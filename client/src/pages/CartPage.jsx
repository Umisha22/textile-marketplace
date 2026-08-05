import { Link, useNavigate } from 'react-router-dom';
import ProductImage from '../components/ProductImage.jsx';
import NeoButton from '../components/design-system/NeoButton.jsx';
import GlassPanel from '../components/design-system/GlassPanel.jsx';
import { EmptyState } from '../components/ui.jsx';
import { useCart } from '../context/CartContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { formatPrice } from '../utils/format.js';
import { CATEGORY_LABELS } from '../utils/constants.js';
import { useCurrency } from '../hooks/useCurrency.js';

export default function CartPage() {
  useCurrency();
  const { items, count, subtotal, updateQty, remove, loading } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const shipping = subtotal >= 500 ? 0 : 25;
  const tax = subtotal * 0.18;
  const total = subtotal + tax + shipping;

  if (loading) return <div className="py-24 text-center text-sm text-text-muted">Loading your cart…</div>;

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16">
        <EmptyState title="Your cart is empty" description="Explore the fabric library or ask Weaver AI."
          action={<div className="flex gap-3">
            <Link to="/products" className="neo-raised-gold rounded-xl px-5 py-2.5 text-sm font-bold">Browse fabrics</Link>
            <Link to="/assistant" className="rounded-xl border border-gold-500/30 px-5 py-2.5 text-sm font-semibold text-gold-400">Ask Weaver</Link>
          </div>} />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <h1 className="font-display text-3xl font-bold text-text-primary">Shopping cart</h1>
      <p className="mt-1 text-sm text-text-secondary">{count} {count === 1 ? 'item' : 'items'} in your cart</p>

      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_360px]">
        <div className="space-y-4">
          {items.map((it) => {
            const p = it.product;
            const productId = p._id || p.id;
            return (
              <div key={productId} className="neo-raised flex flex-col gap-4 rounded-2xl p-4 sm:flex-row">
                <Link to={`/products/${p.slug}`} className="block h-28 w-full shrink-0 overflow-hidden rounded-xl sm:w-28">
                  <ProductImage product={p} className="aspect-[4/3] h-full w-full" />
                </Link>
                <div className="flex flex-1 flex-col">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wider text-text-muted">{CATEGORY_LABELS[p.category] || p.category}</p>
                      <Link to={`/products/${p.slug}`} className="font-display text-lg font-semibold text-text-primary hover:text-gold-400">{p.name}</Link>
                      <p className="mt-0.5 font-mono text-sm text-text-secondary">{formatPrice(p.price)}/{p.unit}{it.color ? ` · ${it.color}` : ''}</p>
                    </div>
                    <button type="button" onClick={() => remove(productId)} className="rounded-lg p-2 text-text-muted transition hover:text-coral-400" title="Remove">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                        <path d="M3 6h18M8 6V4a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2m3 0v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" />
                      </svg>
                    </button>
                  </div>
                  <div className="mt-3 flex items-center justify-between">
                    <div className="neo-flat flex items-center overflow-hidden rounded-xl">
                      <button type="button" onClick={() => updateQty(productId, it.quantity - 1)} className="px-3 py-1.5 text-text-secondary hover:text-text-primary transition">−</button>
                      <span className="w-10 text-center text-sm font-semibold text-text-primary">{it.quantity}</span>
                      <button type="button" onClick={() => updateQty(productId, it.quantity + 1)} className="px-3 py-1.5 text-text-secondary hover:text-text-primary transition">+</button>
                    </div>
                    <p className="font-mono text-lg font-bold text-gold-400">{formatPrice(p.price * it.quantity)}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <GlassPanel className="h-fit p-6">
          <h2 className="font-display text-xl font-bold text-text-primary">Order summary</h2>
          <div className="mt-4 space-y-2 text-sm">
            <div className="flex justify-between text-text-secondary"><span>Subtotal</span><span className="font-mono">{formatPrice(subtotal)}</span></div>
            <div className="flex justify-between text-text-secondary"><span>Tax (18%)</span><span className="font-mono">{formatPrice(tax)}</span></div>
            <div className="flex justify-between text-text-secondary"><span>Shipping</span><span>{shipping === 0 ? 'Free' : formatPrice(shipping)}</span></div>
            <div className="flex justify-between border-t border-void-600/50 pt-3 text-base font-bold text-text-primary">
              <span>Total</span><span className="font-mono text-gold-400">{formatPrice(total)}</span>
            </div>
          </div>
          {!user && <p className="mt-4 rounded-lg bg-gold-500/10 px-3 py-2 text-xs text-gold-400">Log in as a buyer to place this order.</p>}
          <NeoButton onClick={() => navigate(user?.role === 'buyer' ? '/checkout' : '/login')} className="mt-5 w-full">
            {user?.role === 'buyer' ? 'Proceed to checkout' : 'Log in to checkout'}
          </NeoButton>
          <Link to="/products" className="mt-3 block text-center text-sm font-semibold text-gold-400 hover:text-gold-300">Continue shopping</Link>
        </GlassPanel>
      </div>
    </div>
  );
}
