# Netlify + Telnyx + Airtable Setup Guide

This project has been updated to:
- Send SMS via **Telnyx** (Netlify Function: `netlify/functions/sms.js`)
- Store app state in **Airtable** (replacing Netlify Blobs) via `netlify/functions/db.js`
- Keep the frontend and API routes the **same** as before.

---

## 1) Create your Airtable base

1. Go to https://airtable.com and create a **new Base** (e.g., `Senior Assassin Data`).
2. Create a **Table** named `kv`.
3. Add **Fields**:
   - `key` — *Single line text*
   - `value` — *Long text*

### Find your Base ID
- Open the base in a browser.
- Click **Help** → **API documentation**. The page URL or header will show `appXXXXXXXXXXXXXX` — that’s your **Base ID**.

### Create an API token
- In Airtable, go to **Account** → **Developer hub** → **Personal access tokens**.
- Create a token with:
  - **Scopes**: `data.records:read`, `data.records:write`
  - **Access**: Restrict to the base you just created.
- Save the token value (you’ll use it as `AIRTABLE_API_KEY`).

---

## 2) Telnyx setup (SMS)

1. Create a **Telnyx** account → **Messaging**.
2. Buy/assign a phone number (or use an existing one).
3. Create a **Messaging Profile** and attach your number.
4. Copy:
   - **API Key** (`TELNYX_API_KEY`)
   - **Messaging Profile ID** (`TELNYX_MESSAGING_PROFILE_ID`)
   - Optional: **From number** in E.164 format (`TELNYX_FROM`), if you want to force a specific sender.

> Tip: Telnyx auto-honors STOP/HELP carrier keywords. If you want an internal DNT list, we can add `unsubscribed.json` to Airtable.

---

## 3) Netlify environment variables

In your Netlify site, go to **Site settings → Environment variables** and add:

### Telnyx
- `TELNYX_API_KEY` — *required*
- `TELNYX_MESSAGING_PROFILE_ID` — *recommended*
- `TELNYX_FROM` — *optional*
- `SMS_PROVIDER=telnyx` — *forces Telnyx as default*

### Airtable
- `AIRTABLE_API_KEY` — *required*
- `AIRTABLE_BASE_ID` — *required*
- `AIRTABLE_TABLE=kv` — *optional*

Click **Save**, then **Deploy site** (or trigger a redeploy).

---

## 4) Deploy

- Connect this repo to Netlify (or drag-and-drop this folder in the Netlify UI).
- Ensure Node runtime is 18+ (this repo sets it via `package.json`).
- Test flows:
  - Submit a phone number via **/signup** page → should create a row in Airtable (`participants.json`).
  - Check **Telnyx → Messaging → Logs** to confirm outbound SMS when your app sends one.

---

## 5) Local development (optional)

Use Netlify CLI:

```bash
npm i -g netlify-cli
netlify dev
```

> The serverless functions will run with Node 18 and access your local `.env` if you set `NETLIFY_GRAPH_TOKEN` etc., but the simplest is to test in the deployed site.

---

## 6) Notes

- We removed `@netlify/blobs`. State is now persisted in Airtable via `db.js`.
- No frontend changes were required; API surface stays the same.
- If you need to **migrate old data** from Netlify Blobs, ask and we’ll give you a quick one-off migration function.
