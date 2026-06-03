import * as vscode from 'vscode';
import * as https from 'https';
import * as fs from 'fs';
import * as path from 'path';
import * as loc from './localization';

interface BalanceInfo {
    currency: string;
    total_balance: string;
    granted_balance: string;
    topped_up_balance: string;
}

interface UserBalanceResponse {
    is_available: boolean;
    balance_infos: BalanceInfo[];
}

interface ModelInfo {
    id: string;
    object: string;
    owned_by: string;
}

interface ModelsResponse {
    object: string;
    data: ModelInfo[];
}

interface BalanceSnapshot {
    timestamp: number;
    totalBalance: number;
    toppedUpBalance: number;
    grantedBalance: number;
    currency: string;
}

interface ConsumptionStats {
    daily: { consumed: number; label: string } | null;
    weekly: { consumed: number; label: string } | null;
    monthly: { consumed: number; label: string } | null;
    total: { consumed: number; label: string } | null;
    avgDaily: { consumed: number; days: number } | null;
    historyLength: number;
}

const HISTORY_KEY = 'deepseekBalanceHistory';

// Cesta k souboru pro perzistentní uložení historie (přežije i odinstalaci rozšíření)
const HISTORY_FILE = path.join(
    process.env.APPDATA || path.join(process.env.HOME || '', '.config'),
    'deepseek-account-info',
    'balance-history.json'
);

let statusBarItem: vscode.StatusBarItem;
let refreshIntervalTimer: any;
let lastBalanceData: UserBalanceResponse | undefined;
let lastModelsData: ModelsResponse | undefined;
let lastError: string | undefined;
let extensionContext: vscode.ExtensionContext | undefined;

export function activate(context: vscode.ExtensionContext) {
    // Uložíme context pro pozdější použití (ukládání historie)
    extensionContext = context;

    // Vytvoření elementu ve stavovém řádku
    statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
    statusBarItem.command = 'deepseek-account.showDetails';
    context.subscriptions.push(statusBarItem);

    // Registrace příkazů
    const enterApiKeyCommand = vscode.commands.registerCommand('deepseek-account.enterApiKey', async () => {
        const apiKey = await vscode.window.showInputBox({
            prompt: loc.strApiKeyPrompt(),
            placeHolder: loc.strApiKeyPlaceholder(),
            password: true,
            ignoreFocusOut: true
        });

        if (apiKey !== undefined) {
            const config = vscode.workspace.getConfiguration('deepseek');
            await config.update('apiKey', apiKey.trim(), vscode.ConfigurationTarget.Global);
            vscode.window.showInformationMessage(loc.strApiKeySaved());
            // Po uložení ihned aktualizujeme stav
            refreshData();
        }
    });

    const refreshCommand = vscode.commands.registerCommand('deepseek-account.refresh', () => {
        refreshData();
    });

    const showDetailsCommand = vscode.commands.registerCommand('deepseek-account.showDetails', () => {
        showDetails();
    });

    context.subscriptions.push(enterApiKeyCommand, refreshCommand, showDetailsCommand);

    // Sledování změn konfigurace
    context.subscriptions.push(vscode.workspace.onDidChangeConfiguration(e => {
        if (e.affectsConfiguration('deepseek.apiKey') || e.affectsConfiguration('deepseek.refreshInterval')) {
            setupRefreshInterval();
            refreshData();
        }
    }));

    // Prvotní načtení dat při startu
    setupRefreshInterval();
    refreshData();
}

export function deactivate() {
    stopRefreshInterval();
}

function setupRefreshInterval() {
    stopRefreshInterval();

    const config = vscode.workspace.getConfiguration('deepseek');
    const intervalMinutes = config.get<number>('refreshInterval', 10);
    const intervalMs = Math.max(1, intervalMinutes) * 60 * 1000;

    refreshIntervalTimer = setInterval(() => {
        refreshData();
    }, intervalMs);
}

function stopRefreshInterval() {
    if (refreshIntervalTimer) {
        clearInterval(refreshIntervalTimer);
        refreshIntervalTimer = undefined;
    }
}

