const { base } = require('./_common/airtable')
const { ok, bad, requireAdmin, nowChi } = require('./_common/utils')

function computeNextSundayNoon(dt) {
  const weekday = dt.weekday // 1=Mon ... 7=Sun
  const days = (weekday === 7) ? 7 : (7 - weekday) // always NEXT Sunday, not today
  return dt.plus({ days }).set({ hour: 12, minute: 0, second: 0, millisecond: 0 })
}

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') return bad('POST only', 405)
  if (!requireAdmin(event)) return bad('Unauthorized', 401)
  try {
    // Ensure Settings table exists; give clear error if not
    const rows = await base('Settings').select().firstPage().catch((e)=>{
      const code = e?.response?.status
      if (code === 404 || code === 422) {
        throw new Error('Missing Airtable table/field. Create a table named "Settings" with fields "WeekStart" and "WeekEnd" (both Date/Time).')
      }
      throw e
    })

    const start = nowChi()
    const end = computeNextSundayNoon(start)
    const isoStart = start.toISO()
    const isoEnd = end.toISO()

    if (rows.length) {
      try {
        await base('Settings').update([{ id: rows[0].id, fields: { 'WeekStart': isoStart, 'WeekEnd': isoEnd } }])
      } catch (e) {
        // If WeekEnd field missing, retry with WeekStart only
        try {
          await base('Settings').update([{ id: rows[0].id, fields: { 'WeekStart': isoStart } }])
          return ok({ ok: true, warning: 'WeekEnd field missing in Settings. Add a Date/Time field named "WeekEnd" for end-of-week tracking.' })
        } catch (e2) {
          throw e
        }
      }
    } else {
      // Create first Settings row, handling primary field requirement
      let created = null
      try {
        created = await base('Settings').create({ 'WeekStart': isoStart, 'WeekEnd': isoEnd, 'Name': 'Settings' })
      } catch (e1) {
        try {
          created = await base('Settings').create({ 'WeekStart': isoStart, 'WeekEnd': isoEnd, 'Title': 'Settings' })
        } catch (e2) {
          // Try without WeekEnd if that field is missing
          try {
            created = await base('Settings').create({ 'WeekStart': isoStart, 'Name': 'Settings' })
            return ok({ ok: true, warning: 'WeekEnd field missing in Settings. Add a Date/Time field named "WeekEnd" for end-of-week tracking.' })
          } catch (e3) {
            throw new Error('Could not create a Settings row. In Airtable, open the "Settings" table (fields: WeekStart, optional WeekEnd as Date/Time) and add one blank record. Then click Start Week again.')
          }
        }
      }
    }
    return ok({ ok: true })
  } catch (e) {
    console.error('admin-start-week error', e?.response?.data || e?.message || e)
    const msg = e?.response?.data?.error?.message || e?.message || 'Error starting week'
    return bad(msg, 500)
  }
}
