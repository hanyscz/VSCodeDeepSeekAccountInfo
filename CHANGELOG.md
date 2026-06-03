# Changelog

All notable changes to this project will be documented in this file.

---

## 0.9.0 — 2026-06-03

### Added
- **EN:** **Status bar color indication** — when balance drops below the threshold, the status bar item background turns orange/yellow (using `statusBarItem.warningBackground`).
- **EN:** **Unit tests** — added testing infrastructure (Mocha) and first unit tests for history logic.
- **EN:** **Interactive Dashboard** — new webview dashboard with Chart.js balance history graph, projection card, and consumption stats cards. Accessible via `DeepSeek: Show Dashboard` command.
- **EN:** **Dashboard localization** — all dashboard UI strings now properly use EN/CZ localization instead of hardcoded bilingual text.
- **CZ:** **Interaktivní Dashboard** — nové webview okno s Chart.js grafem historie zůstatku, kartou predikce a kartami statistik spotřeby. Přístupný přes příkaz `DeepSeek: Show Dashboard`.
- **CZ:** **Unit testy** — přidána testovací infrastruktura (Mocha) a první unit testy pro logiku historie.
- **CZ:** **Barevná indikace stavového řádku** — při poklesu zůstatku pod práh se pozadí položky ve stavovém řádku zbarví do oranžova/žluta (využívá `statusBarItem.warningBackground`).
- **CZ:** **Lokalizace dashboardu** — všechny texty dashboardu nyní správně používají EN/CZ lokalizaci místo pevně zadaného dvojjazyčného textu.

### Changed
- **EN:** **Modular Refactoring** — split `extension.ts` into `api.ts`, `history.ts`, and `ui.ts` for better maintainability.
- **CZ:** **Modulární refaktoring** — rozdělení `extension.ts` do modulů `api.ts`, `history.ts` a `ui.ts` pro lepší udržitelnost.

---

## 0.8.0 — 2026-06-03

### Added

- **EN:** **Customizable history file path** — new setting `deepseek.historyFilePath`. Set a custom path (e.g., OneDrive/Dropbox) to sync balance history across multiple PCs.
- **EN:** **Optimized data storage** — JSON file is now the primary data source. globalState is used as local cache only. History is automatically pruned (full resolution for last 7 days, 1 snapshot/day for older data, max 3000 snapshots).

- **CZ:** **Customizovatelná cesta k historii** — nové nastavení `deepseek.historyFilePath`. Nastavením vlastní cesty (OneDrive/Dropbox) lze synchronizovat historii mezi více PC.
- **CZ:** **Optimalizované ukládání** — JSON soubor je nyní primárním zdrojem. globalState slouží jen jako lokální cache. Historie se automaticky čistí (plné rozlišení pro posledních 7 dní, 1 snapshot/den pro starší data, max 3000 snapshotů).

---

## 0.7.0 — 2026-06-03

### Added

- **EN:** **Low balance warning** — configurable threshold setting `deepseek.balanceWarningThreshold`. When balance drops below the threshold, a VS Code notification appears with a link to top up.
- **EN:** **Balance history chart** — simple ASCII chart in the detail report showing balance changes over time.
- **EN:** **Consumption prediction** — tooltip and report now show how many days the current balance will last based on average daily consumption.
- **EN:** **Customizable status bar** — new setting `deepseek.statusBarDisplay` with 4 modes: `balance` (default), `daily`, `balance+daily`, `projection`.
- **EN:** **Settings shortcut in tooltip** — tooltip bubble now includes a ⚙️ Settings link that opens all extension settings with one click.

- **CZ:** **Upozornění na nízký zůstatek** — nastavitelný práh `deepseek.balanceWarningThreshold`. Při poklesu zůstatku pod práh se zobrazí notifikace s odkazem na dobití.
- **CZ:** **Graf historie zůstatku** — jednoduchý ASCII graf v detailním reportu zobrazující vývoj zůstatku v čase.
- **CZ:** **Predikce spotřeby** — tooltip a report nyní ukazují, na kolik dní ještě zůstatek vydrží při průměrné denní spotřebě.
- **CZ:** **Customizovatelný stavový řádek** — nové nastavení `deepseek.statusBarDisplay` se 4 režimy: `balance` (výchozí), `daily`, `balance+daily`, `projection`.
- **CZ:** **Zástupce nastavení v tooltipu** — bublina nyní obsahuje odkaz ⚙️ Nastavení, který jedním kliknutím otevře všechna nastavení rozšíření.

