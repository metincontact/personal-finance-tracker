import { useEffect, useState, useCallback } from 'react';
import { getTransactions, addTransaction, deleteTransaction, updateTransaction } from '../services/api';
import type { Transaction, Category } from '../types';
import { Search, Plus, Trash2, X, ChevronLeft, ChevronRight, Download, Pencil } from 'lucide-react';
import ErrorState from '../components/ErrorState';
import ToastStack from '../components/ToastStack';
import { useToast } from '../hooks/useToast';

const CAT: Record<string, { bg: string; color: string; dot: string }> = {
  food:          { bg: 'rgba(129,140,248,0.1)',  color: '#a5b4fc', dot: '#818cf8' },
  transport:     { bg: 'rgba(251,191,36,0.1)',   color: '#fde68a', dot: '#fbbf24' },
  shopping:      { bg: 'rgba(244,114,182,0.1)',  color: '#fbcfe8', dot: '#f472b6' },
  entertainment: { bg: 'rgba(52,211,153,0.1)',   color: '#a7f3d0', dot: '#34d399' },
  health:        { bg: 'rgba(96,165,250,0.1)',   color: '#bfdbfe', dot: '#60a5fa' },
  utilities:     { bg: 'rgba(251,146,60,0.1)',   color: '#fed7aa', dot: '#fb923c' },
  other:         { bg: 'rgba(167,139,250,0.1)',  color: '#ddd6fe', dot: '#a78bfa' },
};
const CAT_LABEL: Record<string, string> = {
  food: 'Food & Drink', transport: 'Transport', shopping: 'Shopping',
  entertainment: 'Entertainment', health: 'Health', utilities: 'Utilities', other: 'Other',
};
const CATEGORIES: Category[] = ['food', 'transport', 'shopping', 'entertainment', 'health', 'utilities', 'other'];
const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const PAGE_SIZE = 20;

const EMPTY_FORM = { date: '', amount: '', description: '', category: 'other' as Category, merchant: '' };

