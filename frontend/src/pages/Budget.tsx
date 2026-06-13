import { useEffect, useState, useCallback } from 'react';
import { getBudgets, updateBudget } from '../services/api';
import type { Budget } from '../types';
import { AlertTriangle, CheckCircle, Pencil, X, Check } from 'lucide-react';
import ErrorState from '../components/ErrorState';
import ToastStack from '../components/ToastStack';
import { useToast } from '../hooks/useToast';

const LABEL: Record<string, string> = {
  food: 'Food & Drink', transport: 'Transport', shopping: 'Shopping',
  entertainment: 'Entertainment', health: 'Health', utilities: 'Utilities', other: 'Other',
};
const EMOJI: Record<string, string> = {
  food: '🍽️', transport: '🚇', shopping: '🛍️',
  entertainment: '🎬', health: '💊', utilities: '⚡', other: '📦',
};
const COLOR: Record<string, string> = {
  food: '#818cf8', transport: '#fbbf24', shopping: '#f472b6',
  entertainment: '#34d399', health: '#60a5fa', utilities: '#fb923c', other: '#a78bfa',
};

export default function BudgetPage() {
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [loading, setLoading] = useState(true);
  const [pageError, setPageError] = useState(false);
  const [editingCategory, setEditingCategory] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');
  const [saving, setSaving] = useState(false);
  const [fieldError, setFieldError] = useState<string | null>(null);
  const { toasts, showToast } = useToast();

  const now = new Date();

  const fetchBudgets = useCallback(() => {
    setLoading(true);
    setPageError(false);
    getBudgets(now.getFullYear(), now.getMonth() + 1)
      .then(data => { setBudgets(data); })
      .catch(() => setPageError(true))
      .finally(() => setLoading(false));
  }, [now.getFullYear(), now.getMonth()]);

  useEffect(() => { fetchBudgets(); }, [fetchBudgets]);

  const startEdit = (b: Budget) => {
    setEditingCategory(b.category);
    setEditValue(String(b.limit));
    setFieldError(null);
  };

  const cancelEdit = () => {
    setEditingCategory(null);
    setEditValue('');
    setFieldError(null);
  };

  const saveEdit = async (category: string) => {
    const limit = parseFloat(editValue);
    if (isNaN(limit) || limit <= 0) {
      setFieldError('Please enter a valid amount');
      return;
    }
    setSaving(true);
    setFieldError(null);
    try {
      await updateBudget(category, limit);
      setEditingCategory(null);
      showToast('Budget updated');
      fetchBudgets();
    } catch {
      showToast('Failed to update budget', 'error');
      setFieldError('Failed to save. Try again.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
      <p style={{ color: '#374151', fontSize: 13 }}>Loading...</p>
    </div>
  );
  if (pageError) return <ErrorState message="Failed to load budgets" onRetry={fetchBudgets} />;

  const totalLimit = budgets.reduce((s, b) => s + b.limit, 0);
  const totalSpent = budgets.reduce((s, b) => s + b.spent, 0);
  const overCount = budgets.filter(b => b.spent > b.limit).length;
  const totalPct = Math.min((totalSpent / totalLimit) * 100, 100);

  return (
    <div className="page-wrap" style={{ padding: '36px 40px', maxWidth: 1000 }}>
      <ToastStack toasts={toasts} />
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 32 }}>
        <div>
          <p style={{ fontSize: 11, fontWeight: 600, color: '#1f2937', letterSpacing: '0.1em', marginBottom: 6 }}>MONTHLY</p>
          <h1 style={{ fontSize: 28, fontWeight: 800, color: '#f8fafc', letterSpacing: '-0.02em' }}>Budget</h1>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 500, color: overCount > 0 ? '#ef4444' : '#34d399' }}>
          {overCount > 0
            ? <><AlertTriangle size={13} /> {overCount} over limit</>
            : <><CheckCircle size={13} /> All within budget</>
          }
        </div>
      </div>

      {/* Total overview */}
      <div className="glass" style={{ padding: '20px 24px', marginBottom: 20 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <p style={{ fontSize: 13, fontWeight: 600, color: '#e2e8f0' }}>Total Budget</p>
          <p style={{ fontSize: 13, fontVariantNumeric: 'tabular-nums' }}>
            <span style={{ color: '#818cf8', fontWeight: 700 }}>£{totalSpent.toFixed(2)}</span>
            <span style={{ color: '#374151' }}> / £{totalLimit.toFixed(0)}</span>
          </p>
        </div>
        <div className="bar-track" style={{ height: 6 }}>
          <div
            className={totalSpent > totalLimit ? 'bar-fill bar-fill-danger' : 'bar-fill'}
            style={{ width: `${totalPct}%` }}
          />
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8 }}>
          <span style={{ fontSize: 11, color: '#374151' }}>{totalPct.toFixed(0)}% used</span>
          <span style={{ fontSize: 11, color: '#374151' }}>£{(totalLimit - totalSpent).toFixed(2)} remaining</span>
        </div>
      </div>

      {/* Budget Grid */}
      <div className="budget-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 14 }}>
        {budgets.map(b => {
          const pct = Math.min((b.spent / b.limit) * 100, 100);
          const isOver = b.spent > b.limit;
          const isWarn = !isOver && pct > 75;
          const accent = isOver ? '#ef4444' : isWarn ? '#fbbf24' : (COLOR[b.category] ?? '#818cf8');
          const isEditing = editingCategory === b.category;

          return (
            <div key={b.category} className="glass" style={{ padding: 22 }}>
              {/* Top row */}
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 18 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{
                    width: 40, height: 40, borderRadius: 12, fontSize: 18,
                    background: 'rgba(255,255,255,0.04)',
                    border: '1px solid rgba(255,255,255,0.07)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    {EMOJI[b.category]}
                  </div>
                  <div>
                    <p style={{ fontSize: 14, fontWeight: 600, color: '#f8fafc' }}>{LABEL[b.category] ?? b.category}</p>

                    {/* Edit mode or display */}
                    {isEditing ? (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 5 }}>
                        <span style={{ fontSize: 12, color: '#374151' }}>£</span>
                        <input
                          type="number"
                          value={editValue}
                          onChange={e => setEditValue(e.target.value)}
                          onKeyDown={e => {
                            if (e.key === 'Enter') saveEdit(b.category);
                            if (e.key === 'Escape') cancelEdit();
                          }}
                          autoFocus
                          style={{
                            background: 'rgba(255,255,255,0.06)',
                            border: '1px solid rgba(99,102,241,0.4)',
                            borderRadius: 8,
                            color: '#f8fafc',
                            fontSize: 13,
                            fontWeight: 600,
                            padding: '4px 8px',
                            width: 90,
                            outline: 'none',
                            fontFamily: 'Inter, sans-serif',
                          }}
                        />
                        <button
                          onClick={() => saveEdit(b.category)}
                          disabled={saving}
                          style={{ background: 'rgba(99,102,241,0.2)', border: 'none', borderRadius: 6, padding: '4px 6px', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                        >
                          <Check size={13} color="#818cf8" />
                        </button>
                        <button
                          onClick={cancelEdit}
                          style={{ background: 'rgba(255,255,255,0.04)', border: 'none', borderRadius: 6, padding: '4px 6px', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                        >
                          <X size={13} color="#374151" />
                        </button>
                      </div>
                    ) : (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 3 }}>
                        <p style={{ fontSize: 11, color: '#374151' }}>£{b.limit.toFixed(0)} limit</p>
                        <button
                          onClick={() => startEdit(b)}
                          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '2px 4px', borderRadius: 4, display: 'flex', alignItems: 'center', opacity: 0.5 }}
                          onMouseEnter={e => (e.currentTarget.style.opacity = '1')}
                          onMouseLeave={e => (e.currentTarget.style.opacity = '0.5')}
                          title="Edit limit"
                        >
                          <Pencil size={11} color="#818cf8" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {isOver && !isEditing && (
                  <span className="badge" style={{ background: 'rgba(239,68,68,0.1)', color: '#fca5a5', border: '1px solid rgba(239,68,68,0.2)' }}>
                    Over
                  </span>
                )}
              </div>

              {/* Error */}
              {isEditing && fieldError && (
                <p style={{ fontSize: 11, color: '#ef4444', marginBottom: 10 }}>{fieldError}</p>
              )}

              {/* Progress bar */}
              <div className="bar-track" style={{ height: 5, marginBottom: 10 }}>
                <div
                  className={isOver ? 'bar-fill bar-fill-danger' : isWarn ? 'bar-fill bar-fill-warn' : 'bar-fill'}
                  style={{ width: `${pct}%` }}
                />
              </div>

              {/* Bottom row */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 15, fontWeight: 700, color: accent, fontVariantNumeric: 'tabular-nums', filter: `drop-shadow(0 0 6px ${accent}55)` }}>
                  £{b.spent.toFixed(2)}
                </span>
                <span style={{ fontSize: 12, fontWeight: 500, color: '#374151' }}>{pct.toFixed(0)}%</span>
              </div>

              {isOver && (
                <p style={{ fontSize: 11, color: '#ef4444', marginTop: 6 }}>
                  +£{(b.spent - b.limit).toFixed(2)} over budget
                </p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
