import { NavLink } from 'react-router-dom';
import { LayoutDashboard, ArrowLeftRight, Target, BarChart3, Wallet, Radio, X } from 'lucide-react';
import { useCurrency, CURRENCIES } from '../context/CurrencyContext';
import type { CurrencyCode } from '../context/CurrencyContext';

const links = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/transactions', label: 'Transactions', icon: ArrowLeftRight, end: false },
  { to: '/budget', label: 'Budget', icon: Target, end: false },
  { to: '/reports', label: 'Reports', icon: BarChart3, end: false },
];

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export default function Sidebar({ isOpen, onClose }: Props) {
  const { currency, setCurrency } = useCurrency();

  return (
    <>
      <div
        className="sidebar-overlay"
        onClick={onClose}
        style={{
          display: 'none',
          position: 'fixed', inset: 0, zIndex: 39,
          background: 'rgba(0,0,0,0.5)',
          backdropFilter: 'blur(4px)',
        }}
      />

      <aside
        className={`sidebar-nav${isOpen ? ' sidebar-open' : ''}`}
        style={{
          width: 240,
          minHeight: '100vh',
          position: 'fixed',
          left: 0, top: 0, zIndex: 40,
          background: 'rgba(6, 8, 16, 0.95)',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
          borderRight: '1px solid rgba(255,255,255,0.06)',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <div style={{ padding: '28px 20px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{
              width: 36, height: 36, borderRadius: 10,
              background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
              boxShadow: '0 0 24px rgba(99, 102, 241, 0.45)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            }}>
              <Wallet size={16} color="white" />
            </div>
            <div>
              <p style={{ fontSize: 14, fontWeight: 700, color: '#f1f5f9', letterSpacing: '-0.01em' }}>Finance</p>
              <p style={{ fontSize: 11, color: '#4b5563', marginTop: 1, fontWeight: 500 }}>Personal Tracker</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="mobile-hamburger"
            style={{ display: 'none', background: 'none', border: 'none', cursor: 'pointer', padding: 4, alignItems: 'center' }}
          >
            <X size={18} color="#374151" />
          </button>
        </div>

        <div className="divider" style={{ margin: '0 16px' }} />

        <nav style={{ flex: 1, padding: '16px 10px', display: 'flex', flexDirection: 'column', gap: 2 }}>
          <p style={{ fontSize: 10, fontWeight: 600, color: '#374151', letterSpacing: '0.1em', padding: '0 8px', marginBottom: 8 }}>
            NAVIGATION
          </p>
          {links.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              onClick={onClose}
              style={{ textDecoration: 'none' }}
              className={({ isActive }) => `${isActive ? 'nav-active' : 'nav-inactive'}`}
            >
              {({ isActive }) => (
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 12px', borderRadius: 10, fontSize: 13, fontWeight: 500 }}>
                  <Icon size={15} color={isActive ? '#818cf8' : '#374151'} strokeWidth={isActive ? 2 : 1.75} />
                  <span>{label}</span>
                </div>
              )}
            </NavLink>
          ))}
        </nav>

        <div style={{ padding: '0 12px 16px' }}>
          <p style={{ fontSize: 10, fontWeight: 600, color: '#374151', letterSpacing: '0.1em', padding: '0 4px', marginBottom: 8 }}>CURRENCY</p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 4 }}>
            {CURRENCIES.map(c => (
              <button
                key={c.code}
                onClick={() => setCurrency(c.code as CurrencyCode)}
                style={{
                  background: currency === c.code ? 'rgba(99,102,241,0.2)' : 'rgba(255,255,255,0.03)',
                  border: `1px solid ${currency === c.code ? 'rgba(99,102,241,0.5)' : 'rgba(255,255,255,0.07)'}`,
                  borderRadius: 8, padding: '6px 4px', cursor: 'pointer',
                  color: currency === c.code ? '#a5b4fc' : '#374151',
                  fontSize: 11, fontWeight: 600, fontFamily: 'Inter, sans-serif',
                  transition: 'all 0.15s',
                }}
              >
                {c.symbol} {c.code}
              </button>
            ))}
          </div>
        </div>

        <div style={{ padding: '0 12px 24px' }}>
          <div style={{
            background: 'linear-gradient(135deg, rgba(99,102,241,0.08) 0%, rgba(168,85,247,0.05) 100%)',
            border: '1px solid rgba(99,102,241,0.15)',
            borderRadius: 14, padding: '12px 14px',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
              <Radio size={12} color="#10b981" />
              <span style={{ fontSize: 12, fontWeight: 600, color: '#a5b4fc' }}>Erste Bank</span>
              <div style={{ marginLeft: 'auto', width: 6, height: 6, borderRadius: '50%', background: '#10b981', boxShadow: '0 0 8px #10b981' }} />
            </div>
            <p style={{ fontSize: 11, color: '#4b5563', lineHeight: 1.5 }}>
              Import PDF from Transactions to sync your data
            </p>
          </div>
        </div>
      </aside>
    </>
  );
}
