import { useState, useCallback } from 'react'
import type {
  CheckResponse,
  DoctorPatientContext,
  DoctorSummaryResponse,
  PatientProfile,
  SimulationState,
  DashboardTab,
} from '../types'
import {
  checkMedicines,
  generateDoctorSummary,
} from '../services/api'

export const DEFAULT_DOCTOR_PATIENT: PatientProfile = {
  ageGroup: 'adult',
  isPregnant: false,
  hasRenalImpairment: false,
  hasLiverDisease: false,
  hasCardiacHistory: false,
  allergies: [],
}

export function useDoctorDashboard() {
  const [patientContext, setPatientContext] = useState<DoctorPatientContext | null>(null)
  const [patientName, setPatientName] = useState<string>('Patient #PT-4821')
  const [patientId, setPatientId] = useState<string>('PT-4821')
  const [baselineAnalysis, setBaselineAnalysis] = useState<CheckResponse | null>(null)
  const [activeTab, setActiveTab] = useState<DashboardTab>('overview')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // What-if simulation state
  const [simulation, setSimulation] = useState<SimulationState>({
    added: [],
    removed: [],
    adjustments: {},
    effectiveMedicines: [],
    analysisResult: null,
    originalResult: null,
  })
  const [simulating, setSimulating] = useState(false)

  // Clinical summary state
  const [clinicalSummary, setClinicalSummary] = useState<DoctorSummaryResponse | null>(null)
  const [summaryLoading, setSummaryLoading] = useState(false)

  // Run baseline safety analysis whenever patient context changes
  const runBaselineCheck = useCallback(async (ctx: DoctorPatientContext) => {
    if (ctx.medicines.length === 0) {
      setBaselineAnalysis(null)
      return
    }
    setLoading(true)
    setError(null)
    try {
      const res = await checkMedicines(ctx.medicines, 'doctor', 'en', ctx.patient)
      setBaselineAnalysis(res)
      // Reset simulation state with baseline as reference
      setSimulation({
        added: [],
        removed: [],
        adjustments: {},
        effectiveMedicines: [...ctx.medicines],
        analysisResult: res,
        originalResult: res,
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to analyze patient medications')
    } finally {
      setLoading(false)
    }
  }, [])

  // Load from QR code
  const loadFromQR = useCallback(
    async (medicines: string[], allergies: string[]) => {
      const ctx: DoctorPatientContext = {
        medicines,
        allergies,
        patient: {
          ...DEFAULT_DOCTOR_PATIENT,
          allergies,
        },
        source: 'qr',
        loadedAt: Date.now(),
      }
      setPatientContext(ctx)
      setPatientName(`QR Emergency Patient (${medicines.length} meds)`)
      setPatientId(`EMERG-${Math.floor(1000 + Math.random() * 9000)}`)
      await runBaselineCheck(ctx)
      setActiveTab('overview')
    },
    [runBaselineCheck],
  )

  // Load patient manually or from preset
  const loadPatient = useCallback(
    async (
      patient: PatientProfile,
      medicines: string[],
      name = 'Clinical Patient',
      id = 'PT-1001',
    ) => {
      const ctx: DoctorPatientContext = {
        medicines,
        allergies: patient.allergies || [],
        patient,
        source: 'manual',
        loadedAt: Date.now(),
      }
      setPatientContext(ctx)
      setPatientName(name)
      setPatientId(id)
      await runBaselineCheck(ctx)
      setActiveTab('overview')
    },
    [runBaselineCheck],
  )

  // Clear loaded patient
  const clearPatient = useCallback(() => {
    setPatientContext(null)
    setBaselineAnalysis(null)
    setClinicalSummary(null)
    setSimulation({
      added: [],
      removed: [],
      adjustments: {},
      effectiveMedicines: [],
      analysisResult: null,
      originalResult: null,
    })
    setError(null)
  }, [])

  // Run simulation analysis for effective medicines
  const runSimulationCheck = useCallback(
    async (effectiveMeds: string[]) => {
      if (!patientContext) return
      setSimulating(true)
      try {
        if (effectiveMeds.length === 0) {
          setSimulation((prev) => ({
            ...prev,
            effectiveMedicines: [],
            analysisResult: null,
          }))
          return
        }
        const res = await checkMedicines(effectiveMeds, 'doctor', 'en', patientContext.patient)
        setSimulation((prev) => ({
          ...prev,
          effectiveMedicines: effectiveMeds,
          analysisResult: res,
        }))
      } catch (err) {
        console.error('Simulation check failed', err)
      } finally {
        setSimulating(false)
      }
    },
    [patientContext],
  )

  // Add proposed medicine to simulation
  const addSimulationMedicine = useCallback(
    (med: string) => {
      const norm = med.trim().toLowerCase()
      if (!norm) return
      setSimulation((prev) => {
        if (prev.effectiveMedicines.includes(norm)) return prev
        const newAdded = prev.added.includes(norm) ? prev.added : [...prev.added, norm]
        const newEffective = [...prev.effectiveMedicines, norm]
        runSimulationCheck(newEffective)
        return {
          ...prev,
          added: newAdded,
          effectiveMedicines: newEffective,
        }
      })
    },
    [runSimulationCheck],
  )

  // Remove existing medicine in simulation
  const removeSimulationMedicine = useCallback(
    (med: string) => {
      const norm = med.trim().toLowerCase()
      setSimulation((prev) => {
        const newRemoved = prev.removed.includes(norm) ? prev.removed : [...prev.removed, norm]
        const newEffective = prev.effectiveMedicines.filter((m) => m !== norm)
        runSimulationCheck(newEffective)
        return {
          ...prev,
          removed: newRemoved,
          effectiveMedicines: newEffective,
        }
      })
    },
    [runSimulationCheck],
  )

  // Restore medicine previously removed in simulation
  const restoreSimulationMedicine = useCallback(
    (med: string) => {
      const norm = med.trim().toLowerCase()
      setSimulation((prev) => {
        const newRemoved = prev.removed.filter((m) => m !== norm)
        const newEffective = prev.effectiveMedicines.includes(norm)
          ? prev.effectiveMedicines
          : [...prev.effectiveMedicines, norm]
        runSimulationCheck(newEffective)
        return {
          ...prev,
          removed: newRemoved,
          effectiveMedicines: newEffective,
        }
      })
    },
    [runSimulationCheck],
  )

  // Delete proposed medicine from added list
  const deleteSimulationAdded = useCallback(
    (med: string) => {
      const norm = med.trim().toLowerCase()
      setSimulation((prev) => {
        const newAdded = prev.added.filter((m) => m !== norm)
        const newEffective = prev.effectiveMedicines.filter((m) => m !== norm)
        runSimulationCheck(newEffective)
        return {
          ...prev,
          added: newAdded,
          effectiveMedicines: newEffective,
        }
      })
    },
    [runSimulationCheck],
  )

  // Dosage adjustment annotation (display-only)
  const setDosageAdjustment = useCallback((med: string, adjustment: string) => {
    setSimulation((prev) => ({
      ...prev,
      adjustments: {
        ...prev.adjustments,
        [med]: adjustment,
      },
    }))
  }, [])

  // Reset simulation back to patient baseline
  const resetSimulation = useCallback(() => {
    if (!patientContext) return
    setSimulation({
      added: [],
      removed: [],
      adjustments: {},
      effectiveMedicines: [...patientContext.medicines],
      analysisResult: baselineAnalysis,
      originalResult: baselineAnalysis,
    })
  }, [patientContext, baselineAnalysis])

  // Generate Doctor Summary from backend
  const fetchSummary = useCallback(async () => {
    if (!patientContext || patientContext.medicines.length === 0) return
    setSummaryLoading(true)
    try {
      const isSimulated =
        simulation.added.length > 0 || simulation.removed.length > 0
      const activeMeds = isSimulated
        ? simulation.effectiveMedicines
        : patientContext.medicines

      const simInfo = isSimulated
        ? {
          added: simulation.added,
          removed: simulation.removed,
          before_score: baselineAnalysis?.risk_score ?? 0,
          after_score: simulation.analysisResult?.risk_score ?? 0,
          delta:
            (simulation.analysisResult?.risk_score ?? 0) -
            (baselineAnalysis?.risk_score ?? 0),
        }
        : undefined

      const data = await generateDoctorSummary(
        activeMeds,
        patientContext.patient,
        simInfo,
      )
      setClinicalSummary(data)
    } catch (err) {
      console.error('Failed to generate summary', err)
    } finally {
      setSummaryLoading(false)
    }
  }, [patientContext, simulation, baselineAnalysis])

  const handleSelectTab = useCallback(
    (tab: DashboardTab) => {
      setActiveTab(tab)
      if (tab === 'summary' && !clinicalSummary && patientContext) {
        fetchSummary()
      }
    },
    [clinicalSummary, patientContext, fetchSummary],
  )

  return {
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
    setActiveTab: handleSelectTab,
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
  }
}
