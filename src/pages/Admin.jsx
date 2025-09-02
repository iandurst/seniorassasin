
import React, { useEffect, useState } from 'react'

function useAdmin(password) {
  const keyParam = `?key=${encodeURIComponent(password || '')}`
  const headers = { 'Content-Type': 'application/json', 'x-admin': password || '' }
  const endpoints = {
    auth: '/.netlify/functions/admin-auth' + keyParam,
    list: '/.netlify/functions/admin-list' + keyParam,
    verify: '/.netlify/functions/admin-verify' + keyParam,
    setAlive: '/.netlify/functions/admin-set-alive' + keyParam,
    eliminate: '/.netlify/functions/admin-eliminate' + keyParam,
    removePlayer: '/.netlify/functions/admin-remove-player' + keyParam,
    resetWeek: '/.netlify/functions/admin-reset-week' + keyParam,
    resetAll: '/.netlify/functions/admin-reset-all' + keyParam,
    hardReset: '/.netlify/functions/admin-hard-reset' + keyParam,
    startWeek: '/.netlify/functions/admin-start-week' + keyParam,
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
  const [pw, setPw] = useState('')
  const api = useAdmin(pw)
  const [data, setData] = useState({ players: [], prizePool: 0, totalElims: 0 })
  const [error, setError] = useState(null)

  async function refresh() {
    try {
      const res = await api.list()
      setData(res)
      setError(null)
    } catch (e) {
      setError(e.message)
    }
  }

  useEffect(() => { if (pw.length) refresh() }, [pw])

  return (
    <div className="space-y-6">
      <div className="card p-4">
        <h1 className="text-2xl font-bold">Admin</h1>
        <p className="text-sm text-white/70">Enter admin password to manage players and weeks.</p>
        <input type="password" className="input mt-2 max-w-sm" placeholder="Enter admin password" value={pw} onChange={e=>setPw(e.target.value)} />
        <div className="mt-2 text-sm">{error && <span className="text-red-400">{error}</span>}</div>
      </div>

      {data?.players?.length > 0 && (
        <div className="space-y-6">
          <div className="card p-4">
            <div className="flex gap-2">
              <button className="btn-ghost" onClick={api.startWeek}>Start Week</button>
              <button className="btn-ghost" onClick={() => { if (confirm('Reset week?')) api.resetWeek().then(refresh) }}>Reset Week</button>
              <button className="btn-ghost" onClick={() => { if (confirm('HARD RESET EVERYTHING?')) api.hardReset().then(refresh) }}>Hard Reset</button>
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
                      <button className="btn-ghost" onClick={() => api.verify(p.id, !p.verified).then(refresh)}>{p.verified ? 'Unverify' : 'Verify'}</button>
                      <button className="btn-ghost" onClick={() => api.setAlive(p.id, !p.alive).then(refresh)}>{p.alive ? 'Set Out' : 'Revive'}</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="card p-4">
            <h2 className="font-semibold mb-2">Record Elimination</h2>
            <EliminationForm players={data.players} onSubmit={(elim)=>api.eliminate(elim.eliminatorId, elim.eliminatedId).then(refresh)} />
          </div>
        </div>
      )}
    </div>
  )
}

function EliminationForm({ players, onSubmit }) {
  const [eliminatorId, setEliminator] = useState('')
  const [eliminatedId, setEliminated] = useState('')
  return (
    <form className="flex flex-wrap gap-2 items-end" onSubmit={(e)=>{ e.preventDefault(); onSubmit({ eliminatorId, eliminatedId}) }}>
      <div>
        <label className="label">Eliminator</label>
        <select className="input" value={eliminatorId} onChange={e=>setEliminator(e.target.value)}>
          <option value="">—</option>
          {players.map(p => <option key={p.id} value={p.id}>{p.firstName} {p.lastName}</option>)}
        </select>
      </div>
      <div>
        <label className="label">Eliminated</label>
        <select className="input" value={eliminatedId} onChange={e=>setEliminated(e.target.value)}>
          <option value="">—</option>
          {players.map(p => <option key={p.id} value={p.id}>{p.firstName} {p.lastName}</option>)}
        </select>
      </div>
      <button className="btn-primary" disabled={!eliminatorId || !eliminatedId}>Save</button>
    </form>
  )
}
