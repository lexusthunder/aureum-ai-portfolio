import { useEffect, useState } from 'react'
import { getActivities, createActivity, getLeads } from '../lib/api'
import Spinner from '../components/ui/Spinner'

const TYPE_ICONS = { call:'📞', email:'✉️', viewing:'🏠', meeting:'👥', note:'📝', offer:'💰' }
const TYPE_COLORS = { call:'bg-blue-500/15 text-blue-400', email:'bg-purple-500/15 text-purple-400', viewing:'bg-green-500/15 text-green-400', meeting:'bg-yellow-500/15 text-yellow-400', note:'bg-gray-500/15 text-gray-400', offer:'bg-amber-500/15 text-amber-400' }

const DEMO_ACTIVITIES = [
  { id:1, activity_type:'call', description:'Initial contact — discussed requirements and budget range. Lead is very motivated.', created_at:new Date(Date.now()-3600000).toISOString(), lead_id:1 },
  { id:2, activity_type:'viewing', description:'Property viewing at 14 Chelmsford Rd. Client was impressed with the garden.', created_at:new Date(Date.now()-86400000).toISOString(), lead_id:1 },
  { id:3, activity_type:'email', description:'Sent follow-up email with 5 matching properties from Ranelagh and Sandymount.', created_at:new Date(Date.now()-86400000*2).toISOString(), lead_id:2 },
  { id:4, activity_type:'offer', description:'Offer submitted: €615,000 on Chelmsford Rd. Awaiting vendor response.', created_at:new Date(Date.now()-86400000*3).toISOString(), lead_id:1 },
  { id:5, activity_type:'meeting', description:'Office meeting to review shortlisted properties and discuss mortgage pre-approval.', created_at:new Date(Date.now()-86400000*4).toISOString(), lead_id:3 },
  { id:6, activity_type:'note', description:'Client mentioned they need to sell existing property first. Timeline 3-6 months.', created_at:new Date(Date.now()-86400000*5).toISOString(), lead_id:4 },
  { id:7, activity_type:'call', description:'Follow-up call. Client confirmed mortgage approval for €650,000.', created_at:new Date(Date.now()-86400000*6).toISOString(), lead_id:1 },
  { id:8, activity_type:'viewing', description:'Second viewing of Grand Canal penthouse. Client very interested, negotiating price.', created_at:new Date(Date.now()-86400000*7).toISOString(), lead_id:3 },
]

function timeAgo(iso) {
  const d=(Date.now()-new Date(iso))/1000
  if(d<60)return'just now'; if(d<3600)return Math.round(d/60)+'m ago'; if(d<86400)return Math.round(d/3600)+'h ago'
  return Math.round(d/86400)+'d ago'
}

