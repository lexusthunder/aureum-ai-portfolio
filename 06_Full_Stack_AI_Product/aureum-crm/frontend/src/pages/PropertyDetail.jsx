import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getProperty, updateProperty } from '../lib/api'
import Spinner from '../components/ui/Spinner'

function fmt(n) { if (!n) return '—'; if (n >= 1000000) return '€'+(n/1000000).toFixed(2)+'M'; return '€'+Math.round(n/1000)+'K' }

const DEMO = { id:1, title:'3 Bed Semi-Detached — Ranelagh', property_type:'house', city:'Dublin', address:'14 Chelmsford Road, Ranelagh, Dublin 6', price:620000, bedrooms:3, bathrooms:2, area_sqm:120, ber_rating:'B2', is_active:true, is_featured:true, description:'A beautiful family home in the heart of Ranelagh. Fully renovated in 2022, this property features a modern kitchen/dining room with south-facing garden, three large bedrooms, and two bathrooms. Walking distance to all Ranelagh amenities.', source:'daft', created_at:new Date().toISOString() }

export default function PropertyDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [prop, setProp] = useState(null)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState({})
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    getProperty(id).then(p => { setProp(p); setForm(p) }).catch(() => { setProp(DEMO); setForm(DEMO) }).finally(() => setLoading(false))
  }, [id])

  async function handleSave() {
    setSaving(true)
    try { const u = await updateProperty(id, form); setProp(u); setForm(u) }
    catch { setProp(prev => ({ ...prev, ...form })) }
    finally { setSaving(false); setEditing(false) }
  }

  if (loading) return <div className="flex items-center justify-center min-h-screen"><Spinner size="lg" /></div>
  const p = prop || DEMO

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex items-center gap-4 mb-6">
        <button onClick={() => navigate('/properties')} className="text-gray-500 hover:text-white text-sm">← Properties</button>
        <div className="flex-1">
          <h1 className="text-xl font-bold text-white">{p.title}</h1>
          <p className="text-sm text-gray-500">{p.address}</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setEditing(v=>!v)} className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-black font-semibold rounded-lg text-sm">{editing ? 'Cancel' : 'Edit'}</button>
          {editing && <button onClick={handleSave} disabled={saving} className="px-4 py-2 bg-green-500 text-black font-semibold rounded-lg text-sm flex items-center gap-2">{saving&&<Spinner size="sm"/>}Save</button>}
        </div>
      </div>

      {/* Image hero */}
      <div className="h-64 bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl flex items-center justify-center mb-6">
        <span className="text-8xl opacity-10">🏠</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-gray-900 rounded-xl border border-white/8 p-5">
            <h3 className="text-xs text-gray-500 uppercase tracking-wide font-medium mb-3">Description</h3>
            {editing
              ? <textarea rows={5} value={form.description||''} onChange={e=>setForm(prev=>({...prev,description:e.target.value}))} className="w-full bg-gray-950 border border-white/10 rounded-lg px-3 py-2 text-sm text-white resize-none focus:outline-none focus:border-amber-500/50" />
              : <p className="text-sm text-gray-300 leading-relaxed">{p.description || 'No description.'}</p>}
          </div>
          <div className="bg-gray-900 rounded-xl border border-white/8 p-5">
            <h3 className="text-xs text-gray-500 uppercase tracking-wide font-medium mb-4">Details</h3>
            <div className="grid grid-cols-2 gap-4">
              {[
                ['Type', p.property_type],['City', p.city],['Bedrooms', p.bedrooms],['Bathrooms', p.bathrooms],
                ['Area', p.area_sqm ? p.area_sqm+'m²' : '—'],['BER Rating', p.ber_rating],['Source', p.source],['Status', p.is_active ? 'Active' : 'Inactive']
              ].map(([k,v]) => (
                <div key={k}>
                  <div className="text-xs text-gray-500 mb-0.5">{k}</div>
                  <div className="text-sm text-white capitalize">{v||'—'}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div>
          <div className="bg-gray-900 rounded-xl border border-white/8 p-5 sticky top-6">
            <div className="text-3xl font-bold text-amber-400 mb-1">{fmt(p.price)}</div>
            {p.area_sqm && <div className="text-sm text-gray-500 mb-4">{fmt(Math.round(p.price/p.area_sqm))}/m²</div>}
            <div className="flex gap-2 flex-wrap mb-4">
              {p.bedrooms>0 && <span className="px-2 py-1 bg-gray-800 rounded text-xs text-gray-300">{p.bedrooms} bed</span>}
              {p.bathrooms>0 && <span className="px-2 py-1 bg-gray-800 rounded text-xs text-gray-300">{p.bathrooms} bath</span>}
              {p.ber_rating && <span className="px-2 py-1 bg-green-500/15 text-green-400 rounded text-xs">{p.ber_rating}</span>}
              {p.is_featured && <span className="px-2 py-1 bg-amber-500/15 text-amber-400 rounded text-xs">Featured</span>}
            </div>
            {editing && (
              <div className="space-y-2 border-t border-white/8 pt-4">
                <div>
                  <label className="text-xs text-gray-400 block mb-1">Price (€)</label>
                  <input type="number" value={form.price||''} onChange={e=>setForm(p=>({...p,price:parseFloat(e.target.value)}))} className="w-full bg-gray-950 border border-white/10 rounded px-2 py-1.5 text-sm text-white focus:outline-none focus:border-amber-500/50" />
                </div>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={!!form.is_featured} onChange={e=>setForm(p=>({...p,is_featured:e.target.checked}))} className="rounded" />
                  <span className="text-sm text-gray-400">Featured listing</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={!!form.is_active} onChange={e=>setForm(p=>({...p,is_active:e.target.checked}))} className="rounded" />
                  <span className="text-sm text-gray-400">Active</span>
                </label>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
