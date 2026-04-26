import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getProperties, createProperty, deleteProperty } from '../lib/api'
import Spinner from '../components/ui/Spinner'

const DEMO_PROPERTIES = [
  { id: 1, title: '3 Bed Semi-Detached — Ranelagh', property_type: 'house', city: 'Dublin', address: '14 Chelmsford Road, Ranelagh', price: 620000, bedrooms: 3, bathrooms: 2, area_sqm: 120, ber_rating: 'B2', is_active: true, is_featured: true, source: 'daft' },
  { id: 2, title: 'Penthouse — Grand Canal Dock', property_type: 'penthouse', city: 'Dublin', address: 'Grand Canal Square, D2', price: 1250000, bedrooms: 2, bathrooms: 2, area_sqm: 145, ber_rating: 'A2', is_active: true, is_featured: true, source: 'manual' },
  { id: 3, title: '2 Bed Apartment — Ballsbridge', property_type: 'apartment', city: 'Dublin', address: '8 Elgin Road, Ballsbridge', price: 480000, bedrooms: 2, bathrooms: 1, area_sqm: 78, ber_rating: 'C1', is_active: true, is_featured: false, source: 'myhome' },
  { id: 4, title: '5 Bed Detached Villa — Foxrock', property_type: 'villa', city: 'Dublin', address: '3 The Grange, Foxrock', price: 1850000, bedrooms: 5, bathrooms: 4, area_sqm: 340, ber_rating: 'A3', is_active: true, is_featured: true, source: 'manual' },
  { id: 5, title: '4 Bed House — Clontarf', property_type: 'house', city: 'Dublin', address: '22 Vernon Avenue, Clontarf', price: 780000, bedrooms: 4, bathrooms: 3, area_sqm: 175, ber_rating: 'B1', is_active: true, is_featured: false, source: 'daft' },
  { id: 6, title: 'Studio Apartment — City Centre', property_type: 'apartment', city: 'Dublin', address: 'Temple Bar, D2', price: 245000, bedrooms: 0, bathrooms: 1, area_sqm: 38, ber_rating: 'D1', is_active: true, is_featured: false, source: 'daft' },
  { id: 7, title: '3 Bed Terrace — Sandymount', property_type: 'house', city: 'Dublin', address: '6 Park Ave, Sandymount', price: 595000, bedrooms: 3, bathrooms: 2, area_sqm: 110, ber_rating: 'C2', is_active: true, is_featured: false, source: 'myhome' },
  { id: 8, title: 'Commercial Unit — Docklands', property_type: 'commercial', city: 'Dublin', address: 'North Wall Quay, D1', price: 2100000, bedrooms: 0, bathrooms: 2, area_sqm: 420, ber_rating: 'A1', is_active: true, is_featured: false, source: 'manual' },
]

const TYPE_COLORS = { house:'bg-blue-500/15 text-blue-400', apartment:'bg-purple-500/15 text-purple-400', villa:'bg-amber-500/15 text-amber-400', penthouse:'bg-pink-500/15 text-pink-400', commercial:'bg-gray-500/15 text-gray-400', land:'bg-green-500/15 text-green-400' }

function fmt(n) { if (!n) return '—'; if (n >= 1000000) return '€'+(n/1000000).toFixed(2)+'M'; return '€'+Math.round(n/1000)+'K' }

