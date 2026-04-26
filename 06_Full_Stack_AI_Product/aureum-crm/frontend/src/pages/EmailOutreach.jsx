import { useState } from 'react'

const TEMPLATES = [
  {
    id: 1,
    name: 'Cold Intro',
    subject: 'Exclusive Luxury Properties in {city} — Aureum',
    body: `Dear {name},\n\nI hope this message finds you well. My name is Ionel from Aureum — we specialise in ultra-prime real estate across {city} and the wider luxury market.\n\nWe have just listed several off-market properties that I believe align with your investment profile. I would love to share an exclusive preview before they go public.\n\nWould you be available for a brief 15-minute call this week?\n\nWarm regards,\nIonel Alexandru\nSenior Partner — Aureum Real Estate`,
    category: 'Prospecting',
    sent: 124, opened: 67, replied: 18,
  },
  {
    id: 2,
    name: 'Post-Viewing Follow-up',
    subject: 'Following up on your viewing at {property}',
    body: `Dear {name},\n\nThank you for taking the time to view {property} yesterday. It was a pleasure showing you around.\n\nI wanted to check in — did the property meet your expectations? I am happy to arrange a second viewing or provide any additional documentation (floor plans, ROI projections, legal pack).\n\nThere is currently strong interest from another party, so please do not hesitate to reach out if you would like to move forward.\n\nBest,\nIonel Alexandru\nAureum Real Estate`,
    category: 'Follow-up',
    sent: 88, opened: 72, replied: 34,
  },
  {
    id: 3,
    name: 'Negotiation Opener',
    subject: 'Re: {property} — Revised Terms',
    body: `Dear {name},\n\nThank you for your continued interest in {property}.\n\nHaving spoken with the vendor, I am pleased to share that there is some flexibility on the asking price. The vendor is open to discussing terms that work for both parties.\n\nI suggest we schedule a call to align on the key points before drafting a formal offer. I am available Thursday or Friday this week — does either suit you?\n\nKind regards,\nIonel Alexandru\nAureum Real Estate`,
    category: 'Negotiation',
    sent: 42, opened: 39, replied: 27,
  },
  {
    id: 4,
    name: 'HNW Outreach',
    subject: 'Private Invitation — {city} Ultra-Prime Portfolio Review',
    body: `Dear {name},\n\nYou are cordially invited to an exclusive private review of Aureum's curated ultra-prime portfolio in {city}.\n\nThis is a strictly by-invitation event for a select group of UHNW investors. We will be presenting a number of trophy assets, including penthouses, waterfront residences, and investment-grade commercial opportunities — many available off-market.\n\nCanapés and refreshments will be served. Details will be confirmed upon RSVP.\n\nI do hope you are able to join us.\n\nWith compliments,\nIonel Alexandru\nAureum Real Estate`,
    category: 'HNW',
    sent: 29, opened: 26, replied: 14,
  },
]

const LEADS = [
  { id: 1, name: 'James Mitchell', email: 'j.mitchell@example.com', city: 'Dublin', property: 'Merrion Square Penthouse' },
  { id: 2, name: 'Aisha Al-Farsi', email: 'a.alfarsi@example.com', city: 'Dubai', property: 'DIFC Tower Suite 4801' },
  { id: 3, name: 'Charlotte Davies', email: 'c.davies@example.com', city: 'London', property: 'Knightsbridge Residence' },
  { id: 4, name: 'Ravi Sharma', email: 'r.sharma@example.com', city: 'Dublin', property: 'Grand Canal Dock Apartment' },
  { id: 5, name: 'Elena Vasquez', email: 'e.vasquez@example.com', city: 'Dubai', property: 'Palm Jumeirah Villa' },
  { id: 6, name: 'Thomas Brennan', email: 't.brennan@example.com', city: 'Dublin', property: 'Ballsbridge Manor' },
]

const SENT_LOG = [
  { id: 1, to: 'James Mitchell', template: 'Post-Viewing Follow-up', sent: '2026-03-29 09:14', status: 'Replied', statusColor: 'text-green-400 bg-green-500/10' },
  { id: 2, to: 'Aisha Al-Farsi', template: 'HNW Outreach', sent: '2026-03-28 15:32', status: 'Opened', statusColor: 'text-blue-400 bg-blue-500/10' },
  { id: 3, to: 'Charlotte Davies', template: 'Negotiation Opener', sent: '2026-03-27 11:05', status: 'Opened', statusColor: 'text-blue-400 bg-blue-500/10' },
  { id: 4, to: 'Ravi Sharma', template: 'Cold Intro', sent: '2026-03-26 14:20', status: 'Delivered', statusColor: 'text-gray-400 bg-gray-500/10' },
  { id: 5, to: 'Elena Vasquez', template: 'Cold Intro', sent: '2026-03-25 10:00', status: 'Replied', statusColor: 'text-green-400 bg-green-500/10' },
]

