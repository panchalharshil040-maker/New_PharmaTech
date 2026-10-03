import { useState } from 'react'
import {
  X,
  UserPlus,
  BookmarkCheck,
  Plus,
  Trash2,
  AlertTriangle,
  Heart,
  Baby,
  Activity,
  AlertCircle,
  Search,
} from 'lucide-react'
import type { PatientProfile } from '../types'
import { searchDrugs } from '../services/api'

interface PresetCase {
  id: string
  name: string
  label: string
  description: string
  medicines: string[]
  patient: PatientProfile
}

const PRESET_CASES: PresetCase[] = [
  {
    id: 'PT-3091',
    name: 'Robert Miller',
    label: 'Geriatric Cardiac Patient (Warfarin + Clopidogrel)',
    description:
      'High bleeding risk drug-drug interaction with anticoagulant and antiplatelet dual therapy.',
    medicines: ['warfarin sodium', 'clopidogrel', 'atorvastatin'],
    patient: {
      ageGroup: 'elderly',
      isPregnant: false,
      hasRenalImpairment: false,
      hasLiverDisease: false,
      hasCardiacHistory: true,
      allergies: ['aspirin'],
    },
  },
  {
    id: 'PT-4120',
    name: 'Elena Rostova',
    label: 'Maternal Safety Case (Warfarin in Pregnancy)',
    description:
      'FDA Black Box contraindication: teratogenic risk in pregnancy; requires heparin replacement.',
    medicines: ['warfarin sodium', 'pantoprazole'],
    patient: {
      ageGroup: 'adult',
      isPregnant: true,
      hasRenalImpairment: false,
      hasLiverDisease: false,
      hasCardiacHistory: false,
      allergies: [],
    },
  },
  {
    id: 'PT-5582',
    name: 'Harish Patel',
    label: 'Polypharmacy Duplicate Therapy & Renal Risk',
    description:
      'Duplicate acetaminophen exposure via Dolo 650 + Combiflam with NSAID nephrotoxicity.',
    medicines: ['dolo 650', 'combiflam', 'metformin'],
    patient: {
      ageGroup: 'adult',
      isPregnant: false,
      hasRenalImpairment: true,
      hasLiverDisease: false,
      hasCardiacHistory: false,
      allergies: ['sulfa'],
    },
  },
  {
    id: 'PT-7719',
    name: 'Sarah Jenkins',
    label: 'Hypertension & Complex Polypharmacy Case',
    description:
      'Multi-drug regimen with Beta-blocker, ACEi/ARB, and Statin with diet interactions.',
    medicines: ['atenolol', 'amlong', 'lipitor', 'ecosprin'],
    patient: {
      ageGroup: 'elderly',
      isPregnant: false,
      hasRenalImpairment: false,
      hasLiverDisease: false,
      hasCardiacHistory: true,
      allergies: ['penicillin'],
    },
  },
]

interface Props {
  isOpen: boolean
  onClose: () => void
  onLoadPatient: (
    patient: PatientProfile,
    medicines: string[],
    name: string,
    id: string,
  ) => void
}