---

## 0.6.0 — 2026-06-03

### Fixed

- **EN:** Consumption statistics now correctly ignore balance increases (top-ups). Only actual balance decreases between consecutive snapshots are counted as consumption. Previously, depositing credit would incorrectly affect the consumption calculation.

- **CZ:** Statistiky spotřeby nyní správně ignorují navýšení zůstatku (dobití kreditu). Do spotřeby se počítají jen reálné poklesy zůstatku mezi jednotlivými snapshoty. Dříve došlo k chybnému ovlivnění výpočtu při dobití kreditu.

---

## 0.5.0 — 2026-06-03

### Changed

- **EN:** Daily consumption statistics now use the current calendar day (midnight to now) instead of a rolling 24-hour window. This makes it easier to understand how many tokens were used each working day.

- **CZ:** Denní statistika spotřeby nyní používá aktuální kalendářní den (od půlnoci do teď) místo klouzavého 24hodinového okna. To usnadňuje pochopení, kolik tokenů bylo spotřebováno každý pracovní den.

---

## 0.4.0 — 2026-06-02

### Added

- **EN:** EN/CZ language support — the extension now detects VS Code language and displays all UI strings in English or Czech accordingly.
- **EN:** Bilingual README (EN first, CZ second).
- **EN:** Extension screenshots (tooltip + detail report) added to README.

- **CZ:** Přidána podpora EN/CZ jazyka — rozšíření nyní detekuje jazyk VS Code a zobrazuje všechny texty anglicky nebo česky.
- **CZ:** Dvojjazyčné README (EN první, CZ druhý).
- **CZ:** Přidány náhledy rozšíření (tooltip + detailní report) do README.

---

## 0.3.0 — 2026-06-02

### Fixed

- **EN:** Updated repository URL and logo source to point to the correct GitHub repository.

- **CZ:** Opravena URL repozitáře a zdroj loga na správný GitHub repozitář.

---

## 0.2.0 — 2026-06-02

### Added

- **EN:** Detailed Markdown report — click the Status Bar to open a full report with balance tables and model list.
- **EN:** Consumption statistics — daily, weekly, monthly, and total spending automatically tracked with persistent history.
- **EN:** Rich tooltip with balance, consumption stats, and available models on hover.
- **EN:** Persistent storage of balance history in a JSON file on disk (survives extension reinstallation).

- **CZ:** Detailní Markdown report — kliknutím na stavový řádek se otevře kompletní report s tabulkami zůstatků a seznamem modelů.
- **CZ:** Statistiky spotřeby — automatické sledování denní, týdenní, měsíční a celkové spotřeby s perzistentní historií.
- **CZ:** Bohatý tooltip se zůstatkem, statistikami spotřeby a dostupnými modely při najetí myší.
- **CZ:** Perzistentní ukládání historie zůstatku do JSON souboru na disku (přežije reinstalaci rozšíření).

---

## 0.1.0 — 2026-06-02

### Added

- **EN:** Initial project setup — VS Code extension foundation.
- **EN:** Display current DeepSeek account balance in the Status Bar.
- **EN:** Check available models via DeepSeek API.
- **EN:** Enter and store API key via VS Code command or settings.
- **EN:** Auto-refresh with configurable interval.
- **EN:** Manual refresh command.

- **CZ:** Založení projektu — základ rozšíření pro VS Code.
- **CZ:** Zobrazení aktuálního zůstatku DeepSeek účtu ve stavovém řádku.
- **CZ:** Kontrola dostupných modelů přes DeepSeek API.
- **CZ:** Zadání a uložení API klíče přes VS Code příkaz nebo nastavení.
- **CZ:** Automatická aktualizace s nastavitelným intervalem.
- **CZ:** Manuální aktualizace příkazem.
