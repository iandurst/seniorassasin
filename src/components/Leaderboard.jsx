import React from 'react'
import clsx from 'clsx'
export default function Leaderboard({ players=[] }){
  const sorted=[...players].sort((a,b)=> (b.eliminations||0)-(a.eliminations||0) || (a.lastName||'').localeCompare(b.lastName||''))
  return (<div className="card p-4">
    <div className="flex items-center justify-between mb-3">
      <h3 className="text-lg font-semibold">Leaderboard</h3>
      <span className="text-xs text-white/60">{sorted.length} players</span>
    </div>
    <table className="table"><thead><tr><th className="w-10">#</th><th>Name</th><th>Eliminations</th><th>Status</th></tr></thead>
    <tbody>{sorted.map((p,i)=>(<tr key={p.id||i}><td className="text-white/60">{i+1}</td><td className="font-medium">{p.firstName} {p.lastName}</td><td>{p.eliminations||0}</td><td><span className={clsx('badge', p.alive?'badge-live':'badge-out')}>{p.alive?'Alive':'Eliminated'}</span></td></tr>))}</tbody></table>
  </div>)
}