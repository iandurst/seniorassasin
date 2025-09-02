
const { base } = require('./_common/airtable')
const { ok, bad } = require('./_common/utils')

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') return bad('POST only', 405)
  try {
    const { firstName, lastName, phone } = JSON.parse(event.body||'{}')
    if (!firstName || !lastName || !phone) return bad('Missing fields')
    if (!/^\d{10}$/.test(phone)) return bad('Phone must be 10 digits')
    const existing = await base('Players').select({ filterByFormula: `{Phone} = '${phone}'` }).firstPage()
    if (existing && existing.length) return bad('This phone is already registered')
    const rec = await base('Players').create({
      'FirstName': firstName.trim(),
      'LastName': lastName.trim(),
      'Phone': phone,
      'Verified': false,
      'Alive': false,
      'Eliminations': 0
    })
    return ok({ id: rec.id, ok: true })
  } catch (e) {
    console.error(e)
    return bad('Error creating signup', 500)
  }
}