export default function Transactions() {
  const now = new Date();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [pageError, setPageError] = useState(false);
  const [selectedYear, setSelectedYear] = useState(now.getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(now.getMonth() + 1);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const { toasts, showToast } = useToast();

  const fetchData = useCallback(() => {
    setLoading(true);
    setPageError(false);
    getTransactions()
      .then(setTransactions)
      .catch(() => setPageError(true))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const prevMonth = () => {
    setPage(1);
    if (selectedMonth === 1) { setSelectedMonth(12); setSelectedYear(y => y - 1); }
    else setSelectedMonth(m => m - 1);
  };
  const nextMonth = () => {
    setPage(1);
    if (selectedMonth === 12) { setSelectedMonth(1); setSelectedYear(y => y + 1); }
    else setSelectedMonth(m => m + 1);
  };

  const monthFiltered = transactions.filter(t => {
    const d = new Date(t.date);
    return d.getFullYear() === selectedYear && d.getMonth() + 1 === selectedMonth;
  });

  const filtered = monthFiltered.filter(t =>
    t.merchant.toLowerCase().includes(search.toLowerCase()) ||
    t.description.toLowerCase().includes(search.toLowerCase()) ||
    t.category.toLowerCase().includes(search.toLowerCase())
  );

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const exportCSV = () => {
    const header = 'Date,Merchant,Description,Category,Amount (£)\n';
    const rows = filtered.map(t => {
      const date = new Date(t.date).toLocaleDateString('en-GB');
      const desc = `"${t.description.replace(/"/g, '""')}"`;
      return `${date},${t.merchant},${desc},${CAT_LABEL[t.category] ?? t.category},${t.amount.toFixed(2)}`;
    }).join('\n');
    const blob = new Blob([header + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `transactions-${selectedYear}-${String(selectedMonth).padStart(2, '0')}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('CSV exported');
  };

  const openModal = () => {
    setEditingId(null);
    setForm({ ...EMPTY_FORM, date: new Date().toISOString().slice(0, 10) });
    setFormError(null);
    setShowModal(true);
  };

  const openEdit = (t: Transaction) => {
    setEditingId(t.id);
    setForm({
      date: new Date(t.date).toISOString().slice(0, 10),
      amount: String(t.amount),
      description: t.description,
      category: t.category,
      merchant: t.merchant,
    });
    setFormError(null);
    setShowModal(true);
  };

  const closeModal = () => { setShowModal(false); setFormError(null); setEditingId(null); };

  const handleSave = async () => {
    if (!form.date || !form.amount || !form.merchant) {
      setFormError('Date, amount and merchant are required');
      return;
    }
    const amount = parseFloat(form.amount);
    if (isNaN(amount) || amount <= 0) { setFormError('Enter a valid amount'); return; }
    setSaving(true);
    setFormError(null);
    try {
      if (editingId) {
        await updateTransaction(editingId, {
          date: form.date, amount,
          description: form.description || form.merchant,
          category: form.category, merchant: form.merchant,
        });
        showToast('Transaction updated');
      } else {
        await addTransaction({
          date: form.date, amount,
          description: form.description || form.merchant,
          category: form.category, merchant: form.merchant,
        });
        showToast('Transaction added');
      }
      setShowModal(false);
      fetchData();
    } catch {
      setFormError('Failed to save. Try again.');
      showToast('Failed to save transaction', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    try {
      await deleteTransaction(id);
      setTransactions(prev => prev.filter(t => t.id !== id));
      showToast('Transaction deleted');
    } catch {
      showToast('Failed to delete transaction', 'error');
    } finally {
      setDeletingId(null);
    }
  };

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
      <p style={{ color: '#374151', fontSize: 13 }}>Loading...</p>
    </div>
  );
  if (pageError) return <ErrorState message="Failed to load transactions" onRetry={fetchData} />;

  const inputStyle: React.CSSProperties = {
    background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.09)',
    borderRadius: 10, color: '#f8fafc', fontSize: 13, padding: '10px 14px',
    outline: 'none', width: '100%', fontFamily: 'Inter, sans-serif', boxSizing: 'border-box',
  };
  const labelStyle: React.CSSProperties = {
    fontSize: 11, fontWeight: 600, color: '#374151', letterSpacing: '0.07em',
    display: 'block', marginBottom: 7,
  };

  const totalSpent = filtered.reduce((s, t) => s + t.amount, 0);

  return (
    <div className="page-wrap" style={{ padding: '36px 40px', maxWidth: 1000 }}>
      <ToastStack toasts={toasts} />

      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 24 }}>
        <div>
          <p style={{ fontSize: 11, fontWeight: 600, color: '#374151', letterSpacing: '0.1em', marginBottom: 6 }}>HISTORY</p>
          <h1 style={{ fontSize: 28, fontWeight: 800, color: '#f8fafc', letterSpacing: '-0.02em' }}>Transactions</h1>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 2, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 12, padding: '2px 4px' }}>
            <button onClick={prevMonth} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '6px 8px', display: 'flex', alignItems: 'center', borderRadius: 8, color: '#374151', transition: 'color 0.1s' }}
              onMouseEnter={e => { e.currentTarget.style.color = '#e2e8f0'; }} onMouseLeave={e => { e.currentTarget.style.color = '#374151'; }}>
              <ChevronLeft size={14} />
            </button>
            <span style={{ fontSize: 13, fontWeight: 600, color: '#e2e8f0', minWidth: 80, textAlign: 'center' }}>
              {MONTHS[selectedMonth - 1]} {selectedYear}
            </span>
            <button onClick={nextMonth} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '6px 8px', display: 'flex', alignItems: 'center', borderRadius: 8, color: '#374151', transition: 'color 0.1s' }}
              onMouseEnter={e => { e.currentTarget.style.color = '#e2e8f0'; }} onMouseLeave={e => { e.currentTarget.style.color = '#374151'; }}>
              <ChevronRight size={14} />
            </button>
          </div>

          <div style={{ position: 'relative' }}>
            <Search size={13} color="#374151" style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)' }} />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search..."
              style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 12, color: '#e2e8f0', fontSize: 13, padding: '9px 14px 9px 36px', outline: 'none', width: 180, backdropFilter: 'blur(20px)', fontFamily: 'Inter, sans-serif' }} />
          </div>

          <button onClick={exportCSV} disabled={filtered.length === 0}
            style={{ display: 'flex', alignItems: 'center', gap: 7, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, color: filtered.length === 0 ? '#1f2937' : '#6b7280', fontSize: 13, fontWeight: 500, padding: '9px 14px', cursor: filtered.length === 0 ? 'not-allowed' : 'pointer', fontFamily: 'Inter, sans-serif', transition: 'all 0.15s' }}
            onMouseEnter={e => { if (filtered.length > 0) { e.currentTarget.style.color = '#e2e8f0'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)'; }}}
            onMouseLeave={e => { e.currentTarget.style.color = '#6b7280'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; }}>
            <Download size={13} />
            CSV
          </button>

          <button onClick={openModal}
            style={{ display: 'flex', alignItems: 'center', gap: 7, background: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.3)', borderRadius: 12, color: '#a5b4fc', fontSize: 13, fontWeight: 600, padding: '9px 16px', cursor: 'pointer', fontFamily: 'Inter, sans-serif', transition: 'all 0.15s' }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(99,102,241,0.25)'; e.currentTarget.style.borderColor = 'rgba(99,102,241,0.5)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(99,102,241,0.15)'; e.currentTarget.style.borderColor = 'rgba(99,102,241,0.3)'; }}>
            <Plus size={15} />
            Add
          </button>
        </div>
      </div>

      {filtered.length > 0 && (
        <div style={{ display: 'flex', gap: 20, marginBottom: 16 }}>
          <p style={{ fontSize: 12, color: '#374151' }}>
            <span style={{ color: '#818cf8', fontWeight: 700 }}>£{totalSpent.toFixed(2)}</span>
            {' '}spent in {MONTHS[selectedMonth - 1]}
          </p>
          <p style={{ fontSize: 12, color: '#374151' }}>{filtered.length} transactions</p>
        </div>
      )}

      <div className="glass" style={{ overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <div style={{ minWidth: 560 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '110px 1fr 160px 100px 80px', padding: '12px 24px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
              {['Date', 'Merchant', 'Category', 'Amount', ''].map((h, i) => (
                <span key={i} style={{ fontSize: 10, fontWeight: 600, color: '#374151', letterSpacing: '0.08em' }}>{h.toUpperCase()}</span>
              ))}
            </div>

            {paginated.map((t, i) => {
              const s = CAT[t.category] ?? CAT['other']!;
              const isDeleting = deletingId === t.id;
              return (
                <div key={t.id}
                  style={{ display: 'grid', gridTemplateColumns: '110px 1fr 160px 100px 80px', padding: '15px 24px', borderBottom: i < paginated.length - 1 ? '1px solid rgba(255,255,255,0.035)' : 'none', alignItems: 'center', transition: 'background 0.12s ease', opacity: isDeleting ? 0.4 : 1 }}
                  onMouseEnter={e => { if (!isDeleting) e.currentTarget.style.background = 'rgba(255,255,255,0.02)'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}>
                  <span style={{ fontSize: 13, color: '#374151', fontVariantNumeric: 'tabular-nums' }}>
                    {new Date(t.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}
                  </span>
                  <div>
                    <span style={{ fontSize: 13, fontWeight: 600, color: '#e2e8f0' }}>{t.merchant}</span>
                    {t.description && t.description !== t.merchant && (
                      <p style={{ fontSize: 11, color: '#374151', marginTop: 1 }}>{t.description}</p>
                    )}
                  </div>
                  <div>
                    <span className="badge" style={{ background: s.bg, color: s.color }}>
                      <span style={{ width: 5, height: 5, borderRadius: '50%', background: s.dot, flexShrink: 0, boxShadow: `0 0 5px ${s.dot}` }} />
                      {CAT_LABEL[t.category] ?? t.category}
                    </span>
                  </div>
                  <span style={{ fontSize: 14, fontWeight: 700, color: '#f8fafc', fontVariantNumeric: 'tabular-nums', textAlign: 'right' }}>
                    £{t.amount.toFixed(2)}
                  </span>
                  <div style={{ display: 'flex', justifyContent: 'center', gap: 4 }}>
                    <button onClick={() => openEdit(t)} disabled={isDeleting}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px', borderRadius: 6, display: 'flex', alignItems: 'center', opacity: 0.25, transition: 'opacity 0.12s' }}
                      onMouseEnter={e => { e.currentTarget.style.opacity = '1'; }}
                      onMouseLeave={e => { e.currentTarget.style.opacity = '0.25'; }}
                      title="Edit">
                      <Pencil size={13} color="#818cf8" />
                    </button>
                    <button onClick={() => handleDelete(t.id)} disabled={isDeleting}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px', borderRadius: 6, display: 'flex', alignItems: 'center', opacity: 0.25, transition: 'opacity 0.12s' }}
                      onMouseEnter={e => { e.currentTarget.style.opacity = '1'; }}
                      onMouseLeave={e => { e.currentTarget.style.opacity = '0.25'; }}
                      title="Delete">
                      <Trash2 size={13} color="#ef4444" />
                    </button>
                  </div>
                </div>
              );
            })}

            {filtered.length === 0 && (
              <div style={{ padding: '48px', textAlign: 'center' }}>
                <p style={{ color: '#374151', fontSize: 13 }}>No transactions in {MONTHS[selectedMonth - 1]} {selectedYear}</p>
                <p style={{ color: '#1f2937', fontSize: 11, marginTop: 6 }}>Use the arrows to navigate months or add a transaction</p>
              </div>
            )}

            {totalPages > 1 && (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '16px 24px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                  style={{ background: 'none', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 8, color: page === 1 ? '#1f2937' : '#6b7280', padding: '6px 10px', cursor: page === 1 ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center' }}>
                  <ChevronLeft size={14} />
                </button>
                <span style={{ fontSize: 12, color: '#374151' }}>Page {page} of {totalPages}</span>
                <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                  style={{ background: 'none', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 8, color: page === totalPages ? '#1f2937' : '#6b7280', padding: '6px 10px', cursor: page === totalPages ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center' }}>
                  <ChevronRight size={14} />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {showModal && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(6px)' }}
          onClick={e => { if (e.target === e.currentTarget) closeModal(); }}>
          <div className="glass" style={{ width: 440, padding: 32, borderRadius: 20, position: 'relative', border: '1px solid rgba(255,255,255,0.09)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28 }}>
              <div>
                <p style={{ fontSize: 11, fontWeight: 600, color: '#374151', letterSpacing: '0.1em', marginBottom: 4 }}>MANUAL ENTRY</p>
                <h2 style={{ fontSize: 20, fontWeight: 800, color: '#f8fafc', letterSpacing: '-0.02em' }}>{editingId ? 'Edit Transaction' : 'Add Transaction'}</h2>
              </div>
              <button onClick={closeModal} style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, padding: '6px', cursor: 'pointer', display: 'flex' }}>
                <X size={15} color="#374151" />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={labelStyle}>DATE</label>
                  <input type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} style={{ ...inputStyle, colorScheme: 'dark' }} />
                </div>
                <div>
                  <label style={labelStyle}>AMOUNT (£)</label>
                  <input type="number" value={form.amount} onChange={e => setForm(f => ({ ...f, amount: e.target.value }))} placeholder="0.00" min="0" step="0.01" style={inputStyle} />
                </div>
              </div>
              <div>
                <label style={labelStyle}>MERCHANT</label>
                <input type="text" value={form.merchant} onChange={e => setForm(f => ({ ...f, merchant: e.target.value }))} placeholder="e.g. Tesco, Amazon..." style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>DESCRIPTION <span style={{ opacity: 0.4 }}>(optional)</span></label>
                <input type="text" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="e.g. Weekly groceries" style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>CATEGORY</label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7 }}>
                  {CATEGORIES.map(cat => {
                    const s = CAT[cat]!;
                    const active = form.category === cat;
                    return (
                      <button key={cat} onClick={() => setForm(f => ({ ...f, category: cat }))}
                        style={{ background: active ? s.bg : 'rgba(255,255,255,0.03)', border: `1px solid ${active ? s.dot + '55' : 'rgba(255,255,255,0.07)'}`, borderRadius: 8, color: active ? s.color : '#374151', fontSize: 12, fontWeight: 500, padding: '6px 12px', cursor: 'pointer', fontFamily: 'Inter, sans-serif', transition: 'all 0.1s', display: 'flex', alignItems: 'center', gap: 5 }}>
                        {active && <span style={{ width: 5, height: 5, borderRadius: '50%', background: s.dot, boxShadow: `0 0 5px ${s.dot}` }} />}
                        {CAT_LABEL[cat]}
                      </button>
                    );
                  })}
                </div>
              </div>
              {formError && (
                <p style={{ fontSize: 12, color: '#ef4444', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.15)', borderRadius: 8, padding: '8px 12px' }}>{formError}</p>
              )}
              <button onClick={handleSave} disabled={saving}
                style={{ background: saving ? 'rgba(99,102,241,0.1)' : 'rgba(99,102,241,0.2)', border: '1px solid rgba(99,102,241,0.35)', borderRadius: 12, color: saving ? '#4b5563' : '#a5b4fc', fontSize: 14, fontWeight: 700, padding: '13px', cursor: saving ? 'not-allowed' : 'pointer', fontFamily: 'Inter, sans-serif', width: '100%', transition: 'all 0.15s', letterSpacing: '0.02em' }}
                onMouseEnter={e => { if (!saving) e.currentTarget.style.background = 'rgba(99,102,241,0.3)'; }}
                onMouseLeave={e => { if (!saving) e.currentTarget.style.background = 'rgba(99,102,241,0.2)'; }}>
                {saving ? 'Saving...' : editingId ? 'Update Transaction' : 'Save Transaction'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
