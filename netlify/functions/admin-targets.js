
const { base } = require('./_common/airtable')
const { ok, bad, requireAdmin } = require('./_common/utils')
const crypto = require('crypto')

function mulberry32(a) {
  return function() {
    var t = a += 0x6D2B79F5;
    t = Math.imul(t ^ t >>> 15, t | 1);
    t ^= t + Math.imul(t ^ t >>> 7, t | 61);
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  }
}

function seededShuffle(arr, seedStr) {
  const seed = crypto.createHash('sha256').update(seedStr).digest().readUInt32LE(0)
  const rand = mulberry32(seed)
  const a = arr.slice()
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

exports.handler = async (event) => {
  if (!requireAdmin(event)) return bad('Unauthorized', 401)
  try {
    const settings = await base('Settings').select().firstPage().catch(()=>[])
    if (!settings.length) return bad('Week not started yet. Click "Start Week" first.', 400)
    const weekStart = settings[0].get('WeekStart') || new Date().toISOString()

    const players = await base('Players').select({ filterByFormula: "AND({Verified} = TRUE(), {Alive} = TRUE())" }).all()
    const list = players.map(r => ({
      id: r.id,
      firstName: r.get('FirstName') || '',
      lastName: r.get('LastName') || '',
      phone: r.get('Phone') || '',
    }))

    if (list.length < 2) {
      const res = list.map(p => ({ ...p, targetName: `${p.firstName} ${p.lastName}`, targetPhone: p.phone }))
      return ok({ weekStart, count: list.length, assignments: res })
    }

    const order = seededShuffle(list, weekStart)
    const assignments = order.map((p, idx) => {
      const target = order[(idx + 1) % order.length]
      return { ...p, targetName: `${target.firstName} ${target.lastName}`.trim(), targetPhone: target.phone }
    })
    assignments.sort((a,b) => (a.lastName || '').localeCompare(b.lastName || ''))

    return ok({ weekStart, count: assignments.length, assignments })
  } catch (e) {
    console.error(e)
    return bad('Error generating targets', 500)
  }
}
