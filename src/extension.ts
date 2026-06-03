import * as vscode from 'vscode';
import * as loc from './localization';
import * as api from './api';
import * as history from './history';
import * as ui from './ui';

let refreshIntervalTimer: NodeJS.Timeout | undefined;
let lastBalanceData: api.UserBalanceResponse | undefined;
let lastError: string | undefined;

export function activate(context: vscode.ExtensionContext) {
    // Inicializace modulů
    history.initHistory(context);
    
    const statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
    statusBarItem.command = 'deepseek-account.showDetails';
    ui.initUI(statusBarItem);
    context.subscriptions.push(statusBarItem);

    // Registrace příkazů
    context.subscriptions.push(
        vscode.commands.registerCommand('deepseek-account.enterApiKey', async () => {
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
                refreshData();
            }
        }),
        vscode.commands.registerCommand('deepseek-account.refresh', () => {
            refreshData();
        }),
        vscode.commands.registerCommand('deepseek-account.showDetails', () => {
            ui.showDashboardUI(lastBalanceData, lastError);
        })
    );

    // Sledování změn konfigurace
    context.subscriptions.push(vscode.workspace.onDidChangeConfiguration(e => {
        if (e.affectsConfiguration('deepseek.apiKey') || 
            e.affectsConfiguration('deepseek.refreshInterval') ||
            e.affectsConfiguration('deepseek.statusBarDisplay') ||
            e.affectsConfiguration('deepseek.balanceWarningThreshold')) {
            setupRefreshInterval();
            refreshData();
        }
    }));

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
        ui.updateStatusBar(undefined, loc.strNoApiKeyError());
        lastBalanceData = undefined;
        lastError = loc.strNoApiKeyError();
        return;
    }

    try {
        const [balance] = await Promise.all([
            api.fetchUserBalance(apiKey),
            api.fetchModels(apiKey)
        ]);

        lastBalanceData = balance;
        lastError = undefined;

        history.saveBalanceSnapshot(balance);
        ui.updateStatusBar(balance, undefined);
    } catch (err: any) {
        lastError = err?.message || String(err);
        ui.updateStatusBar(lastBalanceData, lastError);
    }
}
