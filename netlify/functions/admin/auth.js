
const { ok, bad, requireAdmin } = require('../_common/utils')

exports.handler = async (event) => {
  // Any method: check header and return 200/401
  if (!requireAdmin(event)) return bad('Unauthorized', 401)
  return ok({ ok: true })
}
