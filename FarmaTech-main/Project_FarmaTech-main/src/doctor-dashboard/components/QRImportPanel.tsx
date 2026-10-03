/**
 * QR Import Panel — Doctor Dashboard component for importing patient
 * context via QR code token. Reuses existing QR decoding backend.
 */
import { useState } from 'react'
import { QrCode, Upload, AlertTriangle, CheckCircle2, Camera } from 'lucide-react'
import { decodeQRToken } from '../services/api'

interface Props {
  onImport: (medicines: string[], allergies: string[]) => void
  loading: boolean
}

export default function QRImportPanel({ onImport, loading }: Props) {
  const [token, setToken] = useState('')
  const [error, setError] = useState('')
  const [decoding, setDecoding] = useState(false)

  const handleDecode = async () => {
    if (!token.trim()) return
    setDecoding(true)
    setError('')
    try {
      const data = await decodeQRToken(token.trim())
      if (!data.medicines || data.medicines.length === 0) {
        setError('QR token contained no medications')
        return
      }
      onImport(data.medicines, data.allergies || [])
      setToken('')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to decode QR token')
    } finally {
      setDecoding(false)
    }
  }

  return (
    <div
      style={{
        padding: '24px',
        borderRadius: '16px',
        background: 'linear-gradient(135deg, rgba(26, 31, 46, 0.9), rgba(15, 23, 42, 0.95))',
        border: '1px solid rgba(6, 182, 212, 0.25)',
        boxShadow: '0 4px 24px rgba(0, 0, 0, 0.3)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
        <div
          style={{
            width: 40,
            height: 40,
            borderRadius: '12px',
            background: 'linear-gradient(135deg, #06b6d4, #8b5cf6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 30px rgba(6, 182, 212, 0.15)',
          }}
        >
          <QrCode size={22} color="white" />
        </div>
        <div>
          <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#f1f5f9' }}>
            Import Patient via QR Token
          </h3>
          <p style={{ fontSize: '0.75rem', color: '#64748b' }}>
            Paste the patient's emergency QR token to load their medication context
          </p>
        </div>
      </div>

      <div style={{ marginBottom: '12px' }}>
        <label
          style={{
            fontSize: '0.78rem',
            fontWeight: 600,
            color: '#94a3b8',
            display: 'block',
            marginBottom: '6px',
          }}
        >
          Emergency QR Token:
        </label>
        <textarea
          placeholder="Paste the QR token string here (e.g. eJy...abc.sig123)..."
          value={token}
          onChange={(e) => setToken(e.target.value)}
          style={{
            width: '100%',
            minHeight: '80px',
            padding: '12px 16px',
            background: '#111827',
            border: '1px solid rgba(148, 163, 184, 0.12)',
            borderRadius: '12px',
            color: '#f1f5f9',
            fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif",
            fontSize: '0.88rem',
            resize: 'vertical',
            outline: 'none',
            transition: 'border-color 0.3s',
          }}
          onFocus={(e) => { e.currentTarget.style.borderColor = 'rgba(6, 182, 212, 0.5)' }}
          onBlur={(e) => { e.currentTarget.style.borderColor = 'rgba(148, 163, 184, 0.12)' }}
        />
      </div>

      <button
        onClick={handleDecode}
        disabled={!token.trim() || decoding || loading}
        style={{
          width: '100%',
          height: '44px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px',
          padding: '12px 28px',
          background: 'linear-gradient(135deg, #06b6d4, #8b5cf6)',
          color: 'white',
          fontWeight: 700,
          fontSize: '0.9rem',
          border: 'none',
          borderRadius: '12px',
          cursor: !token.trim() || decoding || loading ? 'not-allowed' : 'pointer',
          opacity: !token.trim() || decoding || loading ? 0.5 : 1,
          transition: 'all 0.3s',
        }}
      >
        {decoding ? (
          <>
            <Camera size={16} className="animate-spin" /> Decoding Token...
          </>
        ) : (
          <>
            <Upload size={16} /> Import Patient from QR
          </>
        )}
      </button>

      {error && (
        <div
          style={{
            marginTop: '12px',
            padding: '12px',
            borderRadius: '8px',
            background: 'rgba(244, 63, 94, 0.15)',
            border: '1px solid rgba(244, 63, 94, 0.3)',
            color: '#fca5a5',
            fontSize: '0.82rem',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
          }}
        >
          <AlertTriangle size={14} />
          {error}
        </div>
      )}

      <div
        style={{
          marginTop: '16px',
          padding: '12px',
          borderRadius: '8px',
          background: 'rgba(16, 185, 129, 0.08)',
          border: '1px solid rgba(16, 185, 129, 0.2)',
          fontSize: '0.75rem',
          color: '#6ee7b7',
          display: 'flex',
          alignItems: 'flex-start',
          gap: '8px',
        }}
      >
        <CheckCircle2 size={14} style={{ marginTop: '2px', flexShrink: 0 }} />
        <span>
          QR tokens are verified using HMAC-SHA256 signatures. Tampered tokens will be rejected.
          Patient data is loaded read-only — no modifications are saved.
        </span>
      </div>
    </div>
  )
}
