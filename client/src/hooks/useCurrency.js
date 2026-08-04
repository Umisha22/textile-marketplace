import { useSyncExternalStore } from 'react';
import { subscribeCurrency, getCurrency } from '../utils/currency.js';

// Re-renders the component whenever the active display currency changes.
export const useCurrency = () => useSyncExternalStore(subscribeCurrency, getCurrency);
