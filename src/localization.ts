import * as vscode from 'vscode';

type LangCode = 'cs' | 'en';

function getLang(): LangCode {
    return vscode.env.language === 'cs' ? 'cs' : 'en';
}

// === Status Bar ===
export function strNoApiKey(): string {
    return getLang() === 'cs' ? '$(key) DeepSeek: Zadejte API klíč' : '$(key) DeepSeek: Enter API Key';
}
export function strNoApiKeyTooltip(): string {
    return getLang() === 'cs' ? 'Kliknutím sem nastavíte DeepSeek API klíč' : 'Click here to set your DeepSeek API key';
}
export function strNoApiKeyError(): string {
    return getLang() === 'cs'
        ? 'API klíč není nastaven. Použijte příkaz "DeepSeek: Zadat API klíč".'
        : 'API key not set. Use the "DeepSeek: Enter API Key" command.';
}
export function strLoading(): string {
    return getLang() === 'cs' ? '$(sync~spin) DeepSeek: Načítání...' : '$(sync~spin) DeepSeek: Loading...';
}
export function strLoadingTooltip(): string {
    return getLang() === 'cs' ? 'Načítání aktuálního stavu účtu z DeepSeek API...' : 'Loading account status from DeepSeek API...';
}
export function strConnectionError(): string {
    return getLang() === 'cs' ? '$(warning) DeepSeek: Chyba spojení' : '$(warning) DeepSeek: Connection error';
}
export function strActive(): string {
    return getLang() === 'cs' ? '$(credit-card) DeepSeek: Aktivní' : '$(credit-card) DeepSeek: Active';
}

// === API Key Input ===
export function strApiKeyPrompt(): string {
    return getLang() === 'cs' ? 'Zadejte váš DeepSeek API klíč' : 'Enter your DeepSeek API key';
}
export function strApiKeyPlaceholder(): string {
    return 'sk_...';
}
export function strApiKeySaved(): string {
    return getLang() === 'cs' ? 'DeepSeek API klíč byl úspěšně uložen.' : 'DeepSeek API key saved successfully.';
}

// === Tooltip ===
export function strTooltipError(): string {
    return getLang() === 'cs' ? '### ⚠️ DeepSeek API Chyba' : '### ⚠️ DeepSeek API Error';
}
export function strTooltipBalance(): string {
    return getLang() === 'cs' ? '### 💰 Stav DeepSeek Účtu' : '### 💰 DeepSeek Account';
}
export function strTooltipAvailable(): string {
    return getLang() === 'cs' ? '**Dostupnost:**' : '**Availability:**';
}
export function strAvailableYes(): string {
    return getLang() === 'cs' ? '✅ Aktivní' : '✅ Active';
}
export function strAvailableNo(): string {
    return getLang() === 'cs' ? '❌ Bez prostředků' : '❌ Insufficient funds';
}
export function strTooltipConsumption(): string {
    return getLang() === 'cs' ? '### 📊 Spotřeba' : '### 📊 Consumption';
}
export function strCollecting(): string {
    return getLang() === 'cs'
        ? '⏳ *Probíhá sběr dat... Další aktualizace přinesou první statistiky.*'
        : '⏳ *Collecting data... Next update will show statistics.*';
}
export function strDaily(): string {
    return getLang() === 'cs' ? '**Denní:**' : '**Daily:**';
}
export function strWeekly(): string {
    return getLang() === 'cs' ? '**Týdenní:**' : '**Weekly:**';
}
export function strMonthly(): string {
    return getLang() === 'cs' ? '**Měsíční:**' : '**Monthly:**';
}
export function strTotal(): string {
    return getLang() === 'cs' ? '**Celkem:**' : '**Total:**';
}
export function strAvgDaily(): string {
    return getLang() === 'cs' ? '**Ø/den:**' : '**Avg/day:**';
}
export function strDays(count: number): string {
    return getLang() === 'cs' ? `${count} dnů` : `${count} days`;
}
export function strTooltipModels(): string {
    return getLang() === 'cs' ? '### 🤖 Dostupné Modely' : '### 🤖 Available Models';
}

