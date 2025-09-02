
# PCS Senior Assassin — Netlify + Airtable (Admin auth fix)

This build includes the admin auth hardening: password accepted via header **and** query param (`?key=`), and values are trimmed.

## Env Vars
- `AIRTABLE_API_KEY` (or `AIRTABLE_PAT`/`AIRTABLE_TOKEN`), `AIRTABLE_BASE_ID`, `ADMIN_PASSWORD` (e.g., `Slapshot2007`).

## Schema
- Players: `FirstName`, `LastName`, `Phone`, `Verified`, `Alive`, `Eliminations`
- Eliminations: `EliminatorId`, `EliminatedId`, `Timestamp`, `ID` (formula `RECORD_ID()`)
- Votes: `PlayerPhone`, `Choice` (`continue`, `end`), `Timestamp`
- Settings: `WeekStart`

Deploy on Netlify. Use the Admin tab with your password. If the password is changed in Netlify, use the new value here as well.
