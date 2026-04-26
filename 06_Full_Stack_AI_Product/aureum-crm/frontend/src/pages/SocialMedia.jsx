import { useState } from 'react'

const PLATFORMS = [
  { id: 'instagram', name: 'Instagram', icon: '📸', followers: '12.4K', growth: '+340 this month', color: 'text-pink-400', bg: 'bg-pink-500/10 border-pink-500/20' },
  { id: 'tiktok', name: 'TikTok', icon: '🎵', followers: '8.7K', growth: '+1.2K this month', color: 'text-cyan-400', bg: 'bg-cyan-500/10 border-cyan-500/20' },
  { id: 'linkedin', name: 'LinkedIn', icon: '💼', followers: '3.1K', growth: '+87 this month', color: 'text-blue-400', bg: 'bg-blue-500/10 border-blue-500/20' },
]

const INITIAL_POSTS = [
  { id: 1, platform: 'instagram', caption: '🏙️ Just listed: Merrion Square Penthouse — 4 beds, 360° Dublin views, private terrace. Price on application. DM for exclusive access. #LuxuryLiving #DublinProperty #Aureum', date: '2026-04-02', time: '10:00', status: 'Scheduled', likes: 0, views: 0 },
  { id: 2, platform: 'tiktok', caption: 'POV: Walking through a €4.5M penthouse above Dublin 🏠✨ Full tour coming Thursday. Follow for exclusive property content. #LuxuryRealEstate #Dublin #PropertyTour', date: '2026-04-03', time: '18:00', status: 'Scheduled', likes: 0, views: 0 },
  { id: 3, platform: 'instagram', caption: "Dubai or Dublin? 🌅 Our portfolio now spans two of the world's most exciting property markets. Which city would you invest in? Comment below 👇 #RealEstate #Dubai #Dublin", date: '2026-03-31', time: '12:00', status: 'Published', likes: 234, views: 4120 },
  { id: 4, platform: 'linkedin', caption: 'Q1 2026 Market Update: Dublin luxury residential continues to outperform expectations, with trophy assets up 8.3% YoY. Here\'s what\'s driving demand — and where we see opportunity in Q2.', date: '2026-03-28', time: '09:00', status: 'Published', likes: 89, views: 1340 },
  { id: 5, platform: 'tiktok', caption: 'This Palm Jumeirah villa just sold in 48 hours 🤯 Here\'s how we closed it. #DubaiRealEstate #LuxuryHomes #AgentLife', date: '2026-03-26', time: '19:00', status: 'Published', likes: 1240, views: 28500 },
  { id: 6, platform: 'instagram', caption: 'Behind the scenes at our Knightsbridge London viewing 🇬🇧 Sometimes the best deals happen over champagne. #LondonProperty #KnightsbridgeLiving #Aureum', date: '2026-04-07', time: '14:00', status: 'Draft', likes: 0, views: 0 },
]

const STATUS_STYLES = {
  Published: 'bg-green-500/15 text-green-400 border border-green-500/20',
  Scheduled: 'bg-amber-500/15 text-amber-400 border border-amber-500/20',
  Draft: 'bg-gray-500/15 text-gray-400 border border-gray-500/20',
}

const PLATFORM_ICONS = { instagram: '📸', tiktok: '🎵', linkedin: '💼' }
const PLATFORM_COLORS = { instagram: 'text-pink-400', tiktok: 'text-cyan-400', linkedin: 'text-blue-400' }