async function refreshData() {
    const config = vscode.workspace.getConfiguration('deepseek');
    const apiKey = config.get<string>('apiKey') || '';

    if (!apiKey) {
        statusBarItem.text = loc.strNoApiKey();
        statusBarItem.tooltip = loc.strNoApiKeyTooltip();
        statusBarItem.command = 'deepseek-account.enterApiKey';
        statusBarItem.show();
        lastBalanceData = undefined;
        lastModelsData = undefined;
        lastError = loc.strNoApiKeyError();
        return;
    }

    statusBarItem.text = loc.strLoading();
    statusBarItem.tooltip = loc.strLoadingTooltip();
    statusBarItem.command = 'deepseek-account.showDetails';
    statusBarItem.show();

    try {
        const [balance, models] = await Promise.all([
            fetchUserBalance(apiKey),
            fetchModels(apiKey)
        ]);

        lastBalanceData = balance;
        lastModelsData = models;
        lastError = undefined;

        // Uložíme snapshot historie zůstatku
        saveBalanceSnapshot(balance);

        updateStatusBar(balance);

        // Kontrola nízkého zůstatku
        checkLowBalance(balance);
    } catch (err: any) {
        lastError = err?.message || String(err);
        statusBarItem.text = loc.strConnectionError();
        statusBarItem.tooltip = buildTooltipMarkdown();
        statusBarItem.command = 'deepseek-account.showDetails';
        statusBarItem.show();
    }
}

function getCurrencySymbol(currency: string): string {
    return currency === 'CNY' ? '¥' : currency === 'USD' ? '$' : `${currency} `;
}

function getCurrencySymbolFromData(): string {
    if (!lastBalanceData || !lastBalanceData.balance_infos.length) return '';
    const c = lastBalanceData.balance_infos[0].currency;
    return getCurrencySymbol(c);
}

function updateStatusBar(balance: UserBalanceResponse) {
    const config = vscode.workspace.getConfiguration('deepseek');
    const displayMode = config.get<string>('statusBarDisplay', 'balance');

    if (balance.balance_infos && balance.balance_infos.length > 0) {
        let displayBalance = balance.balance_infos.find(b => parseFloat(b.total_balance) > 0);
        if (!displayBalance) {
            displayBalance = balance.balance_infos[0];
        }

        const currencySymbol = getCurrencySymbol(displayBalance.currency);
        const amount = parseFloat(displayBalance.total_balance).toFixed(2);
        const curSym = getCurrencySymbolFromData();

        const stats = getConsumptionStats();
        let text = '';

        switch (displayMode) {
            case 'daily': {
                const d = stats.daily ? `${curSym}${Math.abs(stats.daily.consumed).toFixed(4)}` : '—';
                text = `$(credit-card) 📉 ${d}`;
                break;
            }
            case 'balance+daily': {
                const d = stats.daily ? `📉 ${curSym}${Math.abs(stats.daily.consumed).toFixed(4)}` : '';
                text = `$(credit-card) ${currencySymbol}${amount} ${d}`;
                break;
            }
            case 'projection': {
                const proj = getPredictionText(curSym);
                text = proj
                    ? `$(credit-card) 🔮 ${proj}`
                    : `$(credit-card) ${currencySymbol}${amount}`;
                break;
            }
            default: // 'balance'
                text = `$(credit-card) ${currencySymbol}${amount}`;
        }

        statusBarItem.text = text;
        statusBarItem.tooltip = buildTooltipMarkdown();
    } else {
        statusBarItem.text = loc.strActive();
        statusBarItem.tooltip = buildTooltipMarkdown();
    }
}

function checkLowBalance(balance: UserBalanceResponse) {
    const config = vscode.workspace.getConfiguration('deepseek');
    const threshold = config.get<number>('balanceWarningThreshold', 0);
    if (threshold <= 0) return;

    for (const info of balance.balance_infos) {
        const total = parseFloat(info.total_balance);
        if (total < threshold) {
            const sym = getCurrencySymbol(info.currency);
            const msg = loc.strLowBalanceWarning(sym, total.toFixed(2), sym + threshold.toFixed(2));
            vscode.window.showWarningMessage(msg, 'Dobít kredit / Top up').then(sel => {
                if (sel) {
                    vscode.env.openExternal(vscode.Uri.parse('https://platform.deepseek.com'));
                }
            });
            break; // jen jedno upozornění
        }
    }
}

