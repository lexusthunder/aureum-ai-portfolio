import { useState } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts'

const COMMISSIONS = [
  { id: 1, deal: 'Merrion Square Penthouse', client: 'James Mitchell', value: 4_500_000, rate: 1.5, commission: 67_500, status: 'Paid', date: '2026-03-15', city: 'Dublin' },
  { id: 2, deal: 'DIFC Tower Suite 4801', client: 'Aisha Al-Farsi', value: 3_200_000, rate: 2.0, commission: 64_000, status: 'Pending', date: '2026-03-28', city: 'Dubai' },
  { id: 3, deal: 'Knightsbridge Residence', client: 'Charlotte Davies', value: 6_800_000, rate: 1.25, commission: 85_000, status: 'Paid', date: '2026-02-20', city: 'London' },
  { id: 4, deal: 'Grand Canal Dock Apartment', client: 'Ravi Sharma', value: 1_850_000, rate: 1.5, commission: 27_750, status: 'Pending', date: '2026-04-02', city: 'Dublin' },
  { id: 5, deal: 'Palm Jumeirah Villa', client: 'Elena Vasquez', value: 5_100_000, rate: 2.0, commission: 102_000, status: 'Paid', date: '2026-01-30', city: 'Dubai' },
  { id: 6, deal: 'Ballsbridge Manor', client: 'Thomas Brennan', value: 2_700_000, rate: 1.5, commission: 40_500, status: 'Pending', date: '2026-04-10', city: 'Dublin' },
]

const QUARTERLY_TARGETS = [
  { quarter: 'Q1 2026', target: 200_000, actual: 254_500, forecast: 254_500 },
  { quarter: 'Q2 2026', target: 250_000, actual: 132_250, forecast: 290_000 },
  { quarter: 'Q3 2026', target: 300_000, actual: 0, forecast: 310_000 },
  { quarter: 'Q4 2026', target: 350_000, actual: 0, forecast: 365_000 },
]

const EXPENSES = [
  { name: 'Marketing & Ads', value: 18_400, color: '#f59e0b' },
  { name: 'Client Entertainment', value: 12_200, color: '#3b82f6' },
  { name: 'Travel & Viewings', value: 8_700, color: '#10b981' },
  { name: 'Technology & CRM', value: 3_600, color: '#8b5cf6' },
  { name: 'Office & Admin', value: 4_100, color: '#ef4444' },
]

const fmt = n => '€' + n.toLocaleString()

