import React from 'react'
import {
  HeartPulse,
  Stethoscope,
  ArrowLeft,
  Printer,
  RotateCcw,
  UserCheck,
  ShieldAlert,
  FileText,
} from 'lucide-react'
import type { DashboardTab, DoctorPatientContext } from '../types'

interface Props {
  patientContext: DoctorPatientContext | null
  activeTab: DashboardTab
  setActiveTab: (tab: DashboardTab) => void
  onClearPatient: () => void
  onOpenPatientModal: () => void
  onOpenQRImport: () => void
  onPrint: () => void
}

export default function DoctorHeader({
  patientContext,
  activeTab,
  setActiveTab,
  onClearPatient,
  onOpenPatientModal,
  onOpenQRImport,
  onPrint,
}: Props) {
  const handleBackToPatientApp = () => {
    // Navigate back to the patient portal
    window.location.hash = ''
    if (window.location.pathname.startsWith('/doctor-dashboard')) {
      window.history.pushState({}, '', '/')
      window.dispatchEvent(new PopStateEvent('popstate'))
    }
  }

  const navTabs: { id: DashboardTab; label: string; icon: React.ComponentType<{ size?: number }> }[] = [
    { id: 'overview', label: 'Patient Overview', icon: UserCheck },
    { id: 'safety', label: 'Safety Analysis', icon: ShieldAlert },
    { id: 'simulate', label: 'What-If Simulation', icon: Stethoscope },
    { id: 'summary', label: 'Clinical Summary & Export', icon: FileText },
  ]

  return (
    <header
      id="doctor-dashboard-header"
      style={{
        padding: '14px 0',
        borderBottom: '1px solid rgba(6, 182, 212, 0.2)',
        background: 'rgba(10, 14, 26, 0.92)',
        backdropFilter: 'blur(20px)',
        position: 'sticky',
        top: 0,
        zIndex: 50,
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.4)',
      }}
    >
      <div
        className="container"
        style={{
          maxWidth: '1360px',
          margin: '0 auto',
          padding: '0 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '16px',
        }}
      >
        {/* Brand & Doctor Badge */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #06b6d4, #8b5cf6)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 0 24px rgba(6, 182, 212, 0.35)',
            }}
          >
            <Stethoscope size={24} color="white" />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <h1
                style={{
                  fontSize: '1.4rem',
                  fontWeight: 800,
                  background: 'linear-gradient(135deg, #38bdf8, #818cf8)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  letterSpacing: '-0.02em',
                }}
              >
                FarmaTech <span style={{ color: '#06b6d4' }}>MD</span>
              </h1>
              <span
                style={{
                  fontSize: '0.68rem',
                  padding: '3px 10px',
                  borderRadius: '999px',
                  background: 'rgba(6, 182, 212, 0.15)',
                  border: '1px solid rgba(6, 182, 212, 0.4)',
                  color: '#22d3ee',
                  fontWeight: 700,
                  letterSpacing: '0.05em',
                  textTransform: 'uppercase',
                }}
              >
                Doctor Clinical Portal
              </span>
              <span
                style={{
                  fontSize: '0.65rem',
                  padding: '2px 8px',
                  borderRadius: '6px',
                  background: 'rgba(16, 185, 129, 0.12)',
                  border: '1px solid rgba(16, 185, 129, 0.3)',
                  color: '#34d399',
                  fontWeight: 600,
                }}
              >
                Verified Safety Engine
              </span>
            </div>
            <p style={{ fontSize: '0.73rem', color: '#94a3b8', marginTop: '2px' }}>
              Multi-Agent Clinical Decision Support • What-If Simulation • QR Emergency Import
            </p>
          </div>
        </div>

        {/* Global Controls & Navigation */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
          {/* Back to Patient Dashboard Button */}
          <button
            id="btn-back-to-patient"
            onClick={handleBackToPatientApp}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '7px 14px',
              borderRadius: '10px',
              background: 'rgba(30, 41, 59, 0.8)',
              border: '1px solid rgba(148, 163, 184, 0.2)',
              color: '#cbd5e1',
              fontSize: '0.8rem',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
            title="Return to standard Patient Dashboard view"
          >
            <ArrowLeft size={14} />
            <span>Patient Portal</span>
          </button>

          {/* Patient Quick Load Action Buttons */}
          <button
            id="btn-load-patient-modal"
            onClick={onOpenPatientModal}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '7px 14px',
              borderRadius: '10px',
              background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.2), rgba(139, 92, 246, 0.2))',
              border: '1px solid rgba(6, 182, 212, 0.4)',
              color: '#38bdf8',
              fontSize: '0.8rem',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
          >
            <UserCheck size={14} />
            <span>{patientContext ? 'Switch Patient' : 'Select Patient'}</span>
          </button>

          <button
            id="btn-load-qr-import"
            onClick={onOpenQRImport}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '7px 14px',
              borderRadius: '10px',
              background: 'rgba(139, 92, 246, 0.15)',
              border: '1px solid rgba(139, 92, 246, 0.35)',
              color: '#c084fc',
              fontSize: '0.8rem',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
          >
            <HeartPulse size={14} />
            <span>Scan / Import QR</span>
          </button>

          {patientContext && (
            <>
              <button
                id="btn-print-report"
                onClick={onPrint}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '7px 12px',
                  borderRadius: '10px',
                  background: 'rgba(16, 185, 129, 0.12)',
                  border: '1px solid rgba(16, 185, 129, 0.3)',
                  color: '#6ee7b7',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
                title="Print Clinical Assessment"
              >
                <Printer size={14} />
                <span>Print PDF</span>
              </button>

              <button
                id="btn-clear-patient"
                onClick={onClearPatient}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '7px 12px',
                  borderRadius: '10px',
                  background: 'rgba(244, 63, 94, 0.1)',
                  border: '1px solid rgba(244, 63, 94, 0.25)',
                  color: '#fca5a5',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
                title="Close active patient context"
              >
                <RotateCcw size={13} />
                <span>Close</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Navigation Sub-Bar when patient is loaded */}
      {patientContext && (
        <div
          style={{
            maxWidth: '1360px',
            margin: '12px auto 0',
            padding: '0 24px',
            display: 'flex',
            gap: '8px',
            borderTop: '1px solid rgba(148, 163, 184, 0.08)',
            paddingTop: '10px',
            overflowX: 'auto',
          }}
        >
          {navTabs.map((tab) => {
            const Icon = tab.icon
            const active = activeTab === tab.id
            return (
              <button
                key={tab.id}
                id={`tab-btn-${tab.id}`}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '8px 18px',
                  borderRadius: '10px',
                  border: 'none',
                  background: active
                    ? 'linear-gradient(135deg, #06b6d4, #6366f1)'
                    : 'rgba(26, 31, 46, 0.7)',
                  color: active ? '#ffffff' : '#94a3b8',
                  fontSize: '0.84rem',
                  fontWeight: active ? 700 : 500,
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  boxShadow: active ? '0 2px 12px rgba(6, 182, 212, 0.3)' : 'none',
                  whiteSpace: 'nowrap',
                }}
              >
                <Icon size={15} />
                <span>{tab.label}</span>
              </button>
            )
          })}
        </div>
      )}
    </header>
  )
}