export default function SocialMedia() {
  const [posts, setPosts] = useState(INITIAL_POSTS)
  const [filter, setFilter] = useState('all') // all | instagram | tiktok | linkedin
  const [statusFilter, setStatusFilter] = useState('all')
  const [showNew, setShowNew] = useState(false)
  const [newPost, setNewPost] = useState({ platform: 'instagram', caption: '', date: '', time: '10:00', status: 'Draft' })
  const [view, setView] = useState('feed') // feed | calendar

  const filtered = posts.filter(p => {
    if (filter !== 'all' && p.platform !== filter) return false
    if (statusFilter !== 'all' && p.status !== statusFilter) return false
    return true
  })

  const published = posts.filter(p => p.status === 'Published')
  const scheduled = posts.filter(p => p.status === 'Scheduled')
  const drafts = posts.filter(p => p.status === 'Draft')

  function addPost() {
    if (!newPost.caption.trim()) return
    setPosts(prev => [{
      id: Date.now(),
      ...newPost,
      likes: 0,
      views: 0,
    }, ...prev])
    setNewPost({ platform: 'instagram', caption: '', date: '', time: '10:00', status: 'Draft' })
    setShowNew(false)
  }

  function deletePost(id) {
    setPosts(prev => prev.filter(p => p.id !== id))
  }

  function publishPost(id) {
    setPosts(prev => prev.map(p => p.id === id ? { ...p, status: 'Published' } : p))
  }

  // Build calendar weeks
  const today = new Date('2026-03-31')
  const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
  const calendarDates = Array.from({ length: 14 }, (_, i) => {
    const d = new Date(today)
    d.setDate(today.getDate() - 3 + i)
    return d.toISOString().slice(0, 10)
  })

  return (
    <div className="p-6 max-w-screen-xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Social Media</h1>
          <p className="text-sm text-gray-400 mt-0.5">Content calendar, scheduling & performance tracking</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setView('feed')} className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${view === 'feed' ? 'bg-amber-500 text-black' : 'bg-gray-800 text-gray-300 hover:bg-gray-700'}`}>Feed</button>
          <button onClick={() => setView('calendar')} className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${view === 'calendar' ? 'bg-amber-500 text-black' : 'bg-gray-800 text-gray-300 hover:bg-gray-700'}`}>Calendar</button>
          <button onClick={() => setShowNew(true)} className="px-4 py-2 bg-amber-500 text-black rounded-lg text-sm font-semibold hover:bg-amber-400 transition-colors">+ New Post</button>
        </div>
      </div>

      {/* Platform Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {PLATFORMS.map(p => (
          <div key={p.id} className={`bg-gray-900 border rounded-xl p-4 ${p.bg}`}>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xl">{p.icon}</span>
              <span className={`font-semibold text-sm ${p.color}`}>{p.name}</span>
            </div>
            <div className="text-2xl font-bold text-white">{p.followers}</div>
            <div className="text-xs text-gray-400 mt-0.5">{p.growth}</div>
          </div>
        ))}
      </div>

      {/* Summary bar */}
      <div className="flex items-center gap-4 mb-4">
        <div className="flex gap-1">
          {['all', 'instagram', 'tiktok', 'linkedin'].map(f => (
            <button key={f} onClick={() => setFilter(f)} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors capitalize ${filter === f ? 'bg-amber-500 text-black' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'}`}>
              {f === 'all' ? 'All Platforms' : `${PLATFORM_ICONS[f]} ${f.charAt(0).toUpperCase() + f.slice(1)}`}
            </button>
          ))}
        </div>
        <div className="flex gap-1 ml-auto">
          {['all', 'Published', 'Scheduled', 'Draft'].map(s => (
            <button key={s} onClick={() => setStatusFilter(s)} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${statusFilter === s ? 'bg-gray-600 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'}`}>{s}</button>
          ))}
        </div>
      </div>

      {view === 'feed' ? (
        <div className="grid grid-cols-1 gap-3">
          {filtered.length === 0 && (
            <div className="text-center py-16 text-gray-500">No posts match your filters.</div>
          )}
          {filtered.map(post => (
            <div key={post.id} className="bg-gray-900 border border-white/8 rounded-xl p-4 hover:border-white/12 transition-colors">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`text-sm font-medium ${PLATFORM_COLORS[post.platform]}`}>
                      {PLATFORM_ICONS[post.platform]} {post.platform.charAt(0).toUpperCase() + post.platform.slice(1)}
                    </span>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_STYLES[post.status]}`}>{post.status}</span>
                    <span className="text-xs text-gray-500 ml-auto">{post.date} at {post.time}</span>
                  </div>
                  <p className="text-sm text-gray-200 leading-relaxed">{post.caption}</p>
                  {post.status === 'Published' && (
                    <div className="flex gap-4 mt-3">
                      <span className="text-xs text-gray-400">❤️ {post.likes.toLocaleString()}</span>
                      <span className="text-xs text-gray-400">👁 {post.views.toLocaleString()}</span>
                    </div>
                  )}
                </div>
                <div className="flex gap-1 shrink-0">
                  {post.status !== 'Published' && (
                    <button onClick={() => publishPost(post.id)} className="px-3 py-1.5 rounded-lg text-xs bg-green-500/15 text-green-400 hover:bg-green-500/25 transition-colors border border-green-500/20">Publish</button>
                  )}
                  <button onClick={() => deletePost(post.id)} className="px-3 py-1.5 rounded-lg text-xs bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors border border-red-500/20">Delete</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Calendar view */
        <div className="bg-gray-900 border border-white/8 rounded-xl p-4">
          <div className="grid grid-cols-7 gap-1 mb-2">
            {weekDays.map(d => <div key={d} className="text-xs text-gray-500 text-center py-1">{d}</div>)}
          </div>
          <div className="grid grid-cols-7 gap-1">
            {calendarDates.map(date => {
              const dayPosts = posts.filter(p => p.date === date)
              const isToday = date === '2026-03-31'
              return (
                <div key={date} className={`min-h-20 rounded-lg p-1.5 border ${isToday ? 'border-amber-500/40 bg-amber-500/5' : 'border-white/4 bg-gray-800/30'}`}>
                  <div className={`text-xs font-medium mb-1 ${isToday ? 'text-amber-400' : 'text-gray-500'}`}>{date.slice(8)}</div>
                  {dayPosts.map(p => (
                    <div key={p.id} className={`text-xs px-1 py-0.5 rounded mb-0.5 truncate ${p.status === 'Published' ? 'bg-green-500/20 text-green-300' : p.status === 'Scheduled' ? 'bg-amber-500/20 text-amber-300' : 'bg-gray-600/40 text-gray-400'}`}>
                      {PLATFORM_ICONS[p.platform]} {p.caption.slice(0, 20)}…
                    </div>
                  ))}
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* New Post Modal */}
      {showNew && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 border border-white/12 rounded-2xl p-6 w-full max-w-lg">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-white">New Post</h3>
              <button onClick={() => setShowNew(false)} className="text-gray-400 hover:text-white text-xl">×</button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-xs text-gray-400 mb-1 block">Platform</label>
                <select value={newPost.platform} onChange={e => setNewPost(p => ({ ...p, platform: e.target.value }))} className="w-full bg-gray-800 border border-white/8 rounded-lg px-3 py-2 text-white text-sm">
                  <option value="instagram">📸 Instagram</option>
                  <option value="tiktok">🎵 TikTok</option>
                  <option value="linkedin">💼 LinkedIn</option>
                </select>
              </div>
              <div>
                <label className="text-xs text-gray-400 mb-1 block">Caption</label>
                <textarea
                  rows={4}
                  value={newPost.caption}
                  onChange={e => setNewPost(p => ({ ...p, caption: e.target.value }))}
                  placeholder="Write your caption..."
                  className="w-full bg-gray-800 border border-white/8 rounded-lg px-3 py-2 text-white text-sm resize-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">Date</label>
                  <input type="date" value={newPost.date} onChange={e => setNewPost(p => ({ ...p, date: e.target.value }))} className="w-full bg-gray-800 border border-white/8 rounded-lg px-3 py-2 text-white text-sm" />
                </div>
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">Time</label>
                  <input type="time" value={newPost.time} onChange={e => setNewPost(p => ({ ...p, time: e.target.value }))} className="w-full bg-gray-800 border border-white/8 rounded-lg px-3 py-2 text-white text-sm" />
                </div>
              </div>
              <div>
                <label className="text-xs text-gray-400 mb-1 block">Status</label>
                <select value={newPost.status} onChange={e => setNewPost(p => ({ ...p, status: e.target.value }))} className="w-full bg-gray-800 border border-white/8 rounded-lg px-3 py-2 text-white text-sm">
                  <option value="Draft">Draft</option>
                  <option value="Scheduled">Scheduled</option>
                </select>
              </div>
              <div className="flex gap-2 pt-2">
                <button onClick={() => setShowNew(false)} className="flex-1 py-2.5 rounded-xl border border-white/10 text-gray-400 hover:text-white text-sm transition-colors">Cancel</button>
                <button onClick={addPost} className="flex-1 py-2.5 rounded-xl bg-amber-500 text-black font-semibold text-sm hover:bg-amber-400 transition-colors">Add Post</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
