import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { getLead, updateLead, getActivities, createActivity, matchProperties } from '../lib/api'
import Spinner from '../components/ui/Spinner'

const STATUS_OPTIONS = ['new','contacted','qualified','proposal','negotiation','won','lost']
const PRIORITY_OPTIONS = ['low','medium','high','urgent']
const STATUS_COLORS = { new:'bg-blue-500/15 text-blue-400', contacted:'bg-yellow-500/15 text-yellow-400', qualified:'bg-green-500/15 text-green-400', proposal:'bg-purple-500/15 text-purple-400', negotiation:'bg-orange-500/15 text-orange-400', won:'bg-emerald-500/15 text-emerald-400', lost:'bg-red-500/15 text-red-400' }

const DEMO_LEAD = { id: 1, first_name: 'Liam', last_name: 'Murphy', email: 'liam@example.ie', phone: '+353 87 123 4567', company: 'Murphy & Co', source: 'referral', status: 'qualified', priority: 'high', ai_score: 87, budget_min: 500000, budget_max: 650000, preferred_locations: ['Dublin 4', 'Dublin 6'], property_types: ['house', 'apartment'], bedrooms_min: 3, notes: 'Looking for a family home near good schools. Prefers south Dublin.', created_at: new Date(Date.now() - 86400000 * 5).toISOString(), last_contacted: new Date(Date.now() - 86400000 * 2).toISOString() }
const DEMO_ACTIVITIES = [
  { id: 1, activity_type: 'call', description: 'Initial contact call — discussed budget and preferences', created_at: new Date(Date.now() - 86400000 * 5).toISOString() },
  { id: 2, activity_type: 'email', description: 'Sent property listings matching criteria', created_at: new Date(Date.now() - 86400000 * 4).toISOString() },
  { id: 3, activity_type: 'viewing', description: 'Viewing at 14 Ailesbury Rd — very interested, wanted more time to think', created_at: new Date(Date.now() - 86400000 * 2).toISOString() },
]
const DEMO_MATCHES = [
  { id: 1, title: '3 Bed Semi — Ranelagh', price: 620000, city: 'Dublin', bedrooms: 3, match_score: 94 },
  { id: 2, title: '4 Bed Det — Donnybrook', price: 645000, city: 'Dublin', bedrooms: 4, match_score: 88 },
  { id: 3, title: '3 Bed Ter — Sandymount', price: 595000, city: 'Dublin', bedrooms: 3, match_score: 82 },
]

function fmt(n) { if (!n) return '—'; if (n >= 1000000) return '€'+(n/1000000).toFixed(1)+'M'; return '€'+Math.round(n/1000)+'K' }
function timeAgo(iso) { if (!iso) return '—'; const d=(Date.now()-new Date(iso))/1000; if(d<3600) return Math.round(d/60)+'m ago'; if(d<86400) return Math.round(d/3600)+'h ago'; return Math.round(d/86400)+'d ago' }
const ACT_ICONS = { call:'📞', email:'✉️', viewing:'🏠', meeting:'👥', note:'📝', offer:'💰' }

