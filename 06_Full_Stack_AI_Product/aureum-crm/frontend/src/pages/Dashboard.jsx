import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getDashboard, seedData } from '../lib/api'
import Spinner from '../components/ui/Spinner'
import { useAuth } from '../context/AuthContext'

const DEMO = {
  stats: { total_leads: 47, active_deals: 12, total_revenue: 2840000, conversion_rate: 18.5, avg_deal_value: 485000, leads_this_month: 9 },
  recent_leads: [
    { id: 1, first_name: 'Liam', last_name: 'Murphy', status: 'qualified', ai_score: 87, budget_max: 650000, created_at: new Date(Date.now() - 86400000 * 1).toISOString() },
    { id: 2, first_name: 'Aoife', last_name: 'O\'Brien', status: 'new', ai_score: 72, budget_max: 420000, created_at: new Date(Date.now() - 86400000 * 2).toISOString() },
    { id: 3, first_name: 'Ciarán', last_name: 'Walsh', status: 'proposal', ai_score: 91, budget_max: 890000, created_at: new Date(Date.now() - 86400000 * 3).toISOString() },
    { id: 4, first_name: 'Siobhán', last_name: 'Kelly', status: 'contacted', ai_score: 65, budget_max: 320000, created_at: new Date(Date.now() - 86400000 * 4).toISOString() },
  ],
  recent_deals: [
    { id: 1, title: '3 Bed Semi — Ranelagh', stage: 'offer', value: 620000, lead: { first_name: 'Liam', last_name: 'Murphy' } },
    { id: 2, title: 'Penthouse — Grand Canal', stage: 'legal', value: 1250000, lead: { first_name: 'Ciarán', last_name: 'Walsh' } },
    { id: 3, title: '2 Bed Apt — Ballsbridge', stage: 'viewing', value: 480000, lead: { first_name: 'Aoife', last_name: "O'Brien" } },
  ],
  pipeline: { discovery: 5, viewing: 8, offer: 4, negotiation: 2, legal: 3, closed_won: 6 },
}

const STATUS_COLORS = {
  new: 'bg-blue-500/15 text-blue-400', contacted: 'bg-yellow-500/15 text-yellow-400',
  qualified: 'bg-green-500/15 text-green-400', proposal: 'bg-purple-500/15 text-purple-400',
  negotiation: 'bg-orange-500/15 text-orange-400', won: 'bg-emerald-500/15 text-emerald-400',
  lost: 'bg-red-500/15 text-red-400',
}

const STAGE_COLORS = {
  discovery: 'bg-gray-500/15 text-gray-400', viewing: 'bg-blue-500/15 text-blue-400',
  offer: 'bg-yellow-500/15 text-yellow-400', negotiation: 'bg-orange-500/15 text-orange-400',
  legal: 'bg-purple-500/15 text-purple-400', closed_won: 'bg-green-500/15 text-green-400',
  closed_lost: 'bg-red-500/15 text-red-400',
}

function fmt(n) {
  if (n >= 1000000) return '€' + (n / 1000000).toFixed(1) + 'M'
  if (n >= 1000) return '€' + Math.round(n / 1000) + 'K'
  return '€' + n
}

function timeAgo(iso) {
  const diff = (Date.now() - new Date(iso)) / 1000
  if (diff < 3600) return Math.round(diff / 60) + 'm ago'
  if (diff < 86400) return Math.round(diff / 3600) + 'h ago'
  return Math.round(diff / 86400) + 'd ago'
}

