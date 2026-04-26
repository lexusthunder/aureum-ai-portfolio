import { useEffect, useState } from 'react'
import { getDeals, createDeal, updateDeal, getLeads, getProperties } from '../lib/api'
import Spinner from '../components/ui/Spinner'

const STAGES = ['discovery','viewing','offer','negotiation','legal','closed_won','closed_lost']
const STAGE_COLORS = { discovery:'bg-gray-500/15 text-gray-400 border-gray-500/20', viewing:'bg-blue-500/15 text-blue-400 border-blue-500/20', offer:'bg-yellow-500/15 text-yellow-400 border-yellow-500/20', negotiation:'bg-orange-500/15 text-orange-400 border-orange-500/20', legal:'bg-purple-500/15 text-purple-400 border-purple-500/20', closed_won:'bg-green-500/15 text-green-400 border-green-500/20', closed_lost:'bg-red-500/15 text-red-400 border-red-500/20' }
const STAGE_LABELS = { discovery:'Discovery', viewing:'Viewing', offer:'Offer', negotiation:'Negotiation', legal:'Legal', closed_won:'Closed Won', closed_lost:'Closed Lost' }

const DEMO_DEALS = [
  { id:1, title:'3 Bed Semi — Ranelagh', stage:'offer', value:620000, commission_rate:1.5, lead:{ first_name:'Liam', last_name:'Murphy' }, property:{ title:'3 Bed Semi — Ranelagh' }, created_at:new Date(Date.now()-86400000*10).toISOString(), expected_close_date:new Date(Date.now()+86400000*14).toISOString() },
  { id:2, title:'Penthouse — Grand Canal', stage:'legal', value:1250000, commission_rate:1.5, lead:{ first_name:'Ciarán', last_name:'Walsh' }, property:{ title:'Penthouse — Grand Canal Dock' }, created_at:new Date(Date.now()-86400000*20).toISOString(), expected_close_date:new Date(Date.now()+86400000*7).toISOString() },
  { id:3, title:'2 Bed Apt — Ballsbridge', stage:'viewing', value:480000, commission_rate:1.5, lead:{ first_name:'Aoife', last_name:"O'Brien" }, property:null, created_at:new Date(Date.now()-86400000*5).toISOString(), expected_close_date:new Date(Date.now()+86400000*30).toISOString() },
  { id:4, title:'5 Bed Villa — Foxrock', stage:'discovery', value:1850000, commission_rate:1.0, lead:{ first_name:'Seán', last_name:'Byrne' }, property:null, created_at:new Date(Date.now()-86400000*3).toISOString(), expected_close_date:new Date(Date.now()+86400000*60).toISOString() },
  { id:5, title:'4 Bed House — Clontarf', stage:'negotiation', value:780000, commission_rate:1.5, lead:{ first_name:'Niamh', last_name:'Connolly' }, property:null, created_at:new Date(Date.now()-86400000*15).toISOString(), expected_close_date:new Date(Date.now()+86400000*10).toISOString() },
  { id:6, title:'Studio — Temple Bar', stage:'closed_won', value:245000, commission_rate:1.5, lead:{ first_name:'Siobhán', last_name:'Kelly' }, property:null, created_at:new Date(Date.now()-86400000*30).toISOString(), expected_close_date:new Date(Date.now()-86400000*2).toISOString() },
]

function fmt(n) { if(!n)return'—'; if(n>=1000000)return'€'+(n/1000000).toFixed(1)+'M'; return'€'+Math.round(n/1000)+'K' }
function commission(deal) { return fmt(deal.value * (deal.commission_rate||1.5) / 100) }
function daysTo(iso) { if(!iso)return'—'; const d=Math.round((new Date(iso)-Date.now())/86400000); if(d<0)return`${Math.abs(d)}d overdue`; return`in ${d}d` }

