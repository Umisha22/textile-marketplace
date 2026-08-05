import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../../api/client.js';
import ProductImage from '../../components/ProductImage.jsx';
import { Spinner, EmptyState } from '../../components/ui.jsx';
import NeoButton from '../../components/design-system/NeoButton.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import { formatPrice } from '../../utils/format.js';
import { CATEGORY_LABELS } from '../../utils/constants.js';
import { useCurrency } from '../../hooks/useCurrency.js';

export default function SupplierProducts() {
  useCurrency();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const navigate = useNavigate();

  const load = useCallback(() => {
    api
      .get('/supplier/products')
      .then((d) => setProducts(d.products))
      .catch(() => toast('Could not load products.', 'error'))
      .finally(() => setLoading(false));
  }, [toast]);

  useEffect(() => {
    load();
  }, [load]);

  const toggleActive = async (p) => {
    try {
      await api.put(`/supplier/products/${p._id}`, { isActive: !p.isActive });
      toast(p.isActive ? 'Product paused' : 'Product is now live');
      load();
    } catch (e) {
      toast(e.message, 'error');
    }
  };

  const remove = async (p) => {
    if (!window.confirm(`Delete "${p.name}"? This cannot be undone.`)) return;
    try {
      await api.del(`/supplier/products/${p._id}`);
      toast('Product deleted');
      load();
    } catch (e) {
      toast(e.message, 'error');
    }
  };

  if (loading) {
    return <div className="flex justify-center py-24"><Spinner className="h-10 w-10 text-gold-400" /></div>;
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold text-text-primary">Inventory</h1>
          <p className="mt-1 text-sm text-text-secondary">{products.length} products in your catalog.</p>
        </div>
        <Link to="/supplier/products/new">
          <NeoButton>+ Add product</NeoButton>
        </Link>
      </div>

      {products.length === 0 ? (
        <div className="mt-8">
          <EmptyState
            title="No products yet"
            description="Add your first fabric to start receiving orders."
            action={<Link to="/supplier/products/new" className="rounded-xl bg-gold-500 px-5 py-2.5 text-sm font-bold text-void-950">Add your first product</Link>}
          />
        </div>
      ) : (
        <div className="mt-8 overflow-hidden rounded-2xl border border-void-600/50 glass-strong">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead className="border-b border-void-600/50 bg-void-700/50 text-xs uppercase tracking-wider text-text-muted">
                <tr>
                  <th className="p-4">Product</th>
                  <th className="p-4">Price</th>
                  <th className="p-4">Stock</th>
                  <th className="p-4">MOQ</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map((p) => (
                  <tr key={p._id} className="border-b border-void-600/30 hover:bg-void-700/30">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="h-12 w-12 shrink-0 overflow-hidden rounded-lg">
                          <ProductImage product={p} className="!rounded-lg" />
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold text-text-primary">{p.name}</p>
                          <p className="text-xs text-text-muted">{CATEGORY_LABELS[p.category]} · {p.fabricType || '—'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 font-semibold text-gold-400">{formatPrice(p.price)}/{p.unit}</td>
                    <td className={`p-4 font-medium ${p.stock <= 300 ? 'text-coral-400' : 'text-text-primary'}`}>{p.stock.toLocaleString()}</td>
                    <td className="p-4 text-text-secondary">{p.moq || 100}</td>
                    <td className="p-4">
                      <button
                        type="button"
                        onClick={() => toggleActive(p)}
                        className={`rounded-full px-3 py-1 text-xs font-semibold transition ${
                          p.isActive ? 'bg-teal-500/20 text-teal-400 border border-teal-500/30' : 'bg-void-600/50 text-text-muted border border-void-500/50 hover:bg-void-600'
                        }`}
                      >
                        {p.isActive ? '● Live' : '○ Paused'}
                      </button>
                    </td>
                    <td className="p-4">
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => navigate(`/supplier/products/${p._id}/edit`)}
                          className="rounded-lg border border-void-500/50 px-3 py-1.5 text-xs font-semibold text-text-secondary hover:border-gold-500/30 hover:text-gold-400 transition"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => remove(p)}
                          className="rounded-lg border border-coral-500/20 px-3 py-1.5 text-xs font-semibold text-coral-400 hover:bg-coral-500/10 transition"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
