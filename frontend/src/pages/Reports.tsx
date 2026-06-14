import { useEffect, useState, useCallback } from 'react';
import { getMonthlySummary } from '../services/api';
import type { MonthlySummary } from '../types';
import ErrorState from '../components/ErrorState';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { TrendingUp, TrendingDown } from 'lucide-react';

const CAT_LABEL: Record<string, string> = {
  food: 'Food', transport: 'Transport', shopping: 'Shopping',
  entertainment: 'Entertain.', health: 'Health', utilities: 'Utilities', other: 'Other',
};
const CAT_COLOR: Record<string, string> = {
  food: '#818cf8', transport: '#fbbf24', shopping: '#f472b6',
  entertainment: '#34d399', health: '#60a5fa', utilities: '#fb923c', other: '#a78bfa',
};

const BarTip = ({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number; name: string; color: string }>; label?: string }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: '#0f1117', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, padding: '10px 14px', boxShadow: '0 8px 32px rgba(0,0,0,0.5)' }}>
      <p style={{ fontSize: 11, color: '#6b7280', marginBottom: 6, fontWeight: 600 }}>{label}</p>
      {payload.map(p => (
        <p key={p.name} style={{ fontSize: 12, color: p.name === 'Spent' ? p.color : '#374151', marginTop: 2 }}>
          {p.name}: £{p.value?.toFixed(2)}
        </p>
      ))}
    </div>
  );
};

