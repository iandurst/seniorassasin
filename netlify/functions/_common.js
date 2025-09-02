
const Airtable = require('airtable')
const { DateTime } = require('luxon')

const TZ = 'America/Chicago'

function ok(body, statusCode=200) {
  return { statusCode, headers: corsHeaders(), body: JSON.stringify(body) }
}
function bad(error, statusCode=400) {
  return { statusCode, headers: corsHeaders(), body: JSON.stringify({ error }) }
}
function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, x-admin-password',
    'Access-Control-Allow-Methods': 'GET,POST,OPTIONS'
  }
}
function isOptions(event) {
  if (event.httpMethod === 'OPTIONS') return true
  return false
}

function cleanPhone(p) { return (p || '').replace(/\D/g, '') }

function getBase() {
  const apiKey = process.env.AIRTABLE_API_KEY
  const baseId = process.env.AIRTABLE_BASE_ID
  if (!apiKey || !baseId) throw new Error('Missing AIRTABLE_API_KEY or AIRTABLE_BASE_ID')
  Airtable.configure({ apiKey })
  return Airtable.base(baseId)
}

function tables() {
  return {
    players: process.env.AIRTABLE_TABLE_PLAYERS || 'Players',
    elims: process.env.AIRTABLE_TABLE_ELIMS || 'Eliminations',
    votes: process.env.AIRTABLE_TABLE_VOTES || 'Votes',
    state: process.env.AIRTABLE_TABLE_STATE || 'GameState',
  }
}

function requireAdmin(event) {
  const provided = event.headers['x-admin-password'] || event.headers['X-Admin-Password']
  const adminPw = process.env.ADMIN_PASSWORD || 'Slapshot2007'
  if (provided !== adminPw) throw new Error('Unauthorized')
}

async function getSingletonState(base, tnames) {
  const records = await base(tnames.state).select({ filterByFormula: "{key}='state'", maxRecords: 1 }).firstPage()
  if (records.length) return records[0]
  const created = await base(tnames.state).create([{ fields: { key: 'state', currentWeek: 1 } }])
  return created[0]
}

function weekDates(now = DateTime.now().setZone(TZ)) {
  // Purge on Saturday 8:00-24:00; Week ends Saturday midnight (i.e., start of Sunday)
  const startOfWeek = now.startOf('week') // Monday by luxon default; we want Sunday
  const sunday = now.set({ weekday: 7 }).startOf('day')
  const saturday = now.set({ weekday: 6 }).startOf('day')
  const purgeStart = saturday.plus({ hours: 8 })
  const purgeEnd = saturday.endOf('day')
  return { sunday, saturdayEnd: saturday.endOf('day'), purgeStart, purgeEnd }
}

module.exports = { ok, bad, corsHeaders, isOptions, cleanPhone, getBase, tables, requireAdmin, getSingletonState, weekDates, TZ, DateTime }
