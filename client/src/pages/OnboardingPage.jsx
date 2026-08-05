import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { api } from '../api/client.js';
import { Spinner } from '../components/ui.jsx';
import GlassPanel from '../components/design-system/GlassPanel.jsx';
import NeoButton from '../components/design-system/NeoButton.jsx';
import { CURRENCIES } from '../utils/currency.js';

export default function OnboardingPage() {
  const { user, refreshUser } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const isSupplier = user?.role === 'supplier';

  const done = async () => {
    await refreshUser();
    toast('Profile complete!');
    navigate(isSupplier ? '/supplier' : '/', { replace: true });
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <div className="text-center">
        <span className="inline-flex items-center gap-2 rounded-full bg-gold-500/10 px-3.5 py-1.5 text-xs font-semibold text-gold-400 border border-gold-500/20">
          {isSupplier ? 'Supplier onboarding' : 'Buyer onboarding'}
        </span>
        <h1 className="mt-3 font-display text-3xl font-bold text-text-primary">
          {isSupplier ? "Let's set up your business" : 'Tell us about your business'}
        </h1>
        <p className="mx-auto mt-2 max-w-md text-sm text-text-secondary">
          {isSupplier
            ? 'Fill in your business details so buyers can find and trust your mill.'
            : 'Fill in your preferences and we will personalize the marketplace for you.'}
        </p>
      </div>

      <OnboardingForm isSupplier={isSupplier} onDone={done} />
    </div>
  );
}

