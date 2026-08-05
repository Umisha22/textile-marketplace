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
      className={`h-10 cursor-pointer rounded-xl border border-void-600 bg-void-700/50 px-2 text-xs font-semibold text-text-secondary outline-none transition hover:border-gold-500/30 hover:text-text-primary focus:ring-1 focus:ring-gold-500/30 ${className}`}
    >
      {CURRENCIES.map((c) => (
        <option key={c.code} value={c.code}>
          {c.code} · {c.symbol}
        </option>
      ))}
    </select>
  );
}
