
import React, { useEffect, useState } from 'react'
import API from '../api'
import { clsx } from 'clsx'

function PlayerRow({ p, index }) {
  const statusColor = p.status === 'Eliminated' ? 'text-red-300' : (p.status === 'Alive' ? 'text-green-300' : 'text-yellow-300')
  return (
    <tr className="border-b border-white/10">
      <td className="py-2 pr-3 text-gray-400">{index+1}</td>
      <td className="py-2 pr-3">{p.firstName} {p.lastName}</td>
      <td className={clsx('py-2 pr-3', statusColor)}>{p.status}</td>
      <td className="py-2 pr-3 font-semibold">{p.elimCount ?? 0}</td>
    </tr>
  )
}

export default function Home() {
  const [state, setState] = useState({ prizePool: 0, mostElims: null })
  const [players, setPlayers] = useState([])

  useEffect(() => {
    ;(async () => {
      const [gs, list] = await Promise.all([API.getGameState(), API.listPlayers()])
      setState(gs)
      setPlayers(list.players)
    })()
  }, [])

  const top = players.length ? players.reduce((a,b)=> (b.elimCount||0) > (a.elimCount||0) ? b : a, players[0]) : null

  return (
    <div className="space-y-8">
      <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card p-5">
          <div className="text-sm text-gray-300">Prize Pool</div>
          <div className="text-4xl font-extrabold mt-2">${state.prizePool?.toLocaleString()}</div>
          <div className="text-xs text-gray-400 mt-2">+ $5 for every elimination</div>
        </div>
        <div className="card p-5">
          <div className="text-sm text-gray-300">Top Eliminator</div>
          <div className="text-2xl font-bold mt-2">
            {top ? `${top.firstName} ${top.lastName}` : '—'}
          </div>
          <div className="text-sm text-gray-400">{top ? `${top.elimCount} eliminations` : 'No eliminations yet'}</div>
        </div>
        <div className="card p-5">
          <div className="text-sm text-gray-300">Current Week</div>
          <div className="text-2xl font-bold mt-2">{state.currentWeek ?? '—'}</div>
          <div className="text-xs text-gray-400 mt-2">Week ends on Saturday (CST/CDT)</div>
        </div>
      </section>

      <section className="card p-5">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xl font-semibold">Leaderboard</h2>
          <div className="text-sm text-gray-400">Status + Eliminations</div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="text-xs uppercase text-gray-400">
              <tr className="border-b border-white/10">
                <th className="py-2 pr-3">#</th>
                <th className="py-2 pr-3">Player</th>
                <th className="py-2 pr-3">Status</th>
                <th className="py-2 pr-3">Elims</th>
              </tr>
            </thead>
            <tbody>
              {players.map((p, i) => <PlayerRow key={p.id} p={p} index={i} />)}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  )
}
