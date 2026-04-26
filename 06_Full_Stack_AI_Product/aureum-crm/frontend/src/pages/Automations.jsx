import { useState } from 'react'

const INITIAL_AUTOMATIONS = [
  {
    id: 1,
    name: 'AI Lead Scoring Engine',
    description: 'Automatically scores every new lead 0–100 using budget, location preference, engagement history, and urgency signals. Updates every 24h.',
    category: 'Lead Intelligence',
    categoryColor: 'text-purple-400 bg-purple-500/10 border-purple-500/20',
    icon: '✦',
    enabled: true,
    runs: 1240,
    lastRun: '2026-03-31 08:00',
    trigger: 'Daily at 08:00 & on new lead',
  },
  {
    id: 2,
    name: 'Cold Lead Drip — Sequence A',
    description: '5-email drip sequence for new leads: Day 1 intro, Day 3 properties, Day 7 social proof, Day 14 follow-up, Day 30 re-engagement. Stops on reply.',
    category: 'Email Automation',
    categoryColor: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
    icon: '✉',
    enabled: true,
    runs: 342,
    lastRun: '2026-03-31 09:30',
    trigger: 'Lead created with status = New',
  },
  {
    id: 3,
    name: 'Post-Viewing Follow-up Sequence',
    description: 'Sends personalised follow-up email 2h after viewing is logged. If no reply in 48h, sends a gentle nudge. On day 7, escalates to phone call reminder.',
    category: 'Email Automation',
    categoryColor: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
    icon: '✉',
    enabled: true,
    runs: 87,
    lastRun: '2026-03-30 16:15',
    trigger: 'Activity type = Viewing logged',
  },
  {
    id: 4,
    name: 'Hot Lead Alert',
    description: 'Instantly notifies agent via push + email when a lead\'s AI score exceeds 80 or deal stage changes to Negotiation. Assigns 24h follow-up task.',
    category: 'Pipeline Alerts',
    categoryColor: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
    icon: '🔔',
    enabled: true,
    runs: 28,
    lastRun: '2026-03-29 14:22',
    trigger: 'AI score > 80 OR stage = Negotiation',
  },
  {
    id: 5,
    name: 'Stale Deal Nudge',
    description: 'If a deal has not had any activity for 7+ days and is not in Closed stage, creates a follow-up task and sends a "check-in needed" alert.',
    category: 'Pipeline Alerts',
    categoryColor: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
    icon: '⏰',
    enabled: true,
    runs: 15,
    lastRun: '2026-03-28 08:00',
    trigger: 'Deal inactivity > 7 days',
  },
  {
    id: 6,
    name: 'Instagram Auto-Post',
    description: 'Publishes scheduled Instagram posts at the specified time. Pulls approved content from the Social Media calendar and posts via API.',
    category: 'Social Media',
    categoryColor: 'text-pink-400 bg-pink-500/10 border-pink-500/20',
    icon: '📸',
    enabled: false,
    runs: 94,
    lastRun: '2026-03-31 10:00',
    trigger: 'Post scheduled time reached',
  },
  {
    id: 7,
    name: 'Commission Auto-Calculator',
    description: 'When a deal is moved to Closed Won, automatically calculates commission (value × rate), creates a Financial record, and notifies the agent.',
    category: 'Financial',
    categoryColor: 'text-green-400 bg-green-500/10 border-green-500/20',
    icon: '💰',
    enabled: true,
    runs: 12,
    lastRun: '2026-03-15 11:30',
    trigger: 'Deal stage = Closed Won',
  },
  {
    id: 8,
    name: 'Weekly Performance Report',
    description: 'Every Monday at 07:00, generates a summary PDF: new leads, deals moved, commission earned, top performing properties, and sends to agent email.',
    category: 'Reports',
    categoryColor: 'text-gray-400 bg-gray-500/10 border-gray-500/20',
    icon: '📊',
    enabled: true,
    runs: 13,
    lastRun: '2026-03-31 07:00',
    trigger: 'Every Monday at 07:00',
  },
  {
    id: 9,
    name: 'Lead Source Attribution',
    description: 'Tags every new lead with their source (Instagram, LinkedIn, Referral, Property Portal, Direct). Feeds attribution data into the Analytics dashboard.',
    category: 'Lead Intelligence',
    categoryColor: 'text-purple-400 bg-purple-500/10 border-purple-500/20',
    icon: '🎯',
    enabled: true,
    runs: 892,
    lastRun: '2026-03-31 10:05',
    trigger: 'Lead created',
  },
  {
    id: 10,
    name: 'Birthday & Anniversary Reminders',
    description: 'Checks client birthdays and property purchase anniversaries daily. Creates a personalised outreach task for agent 7 days before the date.',
    category: 'Client Nurturing',
    categoryColor: 'text-rose-400 bg-rose-500/10 border-rose-500/20',
    icon: '🎂',
    enabled: false,
    runs: 6,
    lastRun: '2026-03-25 08:00',
    trigger: 'Daily — 7 days before birthday/anniversary',
  },
]

