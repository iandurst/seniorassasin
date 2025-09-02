
import React, { useEffect, useState } from 'react'
import Leaderboard from '../components/Leaderboard.jsx'

export default function Home() {
  const [data, setData] = useState({ players: [], prizePool: 0, topPlayer: null, totalElims: 0, loading: true })
  useEffect(() => {
    fetch('/.netlify/functions/public-data').then(r => r.json()).then(setData).catch(e=>{
      console.error(e); setData(d => ({...d, loading:false}))
    })
  }, [])

  const { players, prizePool, topPlayer, totalElims } = data

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card p-4">
          <div className="text-sm text-white/60">Top Eliminator</div>
          <div className="text-2xl font-bold mt-1">
            {topPlayer ? `${topPlayer.firstName} ${topPlayer.lastName}` : '—'}
          </div>
          <div className="text-white/70">{topPlayer ? `${topPlayer.eliminations} eliminations` : 'No eliminations yet'}</div>
        </div>
        <div className="card p-4">
          <div className="text-sm text-white/60">Prize Pool</div>
          <div className="text-3xl font-extrabold text-accent mt-1">${prizePool}</div>
          <div className="text-white/70">{totalElims} total eliminations</div>
        </div>
        <div className="card p-4">
          <div className="text-sm text-white/60">Game Status</div>
          <div className="mt-1">Updates automatically. Purge Day banner will appear on Saturdays 8am–midnight CST.</div>
        </div>
      </div>

      <Leaderboard players={players} />

    </div>
  )
}
