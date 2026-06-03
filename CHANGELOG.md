# Changelog

All notable changes to this project will be documented in this file.

---

## 0.5.0 — 2026-06-03

### Changed

- **EN:** Daily consumption statistics now use the current calendar day (midnight to now) instead of a rolling 24-hour window. This makes it easier to understand how many tokens were used each working day.

**CZ:** Denní statistika spotřeby nyní používá aktuální kalendářní den (od půlnoci do teď) místo klouzavého 24hodinového okna. To usnadňuje pochopení, kolik tokenů bylo spotřebováno každý pracovní den.

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
