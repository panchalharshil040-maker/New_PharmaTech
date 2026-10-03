import { useState } from 'react'
import {
  ShieldAlert,
  AlertTriangle,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Apple,
  Copy,
  Check,
} from 'lucide-react'
import type { CheckResponse, Finding, RiskLevel } from '../types'
import { explainFindings } from '../services/api'
import type { ExplainResponse } from '../../api'

interface Props {
  data: CheckResponse | null
  loading: boolean
}

export default function ClinicalSafetyView({ data, loading }: Props) {
  const [filterType, setFilterType] = useState<'all' | 'interaction' | 'duplicate' | 'contraindication'>('all')
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [aiExplain, setAiExplain] = useState<ExplainResponse | null>(null)
  const [aiLoading, setAiLoading] = useState(false)
  const [copiedId, setCopiedId] = useState<string | null>(null)

  if (loading) {
    return (
      <div
        style={{
          padding: '60px 20px',
          textAlign: 'center',
          borderRadius: '16px',
          background: 'rgba(26, 31, 46, 0.7)',
          border: '1px solid rgba(148, 163, 184, 0.12)',
        }}
      >
        <div style={{ display: 'inline-block', marginBottom: '12px', color: '#06b6d4' }}>
          <ShieldAlert size={36} className="animate-spin" />
        </div>
        <h4 style={{ fontSize: '1.05rem', color: '#f1f5f9', fontWeight: 600 }}>
          Running Patient Safety Engine...
        </h4>
        <p style={{ fontSize: '0.78rem', color: '#64748b' }}>
          Executing cross-database checks for DDI, contraindications, and active molecule overlaps
        </p>
      </div>
    )
  }

  if (!data) {
    return (
      <div
        style={{
          padding: '40px 20px',
          textAlign: 'center',
          borderRadius: '16px',
          background: 'rgba(26, 31, 46, 0.7)',
          color: '#94a3b8',
        }}
      >
        No safety data available. Please load a patient record.
      </div>
    )
  }

  const { risk_score, risk_level, findings, food_warnings, unresolved } = data

  const getRiskColor = (level: RiskLevel) => {
    switch (level) {
      case 'high':
        return '#f43f5e'
      case 'moderate':
        return '#fbbf24'
      case 'low':
      default:
        return '#34d399'
    }
  }

  const getSeverityBadge = (severity?: string, type?: string) => {
    if (type === 'contraindication' || severity === 'contraindication') {
      return {
        bg: 'rgba(244, 63, 94, 0.2)',
        border: 'rgba(244, 63, 94, 0.45)',
        text: '#fda4af',
        label: 'CONTRAINDICATION',
      }
    }
    if (type === 'duplicate_ingredient' || type === 'class_duplicate' || severity === 'duplicate') {
      return {
        bg: 'rgba(245, 158, 11, 0.2)',
        border: 'rgba(245, 158, 11, 0.45)',
        text: '#fde68a',
        label: 'DUPLICATE THERAPY',
      }
    }
    switch (severity?.toLowerCase()) {
      case 'major':
        return {
          bg: 'rgba(244, 63, 94, 0.2)',
          border: 'rgba(244, 63, 94, 0.45)',
          text: '#fda4af',
          label: 'MAJOR SEVERITY',
        }
      case 'moderate':
        return {
          bg: 'rgba(245, 158, 11, 0.2)',
          border: 'rgba(245, 158, 11, 0.45)',
          text: '#fde68a',
          label: 'MODERATE SEVERITY',
        }
      case 'minor':
        return {
          bg: 'rgba(59, 130, 246, 0.2)',
          border: 'rgba(59, 130, 246, 0.45)',
          text: '#93c5fd',
          label: 'MINOR SEVERITY',
        }
      default:
        return {
          bg: 'rgba(148, 163, 184, 0.2)',
          border: 'rgba(148, 163, 184, 0.45)',
          text: '#cbd5e1',
          label: 'CLINICAL NOTE',
        }
    }
  }

  const filteredFindings = findings.filter((f) => {
    if (filterType === 'all') return true
    if (filterType === 'contraindication') return f.type === 'contraindication' || f.severity === 'contraindication'
    if (filterType === 'duplicate') return f.type === 'duplicate_ingredient' || f.type === 'class_duplicate' || f.severity === 'duplicate'
    if (filterType === 'interaction') return f.type === 'interaction' || !f.type
    return true
  })

  const countContra = findings.filter((f) => f.type === 'contraindication' || f.severity === 'contraindication').length
  const countDuplicate = findings.filter((f) => f.type === 'duplicate_ingredient' || f.type === 'class_duplicate' || f.severity === 'duplicate').length
  const countMajor = findings.filter((f) => f.severity === 'major').length

  const handleRequestAi = async () => {
    if (findings.length === 0) return
    setAiLoading(true)
    try {
      const res = await explainFindings(findings, 'doctor', 'en')
      setAiExplain(res)
    } catch {
      // Handled inside explainFindings
    } finally {
      setAiLoading(false)
    }
  }

  const copyFindingText = (f: Finding, id: string) => {
    const text = `[${f.severity?.toUpperCase() || 'ALERT'}] ${f.drugs?.join(' ↔ ')}\nMechanism: ${f.mechanism || 'N/A'}\nGuidance: ${f.recommendation || 'N/A'}`
    navigator.clipboard.writeText(text)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  return (
    <div id="doctor-clinical-safety-view" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Top Clinical Score & Metric Banner */}
      <div
        style={{
          borderRadius: '16px',
          background: 'linear-gradient(135deg, rgba(26, 31, 46, 0.95), rgba(15, 23, 42, 0.98))',
          border: '1px solid rgba(148, 163, 184, 0.15)',
          boxShadow: '0 4px 24px rgba(0, 0, 0, 0.35)',
          padding: '24px',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '20px',
          alignItems: 'center',
        }}
      >
        {/* Risk Score Card */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div
            style={{
              width: 80,
              height: 80,
              borderRadius: '20px',
              background: `radial-gradient(circle, ${getRiskColor(risk_level)}25 0%, rgba(15, 23, 42, 0.9) 70%)`,
              border: `2px solid ${getRiskColor(risk_level)}`,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: `0 0 25px ${getRiskColor(risk_level)}33`,
            }}
          >
            <span style={{ fontSize: '1.75rem', fontWeight: 800, color: getRiskColor(risk_level), lineHeight: 1 }}>
              {risk_score}
            </span>
            <span style={{ fontSize: '0.62rem', color: '#94a3b8', textTransform: 'uppercase', marginTop: '2px' }}>
              / 100
            </span>
          </div>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span
                style={{
                  fontSize: '0.74rem',
                  padding: '3px 10px',
                  borderRadius: '999px',
                  background: `${getRiskColor(risk_level)}20`,
                  border: `1px solid ${getRiskColor(risk_level)}50`,
                  color: getRiskColor(risk_level),
                  fontWeight: 800,
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                }}
              >
                {risk_level} Risk Level
              </span>
            </div>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#f8fafc', marginTop: '6px' }}>
              Overall Prescription Risk
            </h3>
            <p style={{ fontSize: '0.74rem', color: '#94a3b8' }}>
              Deterministic composite weighted safety score
            </p>
          </div>
        </div>

        {/* Metric 1: Contraindications */}
        <div
          style={{
            padding: '14px 18px',
            borderRadius: '12px',
            background: countContra > 0 ? 'rgba(244, 63, 94, 0.12)' : 'rgba(30, 41, 59, 0.4)',
            border: `1px solid ${countContra > 0 ? 'rgba(244, 63, 94, 0.3)' : 'rgba(148, 163, 184, 0.1)'}`,
          }}
        >
          <div style={{ fontSize: '0.74rem', color: countContra > 0 ? '#fda4af' : '#94a3b8', fontWeight: 600 }}>
            Contraindications
          </div>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, color: countContra > 0 ? '#f43f5e' : '#f1f5f9', marginTop: '2px' }}>
            {countContra}
          </div>
          <div style={{ fontSize: '0.7rem', color: '#64748b' }}>Absolute / Black Box Rules</div>
        </div>

        {/* Metric 2: Major DDI Alerts */}
        <div
          style={{
            padding: '14px 18px',
            borderRadius: '12px',
            background: countMajor > 0 ? 'rgba(244, 63, 94, 0.12)' : 'rgba(30, 41, 59, 0.4)',
            border: `1px solid ${countMajor > 0 ? 'rgba(244, 63, 94, 0.3)' : 'rgba(148, 163, 184, 0.1)'}`,
          }}
        >
          <div style={{ fontSize: '0.74rem', color: countMajor > 0 ? '#fda4af' : '#94a3b8', fontWeight: 600 }}>
            Major DDI Alerts
          </div>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, color: countMajor > 0 ? '#f43f5e' : '#f1f5f9', marginTop: '2px' }}>
            {countMajor}
          </div>
          <div style={{ fontSize: '0.7rem', color: '#64748b' }}>High Clinical Risk Interactions</div>
        </div>

        {/* Metric 3: Duplicate Therapy */}
        <div
          style={{
            padding: '14px 18px',
            borderRadius: '12px',
            background: countDuplicate > 0 ? 'rgba(245, 158, 11, 0.12)' : 'rgba(30, 41, 59, 0.4)',
            border: `1px solid ${countDuplicate > 0 ? 'rgba(245, 158, 11, 0.3)' : 'rgba(148, 163, 184, 0.1)'}`,
          }}
        >
          <div style={{ fontSize: '0.74rem', color: countDuplicate > 0 ? '#fde68a' : '#94a3b8', fontWeight: 600 }}>
            Duplicate Therapies
          </div>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, color: countDuplicate > 0 ? '#fbbf24' : '#f1f5f9', marginTop: '2px' }}>
            {countDuplicate}
          </div>
          <div style={{ fontSize: '0.7rem', color: '#64748b' }}>Molecule Overlap Findings</div>
        </div>
      </div>

      {/* Unresolved Medicines Warning Banner (if any) */}
      {unresolved && unresolved.length > 0 && (
        <div
          style={{
            padding: '14px 18px',
            borderRadius: '12px',
            background: 'rgba(245, 158, 11, 0.12)',
            border: '1px solid rgba(245, 158, 11, 0.3)',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            color: '#fde68a',
            fontSize: '0.82rem',
          }}
        >
          <AlertTriangle size={18} color="#f59e0b" style={{ flexShrink: 0 }} />
          <div>
            <strong>Unresolved Medications in Database:</strong>{' '}
            {unresolved.join(', ')} — Not present in current verified rule database. No interactions
            could be verified for these items.
          </div>
        </div>
      )}

      {/* Filter Tabs & AI Explanation Button */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px',
        }}
      >
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {[
            { id: 'all', label: `All Findings (${findings.length})` },
            { id: 'contraindication', label: `Contraindications (${countContra})` },
            { id: 'interaction', label: `Drug Interactions (${findings.length - countContra - countDuplicate})` },
            { id: 'duplicate', label: `Duplicate Therapy (${countDuplicate})` },
          ].map((f) => (
            <button
              key={f.id}
              onClick={() => setFilterType(f.id as typeof filterType)}
              style={{
                padding: '6px 14px',
                borderRadius: '8px',
                border: 'none',
                background: filterType === f.id ? 'rgba(6, 182, 212, 0.25)' : 'rgba(30, 41, 59, 0.6)',
                color: filterType === f.id ? '#22d3ee' : '#94a3b8',
                fontWeight: 600,
                fontSize: '0.8rem',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* AI Clinical Reasoning trigger */}
        <button
          onClick={handleRequestAi}
          disabled={aiLoading || findings.length === 0}
          style={{
            padding: '7px 16px',
            borderRadius: '8px',
            background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.25), rgba(6, 182, 212, 0.25))',
            border: '1px solid rgba(139, 92, 246, 0.4)',
            color: '#c084fc',
            fontSize: '0.8rem',
            fontWeight: 700,
            cursor: aiLoading || findings.length === 0 ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            boxShadow: '0 2px 10px rgba(139, 92, 246, 0.15)',
          }}
        >
          <Sparkles size={14} className={aiLoading ? 'animate-spin' : ''} />
          <span>{aiLoading ? 'Synthesizing...' : 'Request AI Clinical Synthesis'}</span>
        </button>
      </div>

      {/* AI Clinical Synthesis Panel (if loaded) */}
      {aiExplain && (
        <div
          style={{
            padding: '18px 22px',
            borderRadius: '14px',
            background: 'linear-gradient(135deg, rgba(26, 31, 46, 0.95), rgba(20, 20, 40, 0.95))',
            border: '1px solid rgba(139, 92, 246, 0.35)',
            boxShadow: '0 4px 20px rgba(139, 92, 246, 0.15)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <Sparkles size={16} color="#a855f7" />
            <h4 style={{ fontSize: '0.94rem', fontWeight: 700, color: '#f3e8ff' }}>
              AI Clinical Synthesis & Physician Narrative
            </h4>
            <span
              style={{
                fontSize: '0.66rem',
                padding: '1px 6px',
                borderRadius: '4px',
                background: 'rgba(139, 92, 246, 0.2)',
                color: '#d8b4fe',
                fontWeight: 600,
              }}
            >
              {aiExplain.ai_used ? 'AI-Generated' : 'Rule Engine Fallback'}
            </span>
          </div>
          <p style={{ fontSize: '0.84rem', color: '#cbd5e1', lineHeight: 1.6 }}>
            {aiExplain.summary}
          </p>
        </div>
      )}

      {/* Findings List */}
      {filteredFindings.length === 0 ? (
        <div
          style={{
            padding: '40px 20px',
            textAlign: 'center',
            borderRadius: '14px',
            background: 'rgba(26, 31, 46, 0.6)',
            border: '1px solid rgba(148, 163, 184, 0.1)',
            color: '#94a3b8',
          }}
        >
          No findings matching this filter.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {filteredFindings.map((finding, idx) => {
            const fid = finding.id || `finding-${idx}`
            const isExpanded = expandedId === fid
            const badge = getSeverityBadge(finding.severity, finding.type)

            return (
              <div
                key={fid}
                style={{
                  borderRadius: '12px',
                  background: 'rgba(26, 31, 46, 0.85)',
                  border: `1px solid ${badge.border}`,
                  overflow: 'hidden',
                  transition: 'all 0.2s ease',
                }}
              >
                {/* Header row */}
                <div
                  onClick={() => setExpandedId(isExpanded ? null : fid)}
                  style={{
                    padding: '16px 20px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    cursor: 'pointer',
                    userSelect: 'none',
                    gap: '12px',
                    flexWrap: 'wrap',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1 }}>
                    <span
                      style={{
                        fontSize: '0.68rem',
                        padding: '3px 8px',
                        borderRadius: '6px',
                        background: badge.bg,
                        border: `1px solid ${badge.border}`,
                        color: badge.text,
                        fontWeight: 700,
                        letterSpacing: '0.04em',
                      }}
                    >
                      {badge.label}
                    </span>

                    <span style={{ fontSize: '0.96rem', fontWeight: 700, color: '#f8fafc' }}>
                      {finding.drugs && finding.drugs.length > 0
                        ? finding.drugs.join(' ↔ ')
                        : finding.condition || 'Clinical Safety Alert'}
                    </span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        copyFindingText(finding, fid)
                      }}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        color: '#64748b',
                        cursor: 'pointer',
                        padding: '4px',
                        display: 'flex',
                        alignItems: 'center',
                      }}
                      title="Copy finding details"
                    >
                      {copiedId === fid ? (
                        <Check size={14} color="#34d399" />
                      ) : (
                        <Copy size={14} />
                      )}
                    </button>
                    {isExpanded ? <ChevronUp size={18} color="#94a3b8" /> : <ChevronDown size={18} color="#94a3b8" />}
                  </div>
                </div>

                {/* Collapsible details */}
                {isExpanded && (
                  <div
                    style={{
                      padding: '0 20px 20px 20px',
                      borderTop: '1px solid rgba(148, 163, 184, 0.08)',
                      paddingTop: '14px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '12px',
                      fontSize: '0.84rem',
                      lineHeight: 1.55,
                    }}
                  >
                    {/* Mechanism */}
                    {finding.mechanism && (
                      <div>
                        <span style={{ color: '#94a3b8', fontWeight: 600, display: 'block', fontSize: '0.74rem', textTransform: 'uppercase', marginBottom: '2px' }}>
                          Pharmacological Mechanism:
                        </span>
                        <p style={{ color: '#e2e8f0' }}>{finding.mechanism}</p>
                      </div>
                    )}

                    {/* What to Watch */}
                    {finding.watch && (
                      <div
                        style={{
                          padding: '10px 14px',
                          borderRadius: '8px',
                          background: 'rgba(245, 158, 11, 0.1)',
                          border: '1px solid rgba(245, 158, 11, 0.25)',
                        }}
                      >
                        <span style={{ color: '#fbbf24', fontWeight: 700, display: 'block', fontSize: '0.75rem', marginBottom: '2px' }}>
                          Clinical Vigilance / Monitoring:
                        </span>
                        <p style={{ color: '#fde68a', fontSize: '0.82rem' }}>{finding.watch}</p>
                      </div>
                    )}

                    {/* Recommendation */}
                    {finding.recommendation && (
                      <div
                        style={{
                          padding: '10px 14px',
                          borderRadius: '8px',
                          background: 'rgba(6, 182, 212, 0.1)',
                          border: '1px solid rgba(6, 182, 212, 0.25)',
                        }}
                      >
                        <span style={{ color: '#22d3ee', fontWeight: 700, display: 'block', fontSize: '0.75rem', marginBottom: '2px' }}>
                          Physician Action Recommendation:
                        </span>
                        <p style={{ color: '#cffafe', fontSize: '0.82rem' }}>{finding.recommendation}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* Food Advisories Section */}
      {food_warnings && Object.keys(food_warnings).length > 0 && (
        <div
          style={{
            marginTop: '8px',
            padding: '20px',
            borderRadius: '14px',
            background: 'rgba(26, 31, 46, 0.7)',
            border: '1px solid rgba(148, 163, 184, 0.12)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
            <Apple size={18} color="#fbbf24" />
            <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#f1f5f9' }}>
              Dietary & Lifestyle Considerations (Informational)
            </h4>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {Object.entries(food_warnings).map(([drug, advice]) => (
              <div
                key={drug}
                style={{
                  fontSize: '0.82rem',
                  color: '#cbd5e1',
                  padding: '8px 12px',
                  borderRadius: '6px',
                  background: 'rgba(17, 24, 39, 0.5)',
                }}
              >
                <strong style={{ color: '#38bdf8', textTransform: 'capitalize' }}>{drug}:</strong>{' '}
                {advice}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
