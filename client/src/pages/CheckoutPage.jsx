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

const STEPS = ['Shipping', 'Review', 'Confirm'];

function StepTimeline({ current }) {
  return (
    <div className="flex items-center justify-center gap-0">
      {STEPS.map((step, i) => (
        <div key={step} className="flex items-center">
          <div className="flex flex-col items-center">
            <div className={`flex h-10 w-10 items-center justify-center rounded-full border-2 text-xs font-bold transition-all duration-500 ${
              i < current ? 'border-teal-500 bg-teal-500 text-white' :
              i === current ? 'border-gold-500 bg-gold-500 text-void-950 shadow-[0_0_20px_rgba(212,168,83,0.3)]' :
              'border-void-600 bg-void-700 text-text-muted'
            }`}>
              {i < current ? '✓' : i + 1}
            </div>
            <span className={`mt-1.5 text-[11px] font-semibold ${i <= current ? 'text-text-primary' : 'text-text-muted'}`}>{step}</span>
          </div>
          {i < STEPS.length - 1 && (
            <div className="relative mx-2 mb-5 h-[2px] w-16 overflow-hidden sm:w-24">
              <div className="absolute inset-0 bg-void-600" />
              <div
                className="absolute inset-y-0 left-0 bg-gradient-to-r from-teal-500 to-gold-500 transition-all duration-700 ease-out"
                style={{ width: i < current ? '100%' : i === current ? '50%' : '0%' }}
              />
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

export default function CheckoutPage() {
  useCurrency();
  const { items, subtotal, clear } = useCart();
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);

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

  const nextStep = () => setStep((s) => Math.min(s + 1, 2));
  const prevStep = () => setStep((s) => Math.max(s - 1, 0));

  const placeOrder = async () => {
    setError(''); setPlacing(true);
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

  const inputFocusCls = 'focus:border-gold-500/40 focus:shadow-[0_0_0_3px_rgba(212,168,83,0.08)] focus:outline-none';
  const inputCls = `w-full rounded-xl border border-void-600 bg-void-700/50 px-4 py-2.5 text-sm text-text-primary placeholder:text-text-muted transition-all duration-300 ${inputFocusCls}`;

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
      <h1 className="text-center font-display text-3xl font-bold text-text-primary">Checkout</h1>

      <div className="mt-8">
        <StepTimeline current={step} />
      </div>

      <div className="mt-8">
        {/* Step 0: Shipping */}
        {step === 0 && (
          <GlassPanel className="p-6 animate-fade-up">
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
            <div className="mt-6 flex justify-end">
              <NeoButton onClick={nextStep}>Continue to Review</NeoButton>
            </div>
          </GlassPanel>
        )}

        {/* Step 1: Review */}
        {step === 1 && (
          <GlassPanel className="p-6 animate-fade-up">
            <h2 className="font-display text-lg font-bold text-text-primary">Order review</h2>
            <div className="mt-4 space-y-3">
              {items.map((it) => {
                const p = it.product;
                return (
                  <div key={p._id || p.id} className="flex items-center gap-3 rounded-xl border border-void-600/30 bg-void-700/30 p-3">
                    <div className="h-14 w-14 shrink-0 overflow-hidden rounded-lg"><ProductImage product={p} className="!rounded-lg" /></div>
                    <div className="min-w-0 flex-1">
                      <p className="line-clamp-1 text-sm font-semibold text-text-primary">{p.name}</p>
                      <p className="text-xs text-text-muted">Qty {it.quantity} × {formatPrice(p.price)}</p>
                    </div>
                    <p className="font-mono text-sm font-bold text-gold-400">{formatPrice(p.price * it.quantity)}</p>
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
            <div className="mt-6 flex justify-between">
              <button onClick={prevStep} className="rounded-xl border border-void-500/50 px-5 py-2.5 text-sm font-semibold text-text-secondary hover:border-gold-500/30 transition">Back</button>
              <NeoButton onClick={nextStep}>Place Order</NeoButton>
            </div>
          </GlassPanel>
        )}

        {/* Step 2: Confirm */}
        {step === 2 && (
          <GlassPanel className="p-6 animate-fade-up text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-teal-500/20 border border-teal-500/30">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#00D4AA" strokeWidth="2.5" strokeLinecap="round" className="toast-success-icon"><path d="M8 12.5l2.5 2.5 5.5-5.5" /></svg>
            </div>
            <h2 className="mt-4 font-display text-2xl font-bold text-text-primary">Confirm your order</h2>
            <p className="mt-2 text-sm text-text-secondary">Total: <span className="font-mono font-bold text-gold-400">{formatPrice(total)}</span></p>
            <p className="text-xs text-text-muted">Ship to: {form.address}, {form.city}</p>
            {error && <p className="mt-4 rounded-lg bg-coral-500/10 border border-coral-500/20 px-3 py-2 text-sm text-coral-400">{error}</p>}
            <div className="mt-6 flex justify-center gap-3">
              <button onClick={prevStep} className="rounded-xl border border-void-500/50 px-5 py-2.5 text-sm font-semibold text-text-secondary hover:border-gold-500/30 transition">Back</button>
              <NeoButton onClick={placeOrder} disabled={placing}>
                {placing ? <><Spinner className="h-4 w-4" /> Placing…</> : 'Confirm & Place Order'}
              </NeoButton>
            </div>
          </GlassPanel>
        )}
      </div>
    </div>
  );
}
