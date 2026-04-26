import { useEffect, useState } from 'react'
import { getLeads, matchProperties, getAIScore } from '../lib/api'
import Spinner from '../components/ui/Spinner'

const DEMO_LEADS = [
  { id:1, first_name:'Liam', last_name:'Murphy', budget_max:650000, status:'qualified', ai_score:87 },
  { id:2, first_name:'Aoife', last_name:"O'Brien", budget_max:420000, status:'new', ai_score:72 },
  { id:3, first_name:'Ciarán', last_name:'Walsh', budget_max:900000, status:'proposal', ai_score:94 },
]
const DEMO_MATCHES = {
  1: [
    { id:1, title:'3 Bed Semi — Ranelagh', price:620000, city:'Dublin', bedrooms:3, match_score:94, reasons:['Within budget','South Dublin location','3+ bedrooms','Family home style'] },
    { id:2, title:'4 Bed Det — Donnybrook', price:645000, city:'Dublin', bedrooms:4, match_score:88, reasons:['Within budget','Premium area','Exceeds bedroom requirement'] },
    { id:3, title:'3 Bed Ter — Sandymount', price:595000, city:'Dublin', bedrooms:3, match_score:82, reasons:['Budget friendly','Coastal area','Good school catchment'] },
  ],
  2: [
    { id:3, title:'2 Bed Apt — Ballsbridge', price:400000, city:'Dublin', bedrooms:2, match_score:91, reasons:['Within budget','Premium address','Good investment'] },
    { id:6, title:'Studio — Temple Bar', price:245000, city:'Dublin', bedrooms:0, match_score:75, reasons:['Well within budget','City centre','Modern finish'] },
  ],
  3: [
    { id:4, title:'5 Bed Villa — Foxrock', price:1850000, city:'Dublin', bedrooms:5, match_score:97, reasons:['Luxury specification','Prime location','Exceeds all criteria'] },
    { id:2, title:'Penthouse — Grand Canal', price:1250000, city:'Dublin', bedrooms:2, match_score:89, reasons:['Premium property','High specification','City views'] },
  ],
}

function fmt(n) { if(!n)return'—'; if(n>=1000000)return'€'+(n/1000000).toFixed(1)+'M'; return'€'+Math.round(n/1000)+'K' }
function scoreColor(s) { if(s>=80)return'text-green-400'; if(s>=60)return'text-yellow-400'; return'text-red-400' }

export default function AIMatching() {
  const [leads, setLeads] = useState([])
  const [selected, setSelected] = useState(null)
  const [matches, setMatches] = useState(null)
  const [loading, setLoading] = useState(true)
  const [matching, setMatching] = useState(false)

  useEffect(() => {
    getLeads().then(d=>setLeads(d.leads||d||[])).catch(()=>setLeads(DEMO_LEADS)).finally(()=>setLoading(false))
  }, [])

  async function handleMatch(lead) {
    setSelected(lead); setMatching(true); setMatches(null)
    try {
      const data = await matchProperties(lead.id)
      setMatches(data.matches || data || [])
    } catch {
      await new Promise(r=>setTimeout(r,1200))
      setMatches(DEMO_MATCHES[lead.id] || DEMO_MATCHES[1])
    } finally { setMatching(false) }
  }

  if (loading) return <div className="flex items-center justify-center min-h-screen"><Spinner size="lg" /></div>

  const displayLeads = leads.length > 0 ? leads : DEMO_LEADS

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">✦ AI Property Matching</h1>
        <p className="text-sm text-gray-500 mt-1">Select a lead to find their perfect property matches using AI scoring</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Leads list */}
        <div>
          <h2 className="text-xs text-gray-500 uppercase tracking-wide font-medium mb-3">Select Lead</h2>
          <div className="space-y-2">
            {displayLeads.map(lead => (
              <button key={lead.id} onClick={()=>handleMatch(lead)}
                className={`w-full text-left p-4 rounded-xl border transition-all ${selected?.id===lead.id?'border-amber-500/40 bg-amber-500/8':'border-white/8 bg-gray-900 hover:border-white/15'}`}>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-amber-500/20 flex items-center justify-center text-amber-400 text-sm font-bold shrink-0">
                    {lead.first_name[0]}{lead.last_name[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-white">{lead.first_name} {lead.last_name}</div>
                    <div className="text-xs text-gray-500">Budget: {fmt(lead.budget_max)}</div>
                  </div>
                  <div className={`text-sm font-bold ${scoreColor(lead.ai_score)}`}>{Math.round(lead.ai_score)}</div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Matches */}
        <div className="lg:col-span-2">
          {!selected ? (
            <div className="flex flex-col items-center justify-center h-64 text-center">
              <div className="text-5xl mb-4 opacity-30">✦</div>
              <p className="text-gray-500">Select a lead to see AI property matches</p>
            </div>
          ) : matching ? (
            <div className="flex flex-col items-center justify-center h-64 gap-4">
              <Spinner size="lg" />
              <p className="text-gray-400 text-sm">Analyzing preferences and matching properties...</p>
            </div>
          ) : matches && (
            <div>
              <h2 className="text-xs text-gray-500 uppercase tracking-wide font-medium mb-3">
                Top matches for {selected.first_name} {selected.last_name}
              </h2>
              <div className="space-y-3">
                {matches.map((match, i) => (
                  <div key={match.id||i} className="bg-gray-900 rounded-xl border border-white/8 p-5 hover:border-amber-500/20 transition-colors">
                    <div className="flex items-start justify-between gap-4 mb-3">
                      <div>
                        <div className="text-sm font-semibold text-white">{match.title}</div>
                        <div className="text-xs text-gray-500 mt-0.5">{match.city} · {match.bedrooms > 0 ? match.bedrooms+' bed' : 'Studio'}</div>
                      </div>
                      <div className="text-right shrink-0">
                        <div className="text-lg font-bold text-amber-400">{fmt(match.price)}</div>
                        <div className="flex items-center gap-1 justify-end mt-0.5">
                          <div className="w-12 h-1.5 bg-gray-800 rounded-full overflow-hidden">
                            <div className="h-full bg-green-500 rounded-full" style={{width:`${match.match_score}%`}} />
                          </div>
                          <span className={`text-xs font-bold ${scoreColor(match.match_score)}`}>{match.match_score}%</span>
                        </div>
                      </div>
                    </div>
                    {match.reasons && (
                      <div className="flex flex-wrap gap-1.5">
                        {match.reasons.map(r => (
                          <span key={r} className="px-2 py-0.5 bg-green-500/10 text-green-400 border border-green-500/20 rounded-full text-xs">✓ {r}</span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
