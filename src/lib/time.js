import { DateTime } from 'luxon'
export const TZ='America/Chicago'
export function nowChi(){return DateTime.now().setZone(TZ)}
export function isSaturdayPurgeActive(dt=nowChi()){const s=dt.weekday===6;const h=dt.hour+dt.minute/60;return s&&h>=8&&h<24}
export function isSundayVotingOpen(dt=nowChi()){return dt.weekday===7}
export function weekLabel(dt=nowChi()){return `W${dt.weekNumber} • ${dt.weekYear}`}
