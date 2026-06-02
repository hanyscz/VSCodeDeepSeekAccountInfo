# DeepSeek Account Info

![Logo](large_v3.PNG)

Tento projekt je rozšíření (extension) pro Visual Studio Code, které v reálném čase monitoruje a zobrazuje aktuální stav vašeho účtu DeepSeek na stavovém řádku (Status Bar) včetně statistik spotřeby.

## Hlavní funkce

*   **💰 Monitoring zůstatku:** Ve stavovém řádku neustále vidíte aktuální celkový finanční zůstatek (s podporou USD i CNY).
*   **📊 Statistiky spotřeby:** Automaticky sleduje a počítá denní, týdenní, měsíční a celkovou spotřebu + průměrnou denní spotřebu. Historie je perzistentně uložena v `%APPDATA%\deepseek-account-info\balance-history.json` (přežije i reinstalaci rozšíření).
*   **🔍 Tooltip s detaily:** Po najetí myší na stavový řádek se zobrazí bublina s kompletním přehledem — zůstatek, statistiky spotřeby a dostupné modely.
*   **🤖 Seznam dostupných modelů:** Rychle získáte přehled o modelech dostupných pod vaším API klíčem.
*   **📄 Detailní report (Markdown):** Kliknutím na stavový řádek se otevře přehledný Markdown dokument s tabulkou zůstatků, statistikami spotřeby, sloupcovým grafem a seznamem modelů.
*   **🔑 Bezpečné zadání API klíče:** Možnost zadat API klíč maskovaným vstupem přímo přes VS Code nebo v nastavení.
*   **⏱️ Nastavitelná perioda:** Frekvence automatických aktualizací (výchozí 10 minut).

## Jak začít

1.  **Zadání API klíče:**
    *   Otevřete paletu příkazů (`Ctrl+Shift+P` / `Cmd+Shift+P`).
    *   Spusťte příkaz: **`DeepSeek: Zadat API klíč`**.
    *   Vložte svůj API klíč a stiskněte `Enter`.
    *   *Alternativně: Klíč lze nastavit v nastavení VS Code → `deepseek.apiKey`.*

2.  **Zobrazení detailů:**
    *   Klikněte na ikonu peněženky ve stavovém řádku (vpravo dole) nebo spusťte příkaz **`DeepSeek: Zobrazit podrobnosti účtu a modelů`**.

3.  **Manuální aktualizace:**
    *   Spusťte příkaz **`DeepSeek: Aktualizovat stav`**.

## Nastavení

| Klíč | Výchozí | Popis |
| :--- | :--- | :--- |
| `deepseek.apiKey` | `""` | API klíč pro přístup k DeepSeek API |
| `deepseek.refreshInterval` | `10` | Interval automatického obnovení (v minutách) |

## Statistiky spotřeby

Rozšíření ukládá snapshoty zůstatku při každé aktualizaci. Data jsou persistentní:

1. **VS Code globalState** — přežije aktualizace VS Code i rozšíření.
2. **JSON soubor na disku** (`%APPDATA%\deepseek-account-info\balance-history.json`) — přežije i úplnou reinstalaci rozšíření.

Po nasbírání alespoň 2 snapshotů se automaticky zobrazí:
- 📉 **Denní spotřeba** — změna za posledních 24 hodin
- 📉 **Týdenní spotřeba** — změna za posledních 7 dní
- 📉 **Měsíční spotřeba** — změna za posledních 30 dní
- 📉 **Celková spotřeba** — od první uložené aktualizace
- 📊 **Ø/den** — průměrná denní spotřeba

Pokud zůstatek mezi měřeními vzroste (např. dobití kreditu), zobrazí se 📈 dobito.
