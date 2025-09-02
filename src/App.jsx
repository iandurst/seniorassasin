
import React from 'react'
import { Routes, Route, NavLink, Link, useLocation } from 'react-router-dom'
import Home from './pages/Home'
import Rules from './pages/Rules'
import Signup from './pages/Signup'
import Admin from './pages/Admin'
import Vote from './pages/Vote'
import Leaderboard from './pages/Leaderboard'
import Banner from './components/Banner'
import Logo from './components/Logo'

const NavItem = ({ to, children }) => (
  <NavLink
    to={to}
    className={({ isActive }) =>
      'px-3 py-2 rounded-md text-sm font-medium ' + (isActive ? 'bg-primary text-white' : 'text-gray-200 hover:text-white hover:bg-[#1e1134]')
    }
  >
    {children}
  </NavLink>
)

export default function App() {
  const location = useLocation()
  return (
    <div className="min-h-screen bg-bg">
      <Banner />
      <header className="border-b border-white/10 sticky top-0 z-40 backdrop-blur bg-bg/80">
        <div className="container flex items-center justify-between py-3">
          <Link to="/" className="flex items-center gap-3">
            <Logo size={36} />
            <div>
              <div className="text-xl font-bold">PCS Senior Assassin</div>
              <div className="text-xs text-gray-400">Dark purple & gold theme • drop your logo in /public/logo.svg</div>
            </div>
          </Link>
          <nav className="flex items-center gap-1">
            <NavItem to="/">Home</NavItem>
            <NavItem to="/leaderboard">Leaderboard</NavItem>
            <NavItem to="/rules">Rules</NavItem>
            <NavItem to="/signup">Sign Up</NavItem>
            <NavItem to="/vote">Voting</NavItem>
            <NavItem to="/admin">Admin</NavItem>
          </nav>
        </div>
      </header>
      <main className="container py-8">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/leaderboard" element={<Leaderboard />} />
          <Route path="/rules" element={<Rules />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/vote" element={<Vote />} />
          <Route path="/admin" element={<Admin />} />
        </Routes>
      </main>
      <footer className="border-t border-white/10 text-sm text-gray-400">
        <div className="container py-6 flex items-center justify-between">
          <span>© {new Date().getFullYear()} PCS Senior Assassin</span>
          <span>Built for Netlify + Airtable</span>
        </div>
      </footer>
    </div>
  )
}