export default function Deals() {
  const [deals, setDeals] = useState([])
  const [loading, setLoading] = useState(true)
  const [stageFilter, setStageFilter] = useState('all')
  const [showAdd, setShowAdd] = useState(false)
  const [leads, setLeads] = useState([])
  const [properties, setProperties] = useState([])

  useEffect(() => {
    Promise.all([
      getDeals().then(d=>setDeals(d.deals||d||[])).catch(()=>setDeals(DEMO_DEALS)),
      getLeads().then(d=>setLeads(d.leads||d||[])).catch(()=>{}),
      getProperties().then(d=>setProperties(d.properties||d||[])).catch(()=>{}),
    ]).finally(()=>setLoading(false))
  }, [])

  const filtered = stageFilter === 'all' ? deals : deals.filter(d => d.stage === stageFilter)
  const totalValue = filtered.reduce((s, d) => s + (d.value || 0), 0)
  const totalCommission = filtered.reduce((s, d) => s + (d.value || 0) * (d.commission_rate || 1.5) / 100, 0)

  async function handleStageChange(id, stage) {
    try { await updateDeal(id, { stage }) } catch {}
    setDeals(prev => prev.map(d => d.id === id ? { ...d, stage } : d))
  }

  if (loading) return <div className="flex items-center justify-center min-h-screen"><Spinner size="lg" /></div>

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Deals</h1>
          <p className="text-sm text-gray-500 mt-0.5">{deals.length} deals · Pipeline: <span className="text-amber-400 font-semibold">{fmt(totalValue)}</span> · Commission: <span className="text-green-400 font-semibold">{fmt(totalCommission)}</span></p>
        </div>
        <button onClick={()=>setShowAdd(true)} className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-black font-semibold rounded-lg text-sm">+ New Deal</button>
      </div>

      {/* Stage filters */}
      <div className="flex gap-2 mb-6 flex-wrap">
        <button onClick={()=>setStageFilter('all')} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${stageFilter==='all'?'bg-amber-500/15 text-amber-400':'text-gray-500 hover:text-white'}`}>All ({deals.length})</button>
        {STAGES.map(s => {
          const count = deals.filter(d=>d.stage===s).length
          return <button key={s} onClick={()=>setStageFilter(s)} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors capitalize ${stageFilter===s?'bg-amber-500/15 text-amber-400':'text-gray-500 hover:text-white'}`}>{STAGE_LABELS[s]} ({count})</button>
        })}
      </div>

      {/* Table */}
      <div className="bg-gray-900 rounded-xl border border-white/8 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/8">
              <th className="text-left px-4 py-3 text-xs text-gray-500 font-medium uppercase tracking-wide">Deal</th>
              <th className="text-left px-4 py-3 text-xs text-gray-500 font-medium uppercase tracking-wide">Client</th>
              <th className="text-left px-4 py-3 text-xs text-gray-500 font-medium uppercase tracking-wide">Stage</th>
              <th className="text-right px-4 py-3 text-xs text-gray-500 font-medium uppercase tracking-wide">Value</th>
              <th className="text-right px-4 py-3 text-xs text-gray-500 font-medium uppercase tracking-wide">Commission</th>
              <th className="text-left px-4 py-3 text-xs text-gray-500 font-medium uppercase tracking-wide">Close Date</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr><td colSpan={6} className="text-center py-12 text-gray-500">No deals found</td></tr>
            ) : filtered.map(deal => (
              <tr key={deal.id} className="border-b border-white/5 hover:bg-white/2 transition-colors">
                <td className="px-4 py-3 text-sm font-medium text-white">{deal.title}</td>
                <td className="px-4 py-3 text-sm text-gray-400">{deal.lead?.first_name} {deal.lead?.last_name}</td>
                <td className="px-4 py-3">
                  <select value={deal.stage} onChange={e=>handleStageChange(deal.id, e.target.value)}
                    className={`px-2 py-0.5 rounded-full text-xs font-medium border cursor-pointer bg-transparent focus:outline-none ${STAGE_COLORS[deal.stage]||''}`}>
                    {STAGES.map(s=><option key={s} value={s} className="bg-gray-900 text-white">{STAGE_LABELS[s]}</option>)}
                  </select>
                </td>
                <td className="px-4 py-3 text-sm font-bold text-amber-400 text-right">{fmt(deal.value)}</td>
                <td className="px-4 py-3 text-sm text-green-400 text-right">{commission(deal)}</td>
                <td className="px-4 py-3 text-xs text-gray-500">{daysTo(deal.expected_close_date)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showAdd && <AddDealModal leads={leads} properties={properties} onClose={()=>setShowAdd(false)} onSave={d=>{setDeals(prev=>[d,...prev]);setShowAdd(false)}} />}
    </div>
  )
}

function AddDealModal({ leads, properties, onClose, onSave }) {
  const [form, setForm] = useState({ title:'', stage:'discovery', value:'', commission_rate:'1.5', lead_id:'', property_id:'' })
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault(); setLoading(true)
    try {
      const d = await createDeal({ ...form, value:parseFloat(form.value)||0, commission_rate:parseFloat(form.commission_rate)||1.5, lead_id:parseInt(form.lead_id)||null, property_id:parseInt(form.property_id)||null })
      onSave(d)
    } catch { onSave({ id:Date.now(),...form, value:parseFloat(form.value)||0 }) }
    finally { setLoading(false) }
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-gray-900 rounded-2xl border border-white/10 p-6 w-full max-w-md" onClick={e=>e.stopPropagation()}>
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-semibold text-white">New Deal</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-white text-xl">✕</button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-xs text-gray-400 mb-1 uppercase tracking-wide">Deal Title</label>
            <input type="text" value={form.title} onChange={e=>setForm(p=>({...p,title:e.target.value}))} required className="w-full bg-gray-950 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500/50" placeholder="3 Bed House — Ranelagh" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-gray-400 mb-1 uppercase tracking-wide">Value (€)</label>
              <input type="number" value={form.value} onChange={e=>setForm(p=>({...p,value:e.target.value}))} required className="w-full bg-gray-950 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500/50" />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1 uppercase tracking-wide">Commission %</label>
              <input type="number" step="0.1" value={form.commission_rate} onChange={e=>setForm(p=>({...p,commission_rate:e.target.value}))} className="w-full bg-gray-950 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500/50" />
            </div>
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1 uppercase tracking-wide">Stage</label>
            <select value={form.stage} onChange={e=>setForm(p=>({...p,stage:e.target.value}))} className="w-full bg-gray-950 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none">
              {STAGES.map(s=><option key={s} value={s}>{STAGE_LABELS[s]}</option>)}
            </select>
          </div>
          {leads.length > 0 && (
            <div>
              <label className="block text-xs text-gray-400 mb-1 uppercase tracking-wide">Lead</label>
              <select value={form.lead_id} onChange={e=>setForm(p=>({...p,lead_id:e.target.value}))} className="w-full bg-gray-950 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none">
                <option value="">Select lead</option>
                {leads.map(l=><option key={l.id} value={l.id}>{l.first_name} {l.last_name}</option>)}
              </select>
            </div>
          )}
          <div className="flex gap-3 mt-4">
            <button type="button" onClick={onClose} className="flex-1 px-4 py-2 border border-white/10 rounded-lg text-sm text-gray-400 hover:text-white">Cancel</button>
            <button type="submit" disabled={loading} className="flex-1 px-4 py-2 bg-amber-500 hover:bg-amber-400 text-black font-semibold rounded-lg text-sm flex items-center justify-center gap-2">
              {loading&&<Spinner size="sm"/>} Save
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
