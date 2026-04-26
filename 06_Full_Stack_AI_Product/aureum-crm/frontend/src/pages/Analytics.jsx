import { useEffect, useState } from 'react'
import { getAnalytics } from '../lib/api'
import { AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import Spinner from '../components/ui/Spinner'

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']

const DEMO = {
  revenue: MONTHS.map((m,i) => ({ month:m, revenue: Math.round((120000 + Math.random()*80000) * (1 + i*0.04)), deals: Math.round(2 + Math.random()*4) })),
  lead_sources: [
    { name:'Website', value:34 }, { name:'Referral', value:28 }, { name:'Portal', value:20 },
    { name:'Social', value:12 }, { name:'Cold', value:6 },
  ],
  conversion: MONTHS.slice(0,6).map((m,i) => ({ month:m, rate: Math.round(14 + Math.random()*10) })),
  by_type: [
    { type:'House', count:18, value:9200000 }, { type:'Apartment', count:24, value:7800000 },
    { type:'Villa', count:5, value:8500000 }, { type:'Penthouse', count:3, value:4200000 },
    { type:'Commercial', count:2, value:3100000 },
  ],
  stats: { total_revenue: 32800000, total_deals: 52, avg_deal_value: 630769, best_month: 'September', conversion_rate: 18.5 },
}

const GOLD = '#f59e0b'
const COLORS = [GOLD, '#60a5fa', '#34d399', '#f472b6', '#a78bfa']

function fmt(n) { if(n>=1000000)return'€'+(n/1000000).toFixed(1)+'M'; if(n>=1000)return'€'+Math.round(n/1000)+'K'; return'€'+n }

export default function Analytics() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getAnalytics().then(setData).catch(()=>setData(DEMO)).finally(()=>setLoading(false))
  }, [])

  if (loading) return <div className="flex items-center justify-center min-h-screen"><Spinner size="lg" /></div>
  const d = data || DEMO

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">Analytics</h1>
        <p className="text-sm text-gray-500 mt-1">Performance overview — all time</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <KPI label="Total Revenue" value={fmt(d.stats?.total_revenue||32800000)} icon="💰" />
        <KPI label="Total Deals Closed" value={d.stats?.total_deals||52} icon="🤝" />
        <KPI label="Avg Deal Value" value={fmt(d.stats?.avg_deal_value||630769)} icon="📈" />
        <KPI label="Conversion Rate" value={(d.stats?.conversion_rate||18.5)+'%'} icon="🎯" />
      </div>

      {/* Revenue chart */}
      <div className="bg-gray-900 rounded-xl border border-white/8 p-5 mb-6">
        <h2 className="text-sm font-semibold text-white mb-4">Monthly Revenue</h2>
        <ResponsiveContainer width="100%" height={220}>
          <AreaChart data={d.revenue||DEMO.revenue} margin={{ top:5, right:10, left:0, bottom:0 }}>
            <defs>
              <linearGradient id="goldGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={GOLD} stopOpacity={0.3} />
                <stop offset="95%" stopColor={GOLD} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
            <XAxis dataKey="month" tick={{ fill:'#6b7280', fontSize:11 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill:'#6b7280', fontSize:11 }} axisLine={false} tickLine={false} tickFormatter={v=>'€'+Math.round(v/1000)+'K'} />
            <Tooltip contentStyle={{ background:'#111827', border:'1px solid rgba(255,255,255,0.1)', borderRadius:8, color:'#f9fafb' }} formatter={v=>fmt(v)} />
            <Area type="monotone" dataKey="revenue" stroke={GOLD} strokeWidth={2} fill="url(#goldGrad)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Lead Sources */}
        <div className="bg-gray-900 rounded-xl border border-white/8 p-5">
          <h2 className="text-sm font-semibold text-white mb-4">Lead Sources</h2>
          <div className="flex items-center gap-6">
            <ResponsiveContainer width={160} height={160}>
              <PieChart>
                <Pie data={d.lead_sources||DEMO.lead_sources} cx="50%" cy="50%" innerRadius={45} outerRadius={70} paddingAngle={3} dataKey="value">
                  {(d.lead_sources||DEMO.lead_sources).map((_,i)=><Cell key={i} fill={COLORS[i%COLORS.length]} />)}
                </Pie>
                <Tooltip contentStyle={{ background:'#111827', border:'1px solid rgba(255,255,255,0.1)', borderRadius:8, color:'#f9fafb' }} />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex-1 space-y-2">
              {(d.lead_sources||DEMO.lead_sources).map((s,i)=>(
                <div key={s.name} className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{background:COLORS[i%COLORS.length]}} />
                  <span className="text-xs text-gray-400 flex-1">{s.name}</span>
                  <span className="text-xs font-bold text-white">{s.value}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* By Type */}
        <div className="bg-gray-900 rounded-xl border border-white/8 p-5">
          <h2 className="text-sm font-semibold text-white mb-4">Deals by Property Type</h2>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={d.by_type||DEMO.by_type} margin={{top:0,right:0,left:0,bottom:0}}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="type" tick={{fill:'#6b7280',fontSize:11}} axisLine={false} tickLine={false} />
              <YAxis tick={{fill:'#6b7280',fontSize:11}} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{background:'#111827',border:'1px solid rgba(255,255,255,0.1)',borderRadius:8,color:'#f9fafb'}} />
              <Bar dataKey="count" fill={GOLD} radius={[4,4,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Conversion rate */}
      <div className="bg-gray-900 rounded-xl border border-white/8 p-5">
        <h2 className="text-sm font-semibold text-white mb-4">Conversion Rate Trend (Last 6 Months)</h2>
        <ResponsiveContainer width="100%" height={180}>
          <AreaChart data={d.conversion||DEMO.conversion} margin={{top:5,right:10,left:0,bottom:0}}>
            <defs>
              <linearGradient id="blueGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#60a5fa" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#60a5fa" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
            <XAxis dataKey="month" tick={{fill:'#6b7280',fontSize:11}} axisLine={false} tickLine={false} />
            <YAxis tick={{fill:'#6b7280',fontSize:11}} axisLine={false} tickLine={false} tickFormatter={v=>v+'%'} />
            <Tooltip contentStyle={{background:'#111827',border:'1px solid rgba(255,255,255,0.1)',borderRadius:8,color:'#f9fafb'}} formatter={v=>v+'%'} />
            <Area type="monotone" dataKey="rate" stroke="#60a5fa" strokeWidth={2} fill="url(#blueGrad)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

function KPI({ label, value, icon }) {
  return (
    <div className="bg-gray-900 rounded-xl border border-white/8 p-5">
      <div className="text-xl mb-2">{icon}</div>
      <div className="text-xl font-bold text-white">{value}</div>
      <div className="text-xs text-gray-500 mt-1">{label}</div>
    </div>
  )
}
