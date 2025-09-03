
const { ok, bad, signToken } = require('../_common/utils')

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') return bad('POST only', 405)
  try {
    const { password } = JSON.parse(event.body || '{}')
    if (!password) return bad('Missing password', 400)
    if (password !== 'Slapshot2007') return bad('Unauthorized', 401)
    const token = signToken({ role: 'admin' })
    return ok({ ok: true, token })
  } catch (e) {
    console.error(e)
    return bad('Auth error', 500)
  }
}