export default function Properties() {
  const [props, setProps] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState('all')
  const [showAdd, setShowAdd] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    getProperties()
      .then(d => setProps(d.properties || d || []))
      .catch(() => setProps(DEMO_PROPERTIES))
      .finally(() => setLoading(false))
  }, [])

  const filtered = props.filter(p => {
    const match = p.title?.toLowerCase().includes(search.toLowerCase()) || p.city?.toLowerCase().includes(search.toLowerCase())
    const typeMatch = typeFilter === 'all' || p.property_type === typeFilter
    return match && typeMatch
  })

  async function handleDelete(id, e) {
    e.preventDefault(); e.stopPropagation()
    if (!confirm('Delete this property?')) return
    try { await deleteProperty(id) } catch {}
    setProps(prev => prev.filter(p => p.id !== id))
  }

  if (loading) return <div className="flex items-center justify-center min-h-screen"><Spinner size="lg" /></div>

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Properties</h1>
          <p className="text-sm text-gray-500 mt-0.5">{props.length} listings</p>
        </div>
        <button onClick={() => setShowAdd(true)} className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-black font-semibold rounded-lg text-sm transition-colors">
          + Add Property
        </button>
      </div>

      {/* Filters */}
      <div className="flex gap-3 mb-6 flex-wrap">
        <input type="text" placeholder="Search properties..." value={search} onChange={e => setSearch(e.target.value)}
          className="bg-gray-900 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-amber-500/50 w-64" />
        <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)}
          className="bg-gray-900 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500/50">
          <option value="all">All Types</option>
          {['house','apartment','villa','penthouse','commercial','land'].map(t => <option key={t} value={t}>{t.charAt(0).toUpperCase()+t.slice(1)}</option>)}
        </select>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filtered.length === 0 ? (
          <div className="col-span-3 text-center py-16 text-gray-500">No properties found</div>
        ) : filtered.map(p => (
          <div key={p.id} onClick={() => navigate(`/properties/${p.id}`)}
            className="bg-gray-900 rounded-xl border border-white/8 overflow-hidden cursor-pointer hover:border-amber-500/30 transition-all group">
            {/* Image placeholder */}
            <div className="h-44 bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center relative">
              <span className="text-5xl opacity-20">🏠</span>
              {p.is_featured && (
                <span className="absolute top-3 left-3 px-2 py-0.5 bg-amber-500 text-black text-xs font-bold rounded-full">Featured</span>
              )}
              <span className={`absolute top-3 right-3 px-2 py-0.5 rounded-full text-xs font-medium capitalize ${TYPE_COLORS[p.property_type]||''}`}>{p.property_type}</span>
            </div>
            <div className="p-4">
              <div className="flex items-start justify-between gap-2 mb-1">
                <h3 className="text-sm font-semibold text-white group-hover:text-amber-400 transition-colors leading-snug">{p.title}</h3>
                <button onClick={e => handleDelete(p.id, e)} className="text-gray-700 hover:text-red-400 transition-colors text-xs shrink-0 mt-0.5">✕</button>
              </div>
              <p className="text-xs text-gray-500 mb-3">{p.address || p.city}</p>
              <div className="flex items-center gap-3 text-xs text-gray-400 mb-3">
                {p.bedrooms > 0 && <span>{p.bedrooms} 🛏</span>}
                {p.bathrooms > 0 && <span>{p.bathrooms} 🚿</span>}
                {p.area_sqm && <span>{p.area_sqm}m²</span>}
                {p.ber_rating && <span className="px-1.5 py-0.5 bg-green-500/15 text-green-400 rounded text-xs">{p.ber_rating}</span>}
              </div>
              <div className="text-lg font-bold text-amber-400">{fmt(p.price)}</div>
            </div>
          </div>
        ))}
      </div>

      {showAdd && <AddPropertyModal onClose={() => setShowAdd(false)} onSave={p => { setProps(prev => [p, ...prev]); setShowAdd(false) }} />}
    </div>
  )
}

function AddPropertyModal({ onClose, onSave }) {
  const [form, setForm] = useState({ title: '', property_type: 'house', city: 'Dublin', address: '', price: '', bedrooms: '', bathrooms: '', area_sqm: '', ber_rating: '' })
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault(); setLoading(true)
    try {
      const p = await createProperty({ ...form, price: parseFloat(form.price), bedrooms: parseInt(form.bedrooms)||0, bathrooms: parseInt(form.bathrooms)||0, area_sqm: parseFloat(form.area_sqm)||null })
      onSave(p)
    } catch {
      onSave({ id: Date.now(), ...form, price: parseFloat(form.price)||0, is_active: true })
    } finally { setLoading(false) }
  }

  const F = ({ label, name, type='text', ...rest }) => (
    <div>
      <label className="block text-xs text-gray-400 mb-1 uppercase tracking-wide">{label}</label>
      <input type={type} value={form[name]} onChange={e => setForm(p => ({ ...p, [name]: e.target.value }))}
        className="w-full bg-gray-950 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500/50" {...rest} />
    </div>
  )

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-gray-900 rounded-2xl border border-white/10 p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-semibold text-white">Add Property</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-white text-xl">✕</button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-3">
          <F label="Title" name="title" required placeholder="3 Bed House — Ranelagh" />
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-gray-400 mb-1 uppercase tracking-wide">Type</label>
              <select value={form.property_type} onChange={e => setForm(p => ({ ...p, property_type: e.target.value }))}
                className="w-full bg-gray-950 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none">
                {['house','apartment','villa','penthouse','commercial','land'].map(t=><option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <F label="City" name="city" />
          </div>
          <F label="Address" name="address" />
          <F label="Price (€)" name="price" type="number" required />
          <div className="grid grid-cols-3 gap-3">
            <F label="Bedrooms" name="bedrooms" type="number" />
            <F label="Bathrooms" name="bathrooms" type="number" />
            <F label="Area (m²)" name="area_sqm" type="number" />
          </div>
          <F label="BER Rating" name="ber_rating" placeholder="A2" />
          <div className="flex gap-3 mt-4">
            <button type="button" onClick={onClose} className="flex-1 px-4 py-2 border border-white/10 rounded-lg text-sm text-gray-400 hover:text-white">Cancel</button>
            <button type="submit" disabled={loading} className="flex-1 px-4 py-2 bg-amber-500 hover:bg-amber-400 text-black font-semibold rounded-lg text-sm flex items-center justify-center gap-2">
              {loading && <Spinner size="sm" />} Save
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
