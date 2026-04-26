import axios from 'axios'

// ============================================
// Axios Instance
// ============================================

const api = axios.create({
  baseURL: '/api',
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor – attach JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('aureum_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// Response interceptor – global error handling
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired – redirect to login
      localStorage.removeItem('aureum_token')
      localStorage.removeItem('aureum_user')
      if (window.location.pathname !== '/login') {
        window.location.href = '/login'
      }
    }
    return Promise.reject(error)
  }
)

// ============================================
// Auth
// ============================================

export const login = (email, password) =>
  api.post('/auth/login', { email, password })

export const register = (data) =>
  api.post('/auth/register', data)

export const getCurrentUser = () =>
  api.get('/auth/me')

// ============================================
// Leads
// ============================================

export const getLeads = (params = {}) =>
  api.get('/leads', { params })

export const getLead = (id) =>
  api.get(`/leads/${id}`)

export const createLead = (data) =>
  api.post('/leads', data)

export const updateLead = (id, data) =>
  api.patch(`/leads/${id}`, data)

export const deleteLead = (id) =>
  api.delete(`/leads/${id}`)

// ============================================
// Properties
// ============================================

export const getProperties = (params = {}) =>
  api.get('/properties', { params })

export const getProperty = (id) =>
  api.get(`/properties/${id}`)

export const createProperty = (data) =>
  api.post('/properties', data)

export const updateProperty = (id, data) =>
  api.patch(`/properties/${id}`, data)

export const deleteProperty = (id) =>
  api.delete(`/properties/${id}`)

// ============================================
// Deals
// ============================================

export const getDeals = (params = {}) =>
  api.get('/deals', { params })

export const getDeal = (id) =>
  api.get(`/deals/${id}`)

export const createDeal = (data) =>
  api.post('/deals', data)

export const updateDeal = (id, data) =>
  api.patch(`/deals/${id}`, data)

export const deleteDeal = (id) =>
  api.delete(`/deals/${id}`)

// ============================================
// Activities
// ============================================

export const getActivities = (params = {}) =>
  api.get('/activities', { params })

export const createActivity = (data) =>
  api.post('/activities', data)

export const updateActivity = (id, data) =>
  api.put(`/activities/${id}`, data)

export const deleteActivity = (id) =>
  api.delete(`/activities/${id}`)

// ============================================
// Dashboard
// ============================================

export const getDashboard = () =>
  api.get('/dashboard')

// ============================================
// AI Matching
// ============================================

export const matchProperties = (leadId) =>
  api.get(`/ai/match/${leadId}`)

export const getAIScore = (leadId) =>
  api.get(`/ai/score/${leadId}`)

// ============================================
// Users / Team
// ============================================

export const getUsers = () =>
  api.get('/users')

export const inviteUser = (data) =>
  api.post('/users/invite', data)

export const updateUserProfile = (id, data) =>
  api.put(`/users/${id}`, data)

// ============================================
// Seed
// ============================================

export const seedData = () =>
  api.post('/seed')

// ============================================
// Analytics
// ============================================

export const getAnalytics = (params = {}) =>
  api.get('/analytics', { params })

export default api