export default function Activities() {
  const [activities, setActivities] = useState([])
  const [leads, setLeads] = useState([])
  const [loading, setLoading] = useState(true)
  const [typeFilter, setTypeFilter] = useState('all')
  const [showAdd, setShowAdd] = useState(false)

  useEffect(() => {
    Promise.all([
      getActivities().then(d=>setActivities(d.activities||d||[])).catch(()=>setActivities(DEMO_ACTIVITIES)),
      getLeads().then(d=>setLeads(d.leads||d||[])).catch(()=>{}),
    ]).finally(()=>setLoading(false))
  }, [])

  const filtered = typeFilter === 'all' ? activities : activities.filter(a => a.activity_type === typeFilter)

  async function handleAdd(form) {
    try { const a = await createActivity(form); setActivities(prev=>[a,...prev]) }
    catch { setActivities(prev=>[{ id:Date.now(),...form, created_at:new Date().toISOString() },...prev]) }
    setShowAdd(false)
  }

  if (loading) return <div className="flex items-center justify-center min-h-screen"><Spinner size="lg" /></div>

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Activities</h1>
          <p className="text-sm text-gray-500 mt-0.5">{activities.length} recorded</p>
        </div>
        <button onClick={()=>setShowAdd(true)} className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-black font-semibold rounded-lg text-sm">+ Log Activity</button>
      </div>

      {/* Type filter */}
      <div className="flex gap-2 mb-6 flex-wrap">
        <button onClick={()=>setTypeFilter('all')} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${typeFilter==='all'?'bg-amber-500/15 text-amber-400':'text-gray-500 hover:text-white'}`}>All</button>
        {Object.keys(TYPE_ICONS).map(t => (
          <button key={t} onClick={()=>setTypeFilter(t)} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors capitalize ${typeFilter===t?'bg-amber-500/15 text-amber-400':'text-gray-500 hover:text-white'}`}>
            {TYPE_ICONS[t]} {t}
          </button>
        ))}
      </div>

      {/* Timeline */}
      <div className="relative">
        <div className="absolute left-5 top-0 bottom-0 w-px bg-white/8" />
        <div className="space-y-4">
          {filtered.length === 0 ? (
            <div className="text-center py-12 text-gray-500">No activities</div>
          ) : filtered.map((act, i) => (
            <div key={act.id||i} className="flex gap-4 relative">
              <div className={`shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-lg z-10 ${TYPE_COLORS[act.activity_type]||'bg-gray-500/15'}`}>
                {TYPE_ICONS[act.activity_type]||'📋'}
              </div>
              <div className="flex-1 bg-gray-900 rounded-xl border border-white/8 p-4 mb-0">
                <div className="flex items-start justify-between gap-2">
                  <p className="text-sm text-gray-200 leading-relaxed">{act.description}</p>
                  <span className="text-xs text-gray-600 shrink-0 mt-0.5">{timeAgo(act.created_at)}</span>
                </div>
                <div className="flex items-center gap-3 mt-2">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium capitalize ${TYPE_COLORS[act.activity_type]||''}`}>{act.activity_type}</span>
                  {act.lead_id && <span className="text-xs text-gray-500">Lead #{act.lead_id}</span>}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {showAdd && <AddActivityModal leads={leads} onClose={()=>setShowAdd(false)} onSave={handleAdd} />}
    </div>
  )
}

function AddActivityModal({ leads, onClose, onSave }) {
  const [form, setForm] = useState({ activity_type:'call', description:'', lead_id:'' })
  const [loading, setLoading] = useState(false)
  async function handleSubmit(e) { e.preventDefault(); setLoading(true); await onSave({ ...form, lead_id:parseInt(form.lead_id)||null }); setLoading(false) }
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-gray-900 rounded-2xl border border-white/10 p-6 w-full max-w-md" onClick={e=>e.stopPropagation()}>
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-semibold text-white">Log Activity</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-white text-xl">✕</button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-xs text-gray-400 mb-1 uppercase tracking-wide">Type</label>
            <select value={form.activity_type} onChange={e=>setForm(p=>({...p,activity_type:e.target.value}))} className="w-full bg-gray-950 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none">
              {Object.keys(TYPE_ICONS).map(t=><option key={t} value={t}>{t.charAt(0).toUpperCase()+t.slice(1)}</option>)}
            </select>
          </div>
          {leads.length > 0 && <div>
            <label className="block text-xs text-gray-400 mb-1 uppercase tracking-wide">Lead</label>
            <select value={form.lead_id} onChange={e=>setForm(p=>({...p,lead_id:e.target.value}))} className="w-full bg-gray-950 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none">
              <option value="">Select lead (optional)</option>
              {leads.map(l=><option key={l.id} value={l.id}>{l.first_name} {l.last_name}</option>)}
            </select>
          </div>}
          <div>
            <label className="block text-xs text-gray-400 mb-1 uppercase tracking-wide">Description</label>
            <textarea rows={4} value={form.description} onChange={e=>setForm(p=>({...p,description:e.target.value}))} required className="w-full bg-gray-950 border border-white/10 rounded-lg px-3 py-2 text-sm text-white resize-none focus:outline-none focus:border-amber-500/50" />
          </div>
          <div className="flex gap-3 mt-2">
            <button type="button" onClick={onClose} className="flex-1 px-4 py-2 border border-white/10 rounded-lg text-sm text-gray-400 hover:text-white">Cancel</button>
            <button type="submit" disabled={loading} className="flex-1 px-4 py-2 bg-amber-500 hover:bg-amber-400 text-black font-semibold rounded-lg text-sm flex items-center justify-center gap-2">{loading&&<Spinner size="sm"/>} Log</button>
          </div>
        </form>
      </div>
    </div>
  )
}
