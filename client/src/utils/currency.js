// Client-side currency preferences. Prices are stored server-side in USD and
// converted locally for display using these reference rates.
export const CURRENCIES = [
  { code: 'USD', symbol: '$', rate: 1, name: 'US Dollar', locale: 'en-US' },
  { code: 'INR', symbol: '₹', rate: 83.5, name: 'Indian Rupee', locale: 'en-IN' },
  { code: 'EUR', symbol: '€', rate: 0.92, name: 'Euro', locale: 'de-DE' },
  { code: 'GBP', symbol: '£', rate: 0.79, name: 'British Pound', locale: 'en-GB' },
  { code: 'AED', symbol: 'د.إ', rate: 3.67, name: 'UAE Dirham', locale: 'en-AE' },
  { code: 'JPY', symbol: '¥', rate: 151, name: 'Japanese Yen', locale: 'ja-JP' },
  { code: 'AUD', symbol: 'A$', rate: 1.52, name: 'Australian Dollar', locale: 'en-AU' },
  { code: 'CAD', symbol: 'C$', rate: 1.37, name: 'Canadian Dollar', locale: 'en-CA' },
  { code: 'CNY', symbol: '¥', rate: 7.2, name: 'Chinese Yuan', locale: 'zh-CN' },
  { code: 'SGD', symbol: 'S$', rate: 1.35, name: 'Singapore Dollar', locale: 'en-SG' },
];

let active = 'USD';
const subscribers = new Set();

export const getCurrency = () => active;

export const getCurrencyInfo = (code = active) =>
  CURRENCIES.find((c) => c.code === code) || CURRENCIES[0];

export function setCurrency(code) {
  if (!CURRENCIES.some((c) => c.code === code)) return;
  active = code;
  try {
    localStorage.setItem('astra_currency', code);
  } catch {
    /* ignore */
  }
  subscribers.forEach((fn) => {
    try {
      fn(code);
    } catch {
      /* ignore */
    }
  });
}

export function subscribeCurrency(fn) {
  subscribers.add(fn);
  return () => subscribers.delete(fn);
}

export function initCurrency() {
  try {
    const saved = localStorage.getItem('astra_currency');
    if (saved && CURRENCIES.some((c) => c.code === saved)) active = saved;
  } catch {
    /* ignore */
  }
}

export const convert = (usd, code = active) => usd * getCurrencyInfo(code).rate;

export function formatMoney(usd, code = active) {
  const c = getCurrencyInfo(code);
  const value = usd * c.rate;
  const digits = code === 'JPY' ? 0 : value % 1 === 0 ? 0 : 2;
  return new Intl.NumberFormat(c.locale, {
    style: 'currency',
    currency: code,
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  }).format(value);
}
