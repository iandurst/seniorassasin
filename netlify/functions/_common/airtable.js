
const Airtable = require('airtable')

const { AIRTABLE_API_KEY, AIRTABLE_BASE_ID } = process.env
if (!AIRTABLE_API_KEY || !AIRTABLE_BASE_ID) {
  console.warn('Missing Airtable env vars. Set AIRTABLE_API_KEY and AIRTABLE_BASE_ID in Netlify.')
}

const base = AIRTABLE_API_KEY && AIRTABLE_BASE_ID ? new Airtable({apiKey: AIRTABLE_API_KEY}).base(AIRTABLE_BASE_ID) : null

module.exports = { base }
