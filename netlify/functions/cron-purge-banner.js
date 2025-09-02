
const { ok } = require('./_common')

exports.handler = async () => {
  // This scheduled function placeholder exists to demonstrate Netlify's cron setup.
  // You can optionally compute & pin purgeStart/purgeEnd here if desired.
  return ok({ message: 'cron checked' })
}
