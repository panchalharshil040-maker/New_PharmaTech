import { useState } from 'react'
import {
  Stethoscope,
  Plus,
  Trash2,
  RotateCcw,
  CheckCircle2,
  TrendingDown,
  TrendingUp,
  Minus,
  Search,
  ArrowRight,
  ShieldCheck,
  FileText,
} from 'lucide-react'
import type { CheckResponse, SimulationState } from '../types'
import { searchDrugs } from '../services/api'

interface Props {
  baselineMeds: string[]
  baselineAnalysis: CheckResponse | null
  simulation: SimulationState
  simulating: boolean
  onAddProposedMed: (med: string) => void
  onRemoveMed: (med: string) => void
  onRestoreMed: (med: string) => void
  onDeleteProposedMed: (med: string) => void
  onSetAdjustment: (med: string, adj: string) => void
  onResetSimulation: () => void
  onGoToSummary: () => void
}

export default function WhatIfSimulation({
  baselineMeds,
  baselineAnalysis,
  simulation,
  simulating,
  onAddProposedMed,
  onRemoveMed,
  onRestoreMed,
  onDeleteProposedMed,
  onSetAdjustment,
  onResetSimulation,
  onGoToSummary,
}: Props) {
  const [proposedInput, setProposedInput] = useState('')
  const [suggestions, setSuggestions] = useState<string[]>([])

  const handleInputChange = async (val: string) => {
    setProposedInput(val)
    if (val.trim().length > 1) {
      try {
        const results = await searchDrugs(val.trim())
        setSuggestions(results.map((r) => r.name).slice(0, 5))
      } catch {
        setSuggestions([])
      }
    } else {
      setSuggestions([])
    }
  }

  const handleAdd = (med: string) => {
    const norm = med.trim().toLowerCase()
    if (!norm) return
    onAddProposedMed(norm)
    setProposedInput('')
    setSuggestions([])
  }

  const baselineScore = baselineAnalysis?.risk_score ?? 0
  const simulatedScore = simulation.analysisResult?.risk_score ?? baselineScore
  const scoreDelta = simulatedScore - baselineScore

  // Compute diff in findings:
  // Baseline findings vs Simulated findings
  const baselineFindings = baselineAnalysis?.findings ?? []
  const simulatedFindings = simulation.analysisResult?.findings ?? []

  // Helper to create finding signature
  const findSig = (f: { drugs?: string[]; type?: string; condition?: string }) =>
    `${f.type || 'int'}_${(f.drugs || []).slice().sort().join('+')}_${f.condition || ''}`

  const baselineSignatures = new Set(baselineFindings.map(findSig))
  const simulatedSignatures = new Set(simulatedFindings.map(findSig))

  const newFindings = simulatedFindings.filter((f) => !baselineSignatures.has(findSig(f)))
  const resolvedFindings = baselineFindings.filter((f) => !simulatedSignatures.has(findSig(f)))
  const persistingFindings = simulatedFindings.filter((f) => baselineSignatures.has(findSig(f)))

  const hasModifications = simulation.added.length > 0 || simulation.removed.length > 0

  return (
    <div id="doctor-what-if-simulation" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Persistent Read-Only Safety Rule Guarantee Banner */}
      <div
        style={{
          padding: '14px 20px',
          borderRadius: '12px',
          background: 'rgba(16, 185, 129, 0.1)',
          border: '1px solid rgba(16, 185, 129, 0.3)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <ShieldCheck size={20} color="#34d399" style={{ flexShrink: 0 }} />
          <div>
            <span style={{ fontSize: '0.84rem', fontWeight: 700, color: '#6ee7b7' }}>
              Isolated Simulation Sandbox (Non-Persistent):
            </span>
            <span style={{ fontSize: '0.8rem', color: '#cbd5e1', marginLeft: '6px' }}>
              All additions, discontinuations, and dose modifications here are strictly temporary.
              The master patient medical record is never modified.
            </span>
          </div>
        </div>

        {hasModifications && (
          <button
            onClick={onResetSimulation}
            style={{
              padding: '6px 14px',
              borderRadius: '8px',
              background: 'rgba(51, 65, 85, 0.6)',
              border: '1px solid rgba(148, 163, 184, 0.25)',
              color: '#cbd5e1',
              fontSize: '0.78rem',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <RotateCcw size={13} />
            <span>Reset to Baseline</span>
          </button>
        )}
      </div>

      {/* Delta Comparison Bar */}
      <div
        style={{
          padding: '24px',
          borderRadius: '16px',
          background: 'linear-gradient(135deg, rgba(26, 31, 46, 0.95), rgba(15, 23, 42, 0.98))',
          border: '1px solid rgba(139, 92, 246, 0.3)',
          boxShadow: '0 8px 30px rgba(0, 0, 0, 0.35)',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
          gap: '24px',
          alignItems: 'center',
        }}
      >
        {/* Baseline vs Simulated Score Gauge */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '0.72rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 600 }}>
              Baseline Score
            </div>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#cbd5e1' }}>
              {baselineScore}
            </div>
          </div>

          <ArrowRight size={22} color="#64748b" />

          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '0.72rem', color: '#c084fc', textTransform: 'uppercase', fontWeight: 600 }}>
              Simulated Score
            </div>
            <div
              style={{
                fontSize: '2rem',
                fontWeight: 800,
                color: scoreDelta < 0 ? '#34d399' : scoreDelta > 0 ? '#f43f5e' : '#cbd5e1',
              }}
            >
              {simulatedScore}
            </div>
          </div>

          {/* Delta Pill */}
          <div
            style={{
              padding: '6px 14px',
              borderRadius: '999px',
              background:
                scoreDelta < 0
                  ? 'rgba(16, 185, 129, 0.2)'
                  : scoreDelta > 0
                  ? 'rgba(244, 63, 94, 0.2)'
                  : 'rgba(148, 163, 184, 0.15)',
              border: `1px solid ${
                scoreDelta < 0
                  ? 'rgba(16, 185, 129, 0.4)'
                  : scoreDelta > 0
                  ? 'rgba(244, 63, 94, 0.4)'
                  : 'rgba(148, 163, 184, 0.25)'
              }`,
              color: scoreDelta < 0 ? '#34d399' : scoreDelta > 0 ? '#f43f5e' : '#cbd5e1',
              fontWeight: 800,
              fontSize: '0.86rem',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            {scoreDelta < 0 ? (
              <>
                <TrendingDown size={16} /> {scoreDelta} Risk Reduced!
              </>
            ) : scoreDelta > 0 ? (
              <>
                <TrendingUp size={16} /> +{scoreDelta} Risk Increased!
              </>
            ) : (
              <>
                <Minus size={16} /> No Score Change
              </>
            )}
          </div>
        </div>

        {/* Diff summary chips */}
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <div
            style={{
              flex: 1,
              padding: '12px',
              borderRadius: '10px',
              background: resolvedFindings.length > 0 ? 'rgba(16, 185, 129, 0.12)' : 'rgba(30, 41, 59, 0.4)',
              border: `1px solid ${resolvedFindings.length > 0 ? 'rgba(16, 185, 129, 0.3)' : 'rgba(148, 163, 184, 0.1)'}`,
            }}
          >
            <div style={{ fontSize: '0.72rem', color: '#34d399', fontWeight: 700 }}>
              Resolved / Avoided
            </div>
            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#34d399' }}>
              {resolvedFindings.length}
            </div>
            <div style={{ fontSize: '0.68rem', color: '#64748b' }}>Eliminated findings</div>
          </div>

          <div
            style={{
              flex: 1,
              padding: '12px',
              borderRadius: '10px',
              background: newFindings.length > 0 ? 'rgba(244, 63, 94, 0.12)' : 'rgba(30, 41, 59, 0.4)',
              border: `1px solid ${newFindings.length > 0 ? 'rgba(244, 63, 94, 0.3)' : 'rgba(148, 163, 184, 0.1)'}`,
            }}
          >
            <div style={{ fontSize: '0.72rem', color: '#fb7185', fontWeight: 700 }}>
              Newly Introduced
            </div>
            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#fb7185' }}>
              {newFindings.length}
            </div>
            <div style={{ fontSize: '0.68rem', color: '#64748b' }}>New alerts created</div>
          </div>

          <div
            style={{
              flex: 1,
              padding: '12px',
              borderRadius: '10px',
              background: 'rgba(30, 41, 59, 0.4)',
              border: '1px solid rgba(148, 163, 184, 0.1)',
            }}
          >
            <div style={{ fontSize: '0.72rem', color: '#94a3b8', fontWeight: 700 }}>
              Total Effective
            </div>
            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#f1f5f9' }}>
              {simulatedFindings.length}
            </div>
            <div style={{ fontSize: '0.68rem', color: '#64748b' }}>In simulated regimen</div>
          </div>
        </div>
      </div>

      {/* Main Simulation Workbench: 2-column layout */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '20px' }}>
        {/* Left Column: Medication Adjuster & Proposer */}
        <div
          style={{
            padding: '24px',
            borderRadius: '16px',
            background: 'linear-gradient(135deg, rgba(26, 31, 46, 0.9), rgba(15, 23, 42, 0.95))',
            border: '1px solid rgba(148, 163, 184, 0.15)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
            <Stethoscope size={20} color="#38bdf8" />
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#f8fafc' }}>
              Propose & Adjust Regimen
            </h3>
          </div>

          {/* Add Proposed Medication Input */}
          <div style={{ position: 'relative', marginBottom: '20px' }}>
            <label style={{ fontSize: '0.76rem', color: '#94a3b8', display: 'block', marginBottom: '6px', fontWeight: 600 }}>
              Propose New Medication to Evaluate:
            </label>
            <div style={{ display: 'flex', gap: '8px' }}>
              <div style={{ position: 'relative', flex: 1 }}>
                <Search size={15} style={{ position: 'absolute', left: 10, top: 10, color: '#64748b' }} />
                <input
                  type="text"
                  placeholder="e.g. Enoxaparin, Heparin, Ciprofloxacin..."
                  value={proposedInput}
                  onChange={(e) => handleInputChange(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      handleAdd(proposedInput)
                    }
                  }}
                  style={{
                    width: '100%',
                    padding: '8px 12px 8px 32px',
                    borderRadius: '8px',
                    background: '#111827',
                    border: '1px solid rgba(6, 182, 212, 0.3)',
                    color: '#fff',
                    fontSize: '0.84rem',
                    outline: 'none',
                  }}
                />
              </div>
              <button
                onClick={() => handleAdd(proposedInput)}
                style={{
                  padding: '8px 16px',
                  borderRadius: '8px',
                  background: 'linear-gradient(135deg, #06b6d4, #8b5cf6)',
                  border: 'none',
                  color: '#fff',
                  fontWeight: 700,
                  cursor: 'pointer',
                  fontSize: '0.82rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                }}
              >
                <Plus size={14} /> Add
              </button>
            </div>

            {/* Suggestions dropdown */}
            {suggestions.length > 0 && (
              <div
                style={{
                  position: 'absolute',
                  top: '100%',
                  left: 0,
                  right: 80,
                  backgroundColor: '#1f2937',
                  border: '1px solid rgba(6, 182, 212, 0.4)',
                  borderRadius: '8px',
                  marginTop: '4px',
                  zIndex: 20,
                  boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
                  overflow: 'hidden',
                }}
              >
                {suggestions.map((s, idx) => (
                  <div
                    key={idx}
                    onClick={() => handleAdd(s)}
                    style={{
                      padding: '8px 12px',
                      cursor: 'pointer',
                      color: '#e2e8f0',
                      fontSize: '0.82rem',
                      borderBottom:
                        idx < suggestions.length - 1 ? '1px solid rgba(148,163,184,0.1)' : 'none',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = 'rgba(6, 182, 212, 0.15)'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'transparent'
                    }}
                  >
                    {s}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Current Regimen Toggles */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <span style={{ fontSize: '0.76rem', color: '#94a3b8', fontWeight: 600 }}>
              Baseline Patient Medications:
            </span>
            {baselineMeds.map((med) => {
              const isRemoved = simulation.removed.includes(med.toLowerCase())
              const doseAdj = simulation.adjustments[med] || ''

              return (
                <div
                  key={med}
                  style={{
                    padding: '12px 14px',
                    borderRadius: '10px',
                    background: isRemoved ? 'rgba(244, 63, 94, 0.08)' : 'rgba(30, 41, 59, 0.6)',
                    border: `1px solid ${isRemoved ? 'rgba(244, 63, 94, 0.3)' : 'rgba(148, 163, 184, 0.15)'}`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '10px',
                    opacity: isRemoved ? 0.65 : 1,
                  }}
                >
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span
                        style={{
                          fontWeight: 700,
                          fontSize: '0.88rem',
                          color: isRemoved ? '#f87171' : '#f8fafc',
                          textDecoration: isRemoved ? 'line-through' : 'none',
                          textTransform: 'capitalize',
                        }}
                      >
                        {med}
                      </span>
                      {isRemoved && (
                        <span
                          style={{
                            fontSize: '0.68rem',
                            padding: '1px 6px',
                            borderRadius: '4px',
                            background: 'rgba(244, 63, 94, 0.2)',
                            color: '#fda4af',
                            fontWeight: 600,
                          }}
                        >
                          Discontinued in Simulation
                        </span>
                      )}
                    </div>

                    {!isRemoved && (
                      <input
                        type="text"
                        placeholder="Dose tweak annotation (e.g. reduce to 2.5mg daily)..."
                        value={doseAdj}
                        onChange={(e) => onSetAdjustment(med, e.target.value)}
                        style={{
                          width: '100%',
                          marginTop: '6px',
                          padding: '4px 8px',
                          borderRadius: '6px',
                          background: '#111827',
                          border: '1px solid rgba(148, 163, 184, 0.15)',
                          color: '#cbd5e1',
                          fontSize: '0.74rem',
                          outline: 'none',
                        }}
                      />
                    )}
                  </div>

                  <button
                    onClick={() => (isRemoved ? onRestoreMed(med) : onRemoveMed(med))}
                    style={{
                      padding: '6px 12px',
                      borderRadius: '8px',
                      border: 'none',
                      background: isRemoved ? 'rgba(16, 185, 129, 0.2)' : 'rgba(244, 63, 94, 0.18)',
                      color: isRemoved ? '#34d399' : '#f87171',
                      fontWeight: 700,
                      fontSize: '0.76rem',
                      cursor: 'pointer',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {isRemoved ? 'Restore' : 'Discontinue'}
                  </button>
                </div>
              )
            })}

            {/* Proposed Added Medications */}
            {simulation.added.length > 0 && (
              <div style={{ marginTop: '12px' }}>
                <span style={{ fontSize: '0.76rem', color: '#c084fc', fontWeight: 700, display: 'block', marginBottom: '8px' }}>
                  Newly Proposed Additions in Simulation:
                </span>
                {simulation.added.map((med) => (
                  <div
                    key={med}
                    style={{
                      padding: '10px 14px',
                      borderRadius: '10px',
                      background: 'rgba(139, 92, 246, 0.12)',
                      border: '1px solid rgba(139, 92, 246, 0.35)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      marginBottom: '8px',
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontWeight: 700, fontSize: '0.88rem', color: '#e9d5ff', textTransform: 'capitalize' }}>
                          + {med}
                        </span>
                        <span
                          style={{
                            fontSize: '0.68rem',
                            padding: '1px 6px',
                            borderRadius: '4px',
                            background: 'rgba(139, 92, 246, 0.25)',
                            color: '#d8b4fe',
                            fontWeight: 600,
                          }}
                        >
                          Proposed Add
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => onDeleteProposedMed(med)}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        color: '#f87171',
                        cursor: 'pointer',
                        padding: '4px',
                      }}
                      title="Remove from simulation"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Comparative Findings & Diff Stream */}
        <div
          style={{
            padding: '24px',
            borderRadius: '16px',
            background: 'linear-gradient(135deg, rgba(26, 31, 46, 0.9), rgba(15, 23, 42, 0.95))',
            border: '1px solid rgba(148, 163, 184, 0.15)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#f8fafc' }}>
              Safety Findings Comparison
            </h3>
            {simulating && (
              <span style={{ fontSize: '0.72rem', color: '#38bdf8' }}>Re-evaluating...</span>
            )}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {/* Resolved / Eliminated Findings */}
            {resolvedFindings.map((f, i) => (
              <div
                key={`res-${i}`}
                style={{
                  padding: '12px 14px',
                  borderRadius: '10px',
                  background: 'rgba(16, 185, 129, 0.1)',
                  border: '1px solid rgba(16, 185, 129, 0.3)',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '10px',
                }}
              >
                <CheckCircle2 size={16} color="#34d399" style={{ marginTop: '2px', flexShrink: 0 }} />
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                    <span style={{ fontSize: '0.68rem', padding: '1px 6px', borderRadius: '4px', background: 'rgba(16, 185, 129, 0.25)', color: '#6ee7b7', fontWeight: 700 }}>
                      AVOIDED / RESOLVED
                    </span>
                    <span style={{ fontSize: '0.86rem', fontWeight: 700, color: '#cbd5e1', textDecoration: 'line-through' }}>
                      {f.drugs?.join(' ↔ ') || f.condition}
                    </span>
                  </div>
                  <p style={{ fontSize: '0.74rem', color: '#6ee7b7', marginTop: '2px' }}>
                    Risk eliminated by removing {(f.drugs || []).filter((d) => simulation.removed.includes(d.toLowerCase())).join(', ')}
                  </p>
                </div>
              </div>
            ))}

            {/* Newly Introduced Findings */}
            {newFindings.map((f, i) => (
              <div
                key={`new-${i}`}
                style={{
                  padding: '12px 14px',
                  borderRadius: '10px',
                  background: 'rgba(244, 63, 94, 0.12)',
                  border: '1px solid rgba(244, 63, 94, 0.35)',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '10px',
                }}
              >
                <span style={{ fontSize: '0.68rem', padding: '1px 6px', borderRadius: '4px', background: 'rgba(244, 63, 94, 0.3)', color: '#fda4af', fontWeight: 800, marginTop: '2px' }}>
                  NEW RISK
                </span>
                <div>
                  <div style={{ fontSize: '0.86rem', fontWeight: 700, color: '#fca5a5' }}>
                    {f.drugs?.join(' ↔ ') || f.condition}
                  </div>
                  <p style={{ fontSize: '0.74rem', color: '#fda4af', marginTop: '2px' }}>
                    {f.mechanism || f.watch || f.recommendation || 'Potential safety alert caused by proposed medication.'}
                  </p>
                </div>
              </div>
            ))}

            {/* Persisting Findings */}
            {persistingFindings.map((f, i) => (
              <div
                key={`per-${i}`}
                style={{
                  padding: '10px 14px',
                  borderRadius: '10px',
                  background: 'rgba(30, 41, 59, 0.4)',
                  border: '1px solid rgba(148, 163, 184, 0.12)',
                  fontSize: '0.82rem',
                  color: '#94a3b8',
                }}
              >
                <span style={{ fontWeight: 600, color: '#cbd5e1' }}>
                  {f.drugs?.join(' ↔ ') || f.condition}
                </span>{' '}
                <span style={{ fontSize: '0.7rem', color: '#64748b' }}>({f.severity || f.type})</span>
              </div>
            ))}

            {simulatedFindings.length === 0 && (
              <div
                style={{
                  padding: '24px',
                  textAlign: 'center',
                  borderRadius: '10px',
                  background: 'rgba(16, 185, 129, 0.08)',
                  border: '1px solid rgba(16, 185, 129, 0.2)',
                  color: '#34d399',
                  fontSize: '0.85rem',
                }}
              >
                ✓ All safety risks have been eliminated in this simulated configuration!
              </div>
            )}
          </div>

          {/* Action to proceed to Clinical Summary */}
          <div style={{ marginTop: '20px', paddingTop: '16px', borderTop: '1px solid rgba(148, 163, 184, 0.1)' }}>
            <button
              onClick={onGoToSummary}
              style={{
                width: '100%',
                padding: '10px 20px',
                borderRadius: '10px',
                background: 'linear-gradient(135deg, #06b6d4, #8b5cf6)',
                border: 'none',
                color: '#fff',
                fontWeight: 700,
                fontSize: '0.86rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                boxShadow: '0 4px 15px rgba(6, 182, 212, 0.25)',
              }}
            >
              <FileText size={16} />
              <span>Export Simulation to Clinical Summary</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
