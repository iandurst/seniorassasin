
import React, { useState } from 'react'

export default function Signup() {
  const [form, setForm] = useState({ firstName: '', lastName: '', phone: '' })
  const [status, setStatus] = useState(null)

  const onChange = e => setForm({ ...form, [e.target.name]: e.target.value })

  async function submit(e) {
    e.preventDefault()
    setStatus('Submitting...')
    try {
      const res = await fetch('/.netlify/functions/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Error')
      setStatus('Submitted! You will be verified by an admin before entering the game.')
      setForm({ firstName: '', lastName: '', phone: '' })
    } catch (err) {
      setStatus('Error: ' + err.message)
    }
  }

  return (
    <div className="card p-6 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold mb-2">Sign Up</h1>
      <p className="text-white/70 mb-4 text-sm">Enter your info. Phone numbers are visible only to admins for gameplay coordination.</p>

      <form onSubmit={submit} className="space-y-4">
        <div>
          <label className="label">First Name</label>
          <input className="input" name="firstName" required value={form.firstName} onChange={onChange} />
        </div>
        <div>
          <label className="label">Last Name</label>
          <input className="input" name="lastName" required value={form.lastName} onChange={onChange} />
        </div>
        <div>
          <label className="label">Phone (digits only)</label>
          <input className="input" name="phone" required pattern="\d{10}" placeholder="e.g., 3095551234" value={form.phone} onChange={onChange} />
        </div>
        <button className="btn-primary" type="submit">Submit</button>
      </form>

      {status && <div className="mt-4 text-sm">{status}</div>}
    </div>
  )
}