// === Show Details (Markdown Report) ===
export function strReportTitle(): string {
    return getLang() === 'cs' ? '# Stav DeepSeek Účtu a Dostupnost Modelů' : '# DeepSeek Account Status & Model Availability';
}
export function strReportBalance(): string {
    return getLang() === 'cs' ? '## 💰 Zůstatek na účtu' : '## 💰 Account Balance';
}
export function strReportAvailability(): string {
    return getLang() === 'cs' ? 'Dostupnost volání:' : 'API availability:';
}
export function strReportBalanceYes(): string {
    return getLang() === 'cs' ? '✅ Účet je aktivní a má dostatek prostředků' : '✅ Account is active and has sufficient funds';
}
export function strReportBalanceNo(): string {
    return getLang() === 'cs' ? '❌ Nedostatek prostředků / Neaktivní' : '❌ Insufficient funds / Inactive';
}
export function strReportCurrency(): string {
    return getLang() === 'cs' ? 'Měna' : 'Currency';
}
export function strReportTotal(): string {
    return getLang() === 'cs' ? 'Celkový zůstatek' : 'Total balance';
}
export function strRowTotal(): string {
    return getLang() === 'cs' ? '**Celkem**' : '**Total**';
}
export function strReportConsumption(): string {
    return getLang() === 'cs' ? '## 📊 Statistiky spotřeby' : '## 📊 Consumption Statistics';
}
export function strReportCollecting(): string {
    return getLang() === 'cs'
        ? '⏳ *Probíhá sběr dat... Pro zobrazení statistik je potřeba alespoň 2 aktualizace zůstatku.*'
        : '⏳ *Collecting data... Statistics require at least 2 balance updates.*';
}
export function strReportPeriod(): string {
    return getLang() === 'cs' ? 'Období' : 'Period';
}
export function strReportConsumed(): string {
    return getLang() === 'cs' ? 'Spotřeba' : 'Consumption';
}
export function strReportDaily(): string {
    return getLang() === 'cs' ? '**Denní**' : '**Daily**';
}
export function strReportWeekly(): string {
    return getLang() === 'cs' ? '**Týdenní**' : '**Weekly**';
}
export function strReportMonthly(): string {
    return getLang() === 'cs' ? '**Měsíční**' : '**Monthly**';
}
export function strReportAvgDaily(): string {
    return getLang() === 'cs' ? '**Ø za den**' : '**Avg per day**';
}
export function strSpent(): string {
    return getLang() === 'cs' ? '📉 utraceno' : '📉 spent';
}
export function strDeposited(): string {
    return getLang() === 'cs' ? '📈 dobito' : '📈 deposited';
}
export function strReportAvg(): string {
    return getLang() === 'cs' ? '📊 průměrně' : '📊 average';
}
export function strReportVisualization(): string {
    return getLang() === 'cs' ? '### Vizualizace spotřeby' : '### Consumption Visualization';
}
export function strBarDaily(): string {
    return getLang() === 'cs' ? 'Denní' : 'Daily';
}
export function strBarWeekly(): string {
    return getLang() === 'cs' ? 'Týden' : 'Week';
}
export function strBarMonthly(): string {
    return getLang() === 'cs' ? 'Měsíc' : 'Month';
}
export function strBarTotal(): string {
    return getLang() === 'cs' ? 'Celkem' : 'Total';
}
export function strReportModels(): string {
    return getLang() === 'cs' ? '## 🤖 Dostupné modely DeepSeek' : '## 🤖 Available DeepSeek Models';
}
export function strReportModelsDesc(): string {
    return getLang() === 'cs'
        ? 'Níže je seznam modelů, které jsou aktuálně dostupné na vašem účtu:'
        : 'Below is the list of models currently available on your account:';
}
export function strReportModelsError(): string {
    return getLang() === 'cs'
        ? '*(Nepodařilo se načíst seznam modelů)*'
        : '*(Failed to load model list)*';
}
export function strReportOwner(): string {
    return getLang() === 'cs' ? 'vlastník:' : 'owner:';
}
export function strReportUpdated(): string {
    return getLang() === 'cs' ? '*Naposledy aktualizováno:' : '*Last updated:';
}

