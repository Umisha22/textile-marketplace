import { ORDER_STATUSES } from '../constants.js';

export function generateOrderNumber() {
  const ts = Date.now().toString(36).toUpperCase();
  const rand = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `TM-${ts}-${rand}`;
}

export function nextStatus(current) {
  const i = ORDER_STATUSES.indexOf(current);
  return i >= 0 && i < ORDER_STATUSES.length - 1 ? ORDER_STATUSES[i + 1] : null;
}