export default function LeadDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [lead, setLead] = useState(null)
  const [activities, setActivities] = useState([])
  const [matches, setMatches] = useState([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [editForm, setEditForm] = useState({})
  const [logActivity, setLogActivity] = useState(false)
  const [actForm, setActForm] = useState({ activity_type: 'call', description: '' })
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    Promise.all([
      getLead(id).catch(() => DEMO_LEAD),
      getActivities({ lead_id: id }).catch(() => ({ activities: DEMO_ACTIVITIES })),
      matchProperties(id).catch(() => ({ matches: DEMO_MATCHES })),
    ]).then(([l, a, m]) => {
      setLead(l)
      setEditForm(l)
      setActivities(a.activities || a || DEMO_ACTIVITIES)
      setMatches(m.matches || m || DEMO_MATCHES)
    }).finally(() => setLoading(false))
  }, [id])

  async function handleSave() {
    setSaving(true)
    try { const updated = await updateLead(id, editForm); setLead(updated); setEditForm(updated) }
    catch { setLead(prev => ({ ...prev, ...editForm })) }
    finally { setSaving(false); setEditing(false) }
  }

  async function handleLogActivity(e) {
    e.preventDefault(); setSaving(true)
    try { const act = await createActivity({ ...actForm, lead_id: parseInt(id) }); setActivities(prev => [act, ...prev]) }
    catch { setActivities(prev => [{ id: Date.now(), ...actForm, created_at: new Date().toISOString() }, ...prev]) }
    finally { setSaving(false); setLogActivity(false); setActForm({ activity_type: 'call', description: '' }) }
  }

  if (loading) return <div className="flex items-center justify-center min-h-screen"><Spinner size="lg" /></div>
  const l = lead || DEMO_LEAD

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <button onClick={() => navigate('/leads')} className="text-gray-500 hover:text-white transition-colors text-sm">← Leads</button>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-amber-500/20 flex items-center justify-center text-amber-400 text-lg font-bold">
              {l.first_name?.[0]}{l.last_name?.[0]}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">{l.first_name} {l.last_name}</h1>
              <div className="flex items-center gap-2 mt-0.5">
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium capitalize ${STATUS_COLORS[l.status] || 'bg-gray-500/15 text-gray-400'}`}>{l.status}</span>
                <span className="text-xs text-gray-500">AI Score: <span className="text-amber-400 font-bold">{Math.round(l.ai_score)}</span></span>
              </div>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setLogActivity(true)} className="px-4 py-2 bg-gray-800 border border-white/10 text-white rounded-lg text-sm hover:bg-gray-700 transition-colors">+ Activity</button>
          <button onClick={() => setEditing(v => !v)} className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-black font-semibold rounded-lg text-sm transition-colors">
            {editing ? 'Cancel' : 'Edit'}
          </button>
          {editing && <button onClick={handleSave} disabled={saving} className="px-4 py-2 bg-green-500 hover:bg-green-400 text-black font-semibold rounded-lg text-sm transition-colors flex items-center gap-2">
            {saving && <Spinner size="sm" />} Save
          </button>}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left col */}
        <div className="space-y-4">
          {/* Contact info */}
          <div className="bg-gray-900 rounded-xl border border-white/8 p-5">
            <h3 className="text-xs text-gray-500 uppercase tracking-wide font-medium mb-4">Contact Info</h3>
            <div className="space-y-3">
              <InfoRow label="Email" value={editing ? <input className="bg-gray-950 border border-white/10 rounded px-2 py-1 text-sm text-white w-full focus:outline-none focus:border-amber-500/50" value={editForm.email||''} onChange={e=>setEditForm(p=>({...p,email:e.target.value}))} /> : l.email} />
              <InfoRow label="Phone" value={editing ? <input className="bg-gray-950 border border-white/10 rounded px-2 py-1 text-sm text-white w-full focus:outline-none focus:border-amber-500/50" value={editForm.phone||''} onChange={e=>setEditForm(p=>({...p,phone:e.target.value}))} /> : l.phone} />
              <InfoRow label="Company" value={l.company} />
              <InfoRow label="Source" value={<span className="capitalize">{l.source}</span>} />
              <InfoRow label="Added" value={timeAgo(l.created_at)} />
              <InfoRow label="Last Contact" value={timeAgo(l.last_contacted)} />
            </div>
          </div>

          {/* Status & Priority */}
          <div className="bg-gray-900 rounded-xl border border-white/8 p-5">
            <h3 className="text-xs text-gray-500 uppercase tracking-wide font-medium mb-4">Lead Details</h3>
            <div className="space-y-3">
              <div>
                <div className="text-xs text-gray-500 mb-1">Status</div>
                {editing ? (
                  <select value={editForm.status} onChange={e=>setEditForm(p=>({...p,status:e.target.value}))} className="w-full bg-gray-950 border border-white/10 rounded px-2 py-1.5 text-sm text-white focus:outline-none focus:border-amber-500/50">
                    {STATUS_OPTIONS.map(s=><option key={s} value={s}>{s}</option>)}
                  </select>
                ) : <span className={`px-2 py-0.5 rounded-full text-xs font-medium capitalize ${STATUS_COLORS[l.status]||''}`}>{l.status}</span>}
              </div>
              <div>
                <div className="text-xs text-gray-500 mb-1">Priority</div>
                {editing ? (
                  <select value={editForm.priority} onChange={e=>setEditForm(p=>({...p,priority:e.target.value}))} className="w-full bg-gray-950 border border-white/10 rounded px-2 py-1.5 text-sm text-white focus:outline-none focus:border-amber-500/50">
                    {PRIORITY_OPTIONS.map(s=><option key={s} value={s}>{s}</option>)}
                  </select>
                ) : <span className="text-sm text-white capitalize">{l.priority}</span>}
              </div>
              <InfoRow label="Budget" value={`${fmt(l.budget_min)} – ${fmt(l.budget_max)}`} />
              <InfoRow label="Min Bedrooms" value={l.bedrooms_min || '—'} />
            </div>
          </div>

          {/* Notes */}
          <div className="bg-gray-900 rounded-xl border border-white/8 p-5">
            <h3 className="text-xs text-gray-500 uppercase tracking-wide font-medium mb-3">Notes</h3>
            {editing ? (
              <textarea rows={4} value={editForm.notes||''} onChange={e=>setEditForm(p=>({...p,notes:e.target.value}))}
                className="w-full bg-gray-950 border border-white/10 rounded px-3 py-2 text-sm text-white resize-none focus:outline-none focus:border-amber-500/50" />
            ) : <p className="text-sm text-gray-300 leading-relaxed">{l.notes || 'No notes yet.'}</p>}
          </div>
        </div>

        {/* Right col */}
        <div className="lg:col-span-2 space-y-4">
          {/* AI Matches */}
          <div className="bg-gray-900 rounded-xl border border-white/8 p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xs text-gray-500 uppercase tracking-wide font-medium">✦ AI Property Matches</h3>
              <Link to="/properties" className="text-xs text-amber-400 hover:text-amber-300">View all →</Link>
            </div>
            <div className="space-y-2">
              {matches.map(m => (
                <div key={m.id} className="flex items-center gap-3 p-3 bg-gray-950/50 rounded-lg border border-white/5">
                  <div className="flex-1">
                    <div className="text-sm font-medium text-white">{m.title}</div>
                    <div className="text-xs text-gray-500">{m.city} · {m.bedrooms} bed</div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-bold text-amber-400">{fmt(m.price)}</div>
                    <div className="text-xs text-gray-500">Match: <span className="text-green-400 font-bold">{m.match_score}%</span></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Activities */}
          <div className="bg-gray-900 rounded-xl border border-white/8 p-5">
            <h3 className="text-xs text-gray-500 uppercase tracking-wide font-medium mb-4">Activity Timeline</h3>
            <div className="space-y-3">
              {activities.length === 0 ? (
                <p className="text-sm text-gray-500 text-center py-4">No activities yet</p>
              ) : activities.map((act, i) => (
                <div key={act.id || i} className="flex gap-3">
                  <div className="shrink-0 w-7 h-7 rounded-full bg-gray-800 flex items-center justify-center text-sm">
                    {ACT_ICONS[act.activity_type] || '📋'}
                  </div>
                  <div className="flex-1 pb-3 border-b border-white/5 last:border-0">
                    <div className="text-sm text-gray-300 leading-relaxed">{act.description}</div>
                    <div className="text-xs text-gray-600 mt-1">{act.activity_type} · {timeAgo(act.created_at)}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Log Activity Modal */}
      {logActivity && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setLogActivity(false)}>
          <div className="bg-gray-900 rounded-2xl border border-white/10 p-6 w-full max-w-md" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-white">Log Activity</h2>
              <button onClick={() => setLogActivity(false)} className="text-gray-500 hover:text-white">✕</button>
            </div>
            <form onSubmit={handleLogActivity} className="space-y-3">
              <div>
                <label className="block text-xs text-gray-400 mb-1 uppercase tracking-wide">Type</label>
                <select value={actForm.activity_type} onChange={e=>setActForm(p=>({...p,activity_type:e.target.value}))}
                  className="w-full bg-gray-950 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500/50">
                  {['call','email','viewing','meeting','note','offer'].map(t=><option key={t} value={t}>{t.charAt(0).toUpperCase()+t.slice(1)}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1 uppercase tracking-wide">Description</label>
                <textarea rows={3} value={actForm.description} onChange={e=>setActForm(p=>({...p,description:e.target.value}))} required
                  className="w-full bg-gray-950 border border-white/10 rounded-lg px-3 py-2 text-sm text-white resize-none focus:outline-none focus:border-amber-500/50" />
              </div>
              <div className="flex gap-3 mt-2">
                <button type="button" onClick={() => setLogActivity(false)} className="flex-1 px-4 py-2 border border-white/10 rounded-lg text-sm text-gray-400 hover:text-white">Cancel</button>
                <button type="submit" disabled={saving} className="flex-1 px-4 py-2 bg-amber-500 hover:bg-amber-400 text-black font-semibold rounded-lg text-sm flex items-center justify-center gap-2">
                  {saving && <Spinner size="sm" />} Log
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

function InfoRow({ label, value }) {
  return (
    <div className="flex justify-between items-start gap-4">
      <span className="text-xs text-gray-500 shrink-0 mt-0.5">{label}</span>
      <span className="text-sm text-gray-300 text-right">{value || '—'}</span>
    </div>
  )
}
