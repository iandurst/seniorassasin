const { base } = require('./airtable')
const { DateTime } = require('luxon')

// Hidden config record stored in Players if Settings table is missing.
// We pick field names that already exist so we don't require schema changes.
const CFG_PHONE = '0000000000'   // 10 zeros so it won't collide with a real phone
const CFG_FNAME = 'WeekStart'
const CFG_LNAME = '#CONFIG'

async function trySettingsFirst() {
  try {
    const rows = await base('Settings').select().firstPage()
    if (!rows || !rows.length) return { ok: true, exists: true, id: null, weekStart: null }
    const row = rows[0]
    return { ok: true, exists: true, id: row.id, weekStart: row.get('WeekStart') || null }
  } catch (e) {
    // Table might not exist
    return { ok: false, exists: false, id: null, weekStart: null, error: e }
  }
}

async function getWeekStart() {
  const s = await trySettingsFirst()
  if (s.exists && s.weekStart) return s.weekStart

  // Fallback: check Players for hidden config record
  try {
    const recs = await base('Players').select({
      filterByFormula: `AND({Phone} = '${CFG_PHONE}', {FirstName} = '${CFG_FNAME}', {LastName} = '${CFG_LNAME}')`
    }).firstPage()
    if (recs && recs.length) {
      const epoch = recs[0].get('Eliminations') || 0
      if (epoch) return DateTime.fromSeconds(epoch).toUTC().toISO()
    }
  } catch (e) {}

  return null
}

async function setWeekStart(isoString) {
  const s = await trySettingsFirst()
  if (s.exists) {
    // Use Settings table
    if (s.id) {
      await base('Settings').update([{ id: s.id, fields: { 'WeekStart': isoString } }])
    } else {
      await base('Settings').create({ 'WeekStart': isoString })
    }
    return { source: 'Settings' }
  }

  // Fallback: upsert hidden config record in Players
  const ts = DateTime.fromISO(isoString, { setZone: true }).toSeconds()
  const recs = await base('Players').select({
    filterByFormula: `AND({Phone} = '${CFG_PHONE}', {FirstName} = '${CFG_FNAME}', {LastName} = '${CFG_LNAME}')`
  }).firstPage()
  if (recs && recs.length) {
    await base('Players').update([{ id: recs[0].id, fields: { 'Eliminations': Math.floor(ts) } }])
  } else {
    await base('Players').create({
      'FirstName': CFG_FNAME,
      'LastName': CFG_LNAME,
      'Phone': CFG_PHONE,
      'Verified': false,
      'Alive': false,
      'Eliminations': Math.floor(ts)
    })
  }
  return { source: 'PlayersConfig' }
}

module.exports = { getWeekStart, setWeekStart, CFG_PHONE, CFG_FNAME, CFG_LNAME }
