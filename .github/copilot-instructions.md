# DeepSeek Account Info VS Code Extension

Tento projekt je VS Code rozšíření, které zobrazuje aktuální zůstatek na DeepSeek účtu a dostupnost modelů ve stavovém řádku (Status Bar).

## Hlavní vlastnosti
- Pravidelné dotazování na zůstatek pomocí `/user/balance` endpointu.
- Zobrazení celkového zůstatku (celkové částky), případně rozlišení měny (např. USD nebo CNY).
- Kontrola dostupnosti modelů prostřednictvím `/models` endpointu.
- Možnost zadat API klíč přímo přes příkaz ve VS Code nebo v nastavení.
- Manuální možnost obnovení stavu.
