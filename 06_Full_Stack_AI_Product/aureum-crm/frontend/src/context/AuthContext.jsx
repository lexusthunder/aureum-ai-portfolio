import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import axios from 'axios'
import { supabase, signIn, signOut, getSession, onAuthChange, getProfile } from '../lib/supabase'

const AuthContext = createContext(null)

const SUPABASE_CONFIGURED = !!(
  import.meta.env.VITE_SUPABASE_URL &&
  import.meta.env.VITE_SUPABASE_ANON_KEY &&
  import.meta.env.VITE_SUPABASE_URL !== 'https://placeholder.supabase.co'
)

// ── helpers ──────────────────────────────────────────────────
const mapSupabaseUser = (sbUser, profile) => ({
  id:      sbUser.id,
  email:   sbUser.email,
  name:    profile?.full_name || sbUser.email?.split('@')[0] || 'User',
  role:    profile?.role     || 'agent',
  company: profile?.company  || 'Aureum Realty Group',
  avatar:  profile?.avatar_url || null,
  language: profile?.language || 'en',
})

export function AuthProvider({ children }) {
  const [user, setUser]   = useState(null)
  const [token, setToken] = useState(() => localStorage.getItem('aureum_token'))
  const [loading, setLoading] = useState(true)

  // ── keep axios header in sync ─────────────────────────────
  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
      localStorage.setItem('aureum_token', token)
    } else {
      delete axios.defaults.headers.common['Authorization']
      localStorage.removeItem('aureum_token')
    }
  }, [token])

  // ── init: Supabase session OR legacy JWT ──────────────────
  useEffect(() => {
    if (SUPABASE_CONFIGURED) {
      // ── SUPABASE MODE ──
      getSession().then(async ({ data: { session } }) => {
        if (session) {
          const accessToken = session.access_token
          setToken(accessToken)
          axios.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`
          const { data: profile } = await getProfile(session.user.id)
          const mapped = mapSupabaseUser(session.user, profile)
          setUser(mapped)
          localStorage.setItem('aureum_user', JSON.stringify(mapped))
        } else {
          setToken(null)
          setUser(null)
        }
        setLoading(false)
      })

      const { data: { subscription } } = onAuthChange(async (event, session) => {
        if (event === 'SIGNED_IN' && session) {
          const accessToken = session.access_token
          setToken(accessToken)
          axios.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`
          const { data: profile } = await getProfile(session.user.id)
          const mapped = mapSupabaseUser(session.user, profile)
          setUser(mapped)
          localStorage.setItem('aureum_user', JSON.stringify(mapped))
        } else if (event === 'TOKEN_REFRESHED' && session) {
          setToken(session.access_token)
          axios.defaults.headers.common['Authorization'] = `Bearer ${session.access_token}`
        } else if (event === 'SIGNED_OUT') {
          setToken(null)
          setUser(null)
          localStorage.removeItem('aureum_token')
          localStorage.removeItem('aureum_user')
        }
      })
      return () => subscription.unsubscribe()

    } else {
      // ── LEGACY / DEMO MODE ──
      const initLegacy = async () => {
        if (!token) { setLoading(false); return }
        try {
          const response = await axios.get('/api/auth/me', {
            headers: { Authorization: `Bearer ${token}` },
            timeout: 5000,
          })
          setUser(response.data)
        } catch (err) {
          if (err.response?.status === 401) {
            setToken(null); setUser(null)
          } else {
            const stored = localStorage.getItem('aureum_user')
            if (stored) { try { setUser(JSON.parse(stored)) } catch { setToken(null); setUser(null) } }
            else { setToken(null); setUser(null) }
          }
        } finally { setLoading(false) }
      }
      initLegacy()
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // ── login ─────────────────────────────────────────────────
  const login = useCallback(async (email, password) => {
    if (SUPABASE_CONFIGURED) {
      const { data, error } = await signIn(email, password)
      if (error) return { success: false, error: error.message }
      // onAuthChange fires and sets state
      return { success: true }
    }

    // Legacy JWT + demo fallback
    try {
      const response = await axios.post('/api/auth/login', { email, password }, { timeout: 8000 })
      const { access_token, user: userData } = response.data
      setToken(access_token)
      setUser(userData)
      localStorage.setItem('aureum_user', JSON.stringify(userData))
      return { success: true }
    } catch (err) {
      if (
        (email === 'agent@aureum.ai' && password === 'aureum2026') ||
        (email === 'admin@aureum.ai' && password === 'aureum2026')
      ) {
        const demoUser = {
          id: 1, name: 'Alex Thornton', email,
          role: email.startsWith('admin') ? 'admin' : 'agent',
          avatar: null, company: 'Aureum Realty Group',
        }
        const demoToken = 'demo_token_' + Date.now()
        setToken(demoToken); setUser(demoUser)
        localStorage.setItem('aureum_user', JSON.stringify(demoUser))
        return { success: true }
      }
      const message = err.response?.data?.detail || err.response?.data?.message || 'Invalid credentials. Try agent@aureum.ai / aureum2026'
      return { success: false, error: message }
    }
  }, [])

  // ── logout ────────────────────────────────────────────────
  const logout = useCallback(async () => {
    if (SUPABASE_CONFIGURED) await signOut()
    setToken(null); setUser(null)
    localStorage.removeItem('aureum_token')
    localStorage.removeItem('aureum_user')
    delete axios.defaults.headers.common['Authorization']
  }, [])

  // ── updateUser ────────────────────────────────────────────
  const updateUser = useCallback((updates) => {
    setUser(prev => {
      const updated = { ...prev, ...updates }
      localStorage.setItem('aureum_user', JSON.stringify(updated))
      return updated
    })
  }, [])

  const value = {
    user, token, loading,
    isAuthenticated: !!token && !!user,
    supabaseConfigured: SUPABASE_CONFIGURED,
    login, logout, updateUser,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}

export default AuthContext