function getPredictionText(curSym: string): string | null {
    const stats = getConsumptionStats();
    if (!stats.avgDaily || stats.avgDaily.consumed <= 0) return null;
    if (!lastBalanceData || !lastBalanceData.balance_infos.length) return null;

    const info = lastBalanceData.balance_infos.find(b => parseFloat(b.total_balance) > 0)
        || lastBalanceData.balance_infos[0];
    const currentBalance = parseFloat(info.total_balance);
    if (currentBalance <= 0) return null;

    const daysLeft = Math.round(currentBalance / stats.avgDaily.consumed);
    if (daysLeft < 1) return null;

    const avgStr = curSym + stats.avgDaily.consumed.toFixed(4);
    const balStr = curSym + currentBalance.toFixed(2);
    return loc.strPrediction(balStr, avgStr, daysLeft);
}

function saveBalanceSnapshot(balance: UserBalanceResponse) {
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

    // Uložíme do globalState (pro běžné použití)
    extensionContext.globalState.update(HISTORY_KEY, history);

    // Uložíme i do souboru na disku (přežije odinstalaci)
    saveHistoryToFile(history);
}

function getBalanceHistory(): BalanceSnapshot[] {
    if (!extensionContext) {
        return [];
    }

    // Nejprve zkusíme načíst z globálního state (rychlé)
    const fromState = extensionContext.globalState.get<BalanceSnapshot[]>(HISTORY_KEY, []);
    if (fromState.length > 0) {
        return fromState;
    }

    // Pokud v globalState nic není, zkusíme soubor (např. po reinstalaci)
    return loadHistoryFromFile();
}

function saveHistoryToFile(history: BalanceSnapshot[]) {
    try {
        const dir = path.dirname(HISTORY_FILE);
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
        fs.writeFileSync(HISTORY_FILE, JSON.stringify(history, null, 2), 'utf-8');
    } catch {
        // Tichá chyba — soubor je jen záloha, není kritický
    }
}

