const { ok, bad } = require('./_common/utils')
exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') return bad('POST only', 405)
  return ok({ ok: true })
}
