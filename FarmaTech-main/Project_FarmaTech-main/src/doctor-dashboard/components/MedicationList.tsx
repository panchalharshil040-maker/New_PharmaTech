import { useState } from 'react'
import {
  Pill,
  CheckCircle,
  AlertTriangle,
  FlaskConical,
  Edit3,
  Stethoscope,
  Info,
} from 'lucide-react'
import type { CheckResponse } from '../types'

interface Props {
  medicines: string[]
  analysis: CheckResponse | null
  adjustments: Record<string, string>
  onSetAdjustment: (med: string, adj: string) => void
  onSimulateRemove: (med: string) => void
}

export default function MedicationList({
  medicines,
  analysis,
  adjustments,
  onSetAdjustment,
  onSimulateRemove,
}: Props) {
  const [editingMed, setEditingMed] = useState<string | null>(null)
  const [dosageText, setDosageText] = useState('')

  // Map resolved active ingredients by medication input
  const resolvedMap = new Map<string, string[]>()
  if (analysis?.resolved) {
    for (const r of analysis.resolved) {
      resolvedMap.set(r.input.toLowerCase().trim(), r.ingredients)
    }
  }

  // Count findings associated with each medicine
  const findingsForMed = (med: string) => {
    if (!analysis?.findings) return { major: 0, moderate: 0, contraindications: 0, duplicates: 0 }
    const norm = med.toLowerCase().trim()
    let major = 0
    let moderate = 0
    let contraindications = 0
    let duplicates = 0

    for (const f of analysis.findings) {
      const drugs = (f.drugs || []).map((d) => d.toLowerCase())
      const applies =
        drugs.includes(norm) ||
        (resolvedMap.get(norm) || []).some((ing) => drugs.includes(ing.toLowerCase()))

      if (applies) {
        if (f.type === 'contraindication' || f.severity === 'contraindication') contraindications++
        else if (f.type === 'duplicate_ingredient' || f.type === 'class_duplicate' || f.severity === 'duplicate') duplicates++
        else if (f.severity === 'major') major++
        else if (f.severity === 'moderate') moderate++
      }
    }

    return { major, moderate, contraindications, duplicates }
  }

  const startEdit = (med: string) => {
    setEditingMed(med)
    setDosageText(adjustments[med] || '1 tablet daily with meals')
  }

  const saveEdit = (med: string) => {
    onSetAdjustment(med, dosageText)
    setEditingMed(null)
  }

  return (
    <div
      id="doctor-medication-list"
      style={{
        borderRadius: '16px',
        background: 'linear-gradient(135deg, rgba(26, 31, 46, 0.9), rgba(15, 23, 42, 0.95))',
        border: '1px solid rgba(148, 163, 184, 0.15)',
        boxShadow: '0 4px 24px rgba(0, 0, 0, 0.3)',
        padding: '24px',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '18px',
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
              background: 'linear-gradient(135deg, #06b6d4, #3b82f6)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Pill size={20} color="white" />
          </div>
          <div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#f1f5f9' }}>
              Active Patient Regimen ({medicines.length})
            </h3>
            <p style={{ fontSize: '0.75rem', color: '#64748b' }}>
              Verified medications, resolved active molecules, and clinical schedule
            </p>
          </div>
        </div>

        <div
          style={{
            fontSize: '0.72rem',
            padding: '4px 10px',
            borderRadius: '6px',
            background: 'rgba(16, 185, 129, 0.1)',
            border: '1px solid rgba(16, 185, 129, 0.25)',
            color: '#34d399',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
          }}
        >
          <CheckCircle size={13} /> Master Record: Read-Only
        </div>
      </div>

      {medicines.length === 0 ? (
        <div
          style={{
            textAlign: 'center',
            padding: '36px 20px',
            color: '#94a3b8',
            fontSize: '0.85rem',
          }}
        >
          No medications loaded for this patient.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {medicines.map((med) => {
            const ingredients = resolvedMap.get(med.toLowerCase().trim()) || [med]
            const counts = findingsForMed(med)
            const hasAlerts =
              counts.major > 0 ||
              counts.moderate > 0 ||
              counts.contraindications > 0 ||
              counts.duplicates > 0
            const currentDosage = adjustments[med] || 'Standard therapeutic dose • Oral'

            return (
              <div
                key={med}
                style={{
                  padding: '16px 20px',
                  borderRadius: '12px',
                  background: hasAlerts
                    ? 'linear-gradient(135deg, rgba(30, 41, 59, 0.8), rgba(26, 31, 46, 0.9))'
                    : 'rgba(17, 24, 39, 0.6)',
                  border: `1px solid ${
                    counts.contraindications > 0 || counts.major > 0
                      ? 'rgba(244, 63, 94, 0.35)'
                      : hasAlerts
                      ? 'rgba(245, 158, 11, 0.3)'
                      : 'rgba(148, 163, 184, 0.15)'
                  }`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: '16px',
                  transition: 'all 0.2s ease',
                }}
              >
                {/* Left details */}
                <div style={{ flex: 1, minWidth: '260px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                    <span
                      style={{
                        fontSize: '1rem',
                        fontWeight: 700,
                        color: '#f8fafc',
                        textTransform: 'capitalize',
                      }}
                    >
                      {med}
                    </span>

                    {/* Status Badge */}
                    <span
                      style={{
                        fontSize: '0.68rem',
                        padding: '2px 8px',
                        borderRadius: '999px',
                        background: 'rgba(16, 185, 129, 0.15)',
                        border: '1px solid rgba(16, 185, 129, 0.3)',
                        color: '#34d399',
                        fontWeight: 600,
                      }}
                    >
                      Active
                    </span>

                    {/* Severity alert pills */}
                    {counts.contraindications > 0 && (
                      <span
                        style={{
                          fontSize: '0.68rem',
                          padding: '2px 8px',
                          borderRadius: '999px',
                          background: 'rgba(244, 63, 94, 0.2)',
                          border: '1px solid rgba(244, 63, 94, 0.4)',
                          color: '#fda4af',
                          fontWeight: 700,
                          display: 'flex',
                          alignItems: 'center',
                          gap: '3px',
                        }}
                      >
                        <AlertTriangle size={11} /> Contraindication
                      </span>
                    )}
                    {counts.major > 0 && (
                      <span
                        style={{
                          fontSize: '0.68rem',
                          padding: '2px 8px',
                          borderRadius: '999px',
                          background: 'rgba(244, 63, 94, 0.2)',
                          border: '1px solid rgba(244, 63, 94, 0.4)',
                          color: '#fda4af',
                          fontWeight: 700,
                        }}
                      >
                        {counts.major} Major Alert{counts.major === 1 ? '' : 's'}
                      </span>
                    )}
                    {counts.duplicates > 0 && (
                      <span
                        style={{
                          fontSize: '0.68rem',
                          padding: '2px 8px',
                          borderRadius: '999px',
                          background: 'rgba(245, 158, 11, 0.2)',
                          border: '1px solid rgba(245, 158, 11, 0.4)',
                          color: '#fde68a',
                          fontWeight: 700,
                        }}
                      >
                        Duplicate Ingredient
                      </span>
                    )}
                  </div>

                  {/* Active Ingredients list */}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      marginTop: '6px',
                      flexWrap: 'wrap',
                    }}
                  >
                    <span style={{ fontSize: '0.72rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '3px' }}>
                      <FlaskConical size={12} /> Active Molecule{ingredients.length > 1 ? 's' : ''}:
                    </span>
                    {ingredients.map((ing, idx) => (
                      <span
                        key={idx}
                        style={{
                          fontSize: '0.73rem',
                          padding: '1px 8px',
                          borderRadius: '4px',
                          background: 'rgba(6, 182, 212, 0.12)',
                          border: '1px solid rgba(6, 182, 212, 0.25)',
                          color: '#67e8f9',
                          fontWeight: 500,
                        }}
                      >
                        {ing}
                      </span>
                    ))}
                  </div>

                  {/* Dosage / Regimen Annotation */}
                  <div style={{ marginTop: '8px' }}>
                    {editingMed === med ? (
                      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                        <input
                          type="text"
                          value={dosageText}
                          onChange={(e) => setDosageText(e.target.value)}
                          style={{
                            padding: '4px 8px',
                            borderRadius: '6px',
                            background: '#1f2937',
                            border: '1px solid #06b6d4',
                            color: '#fff',
                            fontSize: '0.78rem',
                            outline: 'none',
                          }}
                        />
                        <button
                          onClick={() => saveEdit(med)}
                          style={{
                            padding: '4px 10px',
                            borderRadius: '6px',
                            background: '#06b6d4',
                            color: '#fff',
                            border: 'none',
                            fontSize: '0.72rem',
                            fontWeight: 600,
                            cursor: 'pointer',
                          }}
                        >
                          Save
                        </button>
                        <button
                          onClick={() => setEditingMed(null)}
                          style={{
                            padding: '4px 8px',
                            borderRadius: '6px',
                            background: '#334155',
                            color: '#cbd5e1',
                            border: 'none',
                            fontSize: '0.72rem',
                            cursor: 'pointer',
                          }}
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <div
                        style={{
                          fontSize: '0.76rem',
                          color: '#94a3b8',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                        }}
                      >
                        <Info size={12} color="#64748b" />
                        <span>Schedule: {currentDosage}</span>
                        <Edit3
                          size={12}
                          color="#38bdf8"
                          style={{ cursor: 'pointer', marginLeft: '4px' }}
                          onClick={() => startEdit(med)}
                        />
                      </div>
                    )}
                  </div>
                </div>

                {/* Right Action Buttons */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <button
                    onClick={() => onSimulateRemove(med)}
                    style={{
                      padding: '7px 12px',
                      borderRadius: '8px',
                      background: 'rgba(139, 92, 246, 0.15)',
                      border: '1px solid rgba(139, 92, 246, 0.3)',
                      color: '#c084fc',
                      fontSize: '0.76rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '5px',
                    }}
                    title="Test discontinuation of this medication in the What-If simulation workspace"
                  >
                    <Stethoscope size={13} />
                    <span>Simulate Stop</span>
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
