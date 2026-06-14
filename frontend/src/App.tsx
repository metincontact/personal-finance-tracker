import { useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import Transactions from './pages/Transactions';
import BudgetPage from './pages/Budget';
import Reports from './pages/Reports';
import NotFound from './pages/NotFound';
import { Menu, Wallet } from 'lucide-react';

export default function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <BrowserRouter>
      <div style={{ background: '#07080e', minHeight: '100vh' }}>
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        <div
          className="mobile-hamburger"
          style={{
            display: 'none',
            position: 'fixed', top: 0, left: 0, right: 0, zIndex: 38,
            height: 56,
            background: 'rgba(6,8,16,0.9)',
            backdropFilter: 'blur(20px)',
            borderBottom: '1px solid rgba(255,255,255,0.06)',
            alignItems: 'center',
            padding: '0 16px',
            gap: 12,
          }}
        >
          <button
            onClick={() => setSidebarOpen(true)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 6, display: 'flex', alignItems: 'center' }}
          >
            <Menu size={20} color="#6b7280" />
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 26, height: 26, borderRadius: 7, background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Wallet size={12} color="white" />
            </div>
            <span style={{ fontSize: 13, fontWeight: 700, color: '#f1f5f9' }}>Finance Tracker</span>
          </div>
        </div>

        <main
          className="main-content"
          style={{ marginLeft: '240px', minHeight: '100vh', overflowY: 'auto' }}
        >
          <div className="mobile-hamburger" style={{ display: 'none', height: 56 }} />

          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/transactions" element={<Transactions />} />
            <Route path="/budget" element={<BudgetPage />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}