export default function Dashboard() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [seeding, setSeeding] = useState(false)
  const { user } = useAuth()

  useEffect(() => {
    getDashboard()
      .then(setData)
      .catch(() => setData(DEMO))
      .finally(() => setLoading(false))
  }, [])

  async function handleSeed() {
    setSeeding(true)
    try {
      await seedData()
      const d = await getDashboard()
      setData(d)
    } catch {
      setData(DEMO)
    } finally {
      setSeeding(false)
    }
  }

  const d = data || DEMO

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen">
      <Spinner size="lg" />
    </div>
  )

  const pipeline = d.pipeline || DEMO.pipeline
  const maxPipeline = Math.max(...Object.values(pipeline), 1)

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">
            Good morning, {user?.name?.split(' ')[0] || user?.full_name?.split(' ')[0] || 'Agent'} 👋
          </h1>
          <p className="text-gray-500 text-sm mt-1">Here's what's happening with your pipeline today.</p>
        </div>
        <button
          onClick={handleSeed}
          disabled={seeding}
          className="flex items-center gap-2 px-4 py-2 bg-amber-500/10 border border-amber-500/20 text-amber-400 rounded-lg text-sm font-medium hover:bg-amber-500/20 transition-colors disabled:opacity-50"
        >
          {seeding ? <Spinner size="sm" /> : '✦'}
          {seeding ? 'Loading...' : 'Load Demo Data'}
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        <KpiCard label="Total Leads" value={d.stats?.total_leads ?? 47} icon="👥" change="+12%" />
        <KpiCard label="Active Deals" value={d.stats?.active_deals ?? 12} icon="🤝" change="+3" />
        <KpiCard label="Pipeline Value" value={fmt(d.stats?.total_revenue ?? 2840000)} icon="💰" change="+18%" />
        <KpiCard label="Avg Deal Value" value={fmt(d.stats?.avg_deal_value ?? 485000)} icon="📈" />
        <KpiCard label="Conversion Rate" value={(d.stats?.conversion_rate ?? 18.5) + '%'} icon="🎯" change="+2.1%" />
        <KpiCard label="Leads This Month" value={d.stats?.leads_this_month ?? 9} icon="📅" change="+5" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Recent Leads */}
        <div className="lg:col-span-2 bg-gray-900 rounded-xl border border-white/8 p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-white">Recent Leads</h2>
            <Link to="/leads" className="text-xs text-amber-400 hover:text-amber-300">View all →</Link>
          </div>
          <div className="space-y-2">
            {(d.recent_leads || DEMO.recent_leads).map(lead => (
              <Link
                key={lead.id}
                to={`/leads/${lead.id}`}
                className="flex items-center gap-3 p-3 rounded-lg hover:bg-white/3 transition-colors group"
              >
                <div className="w-9 h-9 rounded-full bg-amber-500/20 flex items-center justify-center text-amber-400 text-sm font-bold shrink-0">
                  {lead.first_name[0]}{lead.last_name[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-white group-hover:text-amber-400 transition-colors">
                    {lead.first_name} {lead.last_name}
                  </div>
                  <div className="text-xs text-gray-500">Budget: {fmt(lead.budget_max || 0)} · {timeAgo(lead.created_at)}</div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium capitalize ${STATUS_COLORS[lead.status] || 'bg-gray-500/15 text-gray-400'}`}>
                    {lead.status}
                  </span>
                  <div className="text-right">
                    <div className="text-xs font-bold text-amber-400">{lead.ai_score}</div>
                    <div className="text-xs text-gray-600">AI</div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Pipeline */}
        <div className="bg-gray-900 rounded-xl border border-white/8 p-5">
          <h2 className="font-semibold text-white mb-4">Deal Pipeline</h2>
          <div className="space-y-3">
            {Object.entries(pipeline).map(([stage, count]) => (
              <div key={stage}>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs text-gray-400 capitalize">{stage.replace('_', ' ')}</span>
                  <span className="text-xs font-bold text-white">{count}</span>
                </div>
                <div className="h-1.5 bg-gray-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-amber-500 rounded-full transition-all duration-700"
                    style={{ width: `${(count / maxPipeline) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Deals */}
      <div className="bg-gray-900 rounded-xl border border-white/8 p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-white">Recent Deals</h2>
          <Link to="/deals" className="text-xs text-amber-400 hover:text-amber-300">View all →</Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/5">
                <th className="text-left py-2 px-3 text-xs text-gray-500 font-medium uppercase tracking-wide">Deal</th>
                <th className="text-left py-2 px-3 text-xs text-gray-500 font-medium uppercase tracking-wide">Client</th>
                <th className="text-left py-2 px-3 text-xs text-gray-500 font-medium uppercase tracking-wide">Stage</th>
                <th className="text-right py-2 px-3 text-xs text-gray-500 font-medium uppercase tracking-wide">Value</th>
              </tr>
            </thead>
            <tbody>
              {(d.recent_deals || DEMO.recent_deals).map(deal => (
                <tr key={deal.id} className="border-b border-white/3 hover:bg-white/2 transition-colors">
                  <td className="py-3 px-3 text-sm font-medium text-white">{deal.title}</td>
                  <td className="py-3 px-3 text-sm text-gray-400">
                    {deal.lead?.first_name} {deal.lead?.last_name}
                  </td>
                  <td className="py-3 px-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium capitalize ${STAGE_COLORS[deal.stage] || 'bg-gray-500/15 text-gray-400'}`}>
                      {deal.stage?.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-sm font-bold text-amber-400 text-right">{fmt(deal.value)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

function KpiCard({ label, value, icon, change }) {
  return (
    <div className="bg-gray-900 rounded-xl border border-white/8 p-5">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xl">{icon}</span>
        {change && (
          <span className={`text-xs font-semibold ${change.startsWith('+') ? 'text-green-400' : 'text-red-400'}`}>
            {change}
          </span>
        )}
      </div>
      <div className="text-2xl font-bold text-white mb-1">{value}</div>
      <div className="text-xs text-gray-500">{label}</div>
    </div>
  )
}
