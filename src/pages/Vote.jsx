
import React, { useState, useEffect } from 'react'
import { isSundayVotingOpen } from '../lib/time.js'

export default function Vote() {
  const [form, setForm] = useState({ phone: '', choice: 'continue' })
  const [status, setStatus] = useState(null)
  const open = isSundayVotingOpen()

  useEffect(() => {
    if (!open) setStatus('Voting is only open on Sundays (America/Chicago).')
  }, [open])

  const onChange = e => setForm({ ...form, [e.target.name]: e.target.value })

  async function submit(e) {
    e.preventDefault()
    setStatus('Submitting vote...')
    try {
      const res = await fetch('/.netlify/functions/vote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Error')
      setStatus('Vote recorded. Thank you!')
      setForm({ phone: '', choice: 'continue' })
    } catch (err) {
      setStatus('Error: ' + err.message)
    }
  }

  return (
    <div className="card p-6 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold mb-2">Sunday Vote</h1>
      <p className="text-white/70 mb-4 text-sm">Verified players can vote to <strong>continue</strong> the game or <strong>end & share</strong> the current prize pool.</p>
      <form onSubmit={submit} className="space-y-4">
        <div>
          <label className="label">Phone (digits only, must match your sign‑up)</label>
          <input className="input" name="phone" pattern="\d{10}" required value={form.phone} onChange={onChange} />
        </div>
        <div>
          <label className="label">Your Vote</label>
          <select className="input" name="choice" value={form.choice} onChange={onChange}>
            <option value="continue">Continue</option>
            <option value="end">End & share prize pool</option>
          </select>
        </div>
        <button className="btn-primary" type="submit" disabled={!open}>Submit Vote</button>
      </form>
      {status && <div className="mt-4 text-sm">{status}</div>}
    </div>
  )
}
