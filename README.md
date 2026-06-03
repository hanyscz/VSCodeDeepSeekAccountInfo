# DeepSeek Account Info

<p align="center">
  <img src="https://raw.githubusercontent.com/hanyscz/VSCodeDeepSeekAccountInfo/refs/heads/main/large_v3.png" alt="DeepSeek Account Info" width="256"/>
</p>

---

## English 🇬🇧

A Visual Studio Code extension that monitors your DeepSeek account balance and model availability in real-time directly from the Status Bar, including consumption statistics.

### Features

*   **💰 Balance Monitoring:** See your current total balance (USD & CNY supported) at a glance in the Status Bar.
*   **📊 Consumption Statistics:** Automatically tracks daily, weekly, monthly, and total spending plus average daily consumption. History is persisted in `%APPDATA%\deepseek-account-info\balance-history.json` (survives extension reinstallation).
*   **🔍 Detailed Tooltip:** Hover over the Status Bar to see a complete overview — balance, consumption stats, and available models.
*   **🤖 Model List:** Quickly check which models are available under your API key.
*   **📄 Markdown Report:** Click the Status Bar to open a detailed report with balance tables, consumption stats, bar charts, and model list.
*   **🔑 Secure API Key Entry:** Enter your API key via a masked input prompt or configure it in VS Code settings.
*   **⏱️ Configurable Refresh Rate:** Automatic update interval (default: 10 minutes).

<p align="center">
  <table>
    <tr>
      <td align="center" width="50%">
        <img src="https://raw.githubusercontent.com/hanyscz/VSCodeDeepSeekAccountInfo/refs/heads/main/popup.png" alt="Tooltip" width="220"/><br/>
        <em>Tooltip overview</em>
      </td>
      <td align="center" width="50%">
        <img src="https://raw.githubusercontent.com/hanyscz/VSCodeDeepSeekAccountInfo/refs/heads/main/detail.png" alt="Detail report" width="500"/><br/>
        <em>Detail Markdown report</em>
      </td>
    </tr>
  </table>
</p>

### Getting Started

1.  **Enter API Key:**
    *   Open Command Palette (`Ctrl+Shift+P` / `Cmd+Shift+P`).
    *   Run: **`DeepSeek: Enter API Key`**.
    *   Paste your API key and press `Enter`.
    *   *Alternatively: Set it in VS Code Settings → `deepseek.apiKey`.*

2.  **View Details:**
    *   Click the wallet icon in the Status Bar (bottom right) or run **`DeepSeek: Show Account Details`**.

3.  **Manual Refresh:**
    *   Run **`DeepSeek: Refresh Status`**.

### Settings

| Key | Default | Description |
| :--- | :--- | :--- |
| `deepseek.apiKey` | `""` | API key for DeepSeek API access |
| `deepseek.refreshInterval` | `10` | Auto-refresh interval (minutes) |

### Consumption Statistics

The extension saves a balance snapshot on every update. Data is persisted in two places:

1. **VS Code globalState** — survives VS Code and extension updates.
2. **JSON file on disk** (`%APPDATA%\deepseek-account-info\balance-history.json`) — survives extension reinstallation.

After collecting at least 2 snapshots, the following stats become available:
- 📉 **Daily consumption** — change during the current calendar day
- 📉 **Weekly consumption** — change over the last 7 days
- 📉 **Monthly consumption** — change over the last 30 days
- 📉 **Total consumption** — since the first saved snapshot
- 📊 **Avg/day** — average daily consumption

If the balance increases between readings (e.g., top-up), the deposit is ignored — only actual balance decreases are counted as consumption.


### API Documentation

