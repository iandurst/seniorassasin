
import { DateTime } from 'luxon'

export const TZ = 'America/Chicago'

export function nowChi() { return DateTime.now().setZone(TZ) }

export function isSaturdayPurgeActive(dt = nowChi()) {
  const isSaturday = dt.weekday === 6
  const hour = dt.hour + dt.minute/60
  return isSaturday && hour >= 8 && hour < 24
}

export function isSundayVotingOpen(dt = nowChi()) {
  return dt.weekday === 7
}

export function weekLabel(dt = nowChi()) {
  const weekNumber = dt.weekNumber
  const year = dt.weekYear
  return `W${weekNumber} • ${year}`
}
