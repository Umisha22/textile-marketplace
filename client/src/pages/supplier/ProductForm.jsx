import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { api } from '../../api/client.js';
import { Spinner } from '../../components/ui.jsx';
import GlassPanel from '../../components/design-system/GlassPanel.jsx';
import NeoButton from '../../components/design-system/NeoButton.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import { CATEGORY_LABELS, FABRIC_TYPE_LABELS } from '../../utils/constants.js';

const emptyForm = {
  name: '',
  description: '',
  category: 'cotton',
  fabricType: '',
  price: '',
  unit: 'meter',
  stock: '',
  moq: '',
  colors: '',
  tags: '',
  composition: '',
  gsm: '',
  width: '',
  weave: '',
  finish: '',
  isActive: true,
  featured: false,
};

export default function ProductForm() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isEdit) return;
    api
      .get('/supplier/products')
      .then((d) => {
        const p = d.products.find((x) => String(x._id) === String(id));
        if (!p) throw new Error('Product not found.');
        const spec = p.specifications || {};
        setForm({
          name: p.name,
          description: p.description,
          category: p.category,
          fabricType: p.fabricType || '',
          price: p.price,
          unit: p.unit,
          stock: p.stock,
          moq: p.moq || '',
          colors: (p.colors || []).map((c) => c.name).join(', '),
          tags: (p.tags || []).join(', '),
          composition: spec.composition || '',
          gsm: spec.gsm || '',
          width: spec.width || '',
          weave: spec.weave || '',
          finish: spec.finish || '',
          isActive: p.isActive,
          featured: p.featured,
        });
      })
      .catch((e) => toast(e.message, 'error'))
      .finally(() => setLoading(false));
  }, [id, isEdit, toast]);

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });
  const setCheck = (k) => (e) => setForm({ ...form, [k]: e.target.checked });

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    if (!form.name.trim() || !form.description.trim()) {
      setError('Name and description are required.');
      return;
    }
    if (!form.price || !form.stock) {
      setError('Price and stock are required.');
      return;
    }

    const payload = {
      name: form.name.trim(),
      description: form.description.trim(),
      category: form.category,
      fabricType: form.fabricType || undefined,
      price: Number(form.price),
      unit: form.unit,
      stock: Number(form.stock),
      moq: form.moq ? Number(form.moq) : 100,
      colors: form.colors
        .split(',')
        .map((c) => c.trim())
        .filter(Boolean)
        .map((name) => ({ name })),
      tags: form.tags
        .split(',')
        .map((t) => t.trim().toLowerCase())
        .filter(Boolean),
      specifications: {
        composition: form.composition || undefined,
        gsm: form.gsm || undefined,
        width: form.width || undefined,
        weave: form.weave || undefined,
        finish: form.finish || undefined,
      },
      isActive: form.isActive,
      featured: form.featured,
    };

    setSaving(true);
    try {
      if (isEdit) {
        await api.put(`/supplier/products/${id}`, payload);
        toast('Product updated');
      } else {
        await api.post('/supplier/products', payload);
        toast('Product added to your inventory');
      }
      navigate('/supplier/products');
    } catch (err) {
      setError(err.message);
      setSaving(false);
    }
  };

  const inputCls = 'w-full rounded-xl border border-void-600 bg-void-700/50 px-4 py-2.5 text-sm text-text-primary placeholder:text-text-muted outline-none focus:border-gold-500/30 focus:ring-1 focus:ring-gold-500/20';

  if (loading) {
    return <div className="flex justify-center py-24"><Spinner className="h-10 w-10 text-gold-400" /></div>;
  }

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="font-display text-3xl font-bold text-text-primary">
        {isEdit ? 'Edit product' : 'Add new product'}
      </h1>
      <p className="mt-1 text-sm text-text-secondary">
        {isEdit ? 'Update details, stock or availability.' : 'List a new fabric in your inventory.'}
      </p>

      <form onSubmit={submit} className="mt-8 space-y-6">
        <GlassPanel className="p-6">
          <h2 className="font-display text-lg font-bold text-text-primary">Basics</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className="text-sm font-medium text-text-secondary">Product name *</label>
              <input required value={form.name} onChange={set('name')} placeholder="e.g. Egyptian Cotton Poplin 100s" className={`mt-1.5 ${inputCls}`} />
            </div>
            <div className="sm:col-span-2">
              <label className="text-sm font-medium text-text-secondary">Description *</label>
              <textarea required rows={3} value={form.description} onChange={set('description')} placeholder="Composition, handfeel, best uses…" className={`mt-1.5 ${inputCls}`} />
            </div>
            <div>
              <label className="text-sm font-medium text-text-secondary">Category *</label>
              <select value={form.category} onChange={set('category')} className={`mt-1.5 ${inputCls}`}>
                {Object.entries(CATEGORY_LABELS).map(([v, l]) => (
                  <option key={v} value={v}>{l}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-text-secondary">Fabric type</label>
              <select value={form.fabricType} onChange={set('fabricType')} className={`mt-1.5 ${inputCls}`}>
                <option value="">Select…</option>
                {Object.entries(FABRIC_TYPE_LABELS).map(([v, l]) => (
                  <option key={v} value={v}>{l}</option>
                ))}
              </select>
            </div>
          </div>
        </GlassPanel>

        <GlassPanel className="p-6">
          <h2 className="font-display text-lg font-bold text-text-primary">Pricing & inventory</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div>
              <label className="text-sm font-medium text-text-secondary">Price *</label>
              <input type="number" min="0" step="0.01" required value={form.price} onChange={set('price')} placeholder="4.20" className={`mt-1.5 ${inputCls}`} />
            </div>
            <div>
              <label className="text-sm font-medium text-text-secondary">Unit</label>
              <select value={form.unit} onChange={set('unit')} className={`mt-1.5 ${inputCls}`}>
                {['meter', 'yard', 'roll', 'kg'].map((u) => <option key={u} value={u}>{u}</option>)}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-text-secondary">Stock (units) *</label>
              <input type="number" min="0" required value={form.stock} onChange={set('stock')} placeholder="10000" className={`mt-1.5 ${inputCls}`} />
            </div>
            <div>
              <label className="text-sm font-medium text-text-secondary">MOQ</label>
              <input type="number" min="1" value={form.moq} onChange={set('moq')} placeholder="100" className={`mt-1.5 ${inputCls}`} />
            </div>
          </div>

          <div className="mt-4 flex flex-wrap gap-6">
            <label className="flex items-center gap-2 text-sm font-medium text-text-secondary">
              <input type="checkbox" checked={form.isActive} onChange={setCheck('isActive')} className="h-4 w-4 accent-gold-500" />
              Available to buyers
            </label>
            <label className="flex items-center gap-2 text-sm font-medium text-text-secondary">
              <input type="checkbox" checked={form.featured} onChange={setCheck('featured')} className="h-4 w-4 accent-gold-500" />
              Featured on homepage
            </label>
          </div>
        </GlassPanel>

        <GlassPanel className="p-6">
          <h2 className="font-display text-lg font-bold text-text-primary">Specifications</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            {[
              ['composition', 'Composition'],
              ['gsm', 'Weight (GSM)'],
              ['width', 'Width'],
              ['weave', 'Weave'],
              ['finish', 'Finish'],
            ].map(([k, l]) => (
              <div key={k}>
                <label className="text-sm font-medium text-text-secondary">{l}</label>
                <input value={form[k]} onChange={set(k)} placeholder={l} className={`mt-1.5 ${inputCls}`} />
              </div>
            ))}
          </div>
        </GlassPanel>

        <GlassPanel className="p-6">
          <h2 className="font-display text-lg font-bold text-text-primary">Colors & tags</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div>
              <label className="text-sm font-medium text-text-secondary">Colors (comma separated)</label>
              <input value={form.colors} onChange={set('colors')} placeholder="White, Navy, Beige" className={`mt-1.5 ${inputCls}`} />
            </div>
            <div>
              <label className="text-sm font-medium text-text-secondary">Tags (comma separated)</label>
              <input value={form.tags} onChange={set('tags')} placeholder="summer, shirting, breathable" className={`mt-1.5 ${inputCls}`} />
            </div>
          </div>
        </GlassPanel>

        {error && <p className="rounded-lg bg-coral-500/10 border border-coral-500/20 px-3 py-2 text-sm text-coral-400">{error}</p>}

        <div className="flex gap-3">
          <NeoButton type="submit" disabled={saving}>
            {saving && <Spinner className="h-4 w-4" />}
            {isEdit ? 'Save changes' : 'Add product'}
          </NeoButton>
          <button
            type="button"
            onClick={() => navigate('/supplier/products')}
            className="rounded-xl border border-void-500/50 px-6 py-3 text-sm font-semibold text-text-secondary hover:border-gold-500/30 hover:text-gold-400 transition"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
