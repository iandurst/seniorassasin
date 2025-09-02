
import { DateTime } from 'luxon'

export const TZ = 'America/Chicago' // CST/CDT

export function nowChi() { return DateTime.now().setZone(TZ) }

export function isSaturdayPurgeActive(dt = nowChi()) {
  // Saturday 8:00 -> 24:00 local time
  const isSaturday = dt.weekday === 6
  const hour = dt.hour + dt.minute/60
  return isSaturday && hour >= 8 && hour < 24
}

export function isSundayVotingOpen(dt = nowChi()) {
  return dt.weekday === 7 // all day Sunday
}

export function weekLabel(dt = nowChi()) {
  const weekNumber = dt.weekNumber
  const year = dt.weekYear
  return `W${weekNumber} • ${year}`
}
