import { CheckCircle, AlertCircle } from 'lucide-react';
import type { Toast } from '../hooks/useToast';

interface Props {
  toasts: Toast[];
}

export default function ToastStack({ toasts }: Props) {
  if (toasts.length === 0) return null;
  return (
    <div style={{ position: 'fixed', top: 24, right: 24, zIndex: 200, display: 'flex', flexDirection: 'column', gap: 10 }}>
      {toasts.map(t => (
        <div
          key={t.id}
          style={{
            display: 'flex', alignItems: 'center', gap: 10,
            background: t.type === 'success' ? 'rgba(52,211,153,0.08)' : 'rgba(239,68,68,0.08)',
            border: `1px solid ${t.type === 'success' ? 'rgba(52,211,153,0.2)' : 'rgba(239,68,68,0.2)'}`,
            borderRadius: 14,
            padding: '12px 18px',
            backdropFilter: 'blur(20px)',
            boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
            minWidth: 220,
            animation: 'toast-in 0.2s ease',
          }}
        >
          {t.type === 'success'
            ? <CheckCircle size={14} color="#34d399" style={{ flexShrink: 0 }} />
            : <AlertCircle size={14} color="#ef4444" style={{ flexShrink: 0 }} />
          }
          <span style={{ fontSize: 13, fontWeight: 500, color: t.type === 'success' ? '#a7f3d0' : '#fca5a5' }}>
            {t.message}
          </span>
        </div>
      ))}
    </div>
  );
}
