import { useState } from 'react'
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

// Primary tabs shown in bottom bar (iOS) / sidebar (desktop)
const PRIMARY_NAV = [
  { to: '/dashboard',   icon: '⊞',  label: 'Dashboard' },
  { to: '/leads',       icon: '👥',  label: 'Leads' },
  { to: '/deals',       icon: '🤝',  label: 'Deals' },
  { to: '/properties',  icon: '🏠',  label: 'Properties' },
  { to: '/analytics',   icon: '📊',  label: 'Analytics' },
]

// Secondary nav — in sidebar desktop / "More" drawer on mobile
const MORE_NAV = [
  { to: '/activities',    icon: '📋', label: 'Activities' },
  { to: '/ai-matching',   icon: '✦',  label: 'AI Matching' },
  { to: '/email',         icon: '✉',  label: 'Email Outreach' },
  { to: '/social',        icon: '📱',  label: 'Social Media' },
  { to: '/photo-caption', icon: '🖼',  label: 'Photo Captions' },
  { to: '/financial',     icon: '💰',  label: 'Financial' },
  { to: '/automations',   icon: '⚡',  label: 'Automations' },
  { to: '/strategy',      icon: '🎯',  label: 'Strategy' },
  { to: '/settings',      icon: '⚙',  label: 'Settings' },
]

const ALL_NAV = [...PRIMARY_NAV, ...MORE_NAV]

