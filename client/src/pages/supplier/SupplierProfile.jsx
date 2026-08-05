import { useEffect, useState } from 'react';
import { api } from '../../api/client.js';
import { Spinner } from '../../components/ui.jsx';
import GlassPanel from '../../components/design-system/GlassPanel.jsx';
import NeoButton from '../../components/design-system/NeoButton.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import { CURRENCIES, setCurrency } from '../../utils/currency.js';

export default function SupplierProfile() {
  const { user, refreshUser } = useAuth();
  const { toast } = useToast();
  const p = user?.supplierProfile || {};

  const [form, setForm] = useState({
    businessName: '',
    businessType: '',
    contactEmail: '',
    contactPhone: '',
    addressLine1: '',
    addressCity: '',
    addressState: '',
    addressCountry: '',
    operatingHours: 'weekdays_9_6',
    categories: [],
    fabricTypes: [],
    moq: 100,
    description: '',
    currency: 'USD',
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setForm({
      businessName: p.businessName || '',
      businessType: p.businessType || '',
      contactEmail: p.contactEmail || '',
      contactPhone: p.contactPhone || '',
      addressLine1: p.address?.line1 || '',
      addressCity: p.address?.city || '',
      addressState: p.address?.state || '',
      addressCountry: p.address?.country || '',
      operatingHours: p.operatingHours || 'weekdays_9_6',
      categories: p.categories || [],
      fabricTypes: p.fabricTypes || [],
      moq: p.moq || 100,
      description: p.description || '',
      currency: p.currency || 'USD',
    });
  }, []);

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });
  const toggleList = (key) => (v) =>
    setForm({
      ...form,
      [key]: form[key].includes(v) ? form[key].filter((x) => x !== v) : [...form[key], v],
    });

  const save = async () => {
    setSaving(true);
    try {
      await api.put('/auth/profile', {
        supplierProfile: {
          businessName: form.businessName,
          businessType: form.businessType,
          contactEmail: form.contactEmail,
          contactPhone: form.contactPhone,
          address: {
            line1: form.addressLine1,
            city: form.addressCity,
            state: form.addressState,
            country: form.addressCountry,
          },
          operatingHours: form.operatingHours,
          categories: form.categories,
          fabricTypes: form.fabricTypes,
          moq: Number(form.moq),
          description: form.description,
          currency: form.currency,
        },
      });
      await refreshUser();
      setCurrency(form.currency);
      toast('Profile updated');
    } catch (e) {
      toast(e.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  const inputCls = 'w-full rounded-xl border border-void-600 bg-void-700/50 px-4 py-2.5 text-sm text-text-primary placeholder:text-text-muted outline-none focus:border-gold-500/30 focus:ring-1 focus:ring-gold-500/20';
  const chip = (active) =>
    `rounded-full border px-3 py-1.5 text-xs font-semibold transition ${active ? 'border-gold-500/30 bg-gold-500/10 text-gold-400' : 'border-void-600/50 bg-void-700/50 text-text-muted hover:border-gold-500/30 hover:text-gold-400'}`;

  if (!user) return null;

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="font-display text-3xl font-bold text-text-primary">Business profile</h1>
      <p className="mt-1 text-sm text-text-secondary">This information is shown to buyers on your product pages.</p>

      <div className="mt-8 space-y-6">
        <GlassPanel className="p-6">
          <h2 className="font-display text-lg font-bold text-text-primary">Identity & contact</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div>
              <label className="text-sm font-medium text-text-secondary">Business name *</label>
              <input value={form.businessName} onChange={set('businessName')} className={`mt-1.5 ${inputCls}`} />
            </div>
            <div>
              <label className="text-sm font-medium text-text-secondary">Business type</label>
              <input value={form.businessType} onChange={set('businessType')} placeholder="Mill, exporter, trader…" className={`mt-1.5 ${inputCls}`} />
            </div>
            <div>
              <label className="text-sm font-medium text-text-secondary">Contact email</label>
              <input type="email" value={form.contactEmail} onChange={set('contactEmail')} className={`mt-1.5 ${inputCls}`} />
            </div>
            <div>
              <label className="text-sm font-medium text-text-secondary">Contact phone</label>
              <input value={form.contactPhone} onChange={set('contactPhone')} className={`mt-1.5 ${inputCls}`} />
            </div>
          </div>
        </GlassPanel>

        <GlassPanel className="p-6">
          <h2 className="font-display text-lg font-bold text-text-primary">Address & hours</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className="text-sm font-medium text-text-secondary">Street address</label>
              <input value={form.addressLine1} onChange={set('addressLine1')} className={`mt-1.5 ${inputCls}`} />
            </div>
            <div>
              <label className="text-sm font-medium text-text-secondary">City</label>
              <input value={form.addressCity} onChange={set('addressCity')} className={`mt-1.5 ${inputCls}`} />
            </div>
            <div>
              <label className="text-sm font-medium text-text-secondary">State</label>
              <input value={form.addressState} onChange={set('addressState')} className={`mt-1.5 ${inputCls}`} />
            </div>
            <div>
              <label className="text-sm font-medium text-text-secondary">Country</label>
              <input value={form.addressCountry} onChange={set('addressCountry')} className={`mt-1.5 ${inputCls}`} />
            </div>
            <div>
              <label className="text-sm font-medium text-text-secondary">Operating hours</label>
              <select value={form.operatingHours} onChange={set('operatingHours')} className={`mt-1.5 ${inputCls}`}>
                {[
                  ['weekdays_9_6', 'Weekdays 9 AM – 6 PM'],
                  ['weekdays_10_8', 'Weekdays 10 AM – 8 PM'],
                  ['mon_sat_9_7', 'Mon–Sat 9 AM – 7 PM'],
                  ['all_week_10_8', 'All week 10 AM – 8 PM'],
                  ['custom', 'Custom'],
                ].map(([v, l]) => (
                  <option key={v} value={v}>{l}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-text-secondary">Prices shown in</label>
              <select value={form.currency} onChange={set('currency')} className={`mt-1.5 ${inputCls}`}>
                {CURRENCIES.map((c) => (
                  <option key={c.code} value={c.code}>{c.code} · {c.name}</option>
                ))}
              </select>
            </div>
          </div>
        </GlassPanel>

        <GlassPanel className="p-6">
          <h2 className="font-display text-lg font-bold text-text-primary">Catalog & MOQ</h2>
          <div className="mt-4">
            <p className="text-sm font-medium text-text-secondary">Categories you supply</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {['cotton', 'silk', 'linen', 'wool', 'denim', 'polyester', 'viscose', 'blends', 'lace', 'embroidery', 'technical'].map((c) => (
                <button key={c} type="button" onClick={() => toggleList('categories')(c)} className={chip(form.categories.includes(c))}>
                  {c}
                </button>
              ))}
            </div>
          </div>
          <div className="mt-4">
            <p className="text-sm font-medium text-text-secondary">Fabric types</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {['poplin', 'chiffon', 'satin', 'jacquard', 'denim', 'muslin', 'canvas', 'velvet', 'knit', 'twill', 'georgette', 'organza'].map((f) => (
                <button key={f} type="button" onClick={() => toggleList('fabricTypes')(f)} className={chip(form.fabricTypes.includes(f))}>
                  {f}
                </button>
              ))}
            </div>
          </div>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div>
              <label className="text-sm font-medium text-text-secondary">Minimum order quantity (units)</label>
              <input type="number" min="1" value={form.moq} onChange={set('moq')} className={`mt-1.5 ${inputCls}`} />
            </div>
            <div>
              <label className="text-sm font-medium text-text-secondary">Description</label>
              <input value={form.description} onChange={set('description')} placeholder="Your mill's story, certifications…" className={`mt-1.5 ${inputCls}`} />
            </div>
          </div>
        </GlassPanel>

        <NeoButton onClick={save} disabled={saving || !form.businessName}>
          {saving && <Spinner className="h-4 w-4" />} Save profile
        </NeoButton>
      </div>
    </div>
  );
}
