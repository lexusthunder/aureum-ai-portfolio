import React, { Suspense } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import Layout from './components/Layout'
import Spinner from './components/ui/Spinner'

// Lazy load pages for better performance
const Login = React.lazy(() => import('./pages/Login'))
const Dashboard = React.lazy(() => import('./pages/Dashboard'))
const Leads = React.lazy(() => import('./pages/Leads'))
const LeadDetail = React.lazy(() => import('./pages/LeadDetail'))
const Properties = React.lazy(() => import('./pages/Properties'))
const PropertyDetail = React.lazy(() => import('./pages/PropertyDetail'))
const Deals = React.lazy(() => import('./pages/Deals'))
const AIMatching = React.lazy(() => import('./pages/AIMatching'))
const Activities = React.lazy(() => import('./pages/Activities'))
const Analytics = React.lazy(() => import('./pages/Analytics'))
const Settings = React.lazy(() => import('./pages/Settings'))
const EmailOutreach = React.lazy(() => import('./pages/EmailOutreach'))
const SocialMedia = React.lazy(() => import('./pages/SocialMedia'))
const Financial = React.lazy(() => import('./pages/Financial'))
const Automations = React.lazy(() => import('./pages/Automations'))
const Strategy = React.lazy(() => import('./pages/Strategy'))
const PhotoCaption = React.lazy(() => import('./pages/PhotoCaption'))

// Page loading fallback
const PageLoader = () => (
  <div className="flex items-center justify-center min-h-screen bg-gray-950">
    <div className="flex flex-col items-center gap-4">
      <Spinner size="lg" />
      <p className="text-gray-400 text-sm animate-pulse">Loading...</p>
    </div>
  </div>
)

// Error Boundary
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex items-center justify-center min-h-screen bg-gray-950">
          <div className="text-center p-8 max-w-md">
            <div className="text-6xl mb-4">⚠️</div>
            <h2 className="text-xl font-semibold text-white mb-2">Something went wrong</h2>
            <p className="text-gray-400 mb-6 text-sm">{this.state.error?.message || 'An unexpected error occurred'}</p>
            <button
              onClick={() => {
                this.setState({ hasError: false, error: null })
                window.location.href = '/dashboard'
              }}
              className="px-6 py-2 bg-amber-500 text-black rounded-lg font-semibold hover:bg-amber-400 transition-colors"
            >
              Return to Dashboard
            </button>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}

// Protected Route
const PrivateRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth()

  if (loading) return <PageLoader />
  if (!isAuthenticated) return <Navigate to="/login" replace />

  return children
}

// Public Route (redirect to dashboard if already logged in)
const PublicRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth()

  if (loading) return <PageLoader />
  if (isAuthenticated) return <Navigate to="/dashboard" replace />

  return children
}

function AppRoutes() {
  return (
    <Routes>
      {/* Public routes */}
      <Route
        path="/login"
        element={
          <PublicRoute>
            <Suspense fallback={<PageLoader />}>
              <Login />
            </Suspense>
          </PublicRoute>
        }
      />

      {/* Protected routes */}
      <Route
        path="/"
        element={
          <PrivateRoute>
            <Layout />
          </PrivateRoute>
        }
      >
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route
          path="dashboard"
          element={
            <Suspense fallback={<PageLoader />}>
              <Dashboard />
            </Suspense>
          }
        />
        <Route
          path="leads"
          element={
            <Suspense fallback={<PageLoader />}>
              <Leads />
            </Suspense>
          }
        />
        <Route
          path="leads/:id"
          element={
            <Suspense fallback={<PageLoader />}>
              <LeadDetail />
            </Suspense>
          }
        />
        <Route
          path="properties"
          element={
            <Suspense fallback={<PageLoader />}>
              <Properties />
            </Suspense>
          }
        />
        <Route
          path="properties/:id"
          element={
            <Suspense fallback={<PageLoader />}>
              <PropertyDetail />
            </Suspense>
          }
        />
        <Route
          path="deals"
          element={
            <Suspense fallback={<PageLoader />}>
              <Deals />
            </Suspense>
          }
        />
        <Route
          path="ai-matching"
          element={
            <Suspense fallback={<PageLoader />}>
              <AIMatching />
            </Suspense>
          }
        />
        <Route
          path="activities"
          element={
            <Suspense fallback={<PageLoader />}>
              <Activities />
            </Suspense>
          }
        />
        <Route
          path="analytics"
          element={
            <Suspense fallback={<PageLoader />}>
              <Analytics />
            </Suspense>
          }
        />
        <Route
          path="settings"
          element={
            <Suspense fallback={<PageLoader />}>
              <Settings />
            </Suspense>
          }
        />
        <Route
          path="email"
          element={
            <Suspense fallback={<PageLoader />}>
              <EmailOutreach />
            </Suspense>
          }
        />
        <Route
          path="social"
          element={
            <Suspense fallback={<PageLoader />}>
              <SocialMedia />
            </Suspense>
          }
        />
        <Route
          path="financial"
          element={
            <Suspense fallback={<PageLoader />}>
              <Financial />
            </Suspense>
          }
        />
        <Route
          path="automations"
          element={
            <Suspense fallback={<PageLoader />}>
              <Automations />
            </Suspense>
          }
        />
        <Route
          path="strategy"
          element={
            <Suspense fallback={<PageLoader />}>
              <Strategy />
            </Suspense>
          }
        />
        <Route
          path="photo-caption"
          element={
            <Suspense fallback={<PageLoader />}>
              <PhotoCaption />
            </Suspense>
          }
        />
      </Route>

      {/* 404 */}
      <Route
        path="*"
        element={
          <div className="flex items-center justify-center min-h-screen bg-gray-950">
            <div className="text-center">
              <h1 className="text-8xl font-bold gold-text mb-4">404</h1>
              <p className="text-gray-400 mb-6">Page not found</p>
              <a href="/dashboard" className="px-6 py-2 bg-amber-500 text-black rounded-lg font-semibold hover:bg-amber-400 transition-colors inline-block">
                Go to Dashboard
              </a>
            </div>
          </div>
        }
      />
    </Routes>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ErrorBoundary>
          <AppRoutes />
        </ErrorBoundary>
      </AuthProvider>
    </BrowserRouter>
  )
}
