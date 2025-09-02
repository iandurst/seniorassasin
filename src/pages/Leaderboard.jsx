
import React, { useEffect, useState } from 'react'
import API from '../api'

export default function Leaderboard() {
  const [players, setPlayers] = useState([])
  useEffect(() => {
    API.listPlayers().then((data) => setPlayers(data.players))
  }, [])

  return (
    <div className="card p-5">
      <h1 className="text-2xl font-bold mb-4">Leaderboard</h1>
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
            {players.map((p, i) => (
              <tr key={p.id} className="border-b border-white/10">
                <td className="py-2 pr-3 text-gray-400">{i+1}</td>
                <td className="py-2 pr-3">{p.firstName} {p.lastName}</td>
                <td className="py-2 pr-3">{p.status}</td>
                <td className="py-2 pr-3 font-semibold">{p.elimCount ?? 0}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
