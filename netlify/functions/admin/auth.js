const { ok, bad, signToken } = require('../_common/utils')

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') return bad('POST only', 405)
  try {
    const { password } = JSON.parse(event.body || '{}')
    if (!password || password !== 'Slapshot2007') {
      // Clear any stale cookie to be safe
      return {
        statusCode: 401,
        headers: {
          'Content-Type': 'application/json',
          'Set-Cookie': 'pcs_admin=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0'
        },
        body: JSON.stringify({ error: 'Incorrect password' })
      }
    }
    // 24h session
    const expMs = Date.now() + 24*60*60*1000
    const token = signToken(expMs)
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Set-Cookie': `pcs_admin=${token}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${24*60*60}`
      },
      body: JSON.stringify({ ok: true })
    }
  } catch (e) {
    console.error(e)
    return bad('Auth error', 500)
  }
}