export default function ManualPatientModal({
  isOpen,
  onClose,
  onLoadPatient,
}: Props) {
  const [tab, setTab] = useState<'presets' | 'custom'>('presets')

  // Custom patient state
  const [name, setName] = useState('')
  const [patientId, setPatientId] = useState('')
  const [ageGroup, setAgeGroup] = useState<'pediatric' | 'adult' | 'elderly'>('adult')
  const [isPregnant, setIsPregnant] = useState(false)
  const [hasRenalImpairment, setHasRenalImpairment] = useState(false)
  const [hasLiverDisease, setHasLiverDisease] = useState(false)
  const [hasCardiacHistory, setHasCardiacHistory] = useState(false)
  const [allergiesText, setAllergiesText] = useState('')
  const [meds, setMeds] = useState<string[]>([])
  const [medInput, setMedInput] = useState('')
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [customError, setCustomError] = useState('')

  if (!isOpen) return null

  const handleMedInputChange = async (val: string) => {
    setMedInput(val)
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

  const addMed = (medToAdd: string) => {
    const norm = medToAdd.trim().toLowerCase()
    if (norm && !meds.includes(norm)) {
      setMeds([...meds, norm])
      setMedInput('')
      setSuggestions([])
      setCustomError('')
    }
  }

  const removeMed = (index: number) => {
    setMeds(meds.filter((_, i) => i !== index))
  }

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (meds.length === 0) {
      setCustomError('Please add at least one medication to analyze.')
      return
    }

    const allergies = allergiesText
      .split(',')
      .map((a) => a.trim().toLowerCase())
      .filter(Boolean)

    const profile: PatientProfile = {
      ageGroup,
      isPregnant,
      hasRenalImpairment,
      hasLiverDisease,
      hasCardiacHistory,
      allergies,
    }

    const finalName = name.trim() || 'Custom Clinical Patient'
    const finalId = patientId.trim() || `PT-${Math.floor(1000 + Math.random() * 9000)}`

    onLoadPatient(profile, meds, finalName, finalId)
    onClose()
  }

  return (
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
      onClick={onClose}
    >
      <div
        id="manual-patient-modal"
        style={{
          width: '100%',
          maxWidth: '720px',
          maxHeight: '90vh',
          backgroundColor: '#111827',
          borderRadius: '20px',
          border: '1px solid rgba(6, 182, 212, 0.3)',
          boxShadow: '0 20px 50px rgba(0, 0, 0, 0.6)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div
          style={{
            padding: '20px 24px',
            borderBottom: '1px solid rgba(148, 163, 184, 0.12)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'linear-gradient(135deg, rgba(26, 31, 46, 0.9), rgba(17, 24, 39, 0.9))',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: '10px',
                background: 'linear-gradient(135deg, #06b6d4, #8b5cf6)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <UserPlus size={18} color="white" />
            </div>
            <div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#f1f5f9' }}>
                Load Clinical Patient Context
              </h3>
              <p style={{ fontSize: '0.74rem', color: '#64748b' }}>
                Select a verified clinical benchmark case or configure custom patient profile
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#94a3b8',
              cursor: 'pointer',
              padding: '6px',
              borderRadius: '8px',
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Tab switcher */}
        <div
          style={{
            display: 'flex',
            padding: '12px 24px',
            borderBottom: '1px solid rgba(148, 163, 184, 0.1)',
            gap: '12px',
            background: '#0d1322',
          }}
        >
          <button
            onClick={() => setTab('presets')}
            style={{
              padding: '8px 18px',
              borderRadius: '8px',
              border: 'none',
              background: tab === 'presets' ? 'rgba(6, 182, 212, 0.2)' : 'transparent',
              color: tab === 'presets' ? '#22d3ee' : '#94a3b8',
              fontWeight: 600,
              fontSize: '0.84rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <BookmarkCheck size={15} />
            Clinical Benchmark Cases
          </button>
          <button
            onClick={() => setTab('custom')}
            style={{
              padding: '8px 18px',
              borderRadius: '8px',
              border: 'none',
              background: tab === 'custom' ? 'rgba(6, 182, 212, 0.2)' : 'transparent',
              color: tab === 'custom' ? '#22d3ee' : '#94a3b8',
              fontWeight: 600,
              fontSize: '0.84rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <UserPlus size={15} />
            Custom Patient Record
          </button>
        </div>

        {/* Modal Body */}
        <div style={{ padding: '24px', overflowY: 'auto', flex: 1 }}>
          {tab === 'presets' ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <p style={{ fontSize: '0.82rem', color: '#94a3b8', marginBottom: '4px' }}>
                Click any validated clinical scenario to load into the Doctor Dashboard workspace:
              </p>
              {PRESET_CASES.map((preset) => (
                <div
                  key={preset.id}
                  onClick={() => {
                    onLoadPatient(preset.patient, preset.medicines, preset.name, preset.id)
                    onClose()
                  }}
                  style={{
                    padding: '16px 20px',
                    borderRadius: '12px',
                    background: 'rgba(26, 31, 46, 0.8)',
                    border: '1px solid rgba(148, 163, 184, 0.15)',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = 'rgba(6, 182, 212, 0.5)'
                    e.currentTarget.style.background = 'rgba(30, 41, 59, 0.9)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = 'rgba(148, 163, 184, 0.15)'
                    e.currentTarget.style.background = 'rgba(26, 31, 46, 0.8)'
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      marginBottom: '6px',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontWeight: 700, color: '#f1f5f9', fontSize: '0.94rem' }}>
                        {preset.name}
                      </span>
                      <span
                        style={{
                          fontSize: '0.7rem',
                          padding: '1px 6px',
                          borderRadius: '4px',
                          background: 'rgba(148, 163, 184, 0.15)',
                          color: '#94a3b8',
                          fontFamily: 'monospace',
                        }}
                      >
                        {preset.id}
                      </span>
                    </div>
                    <span
                      style={{
                        fontSize: '0.72rem',
                        padding: '2px 8px',
                        borderRadius: '6px',
                        background: 'rgba(6, 182, 212, 0.15)',
                        color: '#38bdf8',
                        fontWeight: 600,
                      }}
                    >
                      {preset.label}
                    </span>
                  </div>
                  <p style={{ fontSize: '0.78rem', color: '#94a3b8', marginBottom: '10px' }}>
                    {preset.description}
                  </p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                    <span style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 600 }}>
                      Meds:
                    </span>
                    {preset.medicines.map((m, i) => (
                      <span
                        key={i}
                        style={{
                          fontSize: '0.72rem',
                          padding: '2px 8px',
                          borderRadius: '4px',
                          background: 'rgba(51, 65, 85, 0.6)',
                          color: '#cbd5e1',
                        }}
                      >
                        {m}
                      </span>
                    ))}
                    {preset.patient.isPregnant && (
                      <span
                        style={{
                          fontSize: '0.7rem',
                          color: '#fb7185',
                          fontWeight: 600,
                          marginLeft: 'auto',
                        }}
                      >
                        ⚠ Pregnant
                      </span>
                    )}
                    {preset.patient.hasRenalImpairment && (
                      <span
                        style={{
                          fontSize: '0.7rem',
                          color: '#fbbf24',
                          fontWeight: 600,
                          marginLeft: 'auto',
                        }}
                      >
                        ⚠ Renal
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <form onSubmit={handleCustomSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {/* Patient Identity */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '0.76rem', color: '#94a3b8', display: 'block', marginBottom: '4px', fontWeight: 600 }}>
                    Patient Full Name:
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. John Doe"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      borderRadius: '8px',
                      background: '#1f2937',
                      border: '1px solid rgba(148, 163, 184, 0.2)',
                      color: '#fff',
                      fontSize: '0.84rem',
                      outline: 'none',
                    }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.76rem', color: '#94a3b8', display: 'block', marginBottom: '4px', fontWeight: 600 }}>
                    Patient Medical Record # / ID:
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. PT-9402"
                    value={patientId}
                    onChange={(e) => setPatientId(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      borderRadius: '8px',
                      background: '#1f2937',
                      border: '1px solid rgba(148, 163, 184, 0.2)',
                      color: '#fff',
                      fontSize: '0.84rem',
                      outline: 'none',
                    }}
                  />
                </div>
              </div>

              {/* Age group */}
              <div>
                <label style={{ fontSize: '0.76rem', color: '#94a3b8', display: 'block', marginBottom: '4px', fontWeight: 600 }}>
                  Age Group:
                </label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  {(['pediatric', 'adult', 'elderly'] as const).map((ag) => (
                    <button
                      key={ag}
                      type="button"
                      onClick={() => setAgeGroup(ag)}
                      style={{
                        flex: 1,
                        padding: '8px',
                        borderRadius: '8px',
                        border: '1px solid',
                        borderColor: ageGroup === ag ? '#06b6d4' : 'rgba(148, 163, 184, 0.2)',
                        background: ageGroup === ag ? 'rgba(6, 182, 212, 0.2)' : '#1f2937',
                        color: ageGroup === ag ? '#22d3ee' : '#94a3b8',
                        textTransform: 'capitalize',
                        fontSize: '0.82rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                      }}
                    >
                      {ag}
                    </button>
                  ))}
                </div>
              </div>

              {/* Clinical Flags */}
              <div>
                <label style={{ fontSize: '0.76rem', color: '#94a3b8', display: 'block', marginBottom: '8px', fontWeight: 600 }}>
                  Clinical Risk Conditions:
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
                  <label
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '8px 12px',
                      borderRadius: '8px',
                      background: isPregnant ? 'rgba(244, 63, 94, 0.15)' : '#1f2937',
                      border: `1px solid ${isPregnant ? '#f43f5e' : 'rgba(148, 163, 184, 0.2)'}`,
                      cursor: 'pointer',
                      fontSize: '0.8rem',
                      color: isPregnant ? '#fca5a5' : '#cbd5e1',
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={isPregnant}
                      onChange={(e) => setIsPregnant(e.target.checked)}
                    />
                    <Baby size={14} /> Pregnant / Lactating
                  </label>

                  <label
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '8px 12px',
                      borderRadius: '8px',
                      background: hasRenalImpairment ? 'rgba(245, 158, 11, 0.15)' : '#1f2937',
                      border: `1px solid ${hasRenalImpairment ? '#f59e0b' : 'rgba(148, 163, 184, 0.2)'}`,
                      cursor: 'pointer',
                      fontSize: '0.8rem',
                      color: hasRenalImpairment ? '#fde68a' : '#cbd5e1',
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={hasRenalImpairment}
                      onChange={(e) => setHasRenalImpairment(e.target.checked)}
                    />
                    <AlertCircle size={14} /> Renal Impairment
                  </label>

                  <label
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '8px 12px',
                      borderRadius: '8px',
                      background: hasLiverDisease ? 'rgba(245, 158, 11, 0.15)' : '#1f2937',
                      border: `1px solid ${hasLiverDisease ? '#f59e0b' : 'rgba(148, 163, 184, 0.2)'}`,
                      cursor: 'pointer',
                      fontSize: '0.8rem',
                      color: hasLiverDisease ? '#fde68a' : '#cbd5e1',
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={hasLiverDisease}
                      onChange={(e) => setHasLiverDisease(e.target.checked)}
                    />
                    <Activity size={14} /> Hepatic Impairment
                  </label>

                  <label
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '8px 12px',
                      borderRadius: '8px',
                      background: hasCardiacHistory ? 'rgba(244, 63, 94, 0.15)' : '#1f2937',
                      border: `1px solid ${hasCardiacHistory ? '#f43f5e' : 'rgba(148, 163, 184, 0.2)'}`,
                      cursor: 'pointer',
                      fontSize: '0.8rem',
                      color: hasCardiacHistory ? '#fca5a5' : '#cbd5e1',
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={hasCardiacHistory}
                      onChange={(e) => setHasCardiacHistory(e.target.checked)}
                    />
                    <Heart size={14} /> Cardiac / HTN History
                  </label>
                </div>
              </div>

              {/* Known Allergies */}
              <div>
                <label style={{ fontSize: '0.76rem', color: '#94a3b8', display: 'block', marginBottom: '4px', fontWeight: 600 }}>
                  Known Allergies (comma separated):
                </label>
                <input
                  type="text"
                  placeholder="e.g. penicillin, aspirin, sulfa"
                  value={allergiesText}
                  onChange={(e) => setAllergiesText(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    background: '#1f2937',
                    border: '1px solid rgba(148, 163, 184, 0.2)',
                    color: '#fff',
                    fontSize: '0.84rem',
                    outline: 'none',
                  }}
                />
              </div>

              {/* Medications List Builder */}
              <div>
                <label style={{ fontSize: '0.76rem', color: '#94a3b8', display: 'block', marginBottom: '4px', fontWeight: 600 }}>
                  Current Medications:
                </label>
                <div style={{ position: 'relative', display: 'flex', gap: '8px', marginBottom: '8px' }}>
                  <div style={{ position: 'relative', flex: 1 }}>
                    <Search
                      size={15}
                      style={{ position: 'absolute', left: 10, top: 10, color: '#64748b' }}
                    />
                    <input
                      type="text"
                      placeholder="Search and add medicine (e.g. Warfarin, Dolo, Combiflam)..."
                      value={medInput}
                      onChange={(e) => handleMedInputChange(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault()
                          addMed(medInput)
                        }
                      }}
                      style={{
                        width: '100%',
                        padding: '8px 12px 8px 32px',
                        borderRadius: '8px',
                        background: '#1f2937',
                        border: '1px solid rgba(148, 163, 184, 0.2)',
                        color: '#fff',
                        fontSize: '0.84rem',
                        outline: 'none',
                      }}
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => addMed(medInput)}
                    style={{
                      padding: '8px 16px',
                      borderRadius: '8px',
                      background: 'rgba(6, 182, 212, 0.25)',
                      border: '1px solid rgba(6, 182, 212, 0.4)',
                      color: '#22d3ee',
                      fontWeight: 600,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                    }}
                  >
                    <Plus size={14} /> Add
                  </button>

                  {/* Autocomplete dropdown */}
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
                          onClick={() => addMed(s)}
                          style={{
                            padding: '8px 12px',
                            cursor: 'pointer',
                            color: '#e2e8f0',
                            fontSize: '0.82rem',
                            borderBottom:
                              idx < suggestions.length - 1
                                ? '1px solid rgba(148,163,184,0.1)'
                                : 'none',
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

                {/* Added Meds Badges */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', minHeight: '36px' }}>
                  {meds.map((m, i) => (
                    <span
                      key={i}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '4px 10px',
                        borderRadius: '6px',
                        background: 'rgba(6, 182, 212, 0.15)',
                        border: '1px solid rgba(6, 182, 212, 0.3)',
                        color: '#e0f2fe',
                        fontSize: '0.8rem',
                      }}
                    >
                      {m}
                      <Trash2
                        size={12}
                        color="#f87171"
                        style={{ cursor: 'pointer' }}
                        onClick={() => removeMed(i)}
                      />
                    </span>
                  ))}
                  {meds.length === 0 && (
                    <span style={{ fontSize: '0.76rem', color: '#64748b', fontStyle: 'italic' }}>
                      No medications added yet. Type a medication name above.
                    </span>
                  )}
                </div>
              </div>

              {customError && (
                <div
                  style={{
                    padding: '8px 12px',
                    borderRadius: '8px',
                    background: 'rgba(244, 63, 94, 0.15)',
                    border: '1px solid rgba(244, 63, 94, 0.3)',
                    color: '#fca5a5',
                    fontSize: '0.78rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                  }}
                >
                  <AlertTriangle size={14} />
                  {customError}
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '12px' }}>
                <button
                  type="button"
                  onClick={onClose}
                  style={{
                    padding: '8px 18px',
                    borderRadius: '8px',
                    background: 'rgba(51, 65, 85, 0.5)',
                    border: '1px solid rgba(148, 163, 184, 0.2)',
                    color: '#94a3b8',
                    fontWeight: 600,
                    cursor: 'pointer',
                    fontSize: '0.84rem',
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{
                    padding: '8px 24px',
                    borderRadius: '8px',
                    background: 'linear-gradient(135deg, #06b6d4, #8b5cf6)',
                    border: 'none',
                    color: '#fff',
                    fontWeight: 700,
                    cursor: 'pointer',
                    fontSize: '0.84rem',
                    boxShadow: '0 2px 10px rgba(6, 182, 212, 0.3)',
                  }}
                >
                  Load Patient Record
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
