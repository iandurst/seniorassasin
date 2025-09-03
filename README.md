
# PCS Senior Assassin — Admin Auth Fix (Top-level functions)

- Admin password is server-side fixed to Slapshot2007 (not shown in UI).
- Admin login returns a signed token; the UI stores it in sessionStorage and sends it as Bearer auth.
- Public leaderboard shows verified players only.
- All admin Netlify functions are at the top level (no subfolders), so endpoints resolve:
  /.netlify/functions/admin-auth, admin-list, admin-verify, admin-set-alive, admin-eliminate,
  admin-reset-week, admin-hard-reset, admin-start-week, admin-reset-all, admin-remove-player, admin-logout

## Env Vars
- AIRTABLE_API_KEY (or AIRTABLE_PAT / AIRTABLE_TOKEN) — PAT with data.records:read & data.records:write, restricted to your base
- AIRTABLE_BASE_ID
- (Optional) ADMIN_TOKEN_SECRET — to customize token signing

Deploy on Netlify; then Admin → Unlock with password.
