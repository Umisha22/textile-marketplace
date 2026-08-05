import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ProductImage from '../components/ProductImage.jsx';
import NeoButton from '../components/design-system/NeoButton.jsx';
import GlassPanel from '../components/design-system/GlassPanel.jsx';
import { Spinner } from '../components/ui.jsx';
import { useCart } from '../context/CartContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { api } from '../api/client.js';
import { formatPrice } from '../utils/format.js';
import { useCurrency } from '../hooks/useCurrency.js';

export default function CheckoutPage() {
  useCurrency();
  const { items, subtotal, clear } = useCart();
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    fullName: user?.name || '', company: '', address: '', city: '', state: '', postalCode: '', country: 'India', phone: '',
  });
  const [notes, setNotes] = useState('');
  const [placing, setPlacing] = useState(false);
  const [error, setError] = useState('');

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });
  const shipping = subtotal >= 500 ? 0 : 25;
  const tax = subtotal * 0.18;
  const total = subtotal + tax + shipping;

  const placeOrder = async (e) => {
    e.preventDefault(); setError(''); setPlacing(true);
    try {
      const data = await api.post('/orders', { shippingAddress: form, notes });
      await clear(); toast('Order placed successfully!');
      navigate(`/order-confirmation/${data.orders[0]._id}`);
    } catch (err) { setError(err.message); setPlacing(false); }
  };

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-xl px-4 py-24 text-center">
        <p className="text-lg font-semibold text-text-primary">Your cart is empty.</p>
        <a href="/products" className="mt-3 inline-block rounded-xl bg-gold-500 px-5 py-2.5 text-sm font-bold text-void-950">Browse fabrics</a>
      </div>
    );
  }

  const inputCls = 'w-full rounded-xl border border-void-600 bg-void-700/50 px-4 py-2.5 text-sm text-text-primary placeholder:text-text-muted outline-none focus:border-gold-500/30 focus:ring-1 focus:ring-gold-500/20';

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <h1 className="font-display text-3xl font-bold text-text-primary">Checkout</h1>
      <p className="mt-1 text-sm text-text-secondary">Shipping info · order review · place order (no payment in this prototype)</p>

      <form onSubmit={placeOrder} className="mt-8 grid gap-8 lg:grid-cols-[1fr_380px]">
        <GlassPanel className="p-6">
          <h2 className="font-display text-lg font-bold text-text-primary">Shipping information</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div><label className="text-sm font-medium text-text-secondary">Full name *</label><input required value={form.fullName} onChange={set('fullName')} className={`mt-1.5 ${inputCls}`} /></div>
            <div><label className="text-sm font-medium text-text-secondary">Company</label><input value={form.company} onChange={set('company')} className={`mt-1.5 ${inputCls}`} /></div>
            <div className="sm:col-span-2"><label className="text-sm font-medium text-text-secondary">Street address *</label><input required value={form.address} onChange={set('address')} placeholder="Building, street, area" className={`mt-1.5 ${inputCls}`} /></div>
            <div><label className="text-sm font-medium text-text-secondary">City *</label><input required value={form.city} onChange={set('city')} className={`mt-1.5 ${inputCls}`} /></div>
            <div><label className="text-sm font-medium text-text-secondary">State</label><input value={form.state} onChange={set('state')} className={`mt-1.5 ${inputCls}`} /></div>
            <div><label className="text-sm font-medium text-text-secondary">Postal code</label><input value={form.postalCode} onChange={set('postalCode')} className={`mt-1.5 ${inputCls}`} /></div>
            <div><label className="text-sm font-medium text-text-secondary">Country *</label><input required value={form.country} onChange={set('country')} className={`mt-1.5 ${inputCls}`} /></div>
            <div className="sm:col-span-2"><label className="text-sm font-medium text-text-secondary">Phone</label><input value={form.phone} onChange={set('phone')} className={`mt-1.5 ${inputCls}`} /></div>
            <div className="sm:col-span-2"><label className="text-sm font-medium text-text-secondary">Order notes (optional)</label><textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} className={`mt-1.5 ${inputCls}`} /></div>
          </div>
        </GlassPanel>

        <GlassPanel className="h-fit p-6">
          <h2 className="font-display text-lg font-bold text-text-primary">Order review</h2>
          <div className="mt-4 space-y-3">
            {items.map((it) => {
              const p = it.product;
              return (
                <div key={p._id || p.id} className="flex items-center gap-3">
                  <div className="h-12 w-12 shrink-0 overflow-hidden rounded-lg"><ProductImage product={p} className="!rounded-lg" /></div>
                  <div className="min-w-0 flex-1">
                    <p className="line-clamp-1 text-sm font-semibold text-text-primary">{p.name}</p>
                    <p className="text-xs text-text-muted">Qty {it.quantity} × {formatPrice(p.price)}</p>
                  </div>
                  <p className="font-mono text-sm font-semibold text-gold-400">{formatPrice(p.price * it.quantity)}</p>
                </div>
              );
            })}
          </div>
          <div className="mt-5 space-y-2 border-t border-void-600/50 pt-4 text-sm">
            <div className="flex justify-between text-text-secondary"><span>Subtotal</span><span className="font-mono">{formatPrice(subtotal)}</span></div>
            <div className="flex justify-between text-text-secondary"><span>Tax (18%)</span><span className="font-mono">{formatPrice(tax)}</span></div>
            <div className="flex justify-between text-text-secondary"><span>Shipping</span><span>{shipping === 0 ? 'Free' : formatPrice(shipping)}</span></div>
            <div className="flex justify-between border-t border-void-600/50 pt-3 text-base font-bold text-text-primary">
              <span>Total</span><span className="font-mono text-gold-400">{formatPrice(total)}</span>
            </div>
          </div>
          {error && <p className="mt-4 rounded-lg bg-coral-500/10 border border-coral-500/20 px-3 py-2 text-sm text-coral-400">{error}</p>}
          <NeoButton type="submit" disabled={placing} className="mt-5 w-full">
            {placing ? <><Spinner className="h-4 w-4" /> Placing order…</> : 'Place order'}
          </NeoButton>
          <p className="mt-3 text-center text-xs text-text-muted">Payment, escrow and logistics are outside the scope of this prototype.</p>
        </GlassPanel>
      </form>
    </div>
  );
}
