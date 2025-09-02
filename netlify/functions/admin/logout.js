const { ok, bad } = require('../_common/utils')

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') return bad('POST only', 405)
  const cookie = [
    `pcs_admin=`,
    `Max-Age=0`,
    `Path=/`,
    `HttpOnly`,
    `Secure`,
    `SameSite=Lax`
  ].join('; ')
  return ok({ ok: true }, 200, cookie)
}
