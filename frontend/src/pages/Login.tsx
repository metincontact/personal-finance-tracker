import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login } from '../services/api';
import { Lock } from 'lucide-react';

export default function Login() {
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password) { setError('Enter your password'); return; }
    setLoading(true);
    setError(null);
    try {
      const { token } = await login(password);
      localStorage.setItem('auth_token', token);
      navigate('/');
    } catch {
      setError('Incorrect password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#080c14' }}>
      <div className="glass" style={{ width: 380, padding: '40px 36px', borderRadius: 20, border: '1px solid rgba(255,255,255,0.08)' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 32 }}>
          <div style={{ width: 48, height: 48, borderRadius: 14, background: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}>
            <Lock size={22} color="#818cf8" />
          </div>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: '#f8fafc', letterSpacing: '-0.02em', marginBottom: 6 }}>Finance Tracker</h1>
          <p style={{ fontSize: 13, color: '#374151' }}>Enter your password to continue</p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <label style={{ fontSize: 11, fontWeight: 600, color: '#374151', letterSpacing: '0.07em', display: 'block', marginBottom: 7 }}>PASSWORD</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              autoFocus
              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.09)', borderRadius: 10, color: '#f8fafc', fontSize: 14, padding: '11px 14px', outline: 'none', width: '100%', fontFamily: 'Inter, sans-serif', boxSizing: 'border-box', letterSpacing: '0.1em' }}
            />
          </div>

          {error && (
            <p style={{ fontSize: 12, color: '#ef4444', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.15)', borderRadius: 8, padding: '8px 12px' }}>
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{ background: loading ? 'rgba(99,102,241,0.1)' : 'rgba(99,102,241,0.2)', border: '1px solid rgba(99,102,241,0.35)', borderRadius: 12, color: loading ? '#4b5563' : '#a5b4fc', fontSize: 14, fontWeight: 700, padding: '13px', cursor: loading ? 'not-allowed' : 'pointer', fontFamily: 'Inter, sans-serif', width: '100%', transition: 'all 0.15s', letterSpacing: '0.02em', marginTop: 4 }}
            onMouseEnter={e => { if (!loading) e.currentTarget.style.background = 'rgba(99,102,241,0.3)'; }}
            onMouseLeave={e => { if (!loading) e.currentTarget.style.background = 'rgba(99,102,241,0.2)'; }}
          >
            {loading ? 'Signing in…' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  );
}