// === Errors ===
export function strApiError(msg: string): string {
    return getLang() === 'cs' ? `Chyba DeepSeek API: ${msg}` : `DeepSeek API Error: ${msg}`;
}
export function strParseError(): string {
    return getLang() === 'cs' ? 'Chyba při parsování JSON odpovědi API:' : 'Error parsing API JSON response:';
}
export function strHttpError(code: number): string {
    return getLang() === 'cs' ? `API server odpověděl kódem ${code}` : `API server responded with status ${code}`;
}
export function strNetworkError(): string {
    return getLang() === 'cs' ? 'Chyba sítě:' : 'Network error:';
}
export function strTimeout(): string {
    return getLang() === 'cs' ? 'Požadavek na DeepSeek API vypršel (Timeout 10s).' : 'DeepSeek API request timed out (10s).';
}

// === Dialog options ===
export function strEnterKey(): string {
    return getLang() === 'cs' ? 'Zadat API klíč' : 'Enter API Key';
}
export function strRetry(): string {
    return getLang() === 'cs' ? 'Zkusit znovu' : 'Retry';
}
export function strShowReport(): string {
    return getLang() === 'cs' ? 'Zobrazit report' : 'Show report';
}
export function strRefresh(): string {
    return getLang() === 'cs' ? 'Aktualizovat' : 'Refresh';
}
export function strTooltipSettings(): string {
    return getLang() === 'cs' ? '⚙️ Nastavení' : '⚙️ Settings';
}
export function strTooltipEnterKey(): string {
    return getLang() === 'cs' ? 'Zadat API klíč' : 'Enter API Key';
}
export function strTooltipRetry(): string {
    return getLang() === 'cs' ? 'Zkusit znovu' : 'Try again';
}

// === Dashboard ===
export function strDashboardTitle(): string {
    return getLang() === 'cs' ? 'DeepSeek Dashboard' : 'DeepSeek Dashboard';
}
export function strDashboardProjection(): string {
    return getLang() === 'cs' ? '🔮 Predikce' : '🔮 Projection';
}
export function strDashboardDaysRemaining(count: number | string): string {
    return getLang() === 'cs' ? `Zbývající dny: ${count}` : `Days remaining: ${count}`;
}
export function strDashboardDailyCard(): string {
    return getLang() === 'cs' ? '📉 Denní' : '📉 Daily';
}
export function strDashboardWeeklyCard(): string {
    return getLang() === 'cs' ? '📉 Týdenní' : '📉 Weekly';
}
export function strDashboardMonthlyCard(): string {
    return getLang() === 'cs' ? '📉 Měsíční' : '📉 Monthly';
}
export function strDashboardTotalCard(): string {
    return getLang() === 'cs' ? '📉 Celkem' : '📉 Total';
}
export function strDashboardAvgCard(): string {
    return getLang() === 'cs' ? '📊 Ø/den' : '📊 Avg/day';
}
export function strDashboardBalanceCard(): string {
    return getLang() === 'cs' ? '💰 Zůstatek' : '💰 Balance';
}

// === Prediction ===
export function strPrediction(balance: string, avg: string, days: number): string {
    return getLang() === 'cs'
        ? `🔮 Při Ø ${avg}/den vydrží ${balance} ještě ~${days} dní`
        : `🔮 At ${avg}/day, ${balance} will last ~${days} days`;
}

// === Low Balance Warning ===
export function strLowBalanceWarning(currency: string, amount: string, threshold: string): string {
    return getLang() === 'cs'
        ? `⚠️ Nízký zůstatek: ${currency}${amount} (práh: ${currency}${threshold})`
        : `⚠️ Low balance: ${currency}${amount} (threshold: ${currency}${threshold})`;
}

// === History Chart ===
export function strHistoryChart(): string {
    return getLang() === 'cs' ? '### 📈 Historie zůstatku' : '### 📈 Balance History';
}
