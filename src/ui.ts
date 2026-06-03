import * as vscode from 'vscode';
import * as loc from './localization';
import { UserBalanceResponse, ModelsResponse } from './api';
import { getConsumptionStats, getBalanceHistory } from './history';
import { showDashboard } from './dashboard';

let statusBarItem: vscode.StatusBarItem;

export function initUI(item: vscode.StatusBarItem) {
    statusBarItem = item;
}

export function showDashboardUI(balance: UserBalanceResponse | undefined, error: string | undefined) {
    showDashboard(balance, error);
}

export function updateStatusBar(balance: UserBalanceResponse | undefined, error: string | undefined) {
    if (error && !balance) {
        statusBarItem.text = loc.strConnectionError();
        statusBarItem.tooltip = buildTooltipMarkdown(balance, undefined, error);
        statusBarItem.backgroundColor = undefined;
        statusBarItem.show();
        return;
    }

    if (!balance || !balance.balance_infos || balance.balance_infos.length === 0) {
        statusBarItem.text = loc.strActive();
        statusBarItem.tooltip = buildTooltipMarkdown(balance, undefined, error);
        statusBarItem.backgroundColor = undefined;
        statusBarItem.show();
        return;
    }

    const config = vscode.workspace.getConfiguration('deepseek');
    const displayMode = config.get<string>('statusBarDisplay', 'balance');
    const threshold = config.get<number>('balanceWarningThreshold', 0);

    let displayBalance = balance.balance_infos.find(b => parseFloat(b.total_balance) > 0) || balance.balance_infos[0];
    const currencySymbol = getCurrencySymbol(displayBalance.currency);
    const amountNum = parseFloat(displayBalance.total_balance);
    const amount = amountNum.toFixed(2);
    
    const stats = getConsumptionStats();
    const curSym = getCurrencySymbol(balance.balance_infos[0].currency);
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
            const proj = getPredictionText(balance);
            text = proj ? `$(credit-card) 🔮 ${proj}` : `$(credit-card) ${currencySymbol}${amount}`;
            break;
        }
        default:
            text = `$(credit-card) ${currencySymbol}${amount}`;
    }

    statusBarItem.text = text;
    statusBarItem.tooltip = buildTooltipMarkdown(balance, undefined, error);

    // Barevná indikace (Krok 5)
    if (threshold > 0 && amountNum < threshold) {
        statusBarItem.backgroundColor = new vscode.ThemeColor('statusBarItem.warningBackground');
    } else {
        statusBarItem.backgroundColor = undefined;
    }
    
    statusBarItem.show();
}

