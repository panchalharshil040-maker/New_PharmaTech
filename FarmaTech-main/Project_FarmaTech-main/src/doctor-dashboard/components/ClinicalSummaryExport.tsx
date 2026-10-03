import { useState } from 'react'
import {
  FileText,
  Copy,
  Check,
  Printer,
  QrCode,
  Sparkles,
} from 'lucide-react'
import { QRCodeSVG } from 'qrcode.react'
import type {
  DoctorPatientContext,
  DoctorSummaryResponse,
  SimulationState,
} from '../types'
import { generateQRToken } from '../services/api'

interface Props {
  patientContext: DoctorPatientContext
  patientName: string
  patientId: string
  summary: DoctorSummaryResponse | null
  summaryLoading: boolean
  simulation: SimulationState
  onRefreshSummary: () => void
}

export default function ClinicalSummaryExport({
  patientContext,
  patientName,
  patientId,
  summary,
  summaryLoading,
  simulation,
  onRefreshSummary,
}: Props) {
  const [copied, setCopied] = useState(false)
  const [physicianNotes, setPhysicianNotes] = useState('')
  const [qrToken, setQrToken] = useState<string | null>(null)
  const [qrLoading, setQrLoading] = useState(false)
  const [qrCopied, setQrCopied] = useState(false)

  const isSimulated = simulation.added.length > 0 || simulation.removed.length > 0
  const activeMeds = isSimulated
    ? simulation.effectiveMedicines
    : patientContext.medicines

  const handleCopySummary = () => {
    if (!summary) return
    const textToCopy = `${summary.summary}\n\n── Physician Notes ──\n${physicianNotes || 'None entered.'}`
    navigator.clipboard.writeText(textToCopy)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleGenerateQR = async () => {
    setQrLoading(true)
    try {
      const data = await generateQRToken(activeMeds, patientContext.allergies)
      setQrToken(data.token)
    } catch (err) {
      console.error('Failed to generate QR', err)
    } finally {
      setQrLoading(false)
    }
  }

  const handleCopyToken = () => {
    if (!qrToken) return
    navigator.clipboard.writeText(qrToken)
    setQrCopied(true)
    setTimeout(() => setQrCopied(false), 2000)
  }

  const handlePrint = () => {
    window.print()
  }

  return (
    <div id="doctor-clinical-summary-export" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Action Toolbar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div
            style={{
              width: 38,
              height: 38,
              borderRadius: '10px',
              background: 'linear-gradient(135deg, #06b6d4, #8b5cf6)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <FileText size={20} color="white" />
          </div>
          <div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#f1f5f9' }}>
              Clinical Safety Summary & Export
            </h3>
            <p style={{ fontSize: '0.75rem', color: '#64748b' }}>
              Structured documentation, physician remarks, print-ready PDF, and discharge QR
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            onClick={onRefreshSummary}
            disabled={summaryLoading}
            style={{
              padding: '7px 14px',
              borderRadius: '8px',
              background: 'rgba(51, 65, 85, 0.6)',
              border: '1px solid rgba(148, 163, 184, 0.2)',
              color: '#cbd5e1',
              fontSize: '0.8rem',
              fontWeight: 600,
              cursor: summaryLoading ? 'not-allowed' : 'pointer',
            }}
          >
            {summaryLoading ? 'Generating...' : 'Refresh Summary'}
          </button>

          <button
            onClick={handleCopySummary}
            disabled={!summary}
            style={{
              padding: '7px 14px',
              borderRadius: '8px',
              background: 'rgba(6, 182, 212, 0.15)',
              border: '1px solid rgba(6, 182, 212, 0.35)',
              color: '#22d3ee',
              fontSize: '0.8rem',
              fontWeight: 600,
              cursor: !summary ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            {copied ? <Check size={14} /> : <Copy size={14} />}
            <span>{copied ? 'Copied!' : 'Copy Summary'}</span>
          </button>

          <button
            onClick={handlePrint}
            style={{
              padding: '7px 16px',
              borderRadius: '8px',
              background: 'linear-gradient(135deg, #10b981, #059669)',
              border: 'none',
              color: '#fff',
              fontSize: '0.8rem',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              boxShadow: '0 2px 10px rgba(16, 185, 129, 0.3)',
            }}
          >
            <Printer size={14} />
            <span>Print Clinical Document</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Summary Text & Notes vs Discharge QR */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '20px' }}>
        {/* Left Column: Formatted Clinical Summary & Notes */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Summary Box */}
          <div
            style={{
              padding: '24px',
              borderRadius: '16px',
              background: 'linear-gradient(135deg, rgba(26, 31, 46, 0.95), rgba(15, 23, 42, 0.98))',
              border: '1px solid rgba(148, 163, 184, 0.15)',
              boxShadow: '0 4px 24px rgba(0, 0, 0, 0.3)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
              <span style={{ fontSize: '0.78rem', color: '#38bdf8', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Verified Clinical Summary (Deterministic Backend Output)
              </span>
              {isSimulated && (
                <span
                  style={{
                    fontSize: '0.68rem',
                    padding: '2px 8px',
                    borderRadius: '4px',
                    background: 'rgba(139, 92, 246, 0.2)',
                    border: '1px solid rgba(139, 92, 246, 0.4)',
                    color: '#c084fc',
                    fontWeight: 700,
                  }}
                >
                  Includes Simulation Delta
                </span>
              )}
            </div>

            {summaryLoading ? (
              <div style={{ padding: '40px 20px', textAlign: 'center', color: '#94a3b8' }}>
                <div style={{ color: '#06b6d4', marginBottom: '8px' }}>
                  <Sparkles size={24} className="animate-spin" />
                </div>
                Generating verified clinical summary from backend...
              </div>
            ) : summary ? (
              <pre
                style={{
                  margin: 0,
                  padding: '16px',
                  borderRadius: '10px',
                  background: '#0d1322',
                  border: '1px solid rgba(148, 163, 184, 0.1)',
                  color: '#e2e8f0',
                  fontSize: '0.78rem',
                  fontFamily: "'JetBrains Mono', 'Fira Code', 'Courier New', monospace",
                  lineHeight: 1.6,
                  whiteSpace: 'pre-wrap',
                  maxHeight: '400px',
                  overflowY: 'auto',
                }}
              >
                {summary.summary}
              </pre>
            ) : (
              <div style={{ padding: '30px', textAlign: 'center', color: '#94a3b8' }}>
                Click &quot;Refresh Summary&quot; to compile clinical report.
              </div>
            )}
          </div>

          {/* Physician Notes Box */}
          <div
            style={{
              padding: '20px',
              borderRadius: '16px',
              background: 'linear-gradient(135deg, rgba(26, 31, 46, 0.95), rgba(15, 23, 42, 0.98))',
              border: '1px solid rgba(148, 163, 184, 0.15)',
            }}
          >
            <label
              style={{
                fontSize: '0.8rem',
                color: '#94a3b8',
                fontWeight: 700,
                display: 'block',
                marginBottom: '8px',
              }}
            >
              Attending Physician Remarks / Instructions:
            </label>
            <textarea
              placeholder="Enter clinical rationales, dosage titration plans, follow-up labs, or patient instructions..."
              value={physicianNotes}
              onChange={(e) => setPhysicianNotes(e.target.value)}
              style={{
                width: '100%',
                minHeight: '100px',
                padding: '12px',
                borderRadius: '10px',
                background: '#111827',
                border: '1px solid rgba(148, 163, 184, 0.15)',
                color: '#f8fafc',
                fontSize: '0.84rem',
                lineHeight: 1.5,
                outline: 'none',
                resize: 'vertical',
              }}
            />
          </div>
        </div>

        {/* Right Column: Discharge Emergency QR Code */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div
            style={{
              padding: '24px',
              borderRadius: '16px',
              background: 'linear-gradient(135deg, rgba(26, 31, 46, 0.95), rgba(15, 23, 42, 0.98))',
              border: '1px solid rgba(6, 182, 212, 0.25)',
              boxShadow: '0 4px 24px rgba(0, 0, 0, 0.3)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
              <QrCode size={20} color="#06b6d4" />
              <div>
                <h4 style={{ fontSize: '1rem', fontWeight: 700, color: '#f8fafc' }}>
                  Discharge Emergency QR Code
                </h4>
                <p style={{ fontSize: '0.74rem', color: '#64748b' }}>
                  Generate an emergency token containing the reviewed medication & allergy context
                </p>
              </div>
            </div>

            {!qrToken ? (
              <div style={{ textAlign: 'center', padding: '30px 10px' }}>
                <p style={{ fontSize: '0.82rem', color: '#94a3b8', marginBottom: '16px' }}>
                  Generate a signed QR code encode of the active medication list ({activeMeds.length} drugs) and
                  allergies ({patientContext.allergies.length} items).
                </p>
                <button
                  onClick={handleGenerateQR}
                  disabled={qrLoading}
                  style={{
                    padding: '10px 24px',
                    borderRadius: '10px',
                    background: 'linear-gradient(135deg, #06b6d4, #8b5cf6)',
                    border: 'none',
                    color: '#fff',
                    fontWeight: 700,
                    fontSize: '0.86rem',
                    cursor: qrLoading ? 'not-allowed' : 'pointer',
                    boxShadow: '0 2px 12px rgba(6, 182, 212, 0.3)',
                  }}
                >
                  {qrLoading ? 'Generating QR Token...' : 'Generate Emergency QR'}
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
                <div
                  style={{
                    padding: '16px',
                    borderRadius: '14px',
                    background: '#ffffff',
                    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.4)',
                  }}
                >
                  <QRCodeSVG
                    value={qrToken}
                    size={180}
                    level="M"
                    includeMargin={true}
                  />
                </div>

                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#f8fafc' }}>
                    Emergency Medication Passport
                  </div>
                  <div style={{ fontSize: '0.72rem', color: '#94a3b8', marginTop: '2px' }}>
                    {patientName} • {activeMeds.length} Medications Encoded
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '8px', width: '100%' }}>
                  <button
                    onClick={handleCopyToken}
                    style={{
                      flex: 1,
                      padding: '8px',
                      borderRadius: '8px',
                      background: 'rgba(51, 65, 85, 0.6)',
                      border: '1px solid rgba(148, 163, 184, 0.2)',
                      color: '#cbd5e1',
                      fontSize: '0.78rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '4px',
                    }}
                  >
                    {qrCopied ? <Check size={13} /> : <Copy size={13} />}
                    <span>{qrCopied ? 'Token Copied!' : 'Copy Token String'}</span>
                  </button>

                  <button
                    onClick={handlePrint}
                    style={{
                      flex: 1,
                      padding: '8px',
                      borderRadius: '8px',
                      background: 'rgba(6, 182, 212, 0.2)',
                      border: '1px solid rgba(6, 182, 212, 0.4)',
                      color: '#22d3ee',
                      fontSize: '0.78rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '4px',
                    }}
                  >
                    <Printer size={13} />
                    <span>Print QR Card</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Printable Clinical Sheet View (styled for window.print) */}
      <div
        id="printable-clinical-report"
        className="print-only"
        style={{
          display: 'none', // Controlled by print CSS
        }}
      >
        <div style={{ padding: '20px', color: '#000', fontFamily: 'sans-serif' }}>
          <h2>FarmaTech MD — Clinical Safety Assessment</h2>
          <p>
            Patient: {patientName} (ID: {patientId}) • Date: {new Date().toLocaleDateString()}
          </p>
          <hr />
          <h3>Medications:</h3>
          <ul>
            {activeMeds.map((m, i) => (
              <li key={i}>{m}</li>
            ))}
          </ul>
          <h3>Allergies:</h3>
          <p>{patientContext.allergies.join(', ') || 'No Known Drug Allergies (NKDA)'}</p>
          <h3>Safety Findings:</h3>
          <pre>{summary?.summary}</pre>
          <h3>Physician Remarks:</h3>
          <p>{physicianNotes || 'None'}</p>
        </div>
      </div>
    </div>
  )
}
