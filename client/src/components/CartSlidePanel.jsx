import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import ProductImage from './ProductImage.jsx';
import NeoButton from './design-system/NeoButton.jsx';
import { useCart } from '../context/CartContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { formatPrice } from '../utils/format.js';
import { CATEGORY_LABELS } from '../utils/constants.js';
import { useCurrency } from '../hooks/useCurrency.js';

function CartItem({ item, onRemove, onUpdateQty }) {
  const p = item.product;
  const productId = p._id || p.id;
  const rowRef = useRef(null);

  const handleRemove = () => {
    if (rowRef.current) {
      rowRef.current.style.transition = 'all 0.5s ease-in';
      rowRef.current.style.transform = 'translateX(100%) rotate(2deg)';
      rowRef.current.style.opacity = '0';
      rowRef.current.style.height = '0';
      rowRef.current.style.padding = '0';
      rowRef.current.style.margin = '0';
      setTimeout(() => onRemove(productId), 400);
    }
  };

  return (
    <div ref={rowRef} className="flex gap-3 rounded-xl border border-void-600/30 bg-void-700/50 p-3 transition-all duration-500">
      <Link to={`/products/${p.slug}`} className="h-16 w-16 shrink-0 overflow-hidden rounded-lg">
        <ProductImage product={p} className="!rounded-lg" />
      </Link>
      <div className="min-w-0 flex-1">
        <p className="line-clamp-1 text-xs font-semibold text-text-primary">{p.name}</p>
        <p className="font-mono text-xs text-gold-400">{formatPrice(p.price)}/{p.unit}</p>
        <div className="mt-1.5 flex items-center gap-2">
          <div className="neo-flat flex items-center overflow-hidden rounded-lg">
            <button onClick={() => onUpdateQty(productId, item.quantity - 1)} className="px-2 py-0.5 text-xs text-text-secondary hover:text-text-primary transition">−</button>
            <span className="w-6 text-center text-xs font-semibold text-text-primary">{item.quantity}</span>
            <button onClick={() => onUpdateQty(productId, item.quantity + 1)} className="px-2 py-0.5 text-xs text-text-secondary hover:text-text-primary transition">+</button>
          </div>
          <button onClick={handleRemove} className="text-[10px] text-text-muted hover:text-coral-400 transition">Remove</button>
        </div>
      </div>
      <p className="font-mono text-sm font-bold text-gold-400 shrink-0">{formatPrice(p.price * item.quantity)}</p>
    </div>
  );
}

export default function CartSlidePanel({ open, onClose }) {
  useCurrency();
  const { items, count, subtotal, updateQty, remove, loading } = useCart();
  const { user } = useAuth();
  const panelRef = useRef(null);

  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  const shipping = subtotal >= 500 ? 0 : 25;
  const tax = subtotal * 0.18;
  const total = subtotal + tax + shipping;

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 z-[60] bg-void-950/60 backdrop-blur-sm transition-opacity duration-300 ${
          open ? 'opacity-100' : 'pointer-events-none opacity-0'
        }`}
        onClick={onClose}
      />

      {/* Panel */}
      <div
        ref={panelRef}
        className={`fixed top-0 right-0 z-[70] flex h-full w-full max-w-md flex-col transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] ${
          open ? 'translate-x-0' : 'translate-x-full'
        }`}
        style={{
          background: 'rgba(18,18,26,0.95)',
          backdropFilter: 'blur(30px)',
          borderLeft: '1px solid rgba(212,168,83,0.1)',
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-void-600/50 px-5 py-4">
          <h2 className="font-display text-lg font-bold text-text-primary">
            Shopping Cart <span className="text-sm text-text-muted">({count})</span>
          </h2>
          <button onClick={onClose} className="rounded-lg p-1.5 text-text-muted hover:text-text-primary transition">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M18 6L6 18M6 6l12 12" /></svg>
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
          {loading ? (
            <p className="py-8 text-center text-sm text-text-muted">Loading...</p>
          ) : items.length === 0 ? (
            <div className="py-12 text-center">
              <p className="text-sm text-text-muted">Your cart is empty</p>
              <Link to="/products" onClick={onClose} className="mt-3 inline-block rounded-xl bg-gold-500 px-4 py-2 text-xs font-bold text-void-950">Browse fabrics</Link>
            </div>
          ) : (
            items.map((it) => (
              <CartItem key={it.product._id || it.product.id} item={it} onRemove={remove} onUpdateQty={updateQty} />
            ))
          )}
        </div>

        {/* Footer summary */}
        {items.length > 0 && (
          <div className="glass-strong border-t border-void-600/50 px-5 py-4 space-y-2">
            <div className="flex justify-between text-xs text-text-secondary"><span>Subtotal</span><span className="font-mono">{formatPrice(subtotal)}</span></div>
            <div className="flex justify-between text-xs text-text-secondary"><span>Tax (18%)</span><span className="font-mono">{formatPrice(tax)}</span></div>
            <div className="flex justify-between text-xs text-text-secondary"><span>Shipping</span><span>{shipping === 0 ? 'Free' : formatPrice(shipping)}</span></div>
            <div className="flex justify-between border-t border-void-600/50 pt-2 text-base font-bold text-text-primary">
              <span>Total</span><span className="font-mono text-gold-400">{formatPrice(total)}</span>
            </div>
            <Link to={user?.role === 'buyer' ? '/checkout' : '/login'} onClick={onClose}>
              <NeoButton className="w-full mt-2">
                {user?.role === 'buyer' ? 'Proceed to checkout' : 'Log in to checkout'}
              </NeoButton>
            </Link>
          </div>
        )}
      </div>
    </>
  );
}