const CATEGORIES = ['All', 'Prospecting', 'Follow-up', 'Negotiation', 'HNW']

function personalize(text, lead) {
  if (!lead) return text
  return text
    .replace(/\{name\}/g, lead.name)
    .replace(/\{city\}/g, lead.city)
    .replace(/\{property\}/g, lead.property)
}

export default function EmailOutreach() {
  const [activeTemplate, setActiveTemplate] = useState(TEMPLATES[0])
  const [selectedLeads, setSelectedLeads] = useState([])
  const [previewLead, setPreviewLead] = useState(LEADS[0])
  const [catFilter, setCatFilter] = useState('All')
  const [tab, setTab] = useState('compose') // compose | log
  const [sentLog, setSentLog] = useState(SENT_LOG)
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)

  const filtered = catFilter === 'All' ? TEMPLATES : TEMPLATES.filter(t => t.category === catFilter)

  function toggleLead(id) {
    setSelectedLeads(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])
  }

  async function handleSend() {
    if (!selectedLeads.length) return
    setSending(true)
    await new Promise(r => setTimeout(r, 1400))
    const newEntries = selectedLeads.map(lid => {
      const lead = LEADS.find(l => l.id === lid)
      return {
        id: Date.now() + lid,
        to: lead.name,
        template: activeTemplate.name,
        sent: new Date().toLocaleString('en-GB', { dateStyle: 'short', timeStyle: 'short' }),
        status: 'Delivered',
        statusColor: 'text-gray-400 bg-gray-500/10',
      }
    })
    setSentLog(prev => [...newEntries, ...prev])
    setSelectedLeads([])
    setSending(false)
    setSent(true)
    setTimeout(() => setSent(false), 3000)
  }

  const openRate = t => Math.round((t.opened / t.sent) * 100)
  const replyRate = t => Math.round((t.replied / t.sent) * 100)

  return (
    <div className="p-6 max-w-screen-xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Email Outreach</h1>
          <p className="text-sm text-gray-400 mt-0.5">Compose, personalise & track luxury-grade email campaigns</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setTab('compose')} className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${tab === 'compose' ? 'bg-amber-500 text-black' : 'bg-gray-800 text-gray-300 hover:bg-gray-700'}`}>Compose</button>
          <button onClick={() => setTab('log')} className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${tab === 'log' ? 'bg-amber-500 text-black' : 'bg-gray-800 text-gray-300 hover:bg-gray-700'}`}>Sent Log ({sentLog.length})</button>
        </div>
      </div>

      {tab === 'compose' ? (
        <div className="grid grid-cols-12 gap-4">
          {/* Template list */}
          <div className="col-span-3 space-y-3">
            <div className="flex gap-1 flex-wrap">
              {CATEGORIES.map(c => (
                <button key={c} onClick={() => setCatFilter(c)} className={`px-2.5 py-1 rounded-full text-xs font-medium transition-colors ${catFilter === c ? 'bg-amber-500 text-black' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'}`}>{c}</button>
              ))}
            </div>
            {filtered.map(t => (
              <button
                key={t.id}
                onClick={() => setActiveTemplate(t)}
                className={`w-full text-left p-3 rounded-xl border transition-all ${activeTemplate.id === t.id ? 'border-amber-500/40 bg-amber-500/8' : 'border-white/6 bg-gray-900 hover:border-white/12'}`}
              >
                <div className="flex items-start justify-between mb-1">
                  <span className="text-sm font-semibold text-white">{t.name}</span>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-gray-700 text-gray-300">{t.category}</span>
                </div>
                <div className="flex gap-3 mt-2">
                  <span className="text-xs text-gray-400">{t.sent} sent</span>
                  <span className="text-xs text-blue-400">{openRate(t)}% open</span>
                  <span className="text-xs text-green-400">{replyRate(t)}% reply</span>
                </div>
              </button>
            ))}
          </div>

          {/* Preview */}
          <div className="col-span-6">
            <div className="bg-gray-900 border border-white/8 rounded-xl p-4 h-full">
              <div className="mb-3">
                <div className="text-xs text-gray-500 mb-1">Subject</div>
                <div className="text-sm font-medium text-white bg-gray-800 rounded-lg px-3 py-2">
                  {personalize(activeTemplate.subject, previewLead)}
                </div>
              </div>
              <div className="mb-3">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-gray-500">Preview as</span>
                  <select
                    value={previewLead.id}
                    onChange={e => setPreviewLead(LEADS.find(l => l.id === parseInt(e.target.value)))}
                    className="text-xs bg-gray-800 border border-white/8 rounded-lg px-2 py-1 text-white"
                  >
                    {LEADS.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
                  </select>
                </div>
              </div>
              <div className="bg-gray-800/50 rounded-xl p-4 text-sm text-gray-200 leading-relaxed whitespace-pre-line">
                {personalize(activeTemplate.body, previewLead)}
              </div>
              <div className="mt-3 flex gap-2">
                <div className="flex-1 text-center py-2 rounded-lg bg-blue-500/10 border border-blue-500/20">
                  <div className="text-lg font-bold text-blue-400">{activeTemplate.sent}</div>
                  <div className="text-xs text-gray-500">Sent</div>
                </div>
                <div className="flex-1 text-center py-2 rounded-lg bg-amber-500/10 border border-amber-500/20">
                  <div className="text-lg font-bold text-amber-400">{openRate(activeTemplate)}%</div>
                  <div className="text-xs text-gray-500">Open Rate</div>
                </div>
                <div className="flex-1 text-center py-2 rounded-lg bg-green-500/10 border border-green-500/20">
                  <div className="text-lg font-bold text-green-400">{replyRate(activeTemplate)}%</div>
                  <div className="text-xs text-gray-500">Reply Rate</div>
                </div>
              </div>
            </div>
          </div>

          {/* Recipients + Send */}
          <div className="col-span-3 space-y-3">
            <div className="bg-gray-900 border border-white/8 rounded-xl p-3">
              <div className="text-xs font-semibold text-gray-400 mb-2 uppercase tracking-wide">Select Recipients</div>
              <div className="space-y-1.5">
                {LEADS.map(l => (
                  <label key={l.id} className="flex items-center gap-2.5 p-2 rounded-lg hover:bg-white/4 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedLeads.includes(l.id)}
                      onChange={() => toggleLead(l.id)}
                      className="accent-amber-500"
                    />
                    <div>
                      <div className="text-xs font-medium text-white">{l.name}</div>
                      <div className="text-xs text-gray-500">{l.city}</div>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            <button
              onClick={handleSend}
              disabled={!selectedLeads.length || sending}
              className={`w-full py-3 rounded-xl font-semibold text-sm transition-all ${
                sent ? 'bg-green-500 text-white' :
                selectedLeads.length ? 'bg-amber-500 text-black hover:bg-amber-400' : 'bg-gray-800 text-gray-500 cursor-not-allowed'
              }`}
            >
              {sending ? 'Sending...' : sent ? '✓ Sent!' : `Send to ${selectedLeads.length || 0} lead${selectedLeads.length !== 1 ? 's' : ''}`}
            </button>

            {!selectedLeads.length && (
              <p className="text-xs text-gray-600 text-center">Select at least one recipient</p>
            )}
          </div>
        </div>
      ) : (
        /* Sent Log */
        <div className="bg-gray-900 border border-white/8 rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/6">
                <th className="px-4 py-3 text-left text-xs text-gray-500 font-medium uppercase">Recipient</th>
                <th className="px-4 py-3 text-left text-xs text-gray-500 font-medium uppercase">Template</th>
                <th className="px-4 py-3 text-left text-xs text-gray-500 font-medium uppercase">Sent</th>
                <th className="px-4 py-3 text-left text-xs text-gray-500 font-medium uppercase">Status</th>
              </tr>
            </thead>
            <tbody>
              {sentLog.map(entry => (
                <tr key={entry.id} className="border-b border-white/4 hover:bg-white/2">
                  <td className="px-4 py-3 text-white font-medium">{entry.to}</td>
                  <td className="px-4 py-3 text-gray-400">{entry.template}</td>
                  <td className="px-4 py-3 text-gray-500 text-xs">{entry.sent}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${entry.statusColor}`}>{entry.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
