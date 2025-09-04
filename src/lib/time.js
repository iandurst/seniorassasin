
import { DateTime } from 'luxon'
export const TZ = 'America/Chicago'
export const nowChi = () => DateTime.now().setZone(TZ)
export const isSaturdayPurgeActive = (dt = nowChi()) => dt.weekday === 6 && (dt.hour + dt.minute/60) >= 8 && (dt.hour + dt.minute/60) < 24
export const isSundayVotingOpen = (dt = nowChi()) => dt.weekday === 7
export const weekLabel = (dt = nowChi()) => `W${dt.weekNumber} • ${dt.weekYear}`
