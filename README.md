

---

## Deploying on Netlify

This project now includes **Netlify Functions** wrappers and a `netlify.toml` so you can host the static site + API on Netlify.

### 1) Prereqs
- **Airtable Base** set up as described above.
- **Netlify account** and (optional) **Netlify CLI**: `npm i -g netlify-cli`

### 2) Environment Variables (Netlify)
In your Netlify Site → **Site configuration → Environment variables**, add:

- `AIRTABLE_API_KEY` — your Airtable API key
- `AIRTABLE_BASE_ID` — your Airtable Base ID
- `ADMIN_PASSWORD` — set your own admin password
- `PRIZE_PER_ELIMINATION` — default `5`
- `BASE_PRIZE` — default `0`
- `TIMEZONE` — `America/Chicago`

### 3) Run Locally with Netlify
```bash
# in the project root
npm install
# either
netlify dev
# or without global install
npx netlify dev
```
The site will serve from `/public` and the `/api/*` routes will proxy to `/.netlify/functions/*`.

### 4) Deploy to Netlify
- Push this folder to **GitHub**.
- In Netlify → **Add new site → Import from Git** → select the repo.
- Netlify will detect the `netlify.toml`:
  - **Publish directory:** `public`
  - **Functions directory:** `netlify/functions`
- Set environment variables (Step 2) and deploy.

### 5) Verify
- Visit `/admin.html` → enter the admin password you set.
- Try **Sign Up** and check **Participants** in the admin panel.
- Confirm **Saturday Purge** banner (auto) and **Sunday Voting** visibility.