export default function Layout() {
  const [collapsed, setCollapsed]     = useState(false)
  const [moreOpen, setMoreOpen]       = useState(false)
  const { user, logout }              = useAuth()
  const navigate                      = useNavigate()
  const location                      = useLocation()

  const isMoreActive = MORE_NAV.some(n => location.pathname.startsWith(n.to))

  function handleLogout() {
    logout()
    navigate('/login')
  }

  function handleMoreNav(to) {
    setMoreOpen(false)
    navigate(to)
  }

  return (
    <div className="flex min-h-screen bg-gray-950 text-gray-100">

      {/* ── DESKTOP SIDEBAR ─────────────────────────────── */}
      <aside
        className={`hidden md:flex flex-col bg-gray-900 border-r border-white/8 transition-all duration-200 ${
          collapsed ? 'w-16' : 'w-60'
        } shrink-0`}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 px-4 py-5 border-b border-white/8">
          <div className="w-8 h-8 rounded-lg bg-amber-500 flex items-center justify-center text-black font-black text-sm shrink-0">
            A
          </div>
          {!collapsed && (
            <div>
              <div className="font-bold text-white text-sm">Aureum</div>
              <div className="text-xs text-gray-500">CRM</div>
            </div>
          )}
        </div>

        {/* Nav */}
        <nav className="flex-1 py-4 px-2 flex flex-col gap-1 overflow-y-auto">
          {ALL_NAV.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-amber-500/15 text-amber-400 border border-amber-500/20'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`
              }
            >
              <span className="text-base shrink-0">{item.icon}</span>
              {!collapsed && <span>{item.label}</span>}
            </NavLink>
          ))}
        </nav>

        {/* User + collapse */}
        <div className="p-3 border-t border-white/8">
          {!collapsed && (
            <div className="flex items-center gap-2 px-2 py-2 mb-2">
              <div className="w-7 h-7 rounded-full bg-amber-500/20 flex items-center justify-center text-amber-400 text-xs font-bold shrink-0">
                {user?.name?.charAt(0) || user?.full_name?.charAt(0) || 'A'}
              </div>
              <div className="min-w-0">
                <div className="text-xs font-semibold text-white truncate">
                  {user?.name || user?.full_name || 'Agent'}
                </div>
                <div className="text-xs text-gray-500 truncate">{user?.role || 'agent'}</div>
              </div>
            </div>
          )}
          <div className="flex gap-1">
            <button
              onClick={handleLogout}
              className={`flex items-center gap-2 px-2 py-2 rounded-lg text-xs text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-colors ${
                collapsed ? 'justify-center w-full' : 'flex-1'
              }`}
            >
              <span>↪</span>
              {!collapsed && 'Logout'}
            </button>
            <button
              onClick={() => setCollapsed(v => !v)}
              className="px-2 py-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-colors text-xs"
            >
              {collapsed ? '→' : '←'}
            </button>
          </div>
        </div>
      </aside>

      {/* ── MOBILE: MAIN CONTENT ────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">

        {/* Mobile Header */}
        <header className="md:hidden flex items-center justify-between px-4 pt-safe bg-gray-900 border-b border-white/8 h-14 shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-amber-500 flex items-center justify-center text-black font-black text-xs shrink-0">
              A
            </div>
            <span className="font-bold text-white text-sm">Aureum CRM</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="text-xs text-gray-500 px-2 py-1 bg-white/5 rounded-full">
              {user?.name?.split(' ')[0] || 'Agent'}
            </div>
          </div>
        </header>

        {/* Main content */}
        <main className="flex-1 overflow-auto pb-safe-bottom">
          <div className="md:pb-0 pb-20">
            <Outlet />
          </div>
        </main>

        {/* ── MOBILE BOTTOM TAB BAR ─────────────────────── */}
        <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-gray-900/95 backdrop-blur-xl border-t border-white/8 pb-safe z-50">
          <div className="flex items-center justify-around px-2 pt-2 pb-1">
            {PRIMARY_NAV.map(item => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-all min-w-0 ${
                    isActive
                      ? 'text-amber-400'
                      : 'text-gray-500'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <div className={`text-xl leading-none transition-transform ${isActive ? 'scale-110' : ''}`}>
                      {item.icon}
                    </div>
                    <span className={`text-[10px] font-medium truncate leading-tight mt-0.5 ${
                      isActive ? 'text-amber-400' : 'text-gray-500'
                    }`}>
                      {item.label}
                    </span>
                    {isActive && (
                      <div className="w-1 h-1 rounded-full bg-amber-400 mt-0.5" />
                    )}
                  </>
                )}
              </NavLink>
            ))}

            {/* More button */}
            <button
              onClick={() => setMoreOpen(true)}
              className={`flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-all ${
                isMoreActive ? 'text-amber-400' : 'text-gray-500'
              }`}
            >
              <div className={`text-xl leading-none transition-transform ${isMoreActive ? 'scale-110' : ''}`}>
                ☰
              </div>
              <span className={`text-[10px] font-medium leading-tight mt-0.5 ${
                isMoreActive ? 'text-amber-400' : 'text-gray-500'
              }`}>
                More
              </span>
              {isMoreActive && (
                <div className="w-1 h-1 rounded-full bg-amber-400 mt-0.5" />
              )}
            </button>
          </div>
        </nav>
      </div>

      {/* ── MORE DRAWER (mobile) ─────────────────────────── */}
      {moreOpen && (
        <>
          <div
            className="md:hidden fixed inset-0 bg-black/60 z-40 backdrop-blur-sm"
            onClick={() => setMoreOpen(false)}
          />
          <div className="md:hidden fixed bottom-0 left-0 right-0 bg-gray-900 rounded-t-2xl border-t border-white/10 z-50 pb-safe">
            {/* Handle */}
            <div className="flex justify-center pt-3 pb-2">
              <div className="w-10 h-1 rounded-full bg-white/20" />
            </div>

            {/* User info */}
            <div className="flex items-center gap-3 px-5 py-3 border-b border-white/8 mb-2">
              <div className="w-9 h-9 rounded-full bg-amber-500/20 flex items-center justify-center text-amber-400 text-sm font-bold shrink-0">
                {user?.name?.charAt(0) || 'A'}
              </div>
              <div>
                <div className="text-sm font-semibold text-white">{user?.name || 'Agent'}</div>
                <div className="text-xs text-gray-500">{user?.email || ''}</div>
              </div>
            </div>

            {/* Nav items */}
            <div className="px-3 pb-2 grid grid-cols-2 gap-1 max-h-80 overflow-y-auto">
              {MORE_NAV.filter(n => n.to !== '/settings').map(item => (
                <button
                  key={item.to}
                  onClick={() => handleMoreNav(item.to)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors text-left ${
                    location.pathname.startsWith(item.to)
                      ? 'bg-amber-500/15 text-amber-400 border border-amber-500/20'
                      : 'text-gray-300 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <span className="text-base shrink-0">{item.icon}</span>
                  <span className="truncate">{item.label}</span>
                </button>
              ))}
            </div>

            {/* Bottom actions */}
            <div className="px-3 py-3 border-t border-white/8 flex gap-2 mt-1">
              <button
                onClick={() => handleMoreNav('/settings')}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
              >
                <span>⚙</span>
                <span>Settings</span>
              </button>
              <button
                onClick={handleLogout}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
              >
                <span>↪</span>
                <span>Logout</span>
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
