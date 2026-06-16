import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import type { ReactNode } from 'react';

export type CurrencyCode = 'PLN' | 'USD' | 'EUR' | 'TRY' | 'AZN';

export const CURRENCIES: { code: CurrencyCode; symbol: string; label: string }[] = [
  { code: 'PLN', symbol: 'zł', label: 'PLN' },
  { code: 'USD', symbol: '$',  label: 'USD' },
  { code: 'EUR', symbol: '€',  label: 'EUR' },
  { code: 'TRY', symbol: '₺',  label: 'TRY' },
  { code: 'AZN', symbol: '₼',  label: 'AZN' },
];

const FALLBACK_RATES: Record<CurrencyCode, number> = {
  PLN: 1,
  USD: 0.26,
  EUR: 0.24,
  TRY: 8.9,
  AZN: 0.44,
};

const CACHE_KEY = 'fx_rates_cache';
const CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour

function loadCachedRates(): Record<CurrencyCode, number> | null {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const { rates, ts } = JSON.parse(raw);
    if (Date.now() - ts > CACHE_TTL_MS) return null;
    return rates;
  } catch {
    return null;
  }
}

function saveCachedRates(rates: Record<CurrencyCode, number>) {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify({ rates, ts: Date.now() }));
  } catch {}
}

interface CurrencyContextValue {
  currency: CurrencyCode;
  setCurrency: (c: CurrencyCode) => void;
  symbol: string;
  fmt: (amountPLN: number) => string;
  toPLN: (amountInCurrency: number) => number;
}

const CurrencyContext = createContext<CurrencyContextValue>({
  currency: 'PLN',
  setCurrency: () => {},
  symbol: 'zł',
  fmt: (n) => `${n.toFixed(2)} zł`,
  toPLN: (n) => n,
});

export function CurrencyProvider({ children }: { children: ReactNode }) {
  const [currency, setCurrencyState] = useState<CurrencyCode>(
    () => (localStorage.getItem('currency') as CurrencyCode) || 'PLN'
  );
  const [rates, setRates] = useState<Record<CurrencyCode, number>>(FALLBACK_RATES);

  useEffect(() => {
    const cached = loadCachedRates();
    if (cached) { setRates(cached); return; }

    fetch('https://open.er-api.com/v6/latest/PLN')
      .then(r => r.json())
      .then(data => {
        if (data?.rates) {
          const fresh: Record<CurrencyCode, number> = {
            PLN: 1,
            USD: data.rates.USD ?? FALLBACK_RATES.USD,
            EUR: data.rates.EUR ?? FALLBACK_RATES.EUR,
            TRY: data.rates.TRY ?? FALLBACK_RATES.TRY,
            AZN: data.rates.AZN ?? FALLBACK_RATES.AZN,
          };
          setRates(fresh);
          saveCachedRates(fresh);
        }
      })
      .catch(() => {});
  }, []);

  const setCurrency = useCallback((c: CurrencyCode) => {
    localStorage.setItem('currency', c);
    setCurrencyState(c);
  }, []);

  const symbol = CURRENCIES.find(c => c.code === currency)?.symbol ?? 'zł';

  const fmt = useCallback((amountPLN: number): string => {
    const converted = amountPLN * rates[currency];
    const s = CURRENCIES.find(c => c.code === currency)?.symbol ?? '';
    if (currency === 'PLN') return `${converted.toFixed(2)} ${s}`;
    return `${s}${converted.toFixed(2)}`;
  }, [currency, rates]);

  const toPLN = useCallback((amountInCurrency: number): number => {
    return amountInCurrency / rates[currency];
  }, [currency, rates]);

  return (
    <CurrencyContext.Provider value={{ currency, setCurrency, symbol, fmt, toPLN }}>
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  return useContext(CurrencyContext);
}
