/**
 * Doctor Dashboard-specific types.
 * Reuses existing types from the main app via re-export where possible.
 */
import type {
  CheckResponse,
  Finding,
  PatientProfile,
  SimulateResponse,
  RiskLevel,
} from '../types'

// Re-export for convenience
export type { CheckResponse, Finding, PatientProfile, SimulateResponse, RiskLevel }

/** The loaded patient context in the Doctor Dashboard */
export interface DoctorPatientContext {
  medicines: string[]
  allergies: string[]
  patient: PatientProfile
  source: 'qr' | 'manual'
  loadedAt: number
}

/** What-if simulation state (temporary, never persisted) */
export interface SimulationState {
  /** Medicines added in simulation (not in original list) */
  added: string[]
  /** Medicines removed in simulation (still in original list, just excluded) */
  removed: string[]
  /** Dosage/frequency adjustments (display-only annotations) */
  adjustments: Record<string, string>
  /** The effective medication list after simulation changes */
  effectiveMedicines: string[]
  /** Analysis result of the simulated medication list */
  analysisResult: CheckResponse | null
  /** The original analysis before simulation */
  originalResult: CheckResponse | null
}

/** Clinical summary response from /api/doctor/summary */
export interface DoctorSummaryResponse {
  summary: string
  risk_score: number
  risk_level: RiskLevel
  findings_count: number
  medicines_count: number
  unresolved_count: number
}

/** Dashboard tab identifiers */
export type DashboardTab = 'overview' | 'safety' | 'simulate' | 'summary'
