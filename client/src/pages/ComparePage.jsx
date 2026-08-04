import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { api } from '../api/client.js';
import ProductImage from '../components/ProductImage.jsx';
import { EmptyState, Spinner } from '../components/ui.jsx';

export default function ComparePage() {
  const [params] = useSearchParams();
  const ids = (params.get('ids') || '').split(',').filter(Boolean);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (ids.length < 2) {
      setError('Select at least two products to compare (use the ⚖ button on product cards).');
      setLoading(false);
      return;
    }
    setLoading(true);
    api
      .post('/ai/compare', { ids })
      .then((d) => setData(d.compare))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [params]);

  if (loading) {
    return (
      <div className="flex justify-center py-32">
        <Spinner className="h-10 w-10 text-brand-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16">
        <EmptyState
          title="Cannot compare"
          description={error}
          action={<Link to="/products" className="rounded-xl bg-brand-800 px-5 py-2.5 text-sm font-semibold text-white">Browse fabrics</Link>}
        />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <p className="text-xs font-semibold uppercase tracking-widest text-clay-500">Side-by-side</p>
      <h1 className="mt-2 font-display text-3xl font-bold text-brand-900">Compare fabrics</h1>

      <div className="mt-8 overflow-hidden rounded-2xl border border-brand-100 bg-white shadow-soft">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead>
              <tr className="border-b-2 border-brand-100 bg-brand-50">
                <th className="p-4 text-xs font-semibold uppercase tracking-wider text-brand-500">Attribute</th>
                {data.products.map((p) => (
                  <th key={p.id} className="w-56 p-4 align-top">
                    <ProductImage product={p} className="aspect-[4/3]" />
                    <Link to={`/products/${p.slug}`} className="mt-2 block font-display text-sm font-semibold text-brand-900 hover:text-brand-600">
                      {p.name}
                    </Link>
                    <p className="mt-1 text-base font-bold text-brand-900">${p.price}<span className="text-xs font-medium text-brand-400">/{p.unit}</span></p>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.rows.map((row, i) => (
                <tr key={row.label} className={i % 2 === 0 ? 'bg-white' : 'bg-brand-50/40'}>
                  <td className="p-4 text-xs font-semibold uppercase tracking-wide text-brand-500">{row.label}</td>
                  {row.values.map((v, j) => (
                    <td key={j} className="p-4 text-brand-900">{v}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Link to="/products" className="mt-6 inline-block text-sm font-semibold text-brand-700 hover:text-brand-900">
        ← Back to library
      </Link>
    </div>
  );
}
