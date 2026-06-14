import { useEffect, useState, useCallback } from 'react';
import { getMonthlySummary, getMonthlyTrend } from '../services/api';
import type { MonthlySummary } from '../types';
import ErrorState from '../components/ErrorState';
import Skeleton from '../components/Skeleton';
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
} from 'recharts';
import { TrendingUp, TrendingDown, ShoppingBag, Zap, ArrowUpRight } from 'lucide-react';

function DashboardSkeleton() {
  return (
    <div className="page-wrap" style={{ padding: '36px 40px', maxWidth: 1080 }}>
      <div style={{ marginBottom: 32 }}>
        <Skeleton width={56} height={10} style={{ marginBottom: 10 }} />
        <Skeleton width={140} height={28} />
      </div>
      <div className="stat-grid-4" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24 }}>
        {[0, 1, 2, 3].map(i => (
          <div key={i} className="stat-card" style={{ padding: 22 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
              <Skeleton width={80} height={10} />
              <Skeleton width={28} height={28} radius={8} />
            </div>
            <Skeleton width={110} height={26} style={{ marginBottom: 12 }} />
            <Skeleton width={70} height={10} />
          </div>
        ))}
      </div>
      <div className="chart-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 16 }}>
        <div className="glass" style={{ padding: '24px 24px 16px' }}>
          <Skeleton width={130} height={14} style={{ marginBottom: 8 }} />
          <Skeleton width={80} height={10} style={{ marginBottom: 24 }} />
          <Skeleton height={210} radius={12} />
        </div>
        <div className="glass" style={{ padding: 24 }}>
          <Skeleton width={100} height={14} style={{ marginBottom: 8 }} />
          <Skeleton width={70} height={10} style={{ marginBottom: 20 }} />
          <Skeleton width={120} height={120} radius={60} style={{ margin: '0 auto 20px' }} />
          {[0, 1, 2, 3].map(i => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
              <Skeleton width={100} height={11} />
              <Skeleton width={36} height={11} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

const CAT_COLOR: Record<string, string> = {
  food: '#818cf8', transport: '#fbbf24', shopping: '#f472b6',
  entertainment: '#34d399', health: '#60a5fa', utilities: '#fb923c', other: '#a78bfa',
};
const CAT_LABEL: Record<string, string> = {
  food: 'Food & Drink', transport: 'Transport', shopping: 'Shopping',
  entertainment: 'Entertainment', health: 'Health', utilities: 'Utilities', other: 'Other',
};
const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

const ChartTip = ({ active, payload }: { active?: boolean; payload?: Array<{ value: number }> }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: '#0f1117', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, padding: '8px 14px', boxShadow: '0 8px 32px rgba(0,0,0,0.4)' }}>
      <p style={{ color: '#818cf8', fontWeight: 600, fontSize: 13 }}>£{payload[0]?.value?.toFixed(2)}</p>
    </div>
  );
};

const PieTip = ({ active, payload }: { active?: boolean; payload?: Array<{ name: string; value: number; payload: { color: string } }> }) => {
  if (!active || !payload?.length) return null;
  const d = payload[0]!;
  return (
    <div style={{ background: '#0f1117', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, padding: '8px 14px', boxShadow: '0 8px 32px rgba(0,0,0,0.4)' }}>
      <p style={{ color: d.payload.color, fontWeight: 600, fontSize: 12 }}>{d.name}</p>
      <p style={{ color: '#e2e8f0', fontSize: 13, marginTop: 2 }}>£{d.value.toFixed(2)}</p>
    </div>
  );
};

export default function Dashboard() {
  const [summary, setSummary] = useState<MonthlySummary | null>(null);
  const [trendData, setTrendData] = useState<{ m: string; v: number }[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const now = new Date();
  const year = now.getFullYear(), month = now.getMonth() + 1;

  const fetchData = useCallback(() => {
    setLoading(true);
    setError(false);
    Promise.all([
      getMonthlySummary(year, month),
      getMonthlyTrend(6),
    ])
      .then(([s, t]) => { setSummary(s); setTrendData(t); })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [year, month]);

  useEffect(() => { fetchData(); }, [fetchData]);

  if (loading) return <DashboardSkeleton />;
  if (error || !summary) return <ErrorState message="Failed to load dashboard" onRetry={fetchData} />;

  const pieData = Object.entries(summary.byCategory).map(([cat, value]) => ({
    name: CAT_LABEL[cat] ?? cat, value, color: CAT_COLOR[cat] ?? '#818cf8',
  }));
  const topEntry = Object.entries(summary.byCategory).sort((a, b) => b[1] - a[1])[0];
  const totalBudget = summary.budgets.reduce((s, b) => s + b.limit, 0);
  const remaining = totalBudget - summary.totalSpent;
  const budgetPct = totalBudget > 0 ? (summary.totalSpent / totalBudget) * 100 : 0;

  return (
    <div className="page-wrap" style={{ padding: '36px 40px', maxWidth: 1080 }}>
      <div style={{ marginBottom: 32 }}>
        <p style={{ fontSize: 11, fontWeight: 600, color: '#374151', letterSpacing: '0.1em', marginBottom: 6 }}>
          {MONTHS[month - 1]?.toUpperCase()} {year}
        </p>
        <h1 style={{ fontSize: 28, fontWeight: 800, color: '#f8fafc', letterSpacing: '-0.02em', lineHeight: 1.1 }}>
          Overview
        </h1>
      </div>

      <div className="stat-grid-4" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24 }}>
        <div className="stat-card" style={{ padding: 22 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
            <p style={{ fontSize: 11, fontWeight: 500, color: '#374151', letterSpacing: '0.04em' }}>TOTAL SPENT</p>
            <div style={{ background: 'rgba(99,102,241,0.12)', borderRadius: 8, padding: 6 }}>
              <TrendingUp size={13} color="#818cf8" />
            </div>
          </div>
          <p className="gradient-text num-glow" style={{ fontSize: 26, fontWeight: 800, letterSpacing: '-0.02em', lineHeight: 1 }}>
            £{summary.totalSpent.toFixed(2)}
          </p>
          <p style={{ fontSize: 11, color: '#374151', marginTop: 10, display: 'flex', alignItems: 'center', gap: 4 }}>
            <ArrowUpRight size={11} color="#ef4444" /> This month
          </p>
        </div>

        <div className="stat-card" style={{ padding: 22 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
            <p style={{ fontSize: 11, fontWeight: 500, color: '#374151', letterSpacing: '0.04em' }}>REMAINING</p>
            <div style={{ background: 'rgba(16,185,129,0.12)', borderRadius: 8, padding: 6 }}>
              <TrendingDown size={13} color="#34d399" />
            </div>
          </div>
          <p style={{ fontSize: 26, fontWeight: 800, letterSpacing: '-0.02em', lineHeight: 1, color: remaining >= 0 ? '#34d399' : '#ef4444', filter: `drop-shadow(0 0 10px ${remaining >= 0 ? 'rgba(52,211,153,0.3)' : 'rgba(239,68,68,0.3)'})` }}>
            £{Math.abs(remaining).toFixed(2)}
          </p>
          <p style={{ fontSize: 11, color: '#374151', marginTop: 10 }}>of £{totalBudget} budget</p>
        </div>

        <div className="stat-card" style={{ padding: 22 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
            <p style={{ fontSize: 11, fontWeight: 500, color: '#374151', letterSpacing: '0.04em' }}>TOP CATEGORY</p>
            <div style={{ background: 'rgba(244,114,182,0.12)', borderRadius: 8, padding: 6 }}>
              <ShoppingBag size={13} color="#f472b6" />
            </div>
          </div>
          <p style={{ fontSize: 22, fontWeight: 800, letterSpacing: '-0.02em', lineHeight: 1.1, color: '#f8fafc' }}>
            {topEntry ? (CAT_LABEL[topEntry[0]] ?? topEntry[0]) : '—'}
          </p>
          <p style={{ fontSize: 11, color: '#374151', marginTop: 10 }}>
            £{topEntry ? topEntry[1].toFixed(2) : '0'} spent
          </p>
        </div>

        <div className="stat-card" style={{ padding: 22 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
            <p style={{ fontSize: 11, fontWeight: 500, color: '#374151', letterSpacing: '0.04em' }}>BUDGET USED</p>
            <div style={{ background: 'rgba(251,191,36,0.12)', borderRadius: 8, padding: 6 }}>
              <Zap size={13} color="#fbbf24" />
            </div>
          </div>
          <p style={{ fontSize: 26, fontWeight: 800, letterSpacing: '-0.02em', lineHeight: 1, color: '#fbbf24', filter: 'drop-shadow(0 0 10px rgba(251,191,36,0.3))' }}>
            {budgetPct.toFixed(0)}%
          </p>
          <div className="bar-track" style={{ height: 4, marginTop: 14 }}>
            <div className="bar-fill" style={{ width: `${Math.min(budgetPct, 100)}%` }} />
          </div>
        </div>
      </div>

      <div className="chart-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 16 }}>
        <div className="glass" style={{ padding: '24px 24px 16px' }}>
          <div style={{ marginBottom: 20 }}>
            <p style={{ fontSize: 14, fontWeight: 600, color: '#f8fafc', letterSpacing: '-0.01em' }}>Spending Trend</p>
            <p style={{ fontSize: 11, color: '#374151', marginTop: 3 }}>Last 6 months</p>
          </div>
          <ResponsiveContainer width="100%" height={210}>
            <AreaChart data={trendData} margin={{ top: 10, right: 10, left: -18, bottom: 0 }}>
              <defs>
                <linearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#6366f1" stopOpacity={0.25} />
                  <stop offset="100%" stopColor="#6366f1" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="rgba(255,255,255,0.03)" vertical={false} />
              <XAxis dataKey="m" tick={{ fill: '#374151', fontSize: 11, fontFamily: 'Inter' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#374151', fontSize: 11, fontFamily: 'Inter' }} axisLine={false} tickLine={false} tickFormatter={(v) => `£${v}`} />
              <Tooltip content={<ChartTip />} />
              <Area type="monotone" dataKey="v" stroke="#818cf8" strokeWidth={2} fill="url(#grad)"
                dot={{ fill: '#818cf8', r: 3, strokeWidth: 0 }}
                activeDot={{ r: 5, fill: '#c4b5fd', strokeWidth: 0 }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="glass" style={{ padding: 24 }}>
          <p style={{ fontSize: 14, fontWeight: 600, color: '#f8fafc', letterSpacing: '-0.01em', marginBottom: 4 }}>By Category</p>
          <p style={{ fontSize: 11, color: '#374151', marginBottom: 16 }}>This month</p>
          <ResponsiveContainer width="100%" height={150}>
            <PieChart>
              <Pie data={pieData} dataKey="value" cx="50%" cy="50%" innerRadius={42} outerRadius={68} paddingAngle={3} strokeWidth={0}>
                {pieData.map((e) => <Cell key={e.name} fill={e.color} opacity={0.9} />)}
              </Pie>
              <Tooltip content={<PieTip />} />
            </PieChart>
          </ResponsiveContainer>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 9, marginTop: 12 }}>
            {pieData.slice(0, 5).map((d) => (
              <div key={d.name} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ width: 6, height: 6, borderRadius: '50%', background: d.color, flexShrink: 0, boxShadow: `0 0 6px ${d.color}` }} />
                  <span style={{ fontSize: 12, color: '#6b7280' }}>{d.name}</span>
                </div>
                <span style={{ fontSize: 12, fontWeight: 600, color: '#e2e8f0', fontVariantNumeric: 'tabular-nums' }}>£{d.value.toFixed(0)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
