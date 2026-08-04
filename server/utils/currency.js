// Static reference rates used to display product prices in the buyer's
// preferred currency. Product prices are always stored in USD (base).
export const CURRENCIES = {
  USD: { code: 'USD', symbol: '$', rate: 1, name: 'US Dollar' },
  INR: { code: 'INR', symbol: '₹', rate: 83.5, name: 'Indian Rupee' },
  EUR: { code: 'EUR', symbol: '€', rate: 0.92, name: 'Euro' },
  GBP: { code: 'GBP', symbol: '£', rate: 0.79, name: 'British Pound' },
  AED: { code: 'AED', symbol: 'د.إ', rate: 3.67, name: 'UAE Dirham' },
  JPY: { code: 'JPY', symbol: '¥', rate: 151, name: 'Japanese Yen' },
  AUD: { code: 'AUD', symbol: 'A$', rate: 1.52, name: 'Australian Dollar' },
  CAD: { code: 'CAD', symbol: 'C$', rate: 1.37, name: 'Canadian Dollar' },
  CNY: { code: 'CNY', symbol: '¥', rate: 7.2, name: 'Chinese Yuan' },
  SGD: { code: 'SGD', symbol: 'S$', rate: 1.35, name: 'Singapore Dollar' },
};

export const CURRENCY_CODES = Object.keys(CURRENCIES);

export const getCurrency = (code) => CURRENCIES[code] || CURRENCIES.USD;

export function formatMoney(usd, code = 'USD') {
  const c = getCurrency(code);
  const value = usd * c.rate;
  const digits = c.code === 'JPY' ? 0 : value % 1 === 0 ? 0 : 2;
  const num = value.toLocaleString('en-US', {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  });
  return `${c.symbol}${num}`;
}

export function formatPriceLine(usd, unit, code = 'USD') {
  return `${formatMoney(usd, code)}/${unit}`;
}

// Convert a user-typed price to the USD base using a detected currency word.
export function priceToUsd(value, text = '') {
  const t = ` ${text.toLowerCase()} `;
  if (/[\s(]rupees?\.?[\s)]|[\s(]rs\.?[\s)]|\binr\b|\u20b9/.test(t)) return value / CURRENCIES.INR.rate;
  if (/[\s(]euros?[\s)]|\beur\b/.test(t)) return value / CURRENCIES.EUR.rate;
  if (/[\s(]pounds?[\s)]|\bgbp\b|\bpound sterling/.test(t)) return value / CURRENCIES.GBP.rate;
  if (/[\s(]dirhams?[\s)]|\baed\b|\bdhs\.?\b/.test(t)) return value / CURRENCIES.AED.rate;
  if (/\byen\b|\u00a5/.test(t)) return value / CURRENCIES.JPY.rate;
  if (/\bcanadian\b|\bcad\b/.test(t)) return value / CURRENCIES.CAD.rate;
  if (/\baustralian\b|\baud\b/.test(t)) return value / CURRENCIES.AUD.rate;
  return value;
}
