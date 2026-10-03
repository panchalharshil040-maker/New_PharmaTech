/**
 * Doctor Dashboard API service.
 *
 * REUSES the existing api.ts functions (checkMedicines, simulateMedicine,
 * generateQRToken, explainFindings, searchDrugs) for all shared functionality.
 * Only adds Doctor-Dashboard-specific API calls here.
 */
import type { PatientProfile } from '../types'
import type { DoctorSummaryResponse } from '../types'
export { checkMedicines, simulateMedicine, generateQRToken, explainFindings, searchDrugs } from '../../api'

const BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:8000'

async function request<T>(path: string, options?: RequestInit, timeoutMs = 8000): Promise<T> {
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs)
  try {
    const res = await fetch(`${BASE}${path}`, {
      ...options,
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        ...(options?.headers ?? {}),
      },
    })
    clearTimeout(timeoutId)
    if (!res.ok) {
      const body = await res.json().catch(() => ({}))
      throw new Error(body.detail ?? `API error ${res.status}`)
    }
    return res.json()
  } catch (err) {
    clearTimeout(timeoutId)
    throw err
  }
}

/**
 * Decode a QR token to extract patient medicines and allergies.
 * Uses the NEW /api/qr/decode endpoint (reuses existing backend QR logic).
 */
export async function decodeQRToken(token: string): Promise<{ medicines: string[]; allergies: string[] }> {
  return request('/api/qr/decode', {
    method: 'POST',
    body: JSON.stringify({ token }),
  })
}

/**
 * Generate a clinical summary for the doctor dashboard.
 * Uses the NEW /api/doctor/summary endpoint.
 */
export async function generateDoctorSummary(
  medicines: string[],
  patient?: PatientProfile,
  simulation?: { added: string[]; removed: string[]; before_score?: number; after_score?: number; delta?: number },
): Promise<DoctorSummaryResponse> {
  return request('/api/doctor/summary', {
    method: 'POST',
    body: JSON.stringify({ medicines, patient, simulation }),
  }, 10000)
}