export default function Reports() {
  const [current, setCurrent] = useState<MonthlySummary | null>(null);
  const [prev, setPrev] = useState<MonthlySummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const now = new Date();
  const year = now.getFullYear(), month = now.getMonth() + 1;
  const prevMonth = month === 1 ? 12 : month - 1;
  const prevYear = month === 1 ? year - 1 : year;

  const fetchData = useCallback(() => {
    setLoading(true);
    setError(false);
    Promise.all([getMonthlySummary(year, month), getMonthlySummary(prevYear, prevMonth)])
      .then(([c, p]) => { setCurrent(c); setPrev(p); })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [year, month, prevYear, prevMonth]);

  useEffect(() => { fetchData(); }, [fetchData]);

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
      <p style={{ color: '#374151', fontSize: 13 }}>Loading...</p>
    </div>
  );
  if (error || !current || !prev) return <ErrorState message="Failed to load reports" onRetry={fetchData} />;

  const diff = current.totalSpent - prev.totalSpent;
  const diffPct = prev.totalSpent > 0 ? ((diff / prev.totalSpent) * 100).toFixed(1) : '0';
  const isUp = diff > 0;

  const barData = Object.entries(current.byCategory).map(([cat, value]) => ({
    name: CAT_LABEL[cat] ?? cat,
    Spent: value,
    Budget: current.budgets.find(b => b.category === cat)?.limit ?? 0,
    color: CAT_COLOR[cat] ?? '#818cf8',
  }));

  return (
    <div className="page-wrap" style={{ padding: '36px 40px', maxWidth: 1000 }}>
      <div style={{ marginBottom: 32 }}>
        <p style={{ fontSize: 11, fontWeight: 600, color: '#374151', letterSpacing: '0.1em', marginBottom: 6 }}>ANALYTICS</p>
        <h1 style={{ fontSize: 28, fontWeight: 800, color: '#f8fafc', letterSpacing: '-0.02em' }}>Reports</h1>
      </div>

      <div className="stat-grid-3" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14, marginBottom: 20 }}>
        <div className="stat-card" style={{ padding: 22 }}>
          <p style={{ fontSize: 11, fontWeight: 600, color: '#374151', letterSpacing: '0.06em', marginBottom: 14 }}>THIS MONTH</p>
          <p className="gradient-text num-glow" style={{ fontSize: 28, fontWeight: 800, letterSpacing: '-0.02em' }}>
            £{current.totalSpent.toFixed(2)}
          </p>
        </div>
        <div className="stat-card" style={{ padding: 22 }}>
          <p style={{ fontSize: 11, fontWeight: 600, color: '#374151', letterSpacing: '0.06em', marginBottom: 14 }}>LAST MONTH</p>
          <p style={{ fontSize: 28, fontWeight: 800, color: '#f8fafc', letterSpacing: '-0.02em' }}>
            £{prev.totalSpent.toFixed(2)}
          </p>
        </div>
        <div className="stat-card" style={{ padding: 22 }}>
          <p style={{ fontSize: 11, fontWeight: 600, color: '#374151', letterSpacing: '0.06em', marginBottom: 14 }}>CHANGE</p>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ background: isUp ? 'rgba(239,68,68,0.1)' : 'rgba(52,211,153,0.1)', borderRadius: 8, padding: '5px' }}>
              {isUp ? <TrendingUp size={14} color="#ef4444" /> : <TrendingDown size={14} color="#34d399" />}
            </div>
            <p style={{ fontSize: 26, fontWeight: 800, letterSpacing: '-0.02em', color: isUp ? '#ef4444' : '#34d399', filter: `drop-shadow(0 0 10px ${isUp ? 'rgba(239,68,68,0.35)' : 'rgba(52,211,153,0.35)'})` }}>
              {isUp ? '+' : ''}{diffPct}%
            </p>
          </div>
          <p style={{ fontSize: 11, color: '#374151', marginTop: 6 }}>
            {isUp ? '+' : ''}£{diff.toFixed(2)} vs last month
          </p>
        </div>
      </div>

      <div className="glass" style={{ padding: '24px 24px 16px', marginBottom: 16 }}>
        <div style={{ marginBottom: 20 }}>
          <p style={{ fontSize: 14, fontWeight: 600, color: '#f8fafc', letterSpacing: '-0.01em' }}>Spent vs Budget</p>
          <p style={{ fontSize: 11, color: '#374151', marginTop: 3 }}>By category — this month</p>
        </div>
        <ResponsiveContainer width="100%" height={240}>
          <BarChart data={barData} margin={{ top: 5, right: 10, left: -18, bottom: 5 }} barGap={4}>
            <CartesianGrid stroke="rgba(255,255,255,0.03)" vertical={false} />
            <XAxis dataKey="name" tick={{ fill: '#374151', fontSize: 11, fontFamily: 'Inter' }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: '#374151', fontSize: 11, fontFamily: 'Inter' }} axisLine={false} tickLine={false} tickFormatter={v => `£${v}`} />
            <Tooltip content={<BarTip />} cursor={{ fill: 'rgba(255,255,255,0.02)' }} />
            <Bar dataKey="Spent" radius={[6, 6, 0, 0]} maxBarSize={28}>
              {barData.map(e => <Cell key={e.name} fill={e.color} fillOpacity={0.85} />)}
            </Bar>
            <Bar dataKey="Budget" radius={[6, 6, 0, 0]} fill="rgba(255,255,255,0.04)" maxBarSize={28} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="glass" style={{ padding: 24 }}>
        <p style={{ fontSize: 14, fontWeight: 600, color: '#f8fafc', letterSpacing: '-0.01em', marginBottom: 18 }}>Category Breakdown</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {Object.entries(current.byCategory)
            .sort((a, b) => b[1] - a[1])
            .map(([cat, value]) => {
              const budget = current.budgets.find(b => b.category === cat)?.limit ?? 0;
              const pct = budget > 0 ? Math.min((value / budget) * 100, 100) : 0;
              const col = CAT_COLOR[cat] ?? '#818cf8';
              return (
                <div key={cat} style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                  <div style={{ width: 7, height: 7, borderRadius: '50%', background: col, flexShrink: 0, boxShadow: `0 0 6px ${col}` }} />
                  <span style={{ fontSize: 12, color: '#6b7280', width: 90, flexShrink: 0 }}>{CAT_LABEL[cat] ?? cat}</span>
                  <div style={{ flex: 1, height: 4, background: 'rgba(255,255,255,0.05)', borderRadius: 99, overflow: 'hidden' }}>
                    <div style={{ width: `${pct}%`, height: '100%', background: col, borderRadius: 99, opacity: 0.75, boxShadow: `0 0 8px ${col}55`, transition: 'width 0.7s cubic-bezier(0.4,0,0.2,1)' }} />
                  </div>
                  <span style={{ fontSize: 13, fontWeight: 700, color: '#e2e8f0', width: 70, textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>
                    £{value.toFixed(2)}
                  </span>
                </div>
              );
            })}
        </div>
      </div>
    </div>
  );
}
