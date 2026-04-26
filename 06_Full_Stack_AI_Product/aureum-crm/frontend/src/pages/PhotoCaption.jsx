import { useState, useRef, useCallback } from 'react'
import axios from 'axios'

const PLATFORMS = [
  { key: 'instagram_post',  label: 'Instagram Post', icon: '📸', color: 'border-pink-500/30 bg-pink-500/5',  badge: 'bg-pink-500/15 text-pink-400' },
  { key: 'instagram_reels', label: 'Instagram Reels', icon: '🎬', color: 'border-purple-500/30 bg-purple-500/5', badge: 'bg-purple-500/15 text-purple-400' },
  { key: 'tiktok',          label: 'TikTok',          icon: '🎵', color: 'border-cyan-500/30 bg-cyan-500/5',  badge: 'bg-cyan-500/15 text-cyan-400' },
  { key: 'linkedin',        label: 'LinkedIn',        icon: '💼', color: 'border-blue-500/30 bg-blue-500/5',  badge: 'bg-blue-500/15 text-blue-400' },
  { key: 'google_business', label: 'Google Business', icon: '🔍', color: 'border-green-500/30 bg-green-500/5', badge: 'bg-green-500/15 text-green-400' },
]

function CaptionCard({ platform, data, onSchedule }) {
  const [copied, setCopied] = useState(false)

  const fullText = typeof data === 'string'
    ? data
    : `${data.caption}\n\n${(data.hashtags || []).map(h => '#' + h.replace(/^#/, '')).join(' ')}`

  function copy() {
    navigator.clipboard.writeText(fullText)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className={`border rounded-2xl p-4 ${platform.color}`}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-lg">{platform.icon}</span>
          <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${platform.badge}`}>{platform.label}</span>
        </div>
        <div className="flex gap-1.5">
          <button
            onClick={copy}
            className="px-3 py-1.5 rounded-lg text-xs bg-gray-700 hover:bg-gray-600 text-gray-300 transition-colors"
          >
            {copied ? '✓ Copied' : 'Copy'}
          </button>
          {onSchedule && (
            <button
              onClick={() => onSchedule(platform, fullText)}
              className="px-3 py-1.5 rounded-lg text-xs bg-amber-500/15 text-amber-400 hover:bg-amber-500/25 border border-amber-500/20 transition-colors"
            >
              + Schedule
            </button>
          )}
        </div>
      </div>

      {typeof data === 'string' ? (
        <p className="text-sm text-gray-200 leading-relaxed">{data}</p>
      ) : (
        <>
          <p className="text-sm text-gray-200 leading-relaxed whitespace-pre-line">{data.caption}</p>
          {data.hashtags && data.hashtags.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-1.5">
              {data.hashtags.map((tag, i) => (
                <span key={i} className="text-xs text-gray-400 bg-gray-800/60 px-2 py-0.5 rounded-full">
                  #{tag.replace(/^#/, '')}
                </span>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  )
}

export default function PhotoCaption() {
  const fileRef = useRef()
  const [preview, setPreview] = useState(null)        // object URL for <img>
  const [imageBase64, setImageBase64] = useState(null)
  const [imageType, setImageType] = useState('jpeg')
  const [dragging, setDragging] = useState(false)

  const [form, setForm] = useState({
    property_name: '',
    city: 'Dublin',
    price: '',
    bedrooms: '',
    agent_name: 'Ionel Alexandru',
    extra_notes: '',
  })

  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)
  const [scheduled, setScheduled] = useState([])
  const [scheduledMsg, setScheduledMsg] = useState(null)

  function loadFile(file) {
    if (!file || !file.type.startsWith('image/')) return
    const type = file.type.split('/')[1] || 'jpeg'
    setImageType(type === 'jpg' ? 'jpeg' : type)
    setPreview(URL.createObjectURL(file))

    const reader = new FileReader()
    reader.onload = e => {
      // Strip the data:image/...;base64, prefix
      const base64 = e.target.result.split(',')[1]
      setImageBase64(base64)
    }
    reader.readAsDataURL(file)
    setResult(null)
    setError(null)
  }

  function onFileChange(e) {
    loadFile(e.target.files[0])
  }

  const onDrop = useCallback(e => {
    e.preventDefault()
    setDragging(false)
    loadFile(e.dataTransfer.files[0])
  }, [])

  async function generate() {
    if (!imageBase64) return
    setLoading(true)
    setError(null)
    setResult(null)

    try {
      const payload = {
        image_base64: imageBase64,
        image_type: imageType,
        agent_name: form.agent_name || 'Ionel Alexandru',
      }
      if (form.property_name) payload.property_name = form.property_name
      if (form.city) payload.city = form.city
      if (form.price) payload.price = form.price
      if (form.bedrooms) payload.bedrooms = parseInt(form.bedrooms)
      if (form.extra_notes) payload.extra_notes = form.extra_notes

      const { data } = await axios.post('/api/ai/caption-from-photo', payload)
      setResult(data)
    } catch (err) {
      const msg = err.response?.data?.detail || err.message
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  function handleSchedule(platform, text) {
    const entry = {
      id: Date.now(),
      platform: platform.key.replace('_post', '').replace('_reels', ''),
      platformLabel: platform.label,
      caption: text,
      scheduledAt: new Date().toLocaleDateString('en-IE'),
    }
    setScheduled(prev => [entry, ...prev])
    setScheduledMsg(`Added to ${platform.label} queue`)
    setTimeout(() => setScheduledMsg(null), 2500)
  }

  return (
    <div className="p-6 max-w-screen-xl">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">Photo Caption Generator</h1>
        <p className="text-sm text-gray-400 mt-0.5">
          Upload a property photo → Claude Vision analysează → captions gata pentru toate platformele
        </p>
      </div>

      <div className="grid grid-cols-12 gap-5">

        {/* Left: Upload + Form */}
        <div className="col-span-4 space-y-4">

          {/* Drop zone */}
          <div
            onClick={() => fileRef.current.click()}
            onDragOver={e => { e.preventDefault(); setDragging(true) }}
            onDragLeave={() => setDragging(false)}
            onDrop={onDrop}
            className={`relative cursor-pointer rounded-2xl border-2 border-dashed transition-all flex items-center justify-center overflow-hidden
              ${dragging ? 'border-amber-400 bg-amber-500/8' : 'border-white/12 hover:border-amber-500/40 hover:bg-white/2'}
              ${preview ? 'h-56' : 'h-44'}`}
          >
            {preview ? (
              <>
                <img src={preview} alt="preview" className="w-full h-full object-cover rounded-2xl" />
                <div className="absolute inset-0 bg-black/30 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center rounded-2xl">
                  <span className="text-white text-sm font-medium">Change photo</span>
                </div>
              </>
            ) : (
              <div className="text-center p-6">
                <div className="text-4xl mb-2">📷</div>
                <div className="text-sm text-gray-300 font-medium">Drop photo here or click</div>
                <div className="text-xs text-gray-500 mt-1">JPG, PNG, WEBP — max 5MB</div>
              </div>
            )}
            <input ref={fileRef} type="file" accept="image/*" onChange={onFileChange} className="hidden" />
          </div>

          {/* Property Details */}
          <div className="bg-gray-900 border border-white/8 rounded-xl p-4 space-y-3">
            <div className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Property Details</div>

            <div>
              <label className="text-xs text-gray-500 mb-1 block">Property Name</label>
              <input
                value={form.property_name}
                onChange={e => setForm(f => ({ ...f, property_name: e.target.value }))}
                placeholder="e.g. Merrion Square Penthouse"
                className="w-full bg-gray-800 border border-white/8 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-600 outline-none focus:border-amber-500/40"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-xs text-gray-500 mb-1 block">City</label>
                <select
                  value={form.city}
                  onChange={e => setForm(f => ({ ...f, city: e.target.value }))}
                  className="w-full bg-gray-800 border border-white/8 rounded-lg px-3 py-2 text-sm text-white outline-none"
                >
                  <option>Dublin</option>
                  <option>Dubai</option>
                  <option>London</option>
                  <option>Lisbon</option>
                  <option>Monaco</option>
                </select>
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Bedrooms</label>
                <input
                  type="number"
                  value={form.bedrooms}
                  onChange={e => setForm(f => ({ ...f, bedrooms: e.target.value }))}
                  placeholder="4"
                  className="w-full bg-gray-800 border border-white/8 rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-amber-500/40"
                />
              </div>
            </div>

            <div>
              <label className="text-xs text-gray-500 mb-1 block">Price (optional)</label>
              <input
                value={form.price}
                onChange={e => setForm(f => ({ ...f, price: e.target.value }))}
                placeholder="e.g. €4,500,000 or POA"
                className="w-full bg-gray-800 border border-white/8 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-600 outline-none focus:border-amber-500/40"
              />
            </div>

            <div>
              <label className="text-xs text-gray-500 mb-1 block">Extra context for AI</label>
              <textarea
                rows={2}
                value={form.extra_notes}
                onChange={e => setForm(f => ({ ...f, extra_notes: e.target.value }))}
                placeholder="e.g. penthouse with rooftop pool, recently renovated, sea views..."
                className="w-full bg-gray-800 border border-white/8 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-600 outline-none resize-none focus:border-amber-500/40"
              />
            </div>
          </div>

          <button
            onClick={generate}
            disabled={!imageBase64 || loading}
            className={`w-full py-3.5 rounded-xl font-bold text-sm transition-all ${
              imageBase64 && !loading
                ? 'bg-amber-500 text-black hover:bg-amber-400'
                : 'bg-gray-800 text-gray-500 cursor-not-allowed'
            }`}
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                </svg>
                Claude analizează fotografia...
              </span>
            ) : '✦ Generate Captions'}
          </button>

          {!imageBase64 && (
            <p className="text-xs text-gray-600 text-center">Încarcă o fotografie pentru a genera captions</p>
          )}

          {/* Scheduled queue */}
          {scheduled.length > 0 && (
            <div className="bg-gray-900 border border-white/8 rounded-xl p-3">
              <div className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Programate ({scheduled.length})</div>
              <div className="space-y-1.5 max-h-40 overflow-y-auto">
                {scheduled.map(s => (
                  <div key={s.id} className="flex items-center gap-2 text-xs">
                    <span className="text-gray-400">{s.scheduledAt}</span>
                    <span className="text-white font-medium">{s.platformLabel}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right: Results */}
        <div className="col-span-8">
          {/* Toast */}
          {scheduledMsg && (
            <div className="mb-3 px-4 py-2.5 bg-green-500/15 border border-green-500/20 rounded-xl text-green-400 text-sm font-medium">
              ✓ {scheduledMsg}
            </div>
          )}

          {error && (
            <div className="mb-4 p-4 bg-red-500/10 border border-red-500/20 rounded-xl">
              <div className="text-red-400 font-semibold text-sm mb-1">Eroare</div>
              <div className="text-red-300 text-xs">{error}</div>
              {error.includes('ANTHROPIC_API_KEY') && (
                <div className="mt-2 text-xs text-gray-400">
                  Adaugă cheia în <code className="bg-gray-800 px-1 rounded">/aureum-crm/.env</code> →{' '}
                  <code className="bg-gray-800 px-1 rounded">ANTHROPIC_API_KEY=sk-ant-...</code>
                </div>
              )}
            </div>
          )}

          {!result && !loading && !error && (
            <div className="h-full flex flex-col items-center justify-center text-center py-20 text-gray-600">
              <div className="text-6xl mb-4 opacity-30">✦</div>
              <div className="text-sm">Încarcă o fotografie și apasă Generate</div>
              <div className="text-xs mt-1">Claude Vision va genera captions pentru toate platformele</div>
            </div>
          )}

          {loading && (
            <div className="h-full flex flex-col items-center justify-center py-20 gap-4">
              <div className="flex gap-1.5">
                {[0,1,2].map(i => (
                  <div key={i} className="w-2 h-2 bg-amber-500 rounded-full animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
                ))}
              </div>
              <div className="text-sm text-gray-400">Claude analizează fotografia și scrie captions...</div>
              <div className="text-xs text-gray-600">Instagram · Reels · TikTok · LinkedIn · Google</div>
            </div>
          )}

          {result && !loading && (
            <div className="space-y-4">
              {/* Photo description */}
              {result.photo_description && (
                <div className="bg-gray-900 border border-amber-500/20 rounded-xl px-4 py-3">
                  <div className="text-xs text-amber-400 font-semibold mb-1">✦ Claude vede în fotografie:</div>
                  <p className="text-sm text-gray-300">{result.photo_description}</p>
                </div>
              )}

              {/* Platform captions */}
              {PLATFORMS.map(p => {
                const data = result[p.key]
                if (!data) return null
                return (
                  <CaptionCard
                    key={p.key}
                    platform={p}
                    data={data}
                    onSchedule={handleSchedule}
                  />
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
