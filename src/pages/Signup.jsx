
import React, { useState } from 'react'
import API from '../api'

function cleanPhone(p) { return (p || '').replace(/\D/g, '') }

export default function Signup() {
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [phone, setPhone] = useState('')
  const [status, setStatus] = useState({ ok: null, msg: '' })

  async function onSubmit(e) {
    e.preventDefault()
    setStatus({ ok: null, msg: 'Submitting...' })
    try {
      const res = await API.signup({ firstName, lastName, phone: cleanPhone(phone) })
      setStatus({ ok: true, msg: 'Signup received! Wait for admin verification.' })
      setFirstName(''); setLastName(''); setPhone('')
    } catch (err) {
      setStatus({ ok: false, msg: err.response?.data?.error || 'Error. Try again.' })
    }
  }

  return (
    <div className="max-w-xl mx-auto card p-6">
      <h1 className="text-2xl font-bold mb-4">Sign Up</h1>
      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <label className="label">First Name</label>
          <input className="input" value={firstName} onChange={e=>setFirstName(e.target.value)} required />
        </div>
        <div>
          <label className="label">Last Name</label>
          <input className="input" value={lastName} onChange={e=>setLastName(e.target.value)} required />
        </div>
        <div>
          <label className="label">Phone Number</label>
          <input className="input" value={phone} onChange={e=>setPhone(e.target.value)} required placeholder="(555) 555-1234" />
          <p className="text-xs text-gray-400 mt-1">Only admins can see phone numbers.</p>
        </div>
        <button className="btn-primary" type="submit">Submit</button>
      </form>
      {status.msg && (
        <div className={"mt-4 text-sm " + (status.ok ? "text-green-300" : status.ok===false ? "text-red-300" : "text-gray-300")}>{status.msg}</div>
      )}
    </div>
  )
}
