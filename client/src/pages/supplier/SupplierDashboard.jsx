import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../api/client.js';
import { Spinner, StatusBadge } from '../../components/ui.jsx';
import FabricIcon from '../../components/FabricIcon.jsx';
import { formatPrice, formatDate } from '../../utils/format.js';
import { useCurrency } from '../../hooks/useCurrency.js';

export default function SupplierDashboard() {
  useCurrency();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [recs, setRecs] = useState(null);

  useEffect(() => {
    api
      .get('/supplier/dashboard')
      .then((d) => setData(d))
      .catch(() => {})
      .finally(() => setLoading(false));
    api
      .get('/recommendations')
      .then((d) => setRecs(d))
      .catch(() => setRecs(null));
  }, []);

  if (loading) {
    return <div className="flex justify-center py-24"><Spinner className="h-10 w-10 text-brand-600" /></div>;
  }

  const s = data?.stats || {};

  const cards = [
    { label: 'Total products', value: s.totalProducts ?? 0, icon: '🧶', to: '/supplier/products' },
    { label: 'Active products', value: s.activeProducts ?? 0, icon: '✅', to: '/supplier/products' },
    { label: 'Pending orders', value: s.pendingOrders ?? 0, icon: '📦', to: '/supplier/orders?status=pending' },
    { label: 'In progress', value: s.inProgressOrders ?? 0, icon: '⏳', to: '/supplier/orders' },
  ];

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold text-brand-900">Dashboard</h1>
          <p className="mt-1 text-sm text-brand-500">A quick pulse on your marketplace activity.</p>
        </div>
        <Link to="/supplier/products/new" className="rounded-xl bg-clay-500 px-4 py-2.5 text-sm font-bold text-white hover:bg-clay-600">
          + Add product
        </Link>
      </div>

      <div className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {cards.map((c) => (
          <Link key={c.label} to={c.to} className="rounded-2xl border border-brand-100 bg-white p-5 shadow-soft transition hover:-translate-y-0.5 hover:shadow-lift">
            <div className="flex items-center justify-between">
              <span className="text-2xl">{c.icon}</span>
              <p className="font-display text-3xl font-bold text-brand-900">{c.value}</p>
            </div>
            <p className="mt-2 text-sm text-brand-500">{c.label}</p>
          </Link>
        ))}
      </div>

      <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border border-brand-100 bg-white p-5 shadow-soft">
          <p className="text-xs text-brand-400">Completed orders</p>
          <p className="mt-1 font-display text-3xl font-bold text-brand-900">{s.completedOrders ?? 0}</p>
        </div>
        <div className="rounded-2xl border border-brand-100 bg-white p-5 shadow-soft">
          <p className="text-xs text-brand-400">Revenue (completed)</p>
          <p className="mt-1 font-display text-3xl font-bold text-brand-900">{formatPrice(s.revenue ?? 0)}</p>
        </div>
      </div>

      {/* Market demand insights */}
      {recs && (
        <div className="mt-8 rounded-2xl border border-brand-100 bg-gradient-to-br from-brand-50/70 to-white p-5 shadow-soft">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="font-display text-lg font-bold text-brand-900">Market demand — last 90 days</h2>
              <p className="mt-0.5 text-xs text-brand-500">
                {recs.stats?.orders ?? 0} orders · {(recs.stats?.units ?? 0).toLocaleString()} meters · {recs.stats?.buyers ?? 0} buyers
                {recs.stats?.buyersInMyCategories > 0 && (
                  <span className="text-emerald-600"> · {recs.stats.buyersInMyCategories} in your categories</span>
                )}
              </p>
            </div>
          </div>

          <div className="mt-4 grid gap-5 lg:grid-cols-3">
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-brand-500">Hot categories</h3>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {recs.demandByCategory?.length ? (
                  recs.demandByCategory.slice(0, 6).map((c) => (
                    <Link
                      key={c.name}
                      to={`/products?category=${c.name}`}
                      className="rounded-full bg-white px-2.5 py-1 text-xs font-semibold text-brand-800 ring-1 ring-brand-200 transition hover:ring-brand-400"
                    >
                      {c.name} <span className="text-brand-400">{c.count}</span>
                    </Link>
                  ))
                ) : (
                  <span className="text-sm text-brand-400">No market demand yet.</span>
                )}
              </div>
              <h3 className="mt-4 text-xs font-semibold uppercase tracking-wider text-brand-500">Hot fabric types</h3>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {recs.demandByFabric?.length ? (
                  recs.demandByFabric.slice(0, 6).map((f) => (
                    <span
                      key={f.name}
                      className="flex items-center gap-1 rounded-full bg-white px-2.5 py-1 text-xs font-semibold text-brand-800 ring-1 ring-brand-200"
                    >
                      <FabricIcon fabricType={f.name} className="h-3.5 w-3.5 text-brand-600" />
                      {f.name} <span className="text-brand-400">{f.count}</span>
                    </span>
                  ))
                ) : (
                  <span className="text-sm text-brand-400">No demand data yet.</span>
                )}
              </div>
              {recs.demandByColor?.length > 0 && (
                <>
                  <h3 className="mt-4 text-xs font-semibold uppercase tracking-wider text-brand-500">Trending colors</h3>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {recs.demandByColor.slice(0, 5).map((c) => (
                      <span
                        key={c.name}
                        className="flex items-center gap-1.5 rounded-full bg-white px-2.5 py-1 text-xs font-semibold text-brand-800 ring-1 ring-brand-200"
                      >
                        <span
                          className="inline-block h-3.5 w-3.5 rounded-full ring-1 ring-black/10"
                          style={{ background: c.name }}
                        />
                        {c.count}
                      </span>
                    ))}
                  </div>
                </>
              )}
            </div>

            <div className="lg:col-span-2">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-brand-500">Suggested to stock — in-demand fabrics you don't carry</h3>
              {recs.suggestedProducts?.length ? (
                <div className="mt-2 grid gap-3 sm:grid-cols-2">
                  {recs.suggestedProducts.map((p) => (
                    <Link
                      key={p.id}
                      to={`/products/${p.slug}`}
                      className="flex items-start gap-3 rounded-xl border border-brand-100 bg-white p-3 transition hover:-translate-y-0.5 hover:border-brand-300 hover:shadow-soft"
                    >
                      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-brand-100 text-brand-700">
                        <FabricIcon fabricType={p.fabricType} className="h-6 w-6" />
                      </span>
                      <div className="min-w-0">
                        <p className="line-clamp-1 text-sm font-semibold text-brand-900">{p.name}</p>
                        <p className="text-xs text-brand-500">
                          {p.category} · {p.fabricType} · {formatPrice(p.price)}/{p.unit}
                        </p>
                        {p.sustainability?.score > 0 && (
                          <p className="mt-0.5 text-xs font-semibold text-emerald-600">🌿 Eco {p.sustainability.score}</p>
                        )}
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <p className="mt-2 rounded-xl border border-brand-100 bg-white p-4 text-sm text-brand-400">
                  No suggested additions right now — try expanding into the hot categories above.
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        {/* Recent orders */}
        <div className="rounded-2xl border border-brand-100 bg-white p-5 shadow-soft">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-lg font-bold text-brand-900">Recent orders</h2>
            <Link to="/supplier/orders" className="text-sm font-semibold text-brand-600 hover:underline">View all</Link>
          </div>
          <div className="mt-4 space-y-3">
            {data?.recentOrders?.length ? (
              data.recentOrders.map((o) => (
                <div key={o._id} className="flex items-center justify-between gap-3 rounded-xl border border-brand-50 bg-brand-50/40 px-4 py-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-brand-900">{o.orderNumber}</p>
                    <p className="text-xs text-brand-400">{o.buyer?.name} · {formatDate(o.createdAt)}</p>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <span className="text-sm font-bold text-brand-900">{formatPrice(o.total)}</span>
                    <StatusBadge status={o.status} />
                  </div>
                </div>
              ))
            ) : (
              <p className="py-6 text-center text-sm text-brand-400">No orders yet.</p>
            )}
          </div>
        </div>

        {/* Inventory alerts */}
        <div className="rounded-2xl border border-brand-100 bg-white p-5 shadow-soft">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-lg font-bold text-brand-900">Inventory alerts</h2>
            <Link to="/supplier/products" className="text-sm font-semibold text-brand-600 hover:underline">Manage</Link>
          </div>
          <div className="mt-4 space-y-3">
            {data?.inventoryAlerts?.length ? (
              data.inventoryAlerts.map((p) => (
                <Link key={p.id} to={`/supplier/products/${p.id}/edit`} className="flex items-center justify-between gap-3 rounded-xl border border-amber-100 bg-amber-50/70 px-4 py-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-brand-900">{p.name}</p>
                    <p className="text-xs text-amber-700">MOQ {p.moq || 100} · low stock {p.stock}</p>
                  </div>
                  <span className="shrink-0 rounded-full bg-amber-200 px-2.5 py-1 text-[11px] font-bold text-amber-900">
                    {p.stock} left
                  </span>
                </Link>
              ))
            ) : (
              <p className="py-6 text-center text-sm text-brand-400">All stock levels look healthy. 🎉</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
