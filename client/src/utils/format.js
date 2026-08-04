import { getCurrency, formatMoney } from './currency.js';

export const formatPrice = (n) => formatMoney(n, getCurrency());

export const formatDate = (d) =>
  new Date(d).toLocaleDateString('en-US', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

export const formatDateTime = (d) =>
  new Date(d).toLocaleString('en-US', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

export const formatNumber = (n) => new Intl.NumberFormat('en-US').format(n);

export const titleCase = (s = '') =>
  s
    .replace(/[_-]+/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());
