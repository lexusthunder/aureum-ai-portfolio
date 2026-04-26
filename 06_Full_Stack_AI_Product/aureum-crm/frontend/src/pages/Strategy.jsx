import { useState } from 'react'

// ─── SWOT Data ───────────────────────────────────────────────
const INITIAL_SWOT = {
  strengths: [
    'Strong AI-powered lead scoring differentiates from traditional agencies',
    'Established presence in Dublin luxury market with high-HNW network',
    'Multi-city coverage: Dublin / Dubai / London creates unique cross-border proposition',
    'Premium brand positioning — Aureum commands higher commission rates',
    'Automated sales engine runs 24/7 reducing reliance on manual outreach',
  ],
  weaknesses: [
    'Small team limits deal volume — scaling requires new hires or partnerships',
    'Dubai market still nascent — limited local relationships vs. established players',
    'Heavy dependence on one senior agent creates single-point-of-failure risk',
    'No physical office in London or Dubai restricts premium perception in those markets',
    'CRM and tech stack are custom-built — maintenance overhead without a tech team',
  ],
  opportunities: [
    'Post-pandemic UHNW migration surge driving unprecedented demand in Dublin & Dubai',
    'Partnerships with private banks & family offices for off-market deal flow',
    'Short-term luxury rental market (Airbnb Luxe) as an additional revenue stream',
    'Expansion into Lisbon and Monaco — two underserved markets with rising HNW demand',
    'Content marketing on Instagram/TikTok creating inbound lead pipeline at near-zero CAC',
  ],
  threats: [
    'Rising interest rates reducing investment appetite among mid-tier HNW buyers',
    'Established luxury agencies (Savills, Knight Frank) entering the same niche',
    'Regulatory changes in Dubai foreign ownership rules could restrict demand',
    'Economic downturn or geopolitical instability impacting UHNW portfolio allocation',
    'AI tools commoditising property matching — must differentiate on relationships & execution',
  ],
}

// ─── KPI Data ────────────────────────────────────────────────
const KPIS = [
  { id: 1, name: 'Lead-to-Deal Conversion', current: 23, target: 30, unit: '%', color: 'bg-amber-500', textColor: 'text-amber-400' },
  { id: 2, name: 'Average Deal Value', current: 3.2, target: 4.0, unit: 'M€', color: 'bg-blue-500', textColor: 'text-blue-400' },
  { id: 3, name: 'Commission Revenue (YTD)', current: 254.5, target: 400, unit: 'K€', color: 'bg-green-500', textColor: 'text-green-400' },
  { id: 4, name: 'New Leads per Month', current: 38, target: 50, unit: '', color: 'bg-purple-500', textColor: 'text-purple-400' },
  { id: 5, name: 'Response Time (avg)', current: 1.8, target: 1.0, unit: 'h', color: 'bg-rose-500', textColor: 'text-rose-400', lower_is_better: true },
  { id: 6, name: 'Email Open Rate', current: 52, target: 60, unit: '%', color: 'bg-amber-500', textColor: 'text-amber-400' },
  { id: 7, name: 'Instagram Followers', current: 12400, target: 20000, unit: '', color: 'bg-pink-500', textColor: 'text-pink-400' },
  { id: 8, name: 'Client NPS Score', current: 78, target: 85, unit: '', color: 'bg-teal-500', textColor: 'text-teal-400' },
]

// ─── OKR Data ────────────────────────────────────────────────
const OKRS = [
  {
    id: 1,
    objective: 'Become #1 Luxury Agent in Dublin by Q3 2026',
    owner: 'Ionel Alexandru',
    quarter: 'Q1-Q3 2026',
    progress: 62,
    keyResults: [
      { id: 1, title: 'Close 8 deals above €2M in Dublin', current: 5, target: 8, unit: 'deals' },
      { id: 2, title: 'Grow Dublin HNW network to 200 qualified contacts', current: 142, target: 200, unit: 'contacts' },
      { id: 3, title: 'Achieve top 3 ranking on 3 Dublin property portals', current: 1, target: 3, unit: 'portals' },
      { id: 4, title: 'Generate €800K commission from Dublin deals alone', current: 492000, target: 800000, unit: '€', fmt: v => `€${(v / 1000).toFixed(0)}K` },
    ],
  },
  {
    id: 2,
    objective: 'Build a 24/7 Automated Sales Engine by Q2 2026',
    owner: 'Ionel Alexandru',
    quarter: 'Q1-Q2 2026',
    progress: 80,
    keyResults: [
      { id: 1, title: 'Deploy 10 active automation workflows', current: 8, target: 10, unit: 'workflows' },
      { id: 2, title: 'Reduce manual prospecting time to < 5h/week', current: 6.5, target: 5, unit: 'h/wk', lower_is_better: true },
      { id: 3, title: 'Achieve 50% of leads via inbound channels', current: 37, target: 50, unit: '%' },
      { id: 4, title: 'Email open rate above 55%', current: 52, target: 55, unit: '%' },
    ],
  },
  {
    id: 3,
    objective: 'Launch Dubai Market Operations — Close 3 Deals by Q4 2026',
    owner: 'Ionel Alexandru',
    quarter: 'Q2-Q4 2026',
    progress: 33,
    keyResults: [
      { id: 1, title: 'Establish 3 local Dubai agency partnerships', current: 1, target: 3, unit: 'partners' },
      { id: 2, title: 'Close 3 deals in Dubai above AED 5M', current: 1, target: 3, unit: 'deals' },
      { id: 3, title: 'Build Dubai HNW pipeline of 50+ qualified leads', current: 18, target: 50, unit: 'leads' },
      { id: 4, title: 'Generate €150K commission from Dubai', current: 64000, target: 150000, unit: '€', fmt: v => `€${(v / 1000).toFixed(0)}K` },
    ],
  },
]

