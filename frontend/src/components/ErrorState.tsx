import { AlertCircle, RefreshCw } from 'lucide-react';

interface Props {
  message?: string;
  onRetry?: () => void;
}

export default function ErrorState({ message = 'Failed to load data', onRetry }: Props) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
      <div style={{
        background: 'rgba(239,68,68,0.06)',
        border: '1px solid rgba(239,68,68,0.14)',
        borderRadius: 20,
        padding: '40px 48px',
        textAlign: 'center',
        maxWidth: 360,
      }}>
        <div style={{ background: 'rgba(239,68,68,0.1)', borderRadius: 14, width: 52, height: 52, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
          <AlertCircle size={24} color="#ef4444" />
        </div>
        <p style={{ color: '#fca5a5', fontSize: 15, fontWeight: 700, marginBottom: 6 }}>{message}</p>
        <p style={{ color: '#374151', fontSize: 12, lineHeight: 1.6, marginBottom: onRetry ? 24 : 0 }}>
          Make sure the backend is running on port 3000
        </p>
        {onRetry && (
          <button
            onClick={onRetry}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 7,
              background: 'rgba(239,68,68,0.1)',
              border: '1px solid rgba(239,68,68,0.2)',
              borderRadius: 10,
              color: '#fca5a5',
              fontSize: 13, fontWeight: 600,
              padding: '9px 20px',
              cursor: 'pointer',
              fontFamily: 'Inter, sans-serif',
              transition: 'background 0.15s',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.18)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.1)'; }}
          >
            <RefreshCw size={13} />
            Try again
          </button>
        )}
      </div>
    </div>
  );
}