*   Balance: `GET https://api.deepseek.com/user/balance` ([docs](https://api-docs.deepseek.com/api/get-user-balance))
*   Models: `GET https://api.deepseek.com/models` ([docs](https://api-docs.deepseek.com/api/list-models))

---

## Česky 🇨🇿

Rozšíření pro Visual Studio Code, které v reálném čase monitoruje a zobrazuje aktuální stav vašeho účtu DeepSeek na stavovém řádku (Status Bar) včetně statistik spotřeby.

### Hlavní funkce

*   **💰 Monitoring zůstatku:** Ve stavovém řádku neustále vidíte aktuální celkový finanční zůstatek (s podporou USD i CNY).
*   **📊 Statistiky spotřeby:** Automaticky sleduje a počítá denní, týdenní, měsíční a celkovou spotřebu + průměrnou denní spotřebu. Historie je perzistentně uložena v `%APPDATA%\deepseek-account-info\balance-history.json` (přežije i reinstalaci rozšíření).
*   **🔍 Tooltip s detaily:** Po najetí myší na stavový řádek se zobrazí bublina s kompletním přehledem — zůstatek, statistiky spotřeby a dostupné modely.
*   **🤖 Seznam dostupných modelů:** Rychle získáte přehled o modelech dostupných pod vaším API klíčem.
*   **📄 Detailní report (Markdown):** Kliknutím na stavový řádek se otevře přehledný Markdown dokument s tabulkou zůstatků, statistikami spotřeby, sloupcovým grafem a seznamem modelů.
*   **🔑 Bezpečné zadání API klíče:** Možnost zadat API klíč maskovaným vstupem přímo přes VS Code nebo v nastavení.
*   **⏱️ Nastavitelná perioda:** Frekvence automatických aktualizací (výchozí 10 minut).

<p align="center">
  <table>
    <tr>
      <td align="center" width="50%">
        <img src="https://raw.githubusercontent.com/hanyscz/VSCodeDeepSeekAccountInfo/refs/heads/main/popup_cz.png" alt="Tooltip" width="220"/><br/>
        <em>Tooltip s přehledem</em>
      </td>
      <td align="center" width="50%">
        <img src="https://raw.githubusercontent.com/hanyscz/VSCodeDeepSeekAccountInfo/refs/heads/main/detail_cz.png" alt="Detailní report" width="500"/><br/>
        <em>Detailní Markdown report</em>
      </td>
    </tr>
  </table>
</p>

### Jak začít

1.  **Zadání API klíče:**
    *   Otevřete paletu příkazů (`Ctrl+Shift+P` / `Cmd+Shift+P`).
    *   Spusťte příkaz: **`DeepSeek: Zadat API klíč`**.
    *   Vložte svůj API klíč a stiskněte `Enter`.
    *   *Alternativně: Klíč lze nastavit v nastavení VS Code → `deepseek.apiKey`.*

2.  **Zobrazení detailů:**
    *   Klikněte na ikonu peněženky ve stavovém řádku (vpravo dole) nebo spusťte příkaz **`DeepSeek: Zobrazit podrobnosti účtu a modelů`**.

3.  **Manuální aktualizace:**
    *   Spusťte příkaz **`DeepSeek: Aktualizovat stav`**.

### Nastavení

| Klíč | Výchozí | Popis |
| :--- | :--- | :--- |
| `deepseek.apiKey` | `""` | API klíč pro přístup k DeepSeek API |
| `deepseek.refreshInterval` | `10` | Interval automatického obnovení (v minutách) |

### Statistiky spotřeby

Rozšíření ukládá snapshoty zůstatku při každé aktualizaci. Data jsou persistentní:

1. **VS Code globalState** — přežije aktualizace VS Code i rozšíření.
2. **JSON soubor na disku** (`%APPDATA%\deepseek-account-info\balance-history.json`) — přežije i úplnou reinstalaci rozšíření.

Po nasbírání alespoň 2 snapshotů se automaticky zobrazí:
- 📉 **Denní spotřeba** — změna během aktuálního kalendářního dne
- 📉 **Týdenní spotřeba** — změna za posledních 7 dní
- 📉 **Měsíční spotřeba** — změna za posledních 30 dní
- 📉 **Celková spotřeba** — od první uložené aktualizace
- 📊 **Ø/den** — průměrná denní spotřeba

Pokud zůstatek mezi měřeními vzroste (např. dobití kreditu), dobití se ignoruje — do spotřeby se počítají jen reálné poklesy zůstatku.


### API dokumentace

*   Stav účtu: `GET https://api.deepseek.com/user/balance` ([dokumentace](https://api-docs.deepseek.com/api/get-user-balance))
*   Seznam modelů: `GET https://api.deepseek.com/models` ([dokumentace](https://api-docs.deepseek.com/api/list-models))