function ProgressBar({ value, color, className = '' }) {
  const pct = Math.min(100, Math.round(value))
  return (
    <div className={`h-1.5 bg-gray-700 rounded-full overflow-hidden ${className}`}>
      <div className={`h-full rounded-full ${color} transition-all`} style={{ width: `${pct}%` }} />
    </div>
  )
}

function krProgress(kr) {
  if (kr.lower_is_better) return Math.max(0, Math.min(100, ((kr.target * 2 - kr.current) / (kr.target * 2)) * 100))
  return Math.min(100, (kr.current / kr.target) * 100)
}

export default function Strategy() {
  const [tab, setTab] = useState('swot')
  const [swot, setSwot] = useState(INITIAL_SWOT)
  const [addingTo, setAddingTo] = useState(null)
  const [newItem, setNewItem] = useState('')

  function removeItem(quadrant, index) {
    setSwot(prev => ({ ...prev, [quadrant]: prev[quadrant].filter((_, i) => i !== index) }))
  }

  function addItem() {
    if (!newItem.trim() || !addingTo) return
    setSwot(prev => ({ ...prev, [addingTo]: [...prev[addingTo], newItem.trim()] }))
    setNewItem('')
    setAddingTo(null)
  }

  const SWOT_CONFIG = {
    strengths: { label: 'Strengths', color: 'border-green-500/30 bg-green-500/5', titleColor: 'text-green-400', dotColor: 'bg-green-500' },
    weaknesses: { label: 'Weaknesses', color: 'border-red-500/30 bg-red-500/5', titleColor: 'text-red-400', dotColor: 'bg-red-500' },
    opportunities: { label: 'Opportunities', color: 'border-blue-500/30 bg-blue-500/5', titleColor: 'text-blue-400', dotColor: 'bg-blue-500' },
    threats: { label: 'Threats', color: 'border-amber-500/30 bg-amber-500/5', titleColor: 'text-amber-400', dotColor: 'bg-amber-500' },
  }

  return (
    <div className="p-6 max-w-screen-xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Strategy</h1>
          <p className="text-sm text-gray-400 mt-0.5">SWOT analysis, KPIs & OKRs for Aureum 2026</p>
        </div>
        <div className="flex gap-2">
          {['swot', 'kpis', 'okrs'].map(t => (
            <button key={t} onClick={() => setTab(t)} className={`px-4 py-2 rounded-lg text-sm font-medium uppercase tracking-wide transition-colors ${tab === t ? 'bg-amber-500 text-black' : 'bg-gray-800 text-gray-300 hover:bg-gray-700'}`}>{t}</button>
          ))}
        </div>
      </div>

      {/* ─── SWOT ─── */}
      {tab === 'swot' && (
        <div className="grid grid-cols-2 gap-4">
          {Object.entries(SWOT_CONFIG).map(([key, cfg]) => (
            <div key={key} className={`border rounded-2xl p-5 ${cfg.color}`}>
              <div className={`font-bold text-base mb-3 ${cfg.titleColor}`}>{cfg.label}</div>
              <ul className="space-y-2 mb-3">
                {swot[key].map((item, i) => (
                  <li key={i} className="flex items-start gap-2 group">
                    <span className={`w-1.5 h-1.5 rounded-full mt-1.5 shrink-0 ${cfg.dotColor}`} />
                    <span className="text-xs text-gray-300 leading-relaxed flex-1">{item}</span>
                    <button onClick={() => removeItem(key, i)} className="opacity-0 group-hover:opacity-100 text-gray-600 hover:text-red-400 text-xs transition-all shrink-0">×</button>
                  </li>
                ))}
              </ul>
              {addingTo === key ? (
                <div className="flex gap-2">
                  <input
                    autoFocus
                    value={newItem}
                    onChange={e => setNewItem(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter') addItem(); if (e.key === 'Escape') setAddingTo(null) }}
                    placeholder="Add item..."
                    className="flex-1 bg-gray-800/80 border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white placeholder-gray-600 outline-none"
                  />
                  <button onClick={addItem} className="px-2.5 py-1.5 bg-amber-500 text-black rounded-lg text-xs font-semibold">Add</button>
                  <button onClick={() => setAddingTo(null)} className="px-2 py-1.5 text-gray-500 hover:text-white text-xs">×</button>
                </div>
              ) : (
                <button onClick={() => setAddingTo(key)} className="text-xs text-gray-500 hover:text-gray-300 transition-colors">+ Add item</button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* ─── KPIs ─── */}
      {tab === 'kpis' && (
        <div className="grid grid-cols-2 gap-4">
          {KPIS.map(kpi => {
            const pct = kpi.lower_is_better
              ? Math.max(0, Math.min(100, ((kpi.target * 2 - kpi.current) / (kpi.target * 2)) * 100))
              : Math.min(100, (kpi.current / kpi.target) * 100)
            const onTrack = kpi.lower_is_better ? kpi.current <= kpi.target * 1.3 : pct >= 70
            return (
              <div key={kpi.id} className="bg-gray-900 border border-white/8 rounded-xl p-5">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="text-sm font-semibold text-white">{kpi.name}</div>
                    <div className="flex items-baseline gap-1.5 mt-1">
                      <span className={`text-2xl font-bold ${kpi.textColor}`}>
                        {typeof kpi.current === 'number' && kpi.current >= 1000
                          ? kpi.current.toLocaleString()
                          : kpi.current}{kpi.unit}
                      </span>
                      <span className="text-xs text-gray-500">/ {typeof kpi.target === 'number' && kpi.target >= 1000 ? kpi.target.toLocaleString() : kpi.target}{kpi.unit} target</span>
                    </div>
                  </div>
                  <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${onTrack ? 'bg-green-500/15 text-green-400' : 'bg-red-500/15 text-red-400'}`}>
                    {onTrack ? 'On Track' : 'Needs Attention'}
                  </span>
                </div>
                <ProgressBar value={pct} color={kpi.color} />
                <div className="flex justify-between mt-1.5">
                  <span className="text-xs text-gray-500">{Math.round(pct)}% of target</span>
                  {kpi.lower_is_better && <span className="text-xs text-gray-500">Lower is better</span>}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* ─── OKRs ─── */}
      {tab === 'okrs' && (
        <div className="space-y-4">
          {OKRS.map(okr => (
            <div key={okr.id} className="bg-gray-900 border border-white/8 rounded-2xl p-5">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="text-sm text-gray-500 mb-1">{okr.quarter}</div>
                  <h3 className="text-lg font-bold text-white leading-snug">{okr.objective}</h3>
                  <div className="text-xs text-gray-500 mt-1">Owner: {okr.owner}</div>
                </div>
                <div className="text-right ml-6 shrink-0">
                  <div className="text-3xl font-bold text-amber-400">{okr.progress}%</div>
                  <div className="text-xs text-gray-500">Overall</div>
                </div>
              </div>
              <ProgressBar value={okr.progress} color="bg-amber-500" className="mb-5" />
              <div className="space-y-3">
                {okr.keyResults.map(kr => {
                  const pct = krProgress(kr)
                  const fmtVal = kr.fmt ? kr.fmt(kr.current) : `${typeof kr.current === 'number' && kr.current >= 1000 ? kr.current.toLocaleString() : kr.current}${kr.unit !== '€' ? ' ' + kr.unit : ''}`
                  const fmtTarget = kr.fmt ? kr.fmt(kr.target) : `${typeof kr.target === 'number' && kr.target >= 1000 ? kr.target.toLocaleString() : kr.target}${kr.unit !== '€' ? ' ' + kr.unit : ''}`
                  return (
                    <div key={kr.id}>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-xs text-gray-300">{kr.title}</span>
                        <span className="text-xs text-gray-400 ml-4 shrink-0">{fmtVal} / {fmtTarget}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-1.5 bg-gray-700 rounded-full overflow-hidden">
                          <div className="h-full bg-amber-500/70 rounded-full transition-all" style={{ width: `${Math.round(pct)}%` }} />
                        </div>
                        <span className="text-xs text-gray-500 w-8 text-right">{Math.round(pct)}%</span>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