function OnboardingForm({ isSupplier, onDone }) {
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    businessType: '',
    industry: 'fashion',
    interests: [],
    fabricTypes: [],
    typicalOrderQuantity: '500_2000',
    budgetRange: '50k_200k',
    colorPreferences: [],
    currency: 'USD',
    businessName: '',
    contactEmail: '',
    contactPhone: '',
    operatingHours: 'weekdays_9_6',
    moq: 100,
    description: '',
  });

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });
  const toggle = (k) => (v) =>
    setForm({ ...form, [k]: form[k].includes(v) ? form[k].filter((x) => x !== v) : [...form[k], v] });

  const save = async () => {
    setSaving(true);
    try {
      const profile = isSupplier
        ? {
            businessName: form.businessName,
            businessType: form.businessType,
            contactEmail: form.contactEmail,
            contactPhone: form.contactPhone,
            categories: form.interests,
            fabricTypes: form.fabricTypes,
            moq: Number(form.moq),
            description: form.description,
            operatingHours: form.operatingHours,
            currency: form.currency,
          }
        : {
            businessType: form.businessType,
            industry: form.industry,
            interests: form.interests,
            fabricTypes: form.fabricTypes,
            typicalOrderQuantity: form.typicalOrderQuantity,
            budgetRange: form.budgetRange,
            colorPreferences: form.colorPreferences,
            currency: form.currency,
          };
      await api.put('/auth/profile', {
        [isSupplier ? 'supplierProfile' : 'buyerProfile']: profile,
      });
      await onDone();
    } catch (e) {
      toast(e.message, 'error');
      setSaving(false);
    }
  };

  const options = (key) => (list) =>
    list.map((v) => (
      <label key={v} className="flex items-center gap-2 rounded-lg border border-void-600/50 bg-void-700/50 px-3 py-2 text-sm text-text-secondary hover:border-gold-500/30 transition">
        <input
          type="checkbox"
          checked={form[key].includes(v)}
          onChange={(e) => toggle(key)(v)}
          className="accent-gold-500"
        />
        {v}
      </label>
    ));

  const interestsOptions = options('interests');
  const colorsOptions = options('colorPreferences');

  const inputCls = 'w-full rounded-xl border border-void-600 bg-void-700/50 px-4 py-2.5 text-sm text-text-primary placeholder:text-text-muted outline-none focus:border-gold-500/30 focus:ring-1 focus:ring-gold-500/20';

  return (
    <GlassPanel className="mt-8 p-6 sm:p-8">
      <h2 className="font-display text-xl font-bold text-text-primary">Profile details</h2>
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        {isSupplier ? (
          <>
            <div className="sm:col-span-2">
              <label className="text-sm font-medium text-text-secondary">Business name *</label>
              <input required value={form.businessName} onChange={set('businessName')} placeholder="e.g. Weaver Textiles Ltd." className={`mt-1.5 ${inputCls}`} />
            </div>
            <div>
              <label className="text-sm font-medium text-text-secondary">Business type</label>
              <input value={form.businessType} onChange={set('businessType')} placeholder="Mill, exporter, trader…" className={`mt-1.5 ${inputCls}`} />
            </div>
            <div>
              <label className="text-sm font-medium text-text-secondary">Contact email</label>
              <input type="email" value={form.contactEmail} onChange={set('contactEmail')} placeholder="sales@yourmill.com" className={`mt-1.5 ${inputCls}`} />
            </div>
            <div>
              <label className="text-sm font-medium text-text-secondary">Contact phone</label>
              <input value={form.contactPhone} onChange={set('contactPhone')} placeholder="+91…" className={`mt-1.5 ${inputCls}`} />
            </div>
            <div>
              <label className="text-sm font-medium text-text-secondary">Operating hours</label>
              <select value={form.operatingHours} onChange={set('operatingHours')} className={`mt-1.5 ${inputCls}`}>
                {[['weekdays_9_6', 'Weekdays 9 AM – 6 PM'], ['weekdays_10_8', 'Weekdays 10 AM – 8 PM'], ['mon_sat_9_7', 'Mon–Sat 9 AM – 7 PM'], ['all_week_10_8', 'All week 10 AM – 8 PM'], ['custom', 'Custom']].map(([v, l]) => (
                  <option key={v} value={v}>{l}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-text-secondary">MOQ (units)</label>
              <input type="number" value={form.moq} onChange={set('moq')} className={`mt-1.5 ${inputCls}`} />
            </div>
          </>
        ) : (
          <>
            <div>
              <label className="text-sm font-medium text-text-secondary">Business type</label>
              <input value={form.businessType} onChange={set('businessType')} placeholder="Designer, brand, manufacturer…" className={`mt-1.5 ${inputCls}`} />
            </div>
            <div>
              <label className="text-sm font-medium text-text-secondary">Industry</label>
              <select value={form.industry} onChange={set('industry')} className={`mt-1.5 ${inputCls}`}>
                {['fashion', 'home_textiles', 'upholstery', 'technical_textiles', 'accessories', 'footwear', 'crafts'].map((v) => (
                  <option key={v} value={v}>{v.replaceAll('_', ' ')}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-text-secondary">Typical order quantity</label>
              <select value={form.typicalOrderQuantity} onChange={set('typicalOrderQuantity')} className={`mt-1.5 ${inputCls}`}>
                {[['under_500', 'Under 500'], ['500_2000', '500 – 2,000'], ['2000_10000', '2,000 – 10,000'], ['over_10000', '10,000+']].map(([v, l]) => (
                  <option key={v} value={v}>{l}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-text-secondary">Budget range</label>
              <select value={form.budgetRange} onChange={set('budgetRange')} className={`mt-1.5 ${inputCls}`}>
                {[['under_50k', 'Under $50K'], ['50k_200k', '$50K – $200K'], ['200k_500k', '$200K – $500K'], ['over_500k', 'Over $500K']].map(([v, l]) => (
                  <option key={v} value={v}>{l}</option>
                ))}
              </select>
            </div>
          </>
        )}
        <div className={isSupplier ? 'sm:col-span-2' : ''}>
          <label className="text-sm font-medium text-text-secondary">Categories of interest</label>
          <div className="mt-1.5 grid grid-cols-2 gap-2 sm:grid-cols-3">
            {interestsOptions(['cotton', 'silk', 'linen', 'wool', 'denim', 'polyester', 'viscose', 'blends', 'lace', 'embroidery', 'technical'])}
          </div>
        </div>
        <div className="sm:col-span-2">
          <label className="text-sm font-medium text-text-secondary">Fabric types</label>
          <div className="mt-1.5 grid grid-cols-2 gap-2 sm:grid-cols-3">
            {options('fabricTypes')(['woven', 'knit', 'poplin', 'chiffon', 'satin', 'georgette', 'jacquard', 'muslin', 'canvas', 'twill', 'velvet', 'crepe'])}
          </div>
        </div>
        {!isSupplier && (
          <div className="sm:col-span-2">
            <label className="text-sm font-medium text-text-secondary">Preferred colors</label>
            <div className="mt-1.5 grid grid-cols-2 gap-2 sm:grid-cols-4">
              {colorsOptions(['white', 'black', 'navy', 'blue', 'beige', 'olive', 'maroon', 'green', 'pink', 'gold', 'purple', 'red'])}
            </div>
          </div>
        )}
        <div className="sm:col-span-2">
          <label className="text-sm font-medium text-text-secondary">Prices shown in</label>
          <select value={form.currency} onChange={set('currency')} className={`mt-1.5 ${inputCls}`}>
            {CURRENCIES.map((c) => (
              <option key={c.code} value={c.code}>{c.code} · {c.name}</option>
            ))}
          </select>
        </div>
      </div>
      <NeoButton onClick={save} disabled={saving || (isSupplier && !form.businessName)} className="mt-6">
        {saving && <Spinner className="h-4 w-4" />} Save profile
      </NeoButton>
    </GlassPanel>
  );
}