const CATEGORIES = ['All', 'Lead Intelligence', 'Email Automation', 'Pipeline Alerts', 'Social Media', 'Financial', 'Reports', 'Client Nurturing']

export default function Automations() {
  const [automations, setAutomations] = useState(INITIAL_AUTOMATIONS)
  const [catFilter, setCatFilter] = useState('All')
  const [selected, setSelected] = useState(null)

  const filtered = catFilter === 'All' ? automations : automations.filter(a => a.category === catFilter)
  const enabled = automations.filter(a => a.enabled).length
  const totalRuns = automations.reduce((s, a) => s + a.runs, 0)

  function toggleEnabled(id) {
    setAutomations(prev => prev.map(a => a.id === id ? { ...a, enabled: !a.enabled } : a))
  }

  return (
    <div className="p-6 max-w-screen-xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">Automations</h1>
        <p className="text-sm text-gray-400 mt-0.5">24/7 automated workflows powering your sales engine</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="bg-gray-900 border border-white/8 rounded-xl p-4">
          <div className="text-xs text-gray-500 mb-1">Active Automations</div>
          <div className="text-3xl font-bold text-amber-400">{enabled}</div>
          <div className="text-xs text-gray-400 mt-1">of {automations.length} total</div>
        </div>
        <div className="bg-gray-900 border border-white/8 rounded-xl p-4">
          <div className="text-xs text-gray-500 mb-1">Total Runs (All Time)</div>
          <div className="text-3xl font-bold text-white">{totalRuns.toLocaleString()}</div>
          <div className="text-xs text-gray-400 mt-1">Across all workflows</div>
        </div>
        <div className="bg-gray-900 border border-white/8 rounded-xl p-4">
          <div className="text-xs text-gray-500 mb-1">Time Saved (est.)</div>
          <div className="text-3xl font-bold text-green-400">147h</div>
          <div className="text-xs text-gray-400 mt-1">This quarter</div>
        </div>
        <div className="bg-gray-900 border border-white/8 rounded-xl p-4">
          <div className="text-xs text-gray-500 mb-1">Last Activity</div>
          <div className="text-lg font-bold text-white">Today 10:05</div>
          <div className="text-xs text-gray-400 mt-1">Lead Source Attribution</div>
        </div>
      </div>

      {/* Category filter */}
      <div className="flex gap-1.5 flex-wrap mb-4">
        {CATEGORIES.map(c => (
          <button key={c} onClick={() => setCatFilter(c)} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${catFilter === c ? 'bg-amber-500 text-black' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'}`}>{c}</button>
        ))}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 gap-3">
        {filtered.map(auto => (
          <div
            key={auto.id}
            className={`bg-gray-900 border rounded-xl p-4 transition-all cursor-pointer ${selected === auto.id ? 'border-amber-500/40' : 'border-white/8 hover:border-white/14'}`}
            onClick={() => setSelected(selected === auto.id ? null : auto.id)}
          >
            <div className="flex items-start gap-4">
              {/* Icon */}
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg shrink-0 border ${auto.categoryColor}`}>
                {auto.icon}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-semibold text-white text-sm">{auto.name}</span>
                  <span className={`px-2 py-0.5 rounded-full text-xs border ${auto.categoryColor}`}>{auto.category}</span>
                </div>
                <p className="text-xs text-gray-400 leading-relaxed">{auto.description}</p>
                {selected === auto.id && (
                  <div className="mt-3 grid grid-cols-3 gap-3">
                    <div className="bg-gray-800/60 rounded-lg p-2">
                      <div className="text-xs text-gray-500 mb-0.5">Trigger</div>
                      <div className="text-xs text-white">{auto.trigger}</div>
                    </div>
                    <div className="bg-gray-800/60 rounded-lg p-2">
                      <div className="text-xs text-gray-500 mb-0.5">Last Run</div>
                      <div className="text-xs text-white">{auto.lastRun}</div>
                    </div>
                    <div className="bg-gray-800/60 rounded-lg p-2">
                      <div className="text-xs text-gray-500 mb-0.5">Total Runs</div>
                      <div className="text-xs text-white font-semibold">{auto.runs.toLocaleString()}</div>
                    </div>
                  </div>
                )}
              </div>

              {/* Toggle */}
              <div className="flex flex-col items-end gap-1.5 shrink-0" onClick={e => e.stopPropagation()}>
                <button
                  onClick={() => toggleEnabled(auto.id)}
                  className={`relative w-11 h-6 rounded-full transition-colors ${auto.enabled ? 'bg-amber-500' : 'bg-gray-700'}`}
                >
                  <span className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-transform ${auto.enabled ? 'translate-x-6' : 'translate-x-1'}`} />
                </button>
                <span className={`text-xs ${auto.enabled ? 'text-amber-400' : 'text-gray-500'}`}>{auto.enabled ? 'On' : 'Off'}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-16 text-gray-500">No automations in this category.</div>
      )}
    </div>
  )
}
