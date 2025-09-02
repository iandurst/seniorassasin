
# Admin Controls, Purge & Telnyx Health — Setup

This update adds:
- **Reset All** button (admin-only)
- **3‑hour Purge** button (admin-only) that notifies all participants by SMS and shows a live countdown
- **Rules Addendum** with new **Immunity Items** (goggles + pool floaties)
- **Telnyx health check** function

## 1) Environment Variables (Netlify → Site settings → Environment variables)

**Admin**
- `ADMIN_TOKEN` — a strong secret string. You’ll paste this in the admin page once.

**Airtable**
- `AIRTABLE_API_KEY` — Personal Access Token with `data.records:read` and `data.records:write`, restricted to your base
- `AIRTABLE_BASE_ID` — `appXXXXXXXXXXXXXX`
- `AIRTABLE_TABLE` — `kv` (or set `AIRTABLE_TABLE_ID` to the `tbl...` value)

**Telnyx**
- `TELNYX_API_KEY` — (starts with `KEY_...`)
- Either `TELNYX_MESSAGING_PROFILE_ID` — `mp_...` **or** `TELNYX_FROM` — `+1XXXXXXXXXX`
- Optional: `DEFAULT_COUNTRY_CODE` — `+1`
- Optional: `PURGE_DURATION_MS` — override 3 hours for testing (e.g., `60000` for 1 minute)

## 2) Files Added
- `public/admin.html` — Admin UI
- `netlify/functions/admin-reset.js` — Reset all data
- `netlify/functions/admin-purge.js` — Start or end a purge (sends SMS to all participants)
- `netlify/functions/purge-status.js` — Returns purge status for countdown display
- `netlify/functions/telnyx-health.js` — Quick environment and deliverability checklist
- `netlify/functions/db.js` — Now has `deleteByPrefix`, `deleteJson`, purge helpers and unsubscribed helpers
- `netlify/functions/sms.js` — Telnyx sending + `sendBulkSms` with concurrency

## 3) How to Use

1. Deploy these files (commit or drag‑and‑drop).  
2. Open `/admin.html` on your site. Enter your **ADMIN_TOKEN** and click **Save token**.
3. **Start 3‑hour Purge**: Click the button → confirms → SMS is sent to all participants. Countdown appears.
4. **End Purge Now**: Ends early; countdown disappears.
5. **Reset Everything**: Clears participants, assignments, votes, and purge state; settings to defaults.

> The purge status is also available programmatically at `/.netlify/functions/purge-status` for use in any page.

## 4) Telnyx Notes

- `TELNYX_API_KEY` **must** be paired with a **messaging profile** (`TELNYX_MESSAGING_PROFILE_ID`) or a **from** number (`TELNYX_FROM`).  
- U.S. A2P messaging from local 10‑digit numbers requires **10DLC registration**. Use a registered campaign or a **verified toll‑free** number for best deliverability.
- Check `/.netlify/functions/telnyx-health` for a quick sanity check.

## 5) Rules Update

Append `public/rules_addendum.html` into your existing rules page, or link to it, to reflect:
- Purge behavior and notifications
- The two new immunity items and exact wear requirements
- Admin reset disclosure

---
Generated: 2025-09-02T00:31:05.224354Z
