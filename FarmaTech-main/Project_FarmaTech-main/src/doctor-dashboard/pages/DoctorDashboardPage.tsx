import { useState } from 'react'
import {
  UserPlus,
  QrCode,
  ShieldCheck,
  Stethoscope,
  ArrowRight,
  AlertTriangle,
} from 'lucide-react'
import DoctorHeader from '../components/DoctorHeader'
import PatientBanner from '../components/PatientBanner'
import QRImportPanel from '../components/QRImportPanel'
import ManualPatientModal from '../components/ManualPatientModal'
import MedicationList from '../components/MedicationList'
import ClinicalSafetyView from '../components/ClinicalSafetyView'
import WhatIfSimulation from '../components/WhatIfSimulation'
import ClinicalSummaryExport from '../components/ClinicalSummaryExport'
import { useDoctorDashboard } from '../state/useDoctorDashboard'

export default function DoctorDashboardPage() {
  const {
    patientContext,
    patientName,
    patientId,
    baselineAnalysis,
    activeTab,
    loading,
    error,
    simulation,
    simulating,
    clinicalSummary,
    summaryLoading,
    setActiveTab,
    loadFromQR,
    loadPatient,
    clearPatient,
    addSimulationMedicine,
    removeSimulationMedicine,
    restoreSimulationMedicine,
    deleteSimulationAdded,
    setDosageAdjustment,
    resetSimulation,
    fetchSummary,
  } = useDoctorDashboard()

  const [isPatientModalOpen, setIsPatientModalOpen] = useState(false)
  const [isQRModalOpen, setIsQRModalOpen] = useState(false)

  const handlePrint = () => {
    window.print()
  }

  const handleSimulateRemoveFromList = (med: string) => {
    removeSimulationMedicine(med)
    setActiveTab('simulate')
  }

  return (
    <div
      id="doctor-dashboard-container"
      style={{
        minHeight: '100vh',
        backgroundColor: '#0a0e1a',
        color: '#f1f5f9',
        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Doctor Header */}
      <DoctorHeader
        patientContext={patientContext}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onClearPatient={clearPatient}
        onOpenPatientModal={() => setIsPatientModalOpen(true)}
        onOpenQRImport={() => setIsQRModalOpen(true)}
        onPrint={handlePrint}
      />

      {/* Main Content Area */}
      <main
        style={{
          flex: 1,
          maxWidth: '1360px',
          width: '100%',
          margin: '0 auto',
          padding: '28px 24px 60px',
        }}
      >
        {/* Error notification if any */}
        {error && (
          <div
            style={{
              padding: '14px 18px',
              borderRadius: '12px',
              background: 'rgba(244, 63, 94, 0.15)',
              border: '1px solid rgba(244, 63, 94, 0.35)',
              color: '#fda4af',
              fontSize: '0.84rem',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              marginBottom: '20px',
            }}
          >
            <AlertTriangle size={18} />
            <span>{error}</span>
          </div>
        )}

        {/* If NO patient is currently loaded: Welcome & Patient Selection Hub */}
        {!patientContext ? (
          <div style={{ maxWidth: '960px', margin: '40px auto 0' }}>
            {/* Welcome banner */}
            <div style={{ textAlign: 'center', marginBottom: '36px' }}>
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '6px 16px',
                  borderRadius: '999px',
                  background: 'rgba(6, 182, 212, 0.15)',
                  border: '1px solid rgba(6, 182, 212, 0.35)',
                  color: '#22d3ee',
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  marginBottom: '14px',
                }}
              >
                <Stethoscope size={14} /> Physician Decision Support Workspace
              </div>
              <h2
                style={{
                  fontSize: '2.2rem',
                  fontWeight: 800,
                  background: 'linear-gradient(135deg, #f1f5f9, #94a3b8)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  letterSpacing: '-0.02em',
                  marginBottom: '10px',
                }}
              >
                Welcome to FarmaTech MD
              </h2>
              <p
                style={{
                  fontSize: '0.94rem',
                  color: '#94a3b8',
                  maxWidth: '600px',
                  margin: '0 auto',
                  lineHeight: 1.6,
                }}
              >
                Load an emergency patient QR token or select a clinical profile to review
                verified drug interactions, contraindications, and conduct isolated what-if simulations.
              </p>
            </div>

            {/* Two Primary Action Cards */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
                gap: '24px',
                marginBottom: '40px',
              }}
            >
              {/* Card 1: Import Patient QR */}
              <div
                onClick={() => setIsQRModalOpen(true)}
                style={{
                  padding: '30px',
                  borderRadius: '20px',
                  background: 'linear-gradient(135deg, rgba(26, 31, 46, 0.9), rgba(15, 23, 42, 0.95))',
                  border: '1px solid rgba(6, 182, 212, 0.3)',
                  boxShadow: '0 8px 30px rgba(0, 0, 0, 0.4)',
                  cursor: 'pointer',
                  transition: 'all 0.25s ease',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(6, 182, 212, 0.6)'
                  e.currentTarget.style.transform = 'translateY(-3px)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(6, 182, 212, 0.3)'
                  e.currentTarget.style.transform = 'translateY(0)'
                }}
              >
                <div>
                  <div
                    style={{
                      width: 52,
                      height: 52,
                      borderRadius: '14px',
                      background: 'linear-gradient(135deg, #06b6d4, #3b82f6)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: '0 4px 20px rgba(6, 182, 212, 0.3)',
                      marginBottom: '20px',
                    }}
                  >
                    <QrCode size={26} color="white" />
                  </div>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#f8fafc', marginBottom: '8px' }}>
                    Import Patient via Emergency QR
                  </h3>
                  <p style={{ fontSize: '0.84rem', color: '#94a3b8', lineHeight: 1.55 }}>
                    Scan or paste a signed emergency QR token. Patient medications and documented
                    allergies are verified and loaded read-only into the clinical workspace.
                  </p>
                </div>

                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    color: '#22d3ee',
                    fontSize: '0.86rem',
                    fontWeight: 700,
                    marginTop: '24px',
                  }}
                >
                  <span>Open QR Token Decoder</span>
                  <ArrowRight size={16} />
                </div>
              </div>

              {/* Card 2: Clinical Benchmark / Custom Patient */}
              <div
                onClick={() => setIsPatientModalOpen(true)}
                style={{
                  padding: '30px',
                  borderRadius: '20px',
                  background: 'linear-gradient(135deg, rgba(26, 31, 46, 0.9), rgba(15, 23, 42, 0.95))',
                  border: '1px solid rgba(139, 92, 246, 0.3)',
                  boxShadow: '0 8px 30px rgba(0, 0, 0, 0.4)',
                  cursor: 'pointer',
                  transition: 'all 0.25s ease',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(139, 92, 246, 0.6)'
                  e.currentTarget.style.transform = 'translateY(-3px)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(139, 92, 246, 0.3)'
                  e.currentTarget.style.transform = 'translateY(0)'
                }}
              >
                <div>
                  <div
                    style={{
                      width: 52,
                      height: 52,
                      borderRadius: '14px',
                      background: 'linear-gradient(135deg, #8b5cf6, #ec4899)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: '0 4px 20px rgba(139, 92, 246, 0.3)',
                      marginBottom: '20px',
                    }}
                  >
                    <UserPlus size={26} color="white" />
                  </div>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#f8fafc', marginBottom: '8px' }}>
                    Select Patient / Clinical Case
                  </h3>
                  <p style={{ fontSize: '0.84rem', color: '#94a3b8', lineHeight: 1.55 }}>
                    Choose from validated clinical scenarios (Geriatric cardiac, maternal contraindications,
                    polypharmacy) or configure a custom patient with specific clinical risk factors.
                  </p>
                </div>

                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    color: '#c084fc',
                    fontSize: '0.86rem',
                    fontWeight: 700,
                    marginTop: '24px',
                  }}
                >
                  <span>Select Clinical Profile</span>
                  <ArrowRight size={16} />
                </div>
              </div>
            </div>

            {/* Security & Verification Callout */}
            <div
              style={{
                padding: '16px 20px',
                borderRadius: '14px',
                background: 'rgba(16, 185, 129, 0.08)',
                border: '1px solid rgba(16, 185, 129, 0.2)',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                color: '#6ee7b7',
                fontSize: '0.82rem',
              }}
            >
              <ShieldCheck size={20} color="#34d399" style={{ flexShrink: 0 }} />
              <div>
                <strong>Clinical Safety Assurance:</strong> All evaluations are powered by the deterministic
                pharmacological rule engine. What-if simulations are isolated and never overwrite existing patient records.
              </div>
            </div>
          </div>
        ) : (
          /* When patient IS loaded: Active Workspace */
          <div>
            {/* Active Patient Demographics Banner */}
            <PatientBanner
              context={patientContext}
              patientName={patientName}
              patientId={patientId}
              onEditPatientModal={() => setIsPatientModalOpen(true)}
            />

            {/* TAB 1: OVERVIEW */}
            {activeTab === 'overview' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                <MedicationList
                  medicines={patientContext.medicines}
                  analysis={baselineAnalysis}
                  adjustments={simulation.adjustments}
                  onSetAdjustment={setDosageAdjustment}
                  onSimulateRemove={handleSimulateRemoveFromList}
                />

                {/* Quick Safety Summary Teaser */}
                {baselineAnalysis && (
                  <div
                    style={{
                      padding: '20px 24px',
                      borderRadius: '16px',
                      background: 'linear-gradient(135deg, rgba(26, 31, 46, 0.8), rgba(15, 23, 42, 0.9))',
                      border: '1px solid rgba(148, 163, 184, 0.15)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      flexWrap: 'wrap',
                      gap: '16px',
                    }}
                  >
                    <div>
                      <h4 style={{ fontSize: '1rem', fontWeight: 700, color: '#f8fafc' }}>
                        Safety Analysis Status
                      </h4>
                      <p style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: '2px' }}>
                        Risk Score: <strong style={{ color: '#38bdf8' }}>{baselineAnalysis.risk_score}/100</strong> ({baselineAnalysis.risk_level.toUpperCase()}) •{' '}
                        {baselineAnalysis.findings.length} total safety findings identified
                      </p>
                    </div>

                    <div style={{ display: 'flex', gap: '10px' }}>
                      <button
                        onClick={() => setActiveTab('safety')}
                        style={{
                          padding: '8px 18px',
                          borderRadius: '8px',
                          background: 'rgba(6, 182, 212, 0.2)',
                          border: '1px solid rgba(6, 182, 212, 0.4)',
                          color: '#22d3ee',
                          fontWeight: 700,
                          fontSize: '0.82rem',
                          cursor: 'pointer',
                        }}
                      >
                        View Full Safety Analysis →
                      </button>

                      <button
                        onClick={() => setActiveTab('simulate')}
                        style={{
                          padding: '8px 18px',
                          borderRadius: '8px',
                          background: 'linear-gradient(135deg, #06b6d4, #8b5cf6)',
                          border: 'none',
                          color: '#fff',
                          fontWeight: 700,
                          fontSize: '0.82rem',
                          cursor: 'pointer',
                        }}
                      >
                        Launch What-If Simulation →
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* TAB 2: SAFETY ANALYSIS */}
            {activeTab === 'safety' && (
              <ClinicalSafetyView
                data={baselineAnalysis}
                loading={loading}
              />
            )}

            {/* TAB 3: WHAT-IF SIMULATION */}
            {activeTab === 'simulate' && (
              <WhatIfSimulation
                baselineMeds={patientContext.medicines}
                baselineAnalysis={baselineAnalysis}
                simulation={simulation}
                simulating={simulating}
                onAddProposedMed={addSimulationMedicine}
                onRemoveMed={removeSimulationMedicine}
                onRestoreMed={restoreSimulationMedicine}
                onDeleteProposedMed={deleteSimulationAdded}
                onSetAdjustment={setDosageAdjustment}
                onResetSimulation={resetSimulation}
                onGoToSummary={() => setActiveTab('summary')}
              />
            )}

            {/* TAB 4: CLINICAL SUMMARY & EXPORT */}
            {activeTab === 'summary' && (
              <ClinicalSummaryExport
                patientContext={patientContext}
                patientName={patientName}
                patientId={patientId}
                summary={clinicalSummary}
                summaryLoading={summaryLoading}
                simulation={simulation}
                onRefreshSummary={fetchSummary}
              />
            )}
          </div>
        )}
      </main>

      {/* Manual / Preset Patient Selection Modal */}
      <ManualPatientModal
        isOpen={isPatientModalOpen}
        onClose={() => setIsPatientModalOpen(false)}
        onLoadPatient={loadPatient}
      />

      {/* QR Token Import Modal */}
      {isQRModalOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.75)',
            backdropFilter: 'blur(8px)',
            zIndex: 100,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
          }}
          onClick={() => setIsQRModalOpen(false)}
        >
          <div
            style={{ width: '100%', maxWidth: '580px' }}
            onClick={(e) => e.stopPropagation()}
          >
            <QRImportPanel
              onImport={(m, a) => {
                loadFromQR(m, a)
                setIsQRModalOpen(false)
              }}
              loading={loading}
            />
          </div>
        </div>
      )}
    </div>
  )
}
