import * as vscode from 'vscode';
import * as loc from './localization';
import { UserBalanceResponse } from './api';
import { getBalanceHistory, getConsumptionStats } from './history';
import { getCurrencySymbol } from './ui';

export function showDashboard(
    balance: UserBalanceResponse | undefined,
    error: string | undefined
) {
    const panel = vscode.window.createWebviewPanel(
        'deepseekDashboard',
        loc.strDashboardTitle(),
        vscode.ViewColumn.One,
        {
            enableScripts: true,
            retainContextWhenHidden: true
        }
    );

    panel.webview.html = getDashboardHtml(balance, error);
}

function getDashboardHtml(
    balance: UserBalanceResponse | undefined,
    error: string | undefined
): string {
    const history = getBalanceHistory();
    const stats = getConsumptionStats();
    const curSym = balance && balance.balance_infos.length > 0 ? getCurrencySymbol(balance.balance_infos[0].currency) : '$';

    const chartData = history.map(h => ({
        t: h.timestamp,
        y: h.totalBalance
    }));

    const dailyStats = stats.daily ? stats.daily.consumed : 0;
    const weeklyStats = stats.weekly ? stats.weekly.consumed : 0;
    const monthlyStats = stats.monthly ? stats.monthly.consumed : 0;
    const totalStats = stats.total ? stats.total.consumed : 0;
    const avgDaily = stats.avgDaily ? stats.avgDaily.consumed : 0;

    let projectionDays: string | number = '--';
    if (balance && balance.balance_infos.length > 0 && avgDaily > 0) {
        const info = balance.balance_infos.find(b => parseFloat(b.total_balance) > 0) || balance.balance_infos[0];
        const currentBalance = parseFloat(info.total_balance);
        if (currentBalance > 0) {
            const daysLeft = Math.round(currentBalance / avgDaily);
            if (daysLeft >= 1) {
                projectionDays = daysLeft;
            }
        }
    }

    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${loc.strDashboardTitle()}</title>
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    <style>
        body { font-family: var(--vscode-font-family); color: var(--vscode-foreground); background-color: var(--vscode-editor-background); padding: 20px; }
        .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin-bottom: 30px; }
        .card { background: var(--vscode-editor-inactiveSelectionBackground); padding: 15px; border-radius: 8px; border: 1px solid var(--vscode-widget-border); display: flex; flex-direction: column; justify-content: center;}
        .card h3 { margin-top: 0; color: var(--vscode-descriptionForeground); font-size: 0.85em; text-transform: uppercase; letter-spacing: 0.5px;}
        .card .value { font-size: 1.6em; font-weight: bold; margin: 5px 0; }
        .card .subtitle { font-size: 0.8em; color: var(--vscode-descriptionForeground); }
        .chart-container { background: var(--vscode-editor-inactiveSelectionBackground); padding: 20px; border-radius: 8px; border: 1px solid var(--vscode-widget-border); margin-bottom: 20px; height: 350px; }
        .error { color: var(--vscode-errorForeground); background: var(--vscode-inputValidation-errorBackground); padding: 10px; border-radius: 4px; margin-bottom: 20px; border: 1px solid var(--vscode-errorForeground); }
        h1 { border-bottom: 1px solid var(--vscode-widget-border); padding-bottom: 10px; margin-bottom: 20px;}
        .highlight { color: var(--vscode-textLink-foreground); }
    </style>
</head>
<body>
    <h1>${loc.strDashboardTitle()}</h1>
    
    ${error ? `<div class="error">⚠️ ${error}</div>` : ''}

    <div class="grid">
        <div class="card">
            <h3>${loc.strDashboardBalanceCard()}</h3>
            <div class="value">${curSym}${balance?.balance_infos[0]?.total_balance || '0.00'}</div>
            <div class="subtitle">${balance?.is_available ? loc.strAvailableYes() : loc.strAvailableNo()}</div>
        </div>
        
        <div class="card">
            <h3>${loc.strDashboardProjection()}</h3>
            <div class="value highlight">~${projectionDays}</div>
            <div class="subtitle">${loc.strDashboardDaysRemaining(projectionDays)}</div>
        </div>

        <div class="card">
            <h3>${loc.strDashboardAvgCard()}</h3>
            <div class="value">${curSym}${avgDaily.toFixed(4)}</div>
            <div class="subtitle">${stats.avgDaily ? loc.strDays(stats.avgDaily.days) : '--'}</div>
        </div>
    </div>

    <div class="grid">
        <div class="card">
            <h3>${loc.strDashboardDailyCard()}</h3>
            <div class="value">${curSym}${dailyStats.toFixed(4)}</div>
        </div>
        <div class="card">
            <h3>${loc.strDashboardWeeklyCard()}</h3>
            <div class="value">${curSym}${weeklyStats.toFixed(4)}</div>
        </div>
        <div class="card">
            <h3>${loc.strDashboardMonthlyCard()}</h3>
            <div class="value">${curSym}${monthlyStats.toFixed(4)}</div>
        </div>
        <div class="card">
            <h3>${loc.strDashboardTotalCard()}</h3>
            <div class="value">${curSym}${totalStats.toFixed(4)}</div>
        </div>
    </div>

    <div class="chart-container">
        <canvas id="balanceChart"></canvas>
    </div>

    <script>
        const ctx = document.getElementById('balanceChart').getContext('2d');
        const historyData = ${JSON.stringify(chartData)};
        
        new Chart(ctx, {
            type: 'line',
            data: {
                datasets: [{
                    label: '${loc.strHistoryChart().replace('### ', '')}',
                    data: historyData.map(d => ({ x: d.t, y: d.y })),
                    borderColor: '#007acc',
                    backgroundColor: 'rgba(0, 122, 204, 0.1)',
                    fill: true,
                    tension: 0.3,
                    pointRadius: 4,
                    pointHoverRadius: 6
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    x: {
                        type: 'linear',
                        position: 'bottom',
                        ticks: {
                            callback: (value) => new Date(value).toLocaleDateString()
                        },
                        grid: { color: 'rgba(128, 128, 128, 0.1)' }
                    },
                    y: {
                        beginAtZero: false,
                        grid: { color: 'rgba(128, 128, 128, 0.1)' }
                    }
                },
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        callbacks: {
                            title: (context) => {
                                return new Date(context[0].parsed.x).toLocaleString();
                            },
                            label: (context) => {
                                return '${curSym}' + context.parsed.y.toFixed(4);
                            }
                        }
                    }
                }
            }
        });
    </script>
</body>
</html>`;
}
