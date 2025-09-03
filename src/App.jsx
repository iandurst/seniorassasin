
import React from 'react'
import { Routes, Route, NavLink } from 'react-router-dom'
import Home from './pages/Home.jsx'
import Rules from './pages/Rules.jsx'
import Signup from './pages/Signup.jsx'
import Vote from './pages/Vote.jsx'
import Admin from './pages/Admin.jsx'
import { isSaturdayPurgeActive, isSundayVotingOpen, weekLabel } from './lib/time.js'

function NavItem({to, children}) {
  return (
    <NavLink to={to} className={({isActive}) => 'px-3 py-2 rounded-md ' + (isActive ? 'bg-white/10' : 'hover:bg-white/5')}>
      {children}
    </NavLink>
  );
}

export default function App() {
  const purge = isSaturdayPurgeActive()
  const voting = isSundayVotingOpen()
  return (
    <div className="min-h-screen">
      {purge && <div className="banner">PURGE DAY ACTIVE • 8:00 AM–MIDNIGHT CST • Anyone can eliminate anyone.</div>}
      {voting && <div className="banner bg-primary text-white">VOTING OPEN • Sunday only • Vote to continue or end & share prize pool.</div>}
      <header className="border-b border-white/10 sticky top-0 bg-bg/80 backdrop-blur z-50">
        <div className="container-narrow flex items-center gap-3 py-3">
          <img src="/logo.svg" alt="PCS" className="h-9 w-9 rounded"/>
          <div className="font-bold text-lg">PCS Senior Assassin</div>
          <div className="ml-auto hidden sm:flex items-center gap-2 text-sm text-white/70">{weekLabel()}</div>
        </div>
        <div className="container-narrow">
          <nav className="flex items-center gap-2 overflow-x-auto whitespace-nowrap py-2">
            <NavItem to="/">Home</NavItem>
            <NavItem to="/rules">Rules</NavItem>
            <NavItem to="/signup">Sign Up</NavItem>
            <NavItem to="/vote">Vote</NavItem>
            <NavItem to="/admin">Admin</NavItem>
            <a href="https://www.instagram.com/pcsseniorassassin26/" target="_blank" rel="noopener" className="px-3 py-2 rounded-md hover:bg-white/5">Instagram</a>
          </nav>
        </div>
      </header>
      <main className="container-narrow py-8 space-y-8">
        <Routes>
          <Route path="/" element={<Home/>} />
          <Route path="/rules" element={<Rules/>} />
          <Route path="/signup" element={<Signup/>} />
          <Route path="/vote" element={<Vote/>} />
          <Route path="/admin" element={<Admin/>} />
        </Routes>
      </main>
      <footer className="container-narrow py-10 text-white/50 text-sm">
        <p>Theme: dark purple & gold • Drop your own logo by replacing <code>/public/logo.svg</code>.</p>
        <p>© {new Date().getFullYear()} PCS Senior Assassin</p>
      </footer>
    </div>
  )
}