export default function Financial() {
  const [commissions, setCommissions] = useState(COMMISSIONS)
  const [filter, setFilter] = useState('all')

  const paid = commissions.filter(c => c.status === 'Paid').reduce((s, c) => s + c.commission, 0)
  const pending = commissions.filter(c => c.status === 'Pending').reduce((s, c) => s + c.commission, 0)
  const totalExpenses = EXPENSES.reduce((s, e) => s + e.value, 0)
  const net = paid - totalExpenses

  function markPaid(id) {
    setCommissions(prev => prev.map(c => c.id === id ? { ...c, status: 'Paid' } : c))
  }

  const filtered = filter === 'all' ? commissions : commissions.filter(c => c.status === filter)

  const chartData = QUARTERLY_TARGETS.map(q => ({
    name: q.quarter,
    Target: q.target / 1000,
    Actual: q.actual / 1000,
    Forecast: q.forecast / 1000,
  }))

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-gray-800 border border-white/12 rounded-lg px-3 py-2 text-xs">
          <div className="font-semibold text-white mb-1">{label}</div>
          {payload.map(p => <div key={p.name} style={{ color: p.color }}>€{(p.value * 1000).toLocaleString()}</div>)}
        </div>
      )
    }
    return null
  }

  return (
    <div className="p-6 max-w-screen-xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">Financial</h1>
        <p className="text-sm text-gray-400 mt-0.5">Commission tracking, expenses & revenue targets</p>
      </div>

      {/* Top KPIs */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="bg-gray-900 border border-white/8 rounded-xl p-4">
          <div className="text-xs text-gray-500 mb-1">Commission Earned (YTD)</div>
          <div className="text-2xl font-bold text-amber-400">{fmt(paid)}</div>
          <div className="text-xs text-green-400 mt-1">↑ 18% vs last year</div>
        </div>
        <div className="bg-gray-900 border border-white/8 rounded-xl p-4">
          <div className="text-xs text-gray-500 mb-1">Pending Commission</div>
          <div className="text-2xl font-bold text-blue-400">{fmt(pending)}</div>
          <div className="text-xs text-gray-400 mt-1">{commissions.filter(c => c.status === 'Pending').length} deals in progress</div>
        </div>
        <div className="bg-gray-900 border border-white/8 rounded-xl p-4">
          <div className="text-xs text-gray-500 mb-1">Total Expenses (YTD)</div>
          <div className="text-2xl font-bold text-red-400">{fmt(totalExpenses)}</div>
          <div className="text-xs text-gray-400 mt-1">Across {EXPENSES.length} categories</div>
        </div>
        <div className="bg-gray-900 border border-white/8 rounded-xl p-4">
          <div className="text-xs text-gray-500 mb-1">Net Profit (YTD)</div>
          <div className="text-2xl font-bold text-green-400">{fmt(net)}</div>
          <div className="text-xs text-gray-400 mt-1">After expenses</div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-6">
        {/* Quarterly Chart */}
        <div className="col-span-2 bg-gray-900 border border-white/8 rounded-xl p-4">
          <div className="text-sm font-semibold text-white mb-4">Revenue vs Target — 2026</div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={chartData} barGap={4}>
              <CartesianGrid strokeDasharray="3 3" stroke="#ffffff08" />
              <XAxis dataKey="name" tick={{ fill: '#9ca3af', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#9ca3af', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => `€${v}K`} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="Target" fill="#374151" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Actual" fill="#f59e0b" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Forecast" fill="#3b82f680" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
          <div className="flex gap-4 mt-2 justify-center">
            <span className="flex items-center gap-1.5 text-xs text-gray-400"><span className="w-3 h-3 rounded-sm bg-gray-700 inline-block" />Target</span>
            <span className="flex items-center gap-1.5 text-xs text-gray-400"><span className="w-3 h-3 rounded-sm bg-amber-500 inline-block" />Actual</span>
            <span className="flex items-center gap-1.5 text-xs text-gray-400"><span className="w-3 h-3 rounded-sm bg-blue-500/50 inline-block" />Forecast</span>
          </div>
        </div>

        {/* Expenses Pie */}
        <div className="bg-gray-900 border border-white/8 rounded-xl p-4">
          <div className="text-sm font-semibold text-white mb-2">Expense Breakdown</div>
          <ResponsiveContainer width="100%" height={160}>
            <PieChart>
              <Pie data={EXPENSES} dataKey="value" cx="50%" cy="50%" outerRadius={65} innerRadius={38}>
                {EXPENSES.map(e => <Cell key={e.name} fill={e.color} />)}
              </Pie>
              <Tooltip formatter={v => fmt(v)} contentStyle={{ background: '#1f2937', border: '1px solid #ffffff14', borderRadius: 8, fontSize: 11 }} />
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-1.5 mt-2">
            {EXPENSES.map(e => (
              <div key={e.name} className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full inline-block shrink-0" style={{ background: e.color }} />
                  <span className="text-xs text-gray-400">{e.name}</span>
                </div>
                <span className="text-xs text-white font-medium">{fmt(e.value)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Commission Table */}
      <div className="bg-gray-900 border border-white/8 rounded-xl overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b border-white/6">
          <div className="text-sm font-semibold text-white">Commission Tracker</div>
          <div className="flex gap-1">
            {['all', 'Paid', 'Pending'].map(f => (
              <button key={f} onClick={() => setFilter(f)} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors capitalize ${filter === f ? 'bg-amber-500 text-black' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'}`}>{f}</button>
            ))}
          </div>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/4">
              <th className="px-4 py-3 text-left text-xs text-gray-500 font-medium uppercase">Deal</th>
              <th className="px-4 py-3 text-left text-xs text-gray-500 font-medium uppercase">Client</th>
              <th className="px-4 py-3 text-left text-xs text-gray-500 font-medium uppercase">City</th>
              <th className="px-4 py-3 text-right text-xs text-gray-500 font-medium uppercase">Property Value</th>
              <th className="px-4 py-3 text-right text-xs text-gray-500 font-medium uppercase">Rate</th>
              <th className="px-4 py-3 text-right text-xs text-gray-500 font-medium uppercase">Commission</th>
              <th className="px-4 py-3 text-left text-xs text-gray-500 font-medium uppercase">Status</th>
              <th className="px-4 py-3 text-left text-xs text-gray-500 font-medium uppercase">Action</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(c => (
              <tr key={c.id} className="border-b border-white/4 hover:bg-white/2 transition-colors">
                <td className="px-4 py-3">
                  <div className="text-white font-medium text-xs">{c.deal}</div>
                  <div className="text-gray-500 text-xs">{c.date}</div>
                </td>
                <td className="px-4 py-3 text-gray-300 text-xs">{c.client}</td>
                <td className="px-4 py-3 text-gray-400 text-xs">{c.city}</td>
                <td className="px-4 py-3 text-right text-white text-xs font-medium">{fmt(c.value)}</td>
                <td className="px-4 py-3 text-right text-gray-400 text-xs">{c.rate}%</td>
                <td className="px-4 py-3 text-right text-amber-400 text-xs font-bold">{fmt(c.commission)}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${c.status === 'Paid' ? 'bg-green-500/15 text-green-400' : 'bg-amber-500/15 text-amber-400'}`}>
                    {c.status}
                  </span>
                </td>
                <td className="px-4 py-3">
                  {c.status === 'Pending' && (
                    <button onClick={() => markPaid(c.id)} className="px-3 py-1 rounded-lg text-xs bg-green-500/15 text-green-400 hover:bg-green-500/25 border border-green-500/20 transition-colors">
                      Mark Paid
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="bg-gray-800/50">
              <td colSpan={5} className="px-4 py-3 text-xs text-gray-400 font-medium">Total</td>
              <td className="px-4 py-3 text-right text-amber-400 font-bold text-xs">{fmt(filtered.reduce((s, c) => s + c.commission, 0))}</td>
              <td colSpan={2} />
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  )
}
