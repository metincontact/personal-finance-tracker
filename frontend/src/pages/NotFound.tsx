import { useNavigate } from 'react-router-dom';

export default function NotFound() {
  const navigate = useNavigate();
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh', gap: 16, textAlign: 'center', padding: 24 }}>
      <p style={{ fontSize: 64, fontWeight: 900, color: 'rgba(99,102,241,0.3)', lineHeight: 1, letterSpacing: '-0.04em' }}>404</p>
      <h1 style={{ fontSize: 22, fontWeight: 700, color: '#f8fafc', letterSpacing: '-0.02em' }}>Page not found</h1>
      <p style={{ fontSize: 13, color: '#374151', maxWidth: 280 }}>The page you're looking for doesn't exist.</p>
      <button
        onClick={() => navigate('/')}
        style={{ marginTop: 8, background: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.3)', borderRadius: 12, color: '#a5b4fc', fontSize: 13, fontWeight: 600, padding: '10px 20px', cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}
      >
        Go to Dashboard
      </button>
    </div>
  );
}
