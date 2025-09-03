
# PCS Senior Assassin — Token-based Admin Auth

- Admin password is **server-side** and fixed to Slapshot2007 (not shown in UI).
- Admin login returns a signed token; the UI stores it in sessionStorage and sends it as Bearer auth.
- Public leaderboard shows **verified players only**.

## Env Vars
- `AIRTABLE_API_KEY` (or `AIRTABLE_PAT` / `AIRTABLE_TOKEN`) — PAT with `data.records:read` and `data.records:write`, restricted to this base.
- `AIRTABLE_BASE_ID`
- *(Optional)* `ADMIN_TOKEN_SECRET` — to customize token signing secret.

## Airtable Tables
Players: FirstName, LastName, Phone, Verified (checkbox), Alive (checkbox), Eliminations (number)  
Eliminations: EliminatorId, EliminatedId, Timestamp, ID(formula RECORD_ID())  
Votes: PlayerPhone, Choice (continue/end), Timestamp  
Settings: WeekStart (datetime)
