
import React, { useEffect, useState } from 'react'

function useAdmin(password) {
  const headers = { 'Content-Type': 'application/json', 'x-admin': password || '' }
  const endpoints = {
    auth: '/.netlify/functions/admin-auth',
    list: '/.netlify/functions/admin-list',
    verify: '/.netlify/functions/admin-verify',
    setAlive: '/.netlify/functions/admin-set-alive',
    eliminate: '/.netlify/functions/admin-eliminate',
    removePlayer: '/.netlify/functions/admin-remove-player',
    resetWeek: '/.netlify/functions/admin-reset-week',
    resetAll: '/.netlify/functions/admin-reset-all',
    hardReset: '/.netlify/functions/admin-hard-reset',
    startWeek: '/.netlify/functions/admin-start-week',
  }
  return {
    async auth() {
      const r = await fetch(endpoints.auth, { headers })
      if (!r.ok) throw new Error('Incorrect password')
      return r.json()
    },
    async list() {
      const r = await fetch(endpoints.list, { headers })
      if (!r.ok) throw new Error('Auth failed or error fetching list')
      return r.json()
    },
    async verify(id, verified=true) {
      const r = await fetch(endpoints.verify, { method:'POST', headers, body: JSON.stringify({ id, verified }) })
      return r.json()
    },
    async setAlive(id, alive) {
      const r = await fetch(endpoints.setAlive, { method:'POST', headers, body: JSON.stringify({ id, alive }) })
      return r.json()
    },
    async eliminate(eliminatorId, eliminatedId) {
      const r = await fetch(endpoints.eliminate, { method:'POST', headers, body: JSON.stringify({ eliminatorId, eliminatedId }) })
      return r.json()
    },
    async removePlayer(id) {
      const r = await fetch(endpoints.removePlayer, { method:'POST', headers, body: JSON.stringify({ id }) })
      return r.json()
    },
    async resetWeek() {
      const r = await fetch(endpoints.resetWeek, { method:'POST', headers })
      return r.json()
    },
    async resetAll() {
      const r = await fetch(endpoints.resetAll, { method:'POST', headers })
      return r.json()
    },
    async hardReset() {
      const r = await fetch(endpoints.hardReset, { method:'POST', headers })
      return r.json()
    },
    async startWeek() {
      const r = await fetch(endpoints.startWeek, { method:'POST', headers })
      return r.json()
    }
  }
}

export default function Admin() {
  const [pw, setPw] = useState(() => sessionStorage.getItem('adminPw') || '')
  const [unlocked, setUnlocked] = useState(false)
  const [data, setData] = useState({ players: [], prizePool: 0, totalElims: 0 })
  const [msg, setMsg] = useState(null)
  const [error, setError] = useState(null)
  const api = useAdmin(pw)

  async function unlock() {
    setMsg('Checking password...'); setError(null)
    try {
      await api.auth()
      setUnlocked(true)
      sessionStorage.setItem('adminPw', pw)
      setMsg('Unlocked. Loading data...')
      const res = await api.list()
      setData(res)
      setMsg(null)
    } catch (e) {
      setUnlocked(false)
      setMsg(null)
      setError(e.message || 'Incorrect password')
    }
  }

  async function refresh() {
    try {
      const res = await api.list()
      setData(res)
      setError(null)
    } catch (e) {
      setError(e.message)
    }
  }

  useEffect(() => {
    if (pw && !unlocked && sessionStorage.getItem('adminPw')) {
      // try auto-unlock on load if we have a saved password
      unlock()
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div className="space-y-6">
      <div className="card p-4">
        <h1 className="text-2xl font-bold">Admin</h1>
        <p className="text-sm text-white/70">Enter admin password to manage players and weeks.</p>
        <div className="flex gap-2 mt-2">
          <input type="password" className="input max-w-sm" placeholder="Enter admin password" value={pw} onChange={e=>setPw(e.target.value)} />
          <button className="btn-primary" onClick={unlock}>Unlock</button>
          {unlocked && <span className="badge badge-live">Unlocked</span>}
        </div>
        {msg && <div className="mt-2 text-sm text-white/80">{msg}</div>}
        {error && <div className="mt-2 text-sm text-red-400">{error}</div>}
      </div>

      {unlocked && (
        <div className="space-y-6">
          <div className="card p-4">
            <div className="flex gap-2 flex-wrap items-center">
              <button className="btn-ghost" onClick={async()=>{ await api.startWeek(); await refresh() }}>Start Week</button>
              <button className="btn-ghost" onClick={async()=>{ if (confirm('Reset week? This revives verified players, zeros eliminations, clears eliminations & votes.')) { await api.resetWeek(); await refresh() }}}>Reset Week</button>
              <button className="btn-ghost" onClick={async()=>{ if (confirm('Reset ALL game data? This clears eliminations, votes, settings AND resets all players to Unverified & Out with 0 eliminations.')) { await api.resetAll(); await refresh() }}}>Reset ALL Game Data</button>
              <button className="btn-ghost" onClick={async()=>{ if (confirm('HARD RESET EVERYTHING? This will DELETE all players and game data.')) { await api.hardReset(); await refresh() }}}>Hard Reset (wipe players)</button>
              <div className="ml-auto text-sm text-white/70">Prize Pool: <span className="text-accent font-bold">${data.prizePool}</span> • Eliminations: {data.totalElims}</div>
            </div>
          </div>

          <div className="card p-4 overflow-x-auto">
            <table className="table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Phone</th>
                  <th>Verified</th>
                  <th>Alive</th>
                  <th>Elims</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {data.players.map(p => (
                  <tr key={p.id}>
                    <td className="font-medium">{p.firstName} {p.lastName}</td>
                    <td className="text-white/70">{p.phone}</td>
                    <td>{p.verified ? 'Yes' : 'No'}</td>
                    <td>{p.alive ? 'Alive' : 'Out'}</td>
                    <td>{p.eliminations||0}</td>
                    <td className="space-x-2">
                      <button className="btn-ghost" onClick={async()=>{ await api.verify(p.id, !p.verified); await refresh() }}>{p.verified ? 'Unverify' : 'Verify'}</button>
                      <button className="btn-ghost" onClick={async()=>{ await api.setAlive(p.id, !p.alive); await refresh() }}>{p.alive ? 'Set Out' : 'Revive'}</button>
                      <button className="btn-ghost" onClick={async()=>{ if (confirm(`Remove ${p.firstName} ${p.lastName}? This also deletes related eliminations.`)) { await api.removePlayer(p.id); await refresh() }}}>Remove</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="text-right">
            <button className="btn-ghost" onClick={refresh}>Refresh</button>
          </div>
        </div>
      )}
    </div>
  )
}
