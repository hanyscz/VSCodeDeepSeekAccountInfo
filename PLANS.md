# Plán implementace: Barevný Status Bar a Refaktoring

Tento plán popisuje kroky pro implementaci barevné indikace stavového řádku a technický refaktoring projektu. Multi-account podpora byla na žádost uživatele odstraněna.

## Cíl
1.  **Refaktoring:** Rozdělit `src/extension.ts` do modulů (`api.ts`, `history.ts`, `ui.ts`).
2.  **Barevný Status Bar:** Dynamická změna barvy při nízkém zůstatku.
3.  **Kvalita:** Unit testy, aktualizace dokumentace a verze.

## Dotčené soubory
*   `src/extension.ts` (orchestrace)
*   `src/api.ts`, `src/history.ts`, `src/ui.ts` (nové moduly)
*   `src/test/` (nové unit testy)
*   `package.json` (verze, konfigurace)
*   `CHANGELOG.md`, `README.md` (dokumentace)

---

## Fáze 1: Refaktoring a Unit Testy

### Krok 1: Modul `src/api.ts`
*   Přesunout rozhraní a HTTPS volání.
*   Zajistit exporty.

### Krok 2: Modul `src/history.ts` + Unit Testy
*   Přesunout logiku historie a výpočtů spotřeby.
*   **Unit Testy:** Vytvořit testy pro `pruneHistory` a `getConsumptionStats` (ověření správnosti výpočtů bez nutnosti VS Code API).

### Krok 3: Modul `src/ui.ts`
*   Přesunout logiku Status Baru, Tooltipu a Markdown reportu.

### Krok 4: Propojení v `src/extension.ts`
*   Zjednodušit hlavní soubor na registraci příkazů a eventů.

---

## Fáze 2: Barevný Status Bar

### Krok 5: Implementace barev
*   V `ui.ts` v `updateStatusBar` přidat logiku:
    *   Pokud `total_balance < balanceWarningThreshold`, nastavit `statusBarItem.backgroundColor = new vscode.ThemeColor('statusBarItem.warningBackground')`.
    *   Jinak nastavit `undefined` (výchozí).

---

## Fáze 3: Dokumentace a Vydání

### Krok 6: Dokumentace a Metadata
*   **README.md:** Přidat informaci o nové vizuální indikaci.
*   **CHANGELOG.md:** Zapsat změny verze 0.9.0.
*   **package.json:** Zvýšit verzi na `0.9.0`.

### Krok 7: Finální ověření
*   Spustit kompilaci (`npm run compile`).
*   Spustit testy.
*   Manuální ověření ve VS Code (Extension Development Host).
