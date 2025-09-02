const { ok, bad } = require('../_common/utils')

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') return bad('POST only', 405)
  try {
    const { password } = JSON.parse(event.body || '{}')
    if (!password) return bad('Missing password', 400)
    if (password !== 'Slapshot2007') return bad('Unauthorized', 401)

    // Session cookie for 6 hours
    const cookie = [
      `pcs_admin=1`,
      `Max-Age=${6*60*60}`,
      `Path=/`,
      `HttpOnly`,
      `Secure`,
      `SameSite=Lax`
    ].join('; ')

    return ok({ ok: true }, 200, cookie)
  } catch (e) {
    console.error(e)
    return bad('Auth error', 500)
  }
}
