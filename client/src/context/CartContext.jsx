import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { api } from '../api/client.js';
import { useAuth } from './AuthContext.jsx';

const CartContext = createContext(null);
const GUEST_KEY = 'astra_guest_cart';

const readGuest = () => {
  try {
    return JSON.parse(localStorage.getItem(GUEST_KEY) || '[]');
  } catch {
    return [];
  }
};

export function CartProvider({ children }) {
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user?.role === 'buyer') {
      loadServerCart();
    } else {
      setItems(readGuest());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?._id]);

  const loadServerCart = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api.get('/cart');
      setItems(
        (data.cart?.items || []).map((it) => ({
          product: it.product,
          quantity: it.quantity,
          color: it.color,
        }))
      );
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const persistGuest = (next) => {
    setItems(next);
    localStorage.setItem(GUEST_KEY, JSON.stringify(next));
  };

  const add = useCallback(
    async (product, quantity = 1, color) => {
      if (user?.role === 'buyer') {
        const data = await api.post('/cart/items', {
          productId: product._id || product.id,
          quantity,
          color,
        });
        setItems(
          (data.cart?.items || []).map((it) => ({
            product: it.product,
            quantity: it.quantity,
            color: it.color,
          }))
        );
      } else {
        const existing = readGuest();
        const found = existing.find(
          (it) => String(it.product._id || it.product.id) === String(product._id || product.id)
        );
        let next;
        if (found) {
          next = existing.map((it) =>
            String(it.product._id || it.product.id) === String(product._id || product.id)
              ? { ...it, quantity: it.quantity + quantity }
              : it
          );
        } else {
          next = [...existing, { product, quantity, color }];
        }
        persistGuest(next);
      }
    },
    [user]
  );

  const updateQty = useCallback(
    async (productId, quantity) => {
      if (user?.role === 'buyer') {
        const data = await api.put(`/cart/items/${productId}`, { quantity });
        setItems(
          (data.cart?.items || []).map((it) => ({
            product: it.product,
            quantity: it.quantity,
            color: it.color,
          }))
        );
      } else {
        persistGuest(
          readGuest().map((it) =>
            String(it.product._id || it.product.id) === String(productId)
              ? { ...it, quantity: Math.max(1, quantity) }
              : it
          )
        );
      }
    },
    [user]
  );

  const remove = useCallback(
    async (productId) => {
      if (user?.role === 'buyer') {
        const data = await api.del(`/cart/items/${productId}`);
        setItems(
          (data.cart?.items || []).map((it) => ({
            product: it.product,
            quantity: it.quantity,
            color: it.color,
          }))
        );
      } else {
        persistGuest(
          readGuest().filter((it) => String(it.product._id || it.product.id) !== String(productId))
        );
      }
    },
    [user]
  );

  const clear = useCallback(async () => {
    if (user?.role === 'buyer') {
      await api.del('/cart');
      setItems([]);
    } else {
      persistGuest([]);
    }
  }, [user]);

  const count = useMemo(() => items.reduce((s, it) => s + it.quantity, 0), [items]);
  const subtotal = useMemo(
    () => items.reduce((s, it) => s + (it.product?.price || 0) * it.quantity, 0),
    [items]
  );

  return (
    <CartContext.Provider
      value={{ items, loading, count, subtotal, add, updateQty, remove, clear }}
    >
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);
