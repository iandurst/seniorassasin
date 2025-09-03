
import React, { useEffect, useState } from 'react'

function useAdmin(token) {
  const base = '/.netlify/functions'
  const handle = async (r) => {
    const data = await r.json().catch(() => ({}))
    if (!r.ok) throw new Error(data.error || 'Request failed')
    return data
  }
  const common = () => ({
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    }
  })
  return {
    auth(password) {
      return fetch(`${base}/admin-auth`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password })
      }).then(handle)
    },
    logout() { return fetch(`${base}/admin-logout`, { method: 'POST', ...common() }).then(handle) },
    list() { return fetch(`${base}/admin-list`, common()).then(handle) },
    verify(id, verified = true) { return fetch(`${base}/admin-verify`, { method: 'POST', ...common(), body: JSON.stringify({ id, verified }) }).then(handle) },
    setAlive(id, alive) { return fetch(`${base}/admin-set-alive`, { method: 'POST', ...common(), body: JSON.stringify({ id, alive }) }).then(handle) },
    eliminate(eliminatorId, eliminatedId) { return fetch(`${base}/admin-eliminate`, { method: 'POST', ...common(), body: JSON.stringify({ eliminatorId, eliminatedId }) }).then(handle) },
    removePlayer(id) { return fetch(`${base}/admin-remove-player`, { method: 'POST', ...common(), body: JSON.stringify({ id }) }).then(handle) },
    resetWeek() { return fetch(`${base}/admin-reset-week`, { method: 'POST', ...common() }).then(handle) },
    resetAll() { return fetch(`${base}/admin-reset-all`, { method: 'POST', ...common() }).then(handle) },
    hardReset() { return fetch(`${base}/admin-hard-reset`, { method: 'POST', ...common() }).then(handle) },
    startWeek() { return fetch(`${base}/admin-start-week`, { method: 'POST', ...common() }).then(handle) },
    targets() { return fetch(`${base}/admin-targets`, common()).then(handle) },
  }
}

export default function Admin() {
  const [token, setToken] = useState(() => sessionStorage.getItem('adminToken') || '')
  const api = useAdmin(token)
  const [pw, setPw] = useState('')
  const [unlocked, setUnlocked] = useState(!!token)
  const [data, setData] = useState({ players: [], prizePool: 0, totalElims: 0 })
  const [targets, setTargets] = useState([])
  const [msg, setMsg] = useState(null)
  const [error, setError] = useState(null)

  async function unlock() {
    setMsg('Checking password...'); setError(null)
    try {
      const res = await api.auth(pw)
      setToken(res.token)
      sessionStorage.setItem('adminToken', res.token)
      setUnlocked(true)
      setMsg('Unlocked. Loading data...')
      const list = await api.list()
      setData(list)
      setMsg(null)
    } catch (e) {
      setUnlocked(false)
      setMsg(null)
      setError(e.message || 'Incorrect password')
    }
  }

  async function lock() {
    try { await api.logout() } catch {}
    setToken('')
    sessionStorage.removeItem('adminToken')
    setUnlocked(false)
    setTargets([])
    setData({ players: [], prizePool: 0, totalElims: 0 })
  }

  async function refresh() {
    try {
      const res = await api.list()
      setData(res)
      setError(null)
    } catch (e) {
      setError(e.message)
      setUnlocked(false)
    }
  }

  useEffect(() => {
    if (token) {
      setUnlocked(true)
      refresh()
    }
  }, [token])

  return (
    <div className="space-y-6">
      <div className="card p-4">
        <h1 className="text-2xl font-bold">Admin</h1>
        <p className="text-sm text-white/70">Enter admin password to manage players and weeks.</p>
        <div className="flex flex-col sm:flex-row gap-2 mt-2 items-center">
          <input type="password" className="input sm:max-w-sm" placeholder="Enter admin password" value={pw} onChange={(e)=>setPw(e.target.value)} />
          <div className="flex gap-2 w-full sm:w-auto">
            <button className="btn-primary" onClick={unlock}>Unlock</button>
            {unlocked && <button className="btn-ghost" onClick={lock}>Lock</button>}
            {unlocked && <span className="badge badge-live">Unlocked</span>}
          </div>
        </div>
        {msg && <div className="mt-2 text-sm text-white/80">{msg}</div>}
        {error && <div className="mt-2 text-sm text-red-400">{error}</div>}
      </div>

      {unlocked && (
        <div className="space-y-6">
          <div className="card p-4">
            <div className="flex gap-2 flex-wrap items-center">
              <button className="btn-ghost" onClick={async()=>{ try { await api.startWeek(); await refresh(); const res = await api.targets(); setTargets(res.assignments || []); setMsg('Week started. Targets loaded.'); setError(null) } catch(e) { setError(e.message || 'Error starting week') } }}>Start Week</button>
              <button className="btn-ghost" onClick={async()=>{ if (confirm('Reset week? This revives verified players, zeros eliminations, clears eliminations & votes.')) { await api.resetWeek(); await refresh(); setTargets([]) }}}>Reset Week</button>
              <button className="btn-ghost" onClick={async()=>{ if (confirm('Reset ALL game data? This clears eliminations, votes, settings and resets all players to Unverified & Out with 0 eliminations.')) { await api.resetAll(); await refresh(); setTargets([]) }}}>Reset ALL Game Data</button>
              <button className="btn-ghost" onClick={async()=>{ if (confirm('HARD RESET EVERYTHING? This will DELETE all players and game data.')) { await api.hardReset(); await refresh(); setTargets([]) }}}>Hard Reset (wipe players)</button>
              <div className="ml-auto text-sm text-white/70">
                Prize Pool: <span className="text-accent font-bold">${"{"+ "data.prizePool"+"}"}</span> • Eliminations: {"{"+"data.totalElims"+"}"}
              </div>
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

          <div className="card p-4 overflow-x-auto">
            <div className="flex items-center gap-2 mb-3">
              <h3 className="text-lg font-semibold">Weekly Targets</h3>
              <button className="btn-ghost" onClick={async()=>{
                try { const res = await api.targets(); setTargets(res.assignments || []) }
                catch(e){ alert(e.message || 'Could not load targets. Make sure week has been started.') }
              }}>Load Targets</button>
              <div className="text-xs text-white/60 ml-auto">Targets are generated from the current Week Start; same for everyone until next Start Week.</div>
            </div>
            <table className="table">
              <thead>
                <tr>
                  <th>Player</th>
                  <th>Phone</th>
                  <th>Target</th>
                  <th>Target Phone</th>
                </tr>
              </thead>
              <tbody>
                {targets.map(t => (
                  <tr key={t.id}>
                    <td className="font-medium">{t.firstName} {t.lastName}</td>
                    <td className="text-white/70">{t.phone}</td>
                    <td>{t.targetName}</td>
                    <td className="text-white/70">{t.targetPhone}</td>
                  </tr>
                ))}
                {!targets.length && (
                  <tr><td colSpan="4" className="text-white/60">No targets yet. Click <strong>Start Week</strong> first, then <strong>Load Targets</strong>.</td></tr>
                )}
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
