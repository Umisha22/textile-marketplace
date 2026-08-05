import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { api } from '../api/client.js';
import ProductImage from '../components/ProductImage.jsx';
import { EmptyState } from '../components/ui.jsx';
import ThreadLoader from '../components/design-system/ThreadLoader.jsx';
import GlassPanel from '../components/design-system/GlassPanel.jsx';

export default function ComparePage() {
  const [params] = useSearchParams();
  const ids = (params.get('ids') || '').split(',').filter(Boolean);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (ids.length < 2) {
      setError('Select at least two products to compare (use the compare button on product cards).');
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
      <ThreadLoader text="Comparing…" />
    );
  }

  if (error) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16">
        <EmptyState
          title="Cannot compare"
          description={error}
          action={<Link to="/products" className="neo-raised-gold rounded-xl px-5 py-2.5 text-sm font-bold">Browse fabrics</Link>}
        />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <p className="text-xs font-semibold uppercase tracking-widest text-gold-400">Side-by-side</p>
      <h1 className="mt-2 font-display text-3xl font-bold text-text-primary">Compare fabrics</h1>

      <div className="mt-8 overflow-hidden rounded-2xl border border-void-600/50 glass-strong">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead>
              <tr className="border-b-2 border-void-600/50 bg-void-700/50">
                <th className="p-4 text-xs font-semibold uppercase tracking-wider text-text-muted">Attribute</th>
                {data.products.map((p) => (
                  <th key={p.id} className="w-56 p-4 align-top">
                    <ProductImage product={p} className="aspect-[4/3]" />
                    <Link to={`/products/${p.slug}`} className="mt-2 block font-display text-sm font-semibold text-text-primary hover:text-gold-400">
                      {p.name}
                    </Link>
                    <p className="mt-1 text-base font-bold text-gold-400">${p.price}<span className="text-xs font-medium text-text-muted">/{p.unit}</span></p>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.rows.map((row, i) => (
                <tr key={row.label} className={i % 2 === 0 ? 'bg-transparent' : 'bg-void-700/20'}>
                  <td className="p-4 text-xs font-semibold uppercase tracking-wide text-text-muted">{row.label}</td>
                  {row.values.map((v, j) => (
                    <td key={j} className="p-4 text-text-primary">{v}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Link to="/products" className="mt-6 inline-block text-sm font-semibold text-gold-400 hover:text-gold-300 transition">
        ← Back to library
      </Link>
    </div>
  );
}
