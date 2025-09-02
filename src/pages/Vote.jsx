
import React, { useEffect, useState } from 'react'
import API from '../api'
import { DateTime } from 'luxon'

const TZ = 'America/Chicago'

function isSunday() {
  const now = DateTime.now().setZone(TZ)
  return now.weekday === 7
}

export default function Vote() {
  const [phone, setPhone] = useState('')
  const [vote, setVote] = useState('Continue')
  const [status, setStatus] = useState({ ok: null, msg: '' })
  const [tally, setTally] = useState({ continue: 0, end: 0 })

  useEffect(() => {
    API.tallyVotes().then(setTally).catch(()=>{})
  }, [])

  async function submit(e) {
    e.preventDefault()
    try {
      const { message } = await API.vote({ phone: phone.replace(/\D/g, ''), vote })
      setStatus({ ok: true, msg: message })
      setPhone('')
      API.tallyVotes().then(setTally).catch(()=>{})
    } catch (err) {
      setStatus({ ok: false, msg: err.response?.data?.error || 'Voting failed' })
    }
  }

  return (
    <div className="max-w-xl mx-auto card p-6 space-y-4">
      <h1 className="text-2xl font-bold mb-2">Sunday Vote</h1>
      <p className="text-gray-300">On Sundays, verified players vote to either <strong>Continue</strong> the game or <strong>End</strong> and split the current prize pool.</p>
      {!isSunday() && <div className="text-yellow-300 text-sm">Voting opens on Sunday (CST/CDT). You can still test here if admin enabled.</div>}
      <form onSubmit={submit} className="space-y-4">
        <div>
          <label className="label">Your Phone (used to verify one vote per player)</label>
          <input className="input" value={phone} onChange={e=>setPhone(e.target.value)} required />
        </div>
        <div className="flex gap-3">
          <label className="flex items-center gap-2">
            <input type="radio" name="vote" value="Continue" checked={vote==='Continue'} onChange={()=>setVote('Continue')} />
            Continue
          </label>
          <label className="flex items-center gap-2">
            <input type="radio" name="vote" value="End" checked={vote==='End'} onChange={()=>setVote('End')} />
            End & Share
          </label>
        </div>
        <button className="btn-secondary" type="submit">Submit Vote</button>
      </form>
      {status.msg && (
        <div className={"text-sm " + (status.ok ? "text-green-300" : "text-red-300")}>{status.msg}</div>
      )}

      <div className="mt-6">
        <h2 className="text-lg font-semibold mb-2">Live Tally (current week)</h2>
        <div className="flex gap-4">
          <div className="card p-4">
            <div className="text-gray-300 text-sm">Continue</div>
            <div className="text-2xl font-bold">{tally.continue}</div>
          </div>
          <div className="card p-4">
            <div className="text-gray-300 text-sm">End & Share</div>
            <div className="text-2xl font-bold">{tally.end}</div>
          </div>
        </div>
      </div>
    </div>
  )
}
