import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../../api/client.js';
import ProductImage from '../../components/ProductImage.jsx';
import { Spinner, EmptyState } from '../../components/ui.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import { formatPrice } from '../../utils/format.js';
import { CATEGORY_LABELS } from '../../utils/constants.js';

export default function SupplierProducts() {
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
    return <div className="flex justify-center py-24"><Spinner className="h-10 w-10 text-brand-600" /></div>;
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold text-brand-900">Inventory</h1>
          <p className="mt-1 text-sm text-brand-500">{products.length} products in your catalog.</p>
        </div>
        <Link to="/supplier/products/new" className="rounded-xl bg-clay-500 px-4 py-2.5 text-sm font-bold text-white hover:bg-clay-600">
          + Add product
        </Link>
      </div>

      {products.length === 0 ? (
        <div className="mt-8">
          <EmptyState
            title="No products yet"
            description="Add your first fabric to start receiving orders."
            action={<Link to="/supplier/products/new" className="rounded-xl bg-brand-800 px-5 py-2.5 text-sm font-semibold text-white">Add your first product</Link>}
          />
        </div>
      ) : (
        <div className="mt-8 overflow-hidden rounded-2xl border border-brand-100 bg-white shadow-soft">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead className="border-b border-brand-100 bg-brand-50 text-xs uppercase tracking-wider text-brand-500">
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
                  <tr key={p._id} className="border-b border-brand-50 hover:bg-brand-50/40">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="h-12 w-12 shrink-0 overflow-hidden rounded-lg">
                          <ProductImage product={p} className="!rounded-lg" />
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold text-brand-900">{p.name}</p>
                          <p className="text-xs text-brand-400">{CATEGORY_LABELS[p.category]} · {p.fabricType || '—'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 font-semibold text-brand-900">{formatPrice(p.price)}/{p.unit}</td>
                    <td className={`p-4 font-medium ${p.stock <= 300 ? 'text-clay-600' : 'text-brand-900'}`}>{p.stock.toLocaleString()}</td>
                    <td className="p-4 text-brand-600">{p.moq || 100}</td>
                    <td className="p-4">
                      <button
                        type="button"
                        onClick={() => toggleActive(p)}
                        className={`rounded-full px-3 py-1 text-xs font-semibold transition ${
                          p.isActive ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
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
                          className="rounded-lg border border-brand-200 px-3 py-1.5 text-xs font-semibold text-brand-700 hover:border-brand-400"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => remove(p)}
                          className="rounded-lg border border-clay-200 px-3 py-1.5 text-xs font-semibold text-clay-600 hover:bg-clay-50"
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
