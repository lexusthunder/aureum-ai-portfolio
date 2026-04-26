import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { getLeads, createLead, deleteLead } from '../lib/api'
import Spinner from '../components/ui/Spinner'

const STATUS_COLORS = {
  new: 'bg-blue-500/15 text-blue-400 border-blue-500/20',
  contacted: 'bg-yellow-500/15 text-yellow-400 border-yellow-500/20',
  qualified: 'bg-green-500/15 text-green-400 border-green-500/20',
  proposal: 'bg-purple-500/15 text-purple-400 border-purple-500/20',
  negotiation: 'bg-orange-500/15 text-orange-400 border-orange-500/20',
  won: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/20',
  lost: 'bg-red-500/15 text-red-400 border-red-500/20',
}

const DEMO_LEADS = [
  { id: 1, first_name: 'Liam', last_name: 'Murphy', email: 'liam@example.ie', phone: '+353 87 123 4567', status: 'qualified', priority: 'high', ai_score: 87, budget_min: 500000, budget_max: 650000, source: 'referral', created_at: new Date(Date.now() - 86400000 * 5).toISOString() },
  { id: 2, first_name: 'Aoife', last_name: "O'Brien", email: 'aoife@example.ie', phone: '+353 85 234 5678', status: 'new', priority: 'medium', ai_score: 72, budget_min: 350000, budget_max: 420000, source: 'website', created_at: new Date(Date.now() - 86400000 * 3).toISOString() },
  { id: 3, first_name: 'Ciarán', last_name: 'Walsh', email: 'ciaran@example.ie', phone: '+353 86 345 6789', status: 'proposal', priority: 'urgent', ai_score: 94, budget_min: 750000, budget_max: 900000, source: 'portal', created_at: new Date(Date.now() - 86400000 * 8).toISOString() },
  { id: 4, first_name: 'Siobhán', last_name: 'Kelly', email: 'siobhan@example.ie', phone: '+353 83 456 7890', status: 'contacted', priority: 'low', ai_score: 58, budget_min: 280000, budget_max: 320000, source: 'social', created_at: new Date(Date.now() - 86400000 * 1).toISOString() },
  { id: 5, first_name: 'Seán', last_name: 'Byrne', email: 'sean@example.ie', phone: '+353 87 567 8901', status: 'negotiation', priority: 'high', ai_score: 88, budget_min: 600000, budget_max: 750000, source: 'referral', created_at: new Date(Date.now() - 86400000 * 12).toISOString() },
  { id: 6, first_name: 'Niamh', last_name: 'Connolly', email: 'niamh@example.ie', phone: '+353 85 678 9012', status: 'won', priority: 'medium', ai_score: 95, budget_min: 400000, budget_max: 500000, source: 'website', created_at: new Date(Date.now() - 86400000 * 20).toISOString() },
]

function fmt(n) { if (!n) return '—'; if (n >= 1000000) return '€' + (n / 1000000).toFixed(1) + 'M'; return '€' + Math.round(n / 1000) + 'K' }
function scoreColor(s) { if (s >= 80) return 'text-green-400'; if (s >= 60) return 'text-yellow-400'; return 'text-red-400' }