export function buildTooltipMarkdown(balance: UserBalanceResponse | undefined, models: ModelsResponse | undefined, error: string | undefined): vscode.MarkdownString {
    const tooltip = new vscode.MarkdownString();
    tooltip.isTrusted = true;

    if (error) {
        tooltip.appendMarkdown(`${loc.strTooltipError()}\n\n`);
        tooltip.appendMarkdown(`> ${error}\n\n`);
        tooltip.appendMarkdown(`[${loc.strTooltipEnterKey()}](command:deepseek-account.enterApiKey) | [${loc.strTooltipRetry()}](command:deepseek-account.refresh)`);
        return tooltip;
    }

    tooltip.appendMarkdown(`${loc.strTooltipBalance()}\n\n`);

    if (balance) {
        const isAvail = balance.is_available ? loc.strAvailableYes() : loc.strAvailableNo();
        tooltip.appendMarkdown(`${loc.strTooltipAvailable()} ${isAvail}\n\n`);

        for (const info of balance.balance_infos) {
            const sym = getCurrencySymbol(info.currency);
            tooltip.appendMarkdown(`*   **${info.currency}:** **${sym}${parseFloat(info.total_balance).toFixed(4)}**\n`);
        }
        tooltip.appendMarkdown(`\n`);

        tooltip.appendMarkdown(`---\n\n`);
        tooltip.appendMarkdown(`${loc.strTooltipConsumption()}\n\n`);
        
        const stats = getConsumptionStats();
        const curSym = balance.balance_infos.length > 0 ? getCurrencySymbol(balance.balance_infos[0].currency) : '';

        if (stats.historyLength < 2) {
            tooltip.appendMarkdown(`${loc.strCollecting()}\n\n`);
        } else {
            const lines: string[] = [];
            if (stats.daily) lines.push(`📉 ${loc.strDaily()} ${curSym}${Math.abs(stats.daily.consumed).toFixed(4)}`);
            if (stats.weekly) lines.push(`📉 ${loc.strWeekly()} ${curSym}${Math.abs(stats.weekly.consumed).toFixed(4)}`);
            if (stats.monthly) lines.push(`📉 ${loc.strMonthly()} ${curSym}${Math.abs(stats.monthly.consumed).toFixed(4)}`);
            if (stats.total) lines.push(`📉 ${loc.strTotal()} ${curSym}${Math.abs(stats.total.consumed).toFixed(4)}`);
            if (stats.avgDaily) lines.push(`📊 ${loc.strAvgDaily()} ${curSym}${Math.abs(stats.avgDaily.consumed).toFixed(4)} (${loc.strDays(stats.avgDaily.days)})`);
            tooltip.appendMarkdown(lines.join('\n\n') + '\n\n');
        }

        const predText = getPredictionText(balance);
        if (predText) {
            tooltip.appendMarkdown(`${predText}\n\n`);
        }
    }

    if (models) {
        tooltip.appendMarkdown(`---\n\n`);
        tooltip.appendMarkdown(`${loc.strTooltipModels()}\n\n`);
        for (const model of models.data) {
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

export function getPredictionText(balance: UserBalanceResponse): string | null {
    const stats = getConsumptionStats();
    if (!stats.avgDaily || stats.avgDaily.consumed <= 0) return null;
    if (!balance.balance_infos.length) return null;

    const info = balance.balance_infos.find(b => parseFloat(b.total_balance) > 0) || balance.balance_infos[0];
    const currentBalance = parseFloat(info.total_balance);
    if (currentBalance <= 0) return null;

    const daysLeft = Math.round(currentBalance / stats.avgDaily.consumed);
    if (daysLeft < 1) return null;

    const curSym = getCurrencySymbol(info.currency);
    const avgStr = curSym + stats.avgDaily.consumed.toFixed(4);
    const balStr = curSym + currentBalance.toFixed(2);
    return loc.strPrediction(balStr, avgStr, daysLeft);
}

export function getCurrencySymbol(currency: string): string {
    return currency === 'CNY' ? '¥' : currency === 'USD' ? '$' : `${currency} `;
}

export function showDetailsInMarkdown(balance: UserBalanceResponse | undefined, models: ModelsResponse | undefined, error: string | undefined) {
    if (error && !balance) {
        const options = [loc.strEnterKey(), loc.strRetry()];
        vscode.window.showErrorMessage(loc.strApiError(error || ''), ...options).then(selection => {
            if (selection === loc.strEnterKey()) {
                vscode.commands.executeCommand('deepseek-account.enterApiKey');
            } else if (selection === loc.strRetry()) {
                vscode.commands.executeCommand('deepseek-account.refresh');
            }
        });
        return;
    }

    let detailsMarkdown = `${loc.strReportTitle()}\n\n`;

    if (balance) {
        detailsMarkdown += `${loc.strReportBalance()}\n`;
        detailsMarkdown += `${loc.strReportAvailability()} ${balance.is_available ? loc.strReportBalanceYes() : loc.strReportBalanceNo()}\n\n`;
        
        detailsMarkdown += `| ${loc.strReportCurrency()} | ${loc.strReportTotal()} |\n`;
        detailsMarkdown += `| :--- | :--- |\n`;
        
        for (const info of balance.balance_infos) {
            const sym = getCurrencySymbol(info.currency);
            detailsMarkdown += `| **${info.currency}** | ${sym}${parseFloat(info.total_balance).toFixed(4)} |\n`;
        }
        detailsMarkdown += `\n`;
        
        const curSym = balance.balance_infos.length > 0 ? getCurrencySymbol(balance.balance_infos[0].currency) : '';
        const stats = getConsumptionStats();

        detailsMarkdown += `${loc.strReportConsumption()}\n\n`;

        if (stats.historyLength < 2) {
            detailsMarkdown += `${loc.strReportCollecting()}\n\n`;
        } else {
            detailsMarkdown += `| ${loc.strReportPeriod()} | ${loc.strReportConsumed()} |\n`;
            detailsMarkdown += `| :--- | :--- |\n`;
            if (stats.daily) detailsMarkdown += `| ${loc.strReportDaily()} | ${curSym}${Math.abs(stats.daily.consumed).toFixed(4)} ${loc.strSpent()} |\n`;
            if (stats.weekly) detailsMarkdown += `| ${loc.strReportWeekly()} | ${curSym}${Math.abs(stats.weekly.consumed).toFixed(4)} ${loc.strSpent()} |\n`;
            if (stats.monthly) detailsMarkdown += `| ${loc.strReportMonthly()} | ${curSym}${Math.abs(stats.monthly.consumed).toFixed(4)} ${loc.strSpent()} |\n`;
            if (stats.total) detailsMarkdown += `| ${loc.strRowTotal()} | ${curSym}${Math.abs(stats.total.consumed).toFixed(4)} ${loc.strSpent()} |\n`;
            if (stats.avgDaily) detailsMarkdown += `| ${loc.strReportAvgDaily()} | ${curSym}${Math.abs(stats.avgDaily.consumed).toFixed(4)} ${loc.strReportAvg()} (${loc.strDays(stats.avgDaily.days)}) |\n`;
            detailsMarkdown += `\n`;
            
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

        const predText = getPredictionText(balance);
        if (predText) detailsMarkdown += `### 🔮 Predikce\n\n> ${predText}\n\n`;

        const history = getBalanceHistory();
        if (history.length >= 3) {
            const sorted = [...history].sort((a, b) => a.timestamp - b.timestamp);
            const maxCols = 20;
            let sampled = sorted;
            if (sorted.length > maxCols) {
                const step = Math.floor(sorted.length / maxCols);
                sampled = [];
                for (let i = 0; i < sorted.length; i += step) sampled.push(sorted[i]);
                if (sampled[sampled.length - 1] !== sorted[sorted.length - 1]) sampled.push(sorted[sorted.length - 1]);
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
                for (const snap of sampled) detailsMarkdown += snap.totalBalance >= threshold ? '█' : ' ';
                detailsMarkdown += '\n';
            }
            const firstDate = new Date(sampled[0].timestamp).toLocaleDateString();
            const lastDate = new Date(sampled[sampled.length - 1].timestamp).toLocaleDateString();
            const axisLen = sampled.length;
            detailsMarkdown += ' '.repeat(labelWidth) + ' └' + '─'.repeat(axisLen) + '\n';
            detailsMarkdown += ' '.repeat(labelWidth + 2) + firstDate + ' '.repeat(Math.max(1, axisLen - firstDate.length - lastDate.length)) + lastDate + '\n';
            detailsMarkdown += `\`\`\`\n\n`;
        }
    }

    if (models) {
        detailsMarkdown += `${loc.strReportModels()}\n\n`;
        detailsMarkdown += `${loc.strReportModelsDesc()}\n\n`;
        for (const model of models.data) {
            detailsMarkdown += `- **${model.id}** *(${loc.strReportOwner()} ${model.owned_by || 'DeepSeek'})*\n`;
        }
        detailsMarkdown += `\n`;
    }

    detailsMarkdown += `${loc.strReportUpdated()} ${new Date().toLocaleTimeString()}*\n`;

    vscode.workspace.openTextDocument({ content: detailsMarkdown, language: 'markdown' }).then(doc => {
        vscode.window.showTextDocument(doc, { preview: true, viewColumn: vscode.ViewColumn.Active });
    });
}
