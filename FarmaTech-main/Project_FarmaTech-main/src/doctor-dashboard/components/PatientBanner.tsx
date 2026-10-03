import {
  ShieldAlert,
  AlertCircle,
  Clock,
  Heart,
  Activity,
  Baby,
  User,
  QrCode,
  FileCheck,
} from 'lucide-react'
import type { DoctorPatientContext } from '../types'

interface Props {
  context: DoctorPatientContext
  patientName: string
  patientId: string
  onEditPatientModal: () => void
}

export default function PatientBanner({
  context,
  patientName,
  patientId,
  onEditPatientModal,
}: Props) {
  const { patient, medicines, allergies, source, loadedAt } = context

  const formattedTime = new Date(loadedAt).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  })

  return (
    <div
      id="doctor-patient-banner"
      style={{
        borderRadius: '16px',
        background: 'linear-gradient(135deg, rgba(26, 31, 46, 0.95), rgba(15, 23, 42, 0.98))',
        border: '1px solid rgba(6, 182, 212, 0.25)',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.35)',
        padding: '20px 24px',
        marginBottom: '24px',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '16px',
        }}
      >
        {/* Left: Patient Identification & Demographics */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div
            style={{
              width: 52,
              height: 52,
              borderRadius: '14px',
              background:
                source === 'qr'
                  ? 'linear-gradient(135deg, #06b6d4, #3b82f6)'
                  : 'linear-gradient(135deg, #10b981, #059669)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
              flexShrink: 0,
            }}
          >
            {source === 'qr' ? (
              <QrCode size={26} color="white" />
            ) : (
              <User size={26} color="white" />
            )}
          </div>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
              <h2
                style={{
                  fontSize: '1.25rem',
                  fontWeight: 700,
                  color: '#f8fafc',
                  letterSpacing: '-0.01em',
                }}
              >
                {patientName}
              </h2>
              <span
                style={{
                  fontSize: '0.72rem',
                  padding: '2px 8px',
                  borderRadius: '6px',
                  background: 'rgba(148, 163, 184, 0.15)',
                  color: '#94a3b8',
                  fontWeight: 600,
                  fontFamily: 'monospace',
                }}
              >
                ID: {patientId}
              </span>
              <span
                style={{
                  fontSize: '0.7rem',
                  padding: '2px 10px',
                  borderRadius: '999px',
                  background:
                    source === 'qr'
                      ? 'rgba(6, 182, 212, 0.18)'
                      : 'rgba(16, 185, 129, 0.18)',
                  border: `1px solid ${
                    source === 'qr' ? 'rgba(6, 182, 212, 0.4)' : 'rgba(16, 185, 129, 0.4)'
                  }`,
                  color: source === 'qr' ? '#22d3ee' : '#34d399',
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                }}
              >
                {source === 'qr' ? <QrCode size={11} /> : <FileCheck size={11} />}
                {source === 'qr' ? 'QR Emergency Import' : 'Manual / Clinical Lookup'}
              </span>
            </div>

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                marginTop: '6px',
                flexWrap: 'wrap',
                fontSize: '0.78rem',
                color: '#94a3b8',
              }}
            >
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Clock size={12} color="#64748b" /> Loaded: {formattedTime}
              </span>
              <span>•</span>
              <span style={{ color: '#38bdf8', fontWeight: 600 }}>
                {medicines.length} Current Medication{medicines.length === 1 ? '' : 's'}
              </span>
              <span>•</span>
              <span
                style={{
                  color: allergies.length > 0 ? '#f87171' : '#94a3b8',
                  fontWeight: allergies.length > 0 ? 600 : 400,
                }}
              >
                {allergies.length > 0
                  ? `${allergies.length} Documented Allergies`
                  : 'No Known Drug Allergies (NKDA)'}
              </span>
            </div>
          </div>
        </div>

        {/* Right: Quick Context Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            onClick={onEditPatientModal}
            style={{
              padding: '6px 14px',
              borderRadius: '8px',
              background: 'rgba(51, 65, 85, 0.6)',
              border: '1px solid rgba(148, 163, 184, 0.2)',
              color: '#e2e8f0',
              fontSize: '0.76rem',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Adjust Clinical Factors
          </button>
        </div>
      </div>

      {/* Clinical Risk Conditions & Allergies Bar */}
      <div
        style={{
          marginTop: '16px',
          paddingTop: '14px',
          borderTop: '1px solid rgba(148, 163, 184, 0.1)',
          display: 'flex',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '8px',
        }}
      >
        <span
          style={{
            fontSize: '0.72rem',
            color: '#64748b',
            textTransform: 'uppercase',
            letterSpacing: '0.04em',
            fontWeight: 700,
            marginRight: '4px',
          }}
        >
          Clinical Flags:
        </span>

        {/* Age Group Tag */}
        <span
          style={{
            fontSize: '0.73rem',
            padding: '3px 10px',
            borderRadius: '6px',
            background: 'rgba(59, 130, 246, 0.15)',
            border: '1px solid rgba(59, 130, 246, 0.3)',
            color: '#60a5fa',
            fontWeight: 600,
            textTransform: 'capitalize',
          }}
        >
          Age: {patient.ageGroup}
        </span>

        {/* Pregnancy Tag */}
        {patient.isPregnant && (
          <span
            style={{
              fontSize: '0.73rem',
              padding: '3px 10px',
              borderRadius: '6px',
              background: 'rgba(244, 63, 94, 0.15)',
              border: '1px solid rgba(244, 63, 94, 0.35)',
              color: '#fb7185',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
            }}
          >
            <Baby size={13} />
            Pregnant / Lactating
          </span>
        )}

        {/* Renal Impairment Tag */}
        {patient.hasRenalImpairment && (
          <span
            style={{
              fontSize: '0.73rem',
              padding: '3px 10px',
              borderRadius: '6px',
              background: 'rgba(245, 158, 11, 0.15)',
              border: '1px solid rgba(245, 158, 11, 0.35)',
              color: '#fbbf24',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
            }}
          >
            <AlertCircle size={13} />
            Renal Impairment
          </span>
        )}

        {/* Liver Disease Tag */}
        {patient.hasLiverDisease && (
          <span
            style={{
              fontSize: '0.73rem',
              padding: '3px 10px',
              borderRadius: '6px',
              background: 'rgba(245, 158, 11, 0.15)',
              border: '1px solid rgba(245, 158, 11, 0.35)',
              color: '#fbbf24',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
            }}
          >
            <Activity size={13} />
            Hepatic Impairment
          </span>
        )}

        {/* Cardiac History Tag */}
        {patient.hasCardiacHistory && (
          <span
            style={{
              fontSize: '0.73rem',
              padding: '3px 10px',
              borderRadius: '6px',
              background: 'rgba(244, 63, 94, 0.15)',
              border: '1px solid rgba(244, 63, 94, 0.35)',
              color: '#fb7185',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
            }}
          >
            <Heart size={13} />
            Cardiac / HTN History
          </span>
        )}

        {/* Allergies Highlight Badges */}
        {allergies.length > 0 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginLeft: '6px' }}>
            <span
              style={{
                fontSize: '0.72rem',
                color: '#f87171',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                gap: '3px',
              }}
            >
              <ShieldAlert size={13} />
              Allergies:
            </span>
            {allergies.map((all, i) => (
              <span
                key={i}
                style={{
                  fontSize: '0.73rem',
                  padding: '2px 8px',
                  borderRadius: '6px',
                  background: 'rgba(239, 68, 68, 0.2)',
                  border: '1px solid rgba(239, 68, 68, 0.4)',
                  color: '#fca5a5',
                  fontWeight: 600,
                }}
              >
                {all}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
