
import React, { useEffect, useMemo, useState } from 'react'
import API from '../api'

const DEFAULT_PASSWORD = 'Slapshot2007' // You can override with VITE_ADMIN_PASSWORD env var at build time

function cleanPhone(p) { return (p || '').replace(/\D/g, '') }

export default function Admin() {
  const [password, setPassword] = useState(localStorage.getItem('adminPassword') || (import.meta.env.VITE_ADMIN_PASSWORD || DEFAULT_PASSWORD))
  const [authed, setAuthed] = useState(!!password)
  const [players, setPlayers] = useState([])
  const [status, setStatus] = useState('')
  const [eliminator, setEliminator] = useState('')
  const [eliminated, setEliminated] = useState('')

  async function refresh() {
    try {
      const data = await API.adminList(password)
      setPlayers(data.players)
      setStatus('')
    } catch (e) {
      setStatus('Invalid admin password or server error.')
      setAuthed(false)
    }
  }

  useEffect(() => { if (authed) refresh() }, [authed])

  function onLogin(e) {
    e.preventDefault()
    setAuthed(true)
    localStorage.setItem('adminPassword', password)
  }

  async function verify(phone, verified, status='Alive') {
    await API.adminVerify(password, phone, verified, status)
    refresh()
  }

  async function startWeek() {
    await API.adminStartWeek(password)
    setStatus('Week started.')
  }

  async function resetAll() {
    if (!confirm('Reset ALL data for a fresh season? This will clear eliminations and votes.')) return
    await API.adminReset(password)
    setStatus('All data reset.')
    refresh()
  }

  async function recordElim() {
    await API.adminRecordElimination(password, cleanPhone(eliminator), cleanPhone(eliminated))
    setStatus('Elimination recorded.')
    setEliminator(''); setEliminated('')
    refresh()
  }

  if (!authed) {
    return (
      <div className="max-w-sm mx-auto card p-6">
        <h1 className="text-2xl font-bold mb-4">Admin Login</h1>
        <form onSubmit={onLogin} className="space-y-4">
          <div>
            <label className="label">Password</label>
            <input className="input" type="password" value={password} onChange={e=>setPassword(e.target.value)} />
            <p className="text-xs text-gray-400 mt-1">Default is "Slapshot2007". You can override via VITE_ADMIN_PASSWORD env var.</p>
          </div>
          <button className="btn-primary">Enter Admin</button>
        </form>
        {status && <div className="text-sm text-red-300 mt-3">{status}</div>}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-3">
        <button className="btn-primary" onClick={refresh}>Refresh</button>
        <button className="btn-secondary" onClick={startWeek}>Start Week</button>
        <button className="btn" style={{background:'#3b1361'}} onClick={resetAll}>Reset ALL</button>
      </div>

      {status && <div className="text-sm text-green-300">{status}</div>}

      <div className="card p-5">
        <h2 className="text-xl font-semibold mb-3">Participants</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="text-xs uppercase text-gray-400">
              <tr className="border-b border-white/10">
                <th className="py-2 pr-3">Name</th>
                <th className="py-2 pr-3">Phone</th>
                <th className="py-2 pr-3">Verified</th>
                <th className="py-2 pr-3">Status</th>
                <th className="py-2 pr-3">Elims</th>
                <th className="py-2 pr-3"></th>
              </tr>
            </thead>
            <tbody>
              {players.map(p => (
                <tr key={p.id} className="border-b border-white/10">
                  <td className="py-2 pr-3">{p.firstName} {p.lastName}</td>
                  <td className="py-2 pr-3">{p.phone}</td>
                  <td className="py-2 pr-3">{p.verified ? 'Yes' : 'No'}</td>
                  <td className="py-2 pr-3">{p.status}</td>
                  <td className="py-2 pr-3">{p.elimCount ?? 0}</td>
                  <td className="py-2 pr-3">
                    {!p.verified ? (
                      <button className="btn-secondary" onClick={()=>verify(p.phone, true, 'Alive')}>Verify</button>
                    ) : (
                      <button className="btn" style={{background:'#5e2b97'}} onClick={()=>verify(p.phone, false, 'Pending')}>Unverify</button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="card p-5">
        <h2 className="text-xl font-semibold mb-3">Record Elimination</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div>
            <label className="label">Eliminator Phone</label>
            <input className="input" value={eliminator} onChange={e=>setEliminator(e.target.value)} placeholder="5555551234" />
          </div>
          <div>
            <label className="label">Eliminated Phone</label>
            <input className="input" value={eliminated} onChange={e=>setEliminated(e.target.value)} placeholder="5555555678" />
          </div>
          <div className="flex items-end">
            <button className="btn-secondary" onClick={recordElim}>Record</button>
          </div>
        </div>
        <p className="text-xs text-gray-400 mt-2">This increments the eliminator's count and marks the eliminated player as Eliminated.</p>
      </div>
    </div>
  )
}