export default function Leads() {
  const [leads, setLeads] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [showAdd, setShowAdd] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    getLeads()
      .then(d => setLeads(d.leads || d || []))
      .catch(() => setLeads(DEMO_LEADS))
      .finally(() => setLoading(false))
  }, [])

  const filtered = leads.filter(l => {
    const name = `${l.first_name} ${l.last_name}`.toLowerCase()
    const matchSearch = name.includes(search.toLowerCase()) || l.email?.includes(search.toLowerCase())
    const matchStatus = statusFilter === 'all' || l.status === statusFilter
    return matchSearch && matchStatus
  })

  async function handleDelete(id, e) {
    e.preventDefault(); e.stopPropagation()
    if (!confirm('Delete this lead?')) return
    try { await deleteLead(id) } catch {}
    setLeads(prev => prev.filter(l => l.id !== id))
  }

  if (loading) return <div className="flex items-center justify-center min-h-screen"><Spinner size="lg" /></div>

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Leads</h1>
          <p className="text-sm text-gray-500 mt-0.5">{leads.length} total leads</p>
        </div>
        <button
          onClick={() => setShowAdd(true)}
          className="flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-400 text-black font-semibold rounded-lg text-sm transition-colors"
        >
          + New Lead
        </button>
      </div>

      {/* Filters */}
      <div className="flex gap-3 mb-6 flex-wrap">
        <input
          type="text"
          placeholder="Search leads..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="bg-gray-900 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-amber-500/50 w-64"
        />
        <select
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
          className="bg-gray-900 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500/50"
        >
          <option value="all">All Status</option>
          {['new', 'contacted', 'qualified', 'proposal', 'negotiation', 'won', 'lost'].map(s => (
            <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div className="bg-gray-900 rounded-xl border border-white/8 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/8">
              <th className="text-left px-4 py-3 text-xs text-gray-500 font-medium uppercase tracking-wide">Lead</th>
              <th className="text-left px-4 py-3 text-xs text-gray-500 font-medium uppercase tracking-wide">Contact</th>
              <th className="text-left px-4 py-3 text-xs text-gray-500 font-medium uppercase tracking-wide">Status</th>
              <th className="text-left px-4 py-3 text-xs text-gray-500 font-medium uppercase tracking-wide">Budget</th>
              <th className="text-left px-4 py-3 text-xs text-gray-500 font-medium uppercase tracking-wide">AI Score</th>
              <th className="text-left px-4 py-3 text-xs text-gray-500 font-medium uppercase tracking-wide">Source</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr><td colSpan={7} className="text-center py-12 text-gray-500">No leads found</td></tr>
            ) : filtered.map(lead => (
              <tr
                key={lead.id}
                onClick={() => navigate(`/leads/${lead.id}`)}
                className="border-b border-white/5 hover:bg-white/2 cursor-pointer transition-colors"
              >
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-amber-500/20 flex items-center justify-center text-amber-400 text-xs font-bold shrink-0">
                      {lead.first_name[0]}{lead.last_name[0]}
                    </div>
                    <div>
                      <div className="text-sm font-medium text-white">{lead.first_name} {lead.last_name}</div>
                      <div className="text-xs text-gray-500 capitalize">{lead.priority} priority</div>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div className="text-sm text-gray-300">{lead.email || '—'}</div>
                  <div className="text-xs text-gray-500">{lead.phone || '—'}</div>
                </td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium capitalize border ${STATUS_COLORS[lead.status] || 'bg-gray-500/15 text-gray-400 border-gray-500/20'}`}>
                    {lead.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-sm text-gray-300">
                  {lead.budget_min && lead.budget_max ? `${fmt(lead.budget_min)} – ${fmt(lead.budget_max)}` : fmt(lead.budget_max)}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-1.5 bg-gray-800 rounded-full overflow-hidden w-16">
                      <div className="h-full bg-amber-500 rounded-full" style={{ width: `${lead.ai_score}%` }} />
                    </div>
                    <span className={`text-xs font-bold ${scoreColor(lead.ai_score)}`}>{Math.round(lead.ai_score)}</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-sm text-gray-500 capitalize">{lead.source || '—'}</td>
                <td className="px-4 py-3">
                  <button
                    onClick={e => handleDelete(lead.id, e)}
                    className="text-gray-600 hover:text-red-400 transition-colors text-xs px-2 py-1"
                  >
                    ✕
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showAdd && <AddLeadModal onClose={() => setShowAdd(false)} onSave={lead => { setLeads(prev => [lead, ...prev]); setShowAdd(false) }} />}
    </div>
  )
}

function AddLeadModal({ onClose, onSave }) {
  const [form, setForm] = useState({ first_name: '', last_name: '', email: '', phone: '', budget_max: '', source: 'website', notes: '' })
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    try {
      const lead = await createLead({ ...form, budget_max: parseFloat(form.budget_max) || null })
      onSave(lead)
    } catch {
      onSave({ id: Date.now(), ...form, status: 'new', ai_score: Math.random() * 40 + 50, created_at: new Date().toISOString() })
    } finally { setLoading(false) }
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-gray-900 rounded-2xl border border-white/10 p-6 w-full max-w-md" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-semibold text-white">New Lead</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-white text-xl">✕</button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <Field label="First Name" value={form.first_name} onChange={v => setForm(p => ({ ...p, first_name: v }))} required />
            <Field label="Last Name" value={form.last_name} onChange={v => setForm(p => ({ ...p, last_name: v }))} required />
          </div>
          <Field label="Email" type="email" value={form.email} onChange={v => setForm(p => ({ ...p, email: v }))} />
          <Field label="Phone" value={form.phone} onChange={v => setForm(p => ({ ...p, phone: v }))} />
          <Field label="Max Budget (€)" type="number" value={form.budget_max} onChange={v => setForm(p => ({ ...p, budget_max: v }))} />
          <div>
            <label className="block text-xs text-gray-400 mb-1 uppercase tracking-wide">Source</label>
            <select value={form.source} onChange={e => setForm(p => ({ ...p, source: e.target.value }))}
              className="w-full bg-gray-950 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500/50">
              {['website', 'referral', 'portal', 'social', 'cold', 'manual'].map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div className="flex gap-3 mt-4">
            <button type="button" onClick={onClose} className="flex-1 px-4 py-2 border border-white/10 rounded-lg text-sm text-gray-400 hover:text-white transition-colors">Cancel</button>
            <button type="submit" disabled={loading} className="flex-1 px-4 py-2 bg-amber-500 hover:bg-amber-400 text-black font-semibold rounded-lg text-sm transition-colors flex items-center justify-center gap-2">
              {loading ? <Spinner size="sm" /> : null} Save
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

function Field({ label, type = 'text', value, onChange, required }) {
  return (
    <div>
      <label className="block text-xs text-gray-400 mb-1 uppercase tracking-wide">{label}</label>
      <input type={type} value={value} onChange={e => onChange(e.target.value)} required={required}
        className="w-full bg-gray-950 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-amber-500/50" />
    </div>
  )
}
