import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { updateUserProfile } from '../lib/api'
import Spinner from '../components/ui/Spinner'

export default function Settings() {
  const { user, updateUser } = useAuth()
  const [profile, setProfile] = useState({ full_name: user?.full_name||user?.name||'', email: user?.email||'', company: user?.company||'', role: user?.role||'agent' })
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [password, setPassword] = useState({ current:'', new_pass:'', confirm:'' })
  const [notifications, setNotifications] = useState({ new_lead:true, deal_update:true, viewing_reminder:true, weekly_report:false })

  async function handleSaveProfile(e) {
    e.preventDefault(); setSaving(true)
    try {
      await updateUserProfile(user?.id, profile)
      updateUser({ ...profile, name: profile.full_name })
    } catch {
      updateUser({ ...profile, name: profile.full_name })
    } finally {
      setSaving(false); setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    }
  }

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold text-white mb-6">Settings</h1>

      {/* Profile */}
      <form onSubmit={handleSaveProfile}>
        <div className="bg-gray-900 rounded-xl border border-white/8 p-6 mb-5">
          <h2 className="text-sm font-semibold text-white mb-5">Profile</h2>

          {/* Avatar */}
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 rounded-full bg-amber-500/20 flex items-center justify-center text-amber-400 text-2xl font-bold">
              {profile.full_name?.charAt(0) || 'A'}
            </div>
            <div>
              <div className="text-sm font-medium text-white">{profile.full_name || 'Your Name'}</div>
              <div className="text-xs text-gray-500 capitalize">{profile.role}</div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Field label="Full Name" value={profile.full_name} onChange={v=>setProfile(p=>({...p,full_name:v}))} />
              <Field label="Email" type="email" value={profile.email} onChange={v=>setProfile(p=>({...p,email:v}))} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Company" value={profile.company} onChange={v=>setProfile(p=>({...p,company:v}))} />
              <div>
                <label className="block text-xs text-gray-400 mb-1.5 uppercase tracking-wide">Role</label>
                <select value={profile.role} onChange={e=>setProfile(p=>({...p,role:e.target.value}))}
                  className="w-full bg-gray-950 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-amber-500/50">
                  <option value="agent">Agent</option>
                  <option value="manager">Manager</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 mt-5">
            <button type="submit" disabled={saving} className="flex items-center gap-2 px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-black font-semibold rounded-lg text-sm transition-colors disabled:opacity-60">
              {saving ? <Spinner size="sm"/> : null} Save Profile
            </button>
            {saved && <span className="text-sm text-green-400">✓ Saved</span>}
          </div>
        </div>
      </form>

      {/* Notifications */}
      <div className="bg-gray-900 rounded-xl border border-white/8 p-6 mb-5">
        <h2 className="text-sm font-semibold text-white mb-5">Notifications</h2>
        <div className="space-y-4">
          {[
            { key:'new_lead', label:'New Lead', desc:'Notify when a new lead is assigned to you' },
            { key:'deal_update', label:'Deal Updates', desc:'Notify when a deal stage changes' },
            { key:'viewing_reminder', label:'Viewing Reminders', desc:'Remind 1 hour before scheduled viewings' },
            { key:'weekly_report', label:'Weekly Report', desc:'Receive a weekly performance summary' },
          ].map(({ key, label, desc }) => (
            <div key={key} className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
              <div>
                <div className="text-sm font-medium text-white">{label}</div>
                <div className="text-xs text-gray-500 mt-0.5">{desc}</div>
              </div>
              <button
                type="button"
                onClick={() => setNotifications(p => ({ ...p, [key]: !p[key] }))}
                className={`relative w-11 h-6 rounded-full transition-colors ${notifications[key] ? 'bg-amber-500' : 'bg-gray-700'}`}
              >
                <span className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform ${notifications[key] ? 'translate-x-5' : ''}`} />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Password */}
      <div className="bg-gray-900 rounded-xl border border-white/8 p-6 mb-5">
        <h2 className="text-sm font-semibold text-white mb-5">Change Password</h2>
        <div className="space-y-3">
          <Field label="Current Password" type="password" value={password.current} onChange={v=>setPassword(p=>({...p,current:v}))} />
          <div className="grid grid-cols-2 gap-3">
            <Field label="New Password" type="password" value={password.new_pass} onChange={v=>setPassword(p=>({...p,new_pass:v}))} />
            <Field label="Confirm New" type="password" value={password.confirm} onChange={v=>setPassword(p=>({...p,confirm:v}))} />
          </div>
          <button type="button" onClick={()=>alert('Password change requires backend connection.')}
            className="px-5 py-2.5 border border-white/10 text-gray-300 hover:text-white rounded-lg text-sm transition-colors">
            Update Password
          </button>
        </div>
      </div>

      {/* About */}
      <div className="bg-gray-900 rounded-xl border border-white/8 p-6">
        <h2 className="text-sm font-semibold text-white mb-4">About Aureum CRM</h2>
        <div className="space-y-2">
          {[['Version','1.0.0'],['Backend','FastAPI + SQLite'],['Frontend','React + Vite + Tailwind'],['AI','Claude Vision API'],['Market','Ireland 🇮🇪']].map(([k,v])=>(
            <div key={k} className="flex justify-between text-sm border-b border-white/5 pb-2 last:border-0">
              <span className="text-gray-500">{k}</span>
              <span className="text-gray-300">{v}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function Field({ label, type='text', value, onChange }) {
  return (
    <div>
      <label className="block text-xs text-gray-400 mb-1.5 uppercase tracking-wide">{label}</label>
      <input type={type} value={value} onChange={e=>onChange(e.target.value)}
        className="w-full bg-gray-950 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-amber-500/50 transition-colors" />
    </div>
  )
}
