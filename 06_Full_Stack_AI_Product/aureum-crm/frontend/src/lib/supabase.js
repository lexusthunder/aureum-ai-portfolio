/**
 * AUREUM CRM — Supabase Client
 * Handles: Auth, Database (Realtime), Storage
 */

import { createClient } from '@supabase/supabase-js'

const supabaseUrl  = import.meta.env.VITE_SUPABASE_URL
const supabaseAnon = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnon) {
  console.warn('[Aureum] Supabase env vars not set — running in offline/demo mode')
}

export const supabase = createClient(
  supabaseUrl  || 'https://placeholder.supabase.co',
  supabaseAnon || 'placeholder',
  {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true,
    },
    realtime: {
      params: { eventsPerSecond: 10 },
    },
  }
)

// ============================================================
// AUTH helpers
// ============================================================

export const signIn = (email, password) =>
  supabase.auth.signInWithPassword({ email, password })

export const signUp = (email, password, metadata = {}) =>
  supabase.auth.signUp({ email, password, options: { data: metadata } })

export const signOut = () => supabase.auth.signOut()

export const getSession = () => supabase.auth.getSession()

export const onAuthChange = (cb) => supabase.auth.onAuthStateChange(cb)

// ============================================================
// PROFILES
// ============================================================

export const getProfile = (userId) =>
  supabase.from('profiles').select('*').eq('id', userId).single()

export const updateProfile = (userId, data) =>
  supabase.from('profiles').update(data).eq('id', userId).select().single()

// ============================================================
// LEADS
// ============================================================

export const getLeads = (filters = {}) => {
  let q = supabase.from('leads').select('*, owner:profiles(id,full_name,email)').order('created_at', { ascending: false })
  if (filters.status)   q = q.eq('status', filters.status)
  if (filters.priority) q = q.eq('priority', filters.priority)
  if (filters.search)   q = q.or(`first_name.ilike.%${filters.search}%,last_name.ilike.%${filters.search}%,email.ilike.%${filters.search}%`)
  return q
}

export const getLead = (id) =>
  supabase.from('leads').select('*, owner:profiles(id,full_name,email)').eq('id', id).single()

export const createLead = (data) =>
  supabase.from('leads').insert(data).select().single()

export const updateLead = (id, data) =>
  supabase.from('leads').update(data).eq('id', id).select().single()

export const deleteLead = (id) =>
  supabase.from('leads').delete().eq('id', id)

// ============================================================
// PROPERTIES
// ============================================================

export const getProperties = (filters = {}) => {
  let q = supabase.from('properties').select('*').order('created_at', { ascending: false })
  if (filters.city)          q = q.eq('city', filters.city)
  if (filters.property_type) q = q.eq('property_type', filters.property_type)
  if (filters.status)        q = q.eq('status', filters.status)
  if (filters.is_featured)   q = q.eq('is_featured', true)
  return q
}

export const getProperty = (id) =>
  supabase.from('properties').select('*').eq('id', id).single()

export const createProperty = (data) =>
  supabase.from('properties').insert(data).select().single()

export const updateProperty = (id, data) =>
  supabase.from('properties').update(data).eq('id', id).select().single()

export const deleteProperty = (id) =>
  supabase.from('properties').delete().eq('id', id)

// ============================================================
// DEALS
// ============================================================

export const getDeals = (filters = {}) => {
  let q = supabase
    .from('deals')
    .select('*, lead:leads(id,first_name,last_name), property:properties(id,title,price), owner:profiles(id,full_name)')
    .order('created_at', { ascending: false })
  if (filters.stage)    q = q.eq('stage', filters.stage)
  if (filters.owner_id) q = q.eq('owner_id', filters.owner_id)
  return q
}

export const getDeal = (id) =>
  supabase
    .from('deals')
    .select('*, lead:leads(*), property:properties(*), owner:profiles(id,full_name,email)')
    .eq('id', id)
    .single()

export const createDeal = (data) =>
  supabase.from('deals').insert(data).select().single()

export const updateDeal = (id, data) =>
  supabase.from('deals').update(data).eq('id', id).select().single()

export const deleteDeal = (id) =>
  supabase.from('deals').delete().eq('id', id)

// ============================================================
// ACTIVITIES
// ============================================================

export const getActivities = (filters = {}) => {
  let q = supabase
    .from('activities')
    .select('*, user:profiles(id,full_name), lead:leads(id,first_name,last_name)')
    .order('created_at', { ascending: false })
  if (filters.lead_id) q = q.eq('lead_id', filters.lead_id)
  if (filters.deal_id) q = q.eq('deal_id', filters.deal_id)
  return q
}

export const createActivity = (data) =>
  supabase.from('activities').insert(data).select().single()

export const updateActivity = (id, data) =>
  supabase.from('activities').update(data).eq('id', id).select().single()

export const deleteActivity = (id) =>
  supabase.from('activities').delete().eq('id', id)

// ============================================================
// DASHBOARD STATS (calculat client-side din Supabase)
// ============================================================

export const getDashboardStats = async () => {
  const [leads, deals, properties, activities] = await Promise.all([
    supabase.from('leads').select('id, status, ai_score, created_at'),
    supabase.from('deals').select('id, stage, value, commission_rate'),
    supabase.from('properties').select('id, is_active, is_featured'),
    supabase.from('activities').select('id, created_at').gte('created_at', new Date(Date.now() - 7 * 86400000).toISOString()),
  ])

  const allLeads  = leads.data  || []
  const allDeals  = deals.data  || []
  const allProps  = properties.data || []

  const totalRevenue = allDeals
    .filter(d => d.stage === 'closed_won')
    .reduce((sum, d) => sum + (d.value * d.commission_rate / 100), 0)

  return {
    total_leads:        allLeads.length,
    new_leads:          allLeads.filter(l => l.status === 'new').length,
    qualified_leads:    allLeads.filter(l => l.status === 'qualified').length,
    active_deals:       allDeals.filter(d => !['closed_won','closed_lost'].includes(d.stage)).length,
    closed_deals:       allDeals.filter(d => d.stage === 'closed_won').length,
    total_revenue:      totalRevenue,
    pipeline_value:     allDeals.reduce((s, d) => s + d.value, 0),
    active_properties:  allProps.filter(p => p.is_active).length,
    avg_ai_score:       allLeads.length ? allLeads.reduce((s, l) => s + (l.ai_score || 0), 0) / allLeads.length : 0,
    weekly_activities:  activities.data?.length || 0,
  }
}

// ============================================================
// STORAGE — Property Images
// ============================================================

export const uploadPropertyImage = async (file, propertyId) => {
  const ext  = file.name.split('.').pop()
  const path = `properties/${propertyId}/${Date.now()}.${ext}`
  const { data, error } = await supabase.storage
    .from('property-images')
    .upload(path, file, { cacheControl: '3600', upsert: false })
  if (error) throw error
  const { data: { publicUrl } } = supabase.storage.from('property-images').getPublicUrl(path)
  return publicUrl
}

export const deletePropertyImage = (path) =>
  supabase.storage.from('property-images').remove([path])

// ============================================================
// REALTIME subscriptions
// ============================================================

export const subscribeToLeads = (callback) =>
  supabase
    .channel('leads-changes')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'leads' }, callback)
    .subscribe()

export const subscribeToDeals = (callback) =>
  supabase
    .channel('deals-changes')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'deals' }, callback)
    .subscribe()

export const subscribeToActivities = (callback) =>
  supabase
    .channel('activities-changes')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'activities' }, callback)
    .subscribe()

export default supabase
