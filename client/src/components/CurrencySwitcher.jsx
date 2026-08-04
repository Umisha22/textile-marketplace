import { CURRENCIES, getCurrency, setCurrency } from '../utils/currency.js';
import { useCurrency } from '../hooks/useCurrency.js';

export default function CurrencySwitcher({ className = '' }) {
  useCurrency();
  const code = getCurrency();

  return (
    <select
      value={code}
      onChange={(e) => setCurrency(e.target.value)}
      title="Display currency"
      aria-label="Display currency"
      className={`h-10 cursor-pointer rounded-xl border border-brand-200 bg-white/70 px-2 text-xs font-semibold text-brand-800 outline-none transition hover:border-brand-400 focus:ring-2 focus:ring-brand-100 ${className}`}
    >
      {CURRENCIES.map((c) => (
        <option key={c.code} value={c.code}>
          {c.code} · {c.symbol}
        </option>
      ))}
    </select>
  );
}
