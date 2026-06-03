import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import { UserBalanceResponse } from './api';
import { BalanceSnapshot, ConsumptionStats, pruneHistory, calculateConsumption } from './logic';

export { BalanceSnapshot, ConsumptionStats };

const HISTORY_KEY = 'deepseekBalanceHistory';

let extensionContext: vscode.ExtensionContext | undefined;

export function initHistory(context: vscode.ExtensionContext) {
    extensionContext = context;
}

export function getHistoryFilePath(): string {
    const config = vscode.workspace.getConfiguration('deepseek');
    const customPath = config.get<string>('historyFilePath', '').trim();
    if (customPath) {
        return path.join(customPath, 'balance-history.json');
    }
    return path.join(
        process.env.APPDATA || path.join(process.env.HOME || '', '.config'),
        'deepseek-account-info',
        'balance-history.json'
    );
}

export function saveBalanceSnapshot(balance: UserBalanceResponse) {
    if (!extensionContext || !balance.balance_infos || balance.balance_infos.length === 0) {
        return;
    }

    const primaryCurrency = balance.balance_infos.find(b => b.currency === 'USD') || balance.balance_infos[0];
    const snapshot: BalanceSnapshot = {
        timestamp: Date.now(),
        totalBalance: parseFloat(primaryCurrency.total_balance),
        toppedUpBalance: parseFloat(primaryCurrency.topped_up_balance),
        grantedBalance: parseFloat(primaryCurrency.granted_balance),
        currency: primaryCurrency.currency
    };

    const history = getBalanceHistory();
    history.push(snapshot);

    extensionContext.globalState.update(HISTORY_KEY, history);
    saveHistoryToFile(history);
}

export function getBalanceHistory(): BalanceSnapshot[] {
    if (!extensionContext) {
        return [];
    }

    const fromFile = loadHistoryFromFile();
    if (fromFile.length > 0) {
        extensionContext.globalState.update(HISTORY_KEY, fromFile);
        return fromFile;
    }

    const fromState = extensionContext.globalState.get<BalanceSnapshot[]>(HISTORY_KEY, []);
    if (fromState.length > 0) {
        saveHistoryToFile(fromState);
        return fromState;
    }

    return [];
}

export function saveHistoryToFile(history: BalanceSnapshot[]) {
    try {
        const pruned = pruneHistory(history);
        const filePath = getHistoryFilePath();
        const dir = path.dirname(filePath);
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
        fs.writeFileSync(filePath, JSON.stringify(pruned, null, 2), 'utf-8');
    } catch {
        // Tichá chyba
    }
}

export function loadHistoryFromFile(): BalanceSnapshot[] {
    try {
        const filePath = getHistoryFilePath();
        if (fs.existsSync(filePath)) {
            const data = fs.readFileSync(filePath, 'utf-8');
            const parsed = JSON.parse(data);
            if (Array.isArray(parsed)) {
                return parsed as BalanceSnapshot[];
            }
        }
    } catch {
        // Tichá chyba
    }
    return [];
}

export function getConsumptionStats(): ConsumptionStats {
    const history = getBalanceHistory();
    const historyLength = history.length;

    if (history.length < 2) {
        return { daily: null, weekly: null, monthly: null, total: null, avgDaily: null, historyLength };
    }

    const sorted = [...history].sort((a, b) => a.timestamp - b.timestamp);
    const now = Date.now();
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);
    const startOfTodayMs = startOfToday.getTime();

    const MS_DAY = 24 * 60 * 60 * 1000;
    const MS_WEEK = 7 * MS_DAY;
    const MS_MONTH = 30 * MS_DAY;

    const dailyConsumed = calculateConsumption(sorted, startOfTodayMs);
    const daily = dailyConsumed !== null ? { consumed: dailyConsumed, label: '' } : null;

    function makeResult(minTimestamp: number): { consumed: number; label: string } | null {
        const consumed = calculateConsumption(sorted, minTimestamp);
        if (consumed === null) return null;
        const snapshots = sorted.filter(s => s.timestamp >= minTimestamp);
        const firstTs = snapshots.length > 0 ? snapshots[0].timestamp : sorted[0].timestamp;
        const daysDiff = Math.max(1, Math.round((now - firstTs) / MS_DAY));
        return {
            consumed,
            label: `${consumed >= 0 ? '' : '+'}${Math.abs(consumed).toFixed(4)} (${daysDiff}d)`
        };
    }

    const weekly = makeResult(now - MS_WEEK);
    const monthly = makeResult(now - MS_MONTH);
    const total = makeResult(sorted[0].timestamp);

    const totalConsumedAll = calculateConsumption(sorted, sorted[0].timestamp);
    const totalDays = Math.max(1, Math.round((now - sorted[0].timestamp) / MS_DAY));
    const avgDaily = totalConsumedAll !== null ? { consumed: totalConsumedAll / totalDays, days: totalDays } : null;

    return { daily, weekly, monthly, total, avgDaily, historyLength };
}
