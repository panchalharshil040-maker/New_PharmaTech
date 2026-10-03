import { StrictMode, useState, useEffect } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App'
import { DoctorDashboard } from './doctor-dashboard'

export function Root() {
  const [isDoctorRoute, setIsDoctorRoute] = useState(() => {
    return (
      window.location.pathname.startsWith('/doctor-dashboard') ||
      window.location.hash.startsWith('#/doctor-dashboard')
    )
  })

  useEffect(() => {
    const handleLocationChange = () => {
      setIsDoctorRoute(
        window.location.pathname.startsWith('/doctor-dashboard') ||
        window.location.hash.startsWith('#/doctor-dashboard')
      )
    }

    window.addEventListener('popstate', handleLocationChange)
    window.addEventListener('hashchange', handleLocationChange)
    return () => {
      window.removeEventListener('popstate', handleLocationChange)
      window.removeEventListener('hashchange', handleLocationChange)
    }
  }, [])

  if (isDoctorRoute) {
    return <DoctorDashboard />
  }

  return (
    <>
      <App />
      {/* Floating link to access isolated Doctor Dashboard */}
      <a
        href="#/doctor-dashboard"
        id="link-to-doctor-dashboard"
        style={{
          position: 'fixed',
          bottom: '16px',
          right: '16px',
          zIndex: 9999,
          padding: '8px 16px',
          borderRadius: '999px',
          background: 'linear-gradient(135deg, #06b6d4, #8b5cf6)',
          color: '#ffffff',
          fontSize: '0.78rem',
          fontWeight: 700,
          textDecoration: 'none',
          boxShadow: '0 4px 16px rgba(6, 182, 212, 0.4)',
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          transition: 'transform 0.2s ease',
        }}
      >
        <span>🩺 MD Clinical Dashboard</span>
        <span style={{ fontSize: '0.7rem', opacity: 0.8 }}>→</span>
      </a>
    </>
  )
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Root />
  </StrictMode>,
)