function loadHistoryFromFile(): BalanceSnapshot[] {
    try {
        if (fs.existsSync(HISTORY_FILE)) {
            const data = fs.readFileSync(HISTORY_FILE, 'utf-8');
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

function getConsumptionStats(): ConsumptionStats {
    const history = getBalanceHistory();
    const historyLength = history.length;

    if (history.length < 2) {
        return { daily: null, weekly: null, monthly: null, total: null, avgDaily: null, historyLength };
    }

    // Seřadíme snapshoty chronologicky (pro jistotu)
    const sorted = [...history].sort((a, b) => a.timestamp - b.timestamp);

    const now = Date.now();

    // Začátek dnešního kalendářního dne (00:00:00.000)
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);
    const startOfTodayMs = startOfToday.getTime();

    const MS_DAY = 24 * 60 * 60 * 1000;
    const MS_WEEK = 7 * MS_DAY;
    const MS_MONTH = 30 * MS_DAY;

    /**
     * Spočítá spotřebu v daném časovém okně.
     * Sčítá jen POKLESY zůstatku mezi dvěma po sobě jdoucími snapshoty.
     * Navýšení (dobití kreditu) ignoruje — nezapočítává se do spotřeby.
     */
    function calcConsumptionSince(minTimestamp: number): number | null {
        const snapshots = sorted.filter(s => s.timestamp >= minTimestamp);
        if (snapshots.length < 2) return null;

        let totalConsumed = 0;
        for (let i = 1; i < snapshots.length; i++) {
            const diff = snapshots[i - 1].totalBalance - snapshots[i].totalBalance;
            if (diff > 0) {
                totalConsumed += diff;
            }
        }
        return totalConsumed;
    }

    const daily = dailyConsumption();
    const weekly = makeResult(now - MS_WEEK, 'weekly');
    const monthly = makeResult(now - MS_MONTH, 'monthly');
    const total = makeResult(sorted[0].timestamp, 'total');
    const avgDaily = makeAvgDaily();

    function makeResult(minTimestamp: number, _label: string): { consumed: number; label: string } | null {
        const consumed = calcConsumptionSince(minTimestamp);
        if (consumed === null) return null;
        const snapshots = sorted.filter(s => s.timestamp >= minTimestamp);
        const firstTs = snapshots.length > 0 ? snapshots[0].timestamp : sorted[0].timestamp;
        const daysDiff = Math.max(1, Math.round((now - firstTs) / MS_DAY));
        return {
            consumed,
            label: `${consumed >= 0 ? '' : '+'}${Math.abs(consumed).toFixed(4)} (${daysDiff}d)`
        };
    }

    function dailyConsumption(): { consumed: number; label: string } | null {
        const consumed = calcConsumptionSince(startOfTodayMs);
        if (consumed === null) return null;
        return { consumed, label: '' };
    }

    function makeAvgDaily(): { consumed: number; days: number } | null {
        const totalConsumed = calcConsumptionSince(sorted[0].timestamp);
        if (totalConsumed === null) return null;
        const totalDays = Math.max(1, Math.round((now - sorted[0].timestamp) / MS_DAY));
        return { consumed: totalConsumed / totalDays, days: totalDays };
    }

    return { daily, weekly, monthly, total, avgDaily, historyLength };
}

function buildTooltipMarkdown(): vscode.MarkdownString {
    const tooltip = new vscode.MarkdownString();
    tooltip.isTrusted = true;

    if (lastError) {
        tooltip.appendMarkdown(`${loc.strTooltipError()}\n\n`);
        tooltip.appendMarkdown(`> ${lastError}\n\n`);
        tooltip.appendMarkdown(`[${loc.strTooltipEnterKey()}](command:deepseek-account.enterApiKey) | [${loc.strTooltipRetry()}](command:deepseek-account.refresh)`);
        return tooltip;
    }

    tooltip.appendMarkdown(`${loc.strTooltipBalance()}\n\n`);

    if (lastBalanceData) {
        const isAvail = lastBalanceData.is_available ? loc.strAvailableYes() : loc.strAvailableNo();
        tooltip.appendMarkdown(`${loc.strTooltipAvailable()} ${isAvail}\n\n`);

        for (const info of lastBalanceData.balance_infos) {
            const currencySymbol = info.currency === 'CNY' ? '¥' : info.currency === 'USD' ? '$' : '';
            tooltip.appendMarkdown(`*   **${info.currency}:** **${currencySymbol}${parseFloat(info.total_balance).toFixed(4)}**\n`);
        }
        tooltip.appendMarkdown(`\n`);

        // Statistiky spotřeby – vždy viditelné
        tooltip.appendMarkdown(`---\n\n`);
        tooltip.appendMarkdown(`${loc.strTooltipConsumption()}\n\n`);
        
        const stats = getConsumptionStats();
        const curSym = lastBalanceData.balance_infos.length > 0
            ? (lastBalanceData.balance_infos[0].currency === 'CNY' ? '¥' : lastBalanceData.balance_infos[0].currency === 'USD' ? '$' : '')
            : '';

        if (stats.historyLength < 2) {
            tooltip.appendMarkdown(`${loc.strCollecting()}\n\n`);
        } else {
            const lines: string[] = [];
            if (stats.daily) {
                lines.push(`📉 ${loc.strDaily()} ${curSym}${Math.abs(stats.daily.consumed).toFixed(4)}`);
            }
            if (stats.weekly) {
                lines.push(`📉 ${loc.strWeekly()} ${curSym}${Math.abs(stats.weekly.consumed).toFixed(4)}`);
            }
            if (stats.monthly) {
                lines.push(`📉 ${loc.strMonthly()} ${curSym}${Math.abs(stats.monthly.consumed).toFixed(4)}`);
            }
            if (stats.total) {
                lines.push(`📉 ${loc.strTotal()} ${curSym}${Math.abs(stats.total.consumed).toFixed(4)}`);
            }
            if (stats.avgDaily) {
                lines.push(`📊 ${loc.strAvgDaily()} ${curSym}${Math.abs(stats.avgDaily.consumed).toFixed(4)} (${loc.strDays(stats.avgDaily.days)})`);
            }
            tooltip.appendMarkdown(lines.join('\n\n') + '\n\n');
        }

        // Predikce
        const curSymPred = getCurrencySymbolFromData();
        const predText = getPredictionText(curSymPred);
        if (predText) {
            tooltip.appendMarkdown(`${predText}\n\n`);
        }
    }

    if (lastModelsData) {
        tooltip.appendMarkdown(`---\n\n`);
        tooltip.appendMarkdown(`${loc.strTooltipModels()}\n\n`);
        for (const model of lastModelsData.data) {
            tooltip.appendMarkdown(`*   \`${model.id}\`\n`);
        }
        tooltip.appendMarkdown(`\n`);
    }

    tooltip.appendMarkdown(`---\n`);
    tooltip.appendMarkdown(`${loc.strReportUpdated()} ${new Date().toLocaleTimeString()}*\n\n`);
    const settingsQuery = encodeURIComponent(JSON.stringify({ query: '@ext:Hanyscz.vscode-deepseek-account-info' }));
    tooltip.appendMarkdown(`[${loc.strShowReport()}](command:deepseek-account.showDetails) | [${loc.strRefresh()}](command:deepseek-account.refresh) | [${loc.strTooltipSettings()}](command:workbench.action.openSettings?${settingsQuery})`);

    return tooltip;
}

function fetchUserBalance(apiKey: string): Promise<UserBalanceResponse> {
    return makeHttpsGetRequest('https://api.deepseek.com/user/balance', apiKey);
}

function fetchModels(apiKey: string): Promise<ModelsResponse> {
    return makeHttpsGetRequest('https://api.deepseek.com/models', apiKey);
}

function makeHttpsGetRequest<T>(url: string, apiKey: string): Promise<T> {
    return new Promise((resolve, reject) => {
        const options = {
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Accept': 'application/json',
                'User-Agent': 'VSCode-DeepSeek-Account-Info-Extension'
            }
        };

        const req = https.get(url, options, (res: any) => {
            let data = '';

            res.on('data', (chunk: any) => {
                data += chunk;
            });

            res.on('end', () => {
                if (res.statusCode && res.statusCode >= 200 && res.statusCode < 300) {
                    try {
                        const parsed = JSON.parse(data);
                        resolve(parsed as T);
                    } catch (e) {
                        reject(new Error(`${loc.strParseError()} ${e instanceof Error ? e.message : String(e)}`));
                    }
                } else {
                    try {
                        const errObj = JSON.parse(data);
                        reject(new Error(errObj.error?.message || loc.strHttpError(res.statusCode)));
                    } catch {
                        reject(new Error(loc.strHttpError(res.statusCode)));
                    }
                }
            });
        });

        req.on('error', (err: any) => {
            reject(new Error(`${loc.strNetworkError()} ${err.message}`));
        });

        // Nastavení timeoutu pro požadavek
        req.setTimeout(10000, () => {
            req.destroy();
            reject(new Error(loc.strTimeout()));
        });
    });
}

function showDetails() {
    if (lastError && !lastBalanceData) {
        const options = [loc.strEnterKey(), loc.strRetry()];
        vscode.window.showErrorMessage(loc.strApiError(lastError || ''), ...options).then(selection => {
            if (selection === loc.strEnterKey()) {
                vscode.commands.executeCommand('deepseek-account.enterApiKey');
            } else if (selection === loc.strRetry()) {
                refreshData();
            }
        });
        return;
    }

    // Vytvoříme přehledný text s detaily a ukážeme jej v textovém editoru (jako virtuální Markdown soubor)
    // To je mnohem interaktivnější a přehlednější než obyčejná message box!
    let detailsMarkdown = `${loc.strReportTitle()}\n\n`;

    if (lastBalanceData) {
        detailsMarkdown += `${loc.strReportBalance()}\n`;
        detailsMarkdown += `${loc.strReportAvailability()} ${lastBalanceData.is_available ? loc.strReportBalanceYes() : loc.strReportBalanceNo()}\n\n`;
        
        detailsMarkdown += `| ${loc.strReportCurrency()} | ${loc.strReportTotal()} |\n`;
        detailsMarkdown += `| :--- | :--- |\n`;
        
        for (const info of lastBalanceData.balance_infos) {
            const currencySymbol = info.currency === 'CNY' ? '¥' : info.currency === 'USD' ? '$' : '';
            detailsMarkdown += `| **${info.currency}** | ${currencySymbol}${parseFloat(info.total_balance).toFixed(4)} |\n`;
        }
        detailsMarkdown += `\n`;
        
        // Statistiky spotřeby – vždy viditelné
        const curSym = lastBalanceData.balance_infos.length > 0
            ? (lastBalanceData.balance_infos[0].currency === 'CNY' ? '¥' : lastBalanceData.balance_infos[0].currency === 'USD' ? '$' : '')
            : '';
        const stats = getConsumptionStats();

        detailsMarkdown += `${loc.strReportConsumption()}\n\n`;

        if (stats.historyLength < 2) {
            detailsMarkdown += `${loc.strReportCollecting()}\n\n`;
        } else {
            detailsMarkdown += `| ${loc.strReportPeriod()} | ${loc.strReportConsumed()} |\n`;
            detailsMarkdown += `| :--- | :--- |\n`;
            if (stats.daily) {
                detailsMarkdown += `| ${loc.strReportDaily()} | ${curSym}${Math.abs(stats.daily.consumed).toFixed(4)} ${loc.strSpent()} |\n`;
            }
            if (stats.weekly) {
                detailsMarkdown += `| ${loc.strReportWeekly()} | ${curSym}${Math.abs(stats.weekly.consumed).toFixed(4)} ${loc.strSpent()} |\n`;
            }
            if (stats.monthly) {
                detailsMarkdown += `| ${loc.strReportMonthly()} | ${curSym}${Math.abs(stats.monthly.consumed).toFixed(4)} ${loc.strSpent()} |\n`;
            }
            if (stats.total) {
                detailsMarkdown += `| ${loc.strRowTotal()} | ${curSym}${Math.abs(stats.total.consumed).toFixed(4)} ${loc.strSpent()} |\n`;
            }
            if (stats.avgDaily) {
                const direction = loc.strReportAvg();
                detailsMarkdown += `| ${loc.strReportAvgDaily()} | ${curSym}${Math.abs(stats.avgDaily.consumed).toFixed(4)} ${direction} (${loc.strDays(stats.avgDaily.days)}) |\n`;
            }
            detailsMarkdown += `\n`;
            
            // Grafické znázornění pomocí jednoduchých textových sloupců
            const maxVal = Math.max(
                stats.daily ? Math.abs(stats.daily.consumed) : 0,
                stats.weekly ? Math.abs(stats.weekly.consumed) : 0,
                stats.monthly ? Math.abs(stats.monthly.consumed) : 0,
                stats.total ? Math.abs(stats.total.consumed) : 0
            );
            if (maxVal > 0) {
                detailsMarkdown += `${loc.strReportVisualization()}\n\n`;
                detailsMarkdown += `\`\`\`\n`;
                const barWidth = 30;
                if (stats.daily) {
                    const barLen = Math.max(1, Math.round((Math.abs(stats.daily.consumed) / maxVal) * barWidth));
                    detailsMarkdown += `${loc.strBarDaily()}  ${'█'.repeat(barLen)} ${curSym}${Math.abs(stats.daily.consumed).toFixed(4)}\n`;
                }
                if (stats.weekly) {
                    const barLen = Math.max(1, Math.round((Math.abs(stats.weekly.consumed) / maxVal) * barWidth));
                    detailsMarkdown += `${loc.strBarWeekly()}  ${'█'.repeat(barLen)} ${curSym}${Math.abs(stats.weekly.consumed).toFixed(4)}\n`;
                }
                if (stats.monthly) {
                    const barLen = Math.max(1, Math.round((Math.abs(stats.monthly.consumed) / maxVal) * barWidth));
                    detailsMarkdown += `${loc.strBarMonthly()}  ${'█'.repeat(barLen)} ${curSym}${Math.abs(stats.monthly.consumed).toFixed(4)}\n`;
                }
                if (stats.total) {
                    const barLen = Math.max(1, Math.round((Math.abs(stats.total.consumed) / maxVal) * barWidth));
                    detailsMarkdown += `${loc.strBarTotal()} ${'█'.repeat(barLen)} ${curSym}${Math.abs(stats.total.consumed).toFixed(4)}\n`;
                }
                detailsMarkdown += `\`\`\`\n\n`;
            }
        }

        // Predikce
        const predText = getPredictionText(curSym);
        if (predText) {
            detailsMarkdown += `### 🔮 Predikce\n\n> ${predText}\n\n`;
        }

        // Graf historie zůstatku
        const history = getBalanceHistory();
        if (history.length >= 3) {
            const sorted = [...history].sort((a, b) => a.timestamp - b.timestamp);

            // Vzorkování – max 20 sloupců pro přehlednost
            const maxCols = 20;
            let sampled = sorted;
            if (sorted.length > maxCols) {
                const step = Math.floor(sorted.length / maxCols);
                sampled = [];
                for (let i = 0; i < sorted.length; i += step) {
                    sampled.push(sorted[i]);
                }
                // Vždy zahrneme poslední
                if (sampled[sampled.length - 1] !== sorted[sorted.length - 1]) {
                    sampled.push(sorted[sorted.length - 1]);
                }
            }

            const minBal = Math.min(...sampled.map(s => s.totalBalance));
            const maxBal = Math.max(...sampled.map(s => s.totalBalance));
            const range = Math.max(maxBal - minBal, 0.001);

            detailsMarkdown += `${loc.strHistoryChart()}\n\n`;
            detailsMarkdown += `\`\`\`\n`;
            const chartHeight = 5;
            const labelWidth = 10;
            for (let row = chartHeight; row >= 1; row--) {
                const threshold = minBal + (range * row) / chartHeight;
                const label = (curSym + threshold.toFixed(2)).padStart(labelWidth, ' ');
                detailsMarkdown += label + ' ┤';
                for (const snap of sampled) {
                    detailsMarkdown += snap.totalBalance >= threshold ? '█' : ' ';
                }
                detailsMarkdown += '\n';
            }
            // Spodní osa
            const firstDate = new Date(sampled[0].timestamp).toLocaleDateString();
            const lastDate = new Date(sampled[sampled.length - 1].timestamp).toLocaleDateString();
            const axisLen = sampled.length;
            detailsMarkdown += ' '.repeat(labelWidth) + ' └' + '─'.repeat(axisLen) + '\n';
            detailsMarkdown += ' '.repeat(labelWidth + 2) + firstDate + ' '.repeat(Math.max(1, axisLen - firstDate.length - lastDate.length)) + lastDate + '\n';
            detailsMarkdown += `\`\`\`\n\n`;
        }
    }

    if (lastModelsData) {
        detailsMarkdown += `${loc.strReportModels()}\n\n`;
        detailsMarkdown += `${loc.strReportModelsDesc()}\n\n`;
        
        for (const model of lastModelsData.data) {
            detailsMarkdown += `- **${model.id}** *(${loc.strReportOwner()} ${model.owned_by || 'DeepSeek'})*\n`;
        }
        detailsMarkdown += `\n`;
    } else {
        detailsMarkdown += `${loc.strReportModels()}\n`;
        detailsMarkdown += `${loc.strReportModelsError()}\n\n`;
    }

    detailsMarkdown += `${loc.strReportUpdated()} ${new Date().toLocaleTimeString()}*\n`;

    // Zobrazení Markdown dokumentu
    vscode.workspace.openTextDocument({
        content: detailsMarkdown,
        language: 'markdown'
    }).then(doc => {
        vscode.window.showTextDocument(doc, {
            preview: true,
            viewColumn: vscode.ViewColumn.Active
        });
    });
}
