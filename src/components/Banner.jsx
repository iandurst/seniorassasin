
import React, { useEffect, useState } from 'react'
import { DateTime } from 'luxon'

const TZ = 'America/Chicago'

function isPurgeWindow(now=DateTime.now().setZone(TZ)) {
  // Purge: Saturday from 8:00 to 23:59:59 CST/CDT
  const weekday = now.weekday // 1=Mon ... 6=Sat
  if (weekday !== 6) return false
  const hour = now.hour
  return hour >= 8 && hour < 24
}

export default function Banner() {
  const [purge, setPurge] = useState(isPurgeWindow())

  useEffect(() => {
    const id = setInterval(() => setPurge(isPurgeWindow()), 60_000)
    return () => clearInterval(id)
  }, [])

  if (!purge) return null

  return (
    <div className="bg-accent text-black text-center py-2 text-sm font-semibold sticky top-0 z-50">
      🔥 PURGE DAY ACTIVE (Sat 8:00–MIDNIGHT CST/CDT): Anyone can eliminate anyone.
    </div>
  )
}
