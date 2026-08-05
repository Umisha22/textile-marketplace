import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../../api/client.js';
import { StatusBadge } from '../../components/ui.jsx';
import ThreadLoader from '../../components/design-system/ThreadLoader.jsx';
import FabricIcon from '../../components/FabricIcon.jsx';
import GlassPanel from '../../components/design-system/GlassPanel.jsx';
import NeoButton from '../../components/design-system/NeoButton.jsx';
import { formatPrice, formatDate } from '../../utils/format.js';
import { useCurrency } from '../../hooks/useCurrency.js';

export default function SupplierDashboard() {
  useCurrency();
  const navigate = useNavigate();
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
    return <ThreadLoader text="Loading dashboard…" />;
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
          <h1 className="font-display text-3xl font-bold text-text-primary">Dashboard</h1>
          <p className="mt-1 text-sm text-text-secondary">A quick pulse on your marketplace activity.</p>
        </div>
        <NeoButton onClick={() => navigate('/supplier/products/new')} className="text-sm">
          + Add product
        </NeoButton>
      </div>

      <div className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {cards.map((c) => (
          <Link key={c.label} to={c.to} className="neo-raised rounded-2xl p-5 transition hover:-translate-y-0.5">
            <div className="flex items-center justify-between">
              <span className="text-2xl">{c.icon}</span>
              <p className="font-display text-3xl font-bold text-text-primary">{c.value}</p>
            </div>
            <p className="mt-2 text-sm text-text-secondary">{c.label}</p>
          </Link>
        ))}
      </div>

      <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-2">
        <GlassPanel className="p-5">
          <p className="text-xs text-text-muted">Completed orders</p>
          <p className="mt-1 font-display text-3xl font-bold text-text-primary">{s.completedOrders ?? 0}</p>
        </GlassPanel>
        <GlassPanel className="p-5">
          <p className="text-xs text-text-muted">Revenue (completed)</p>
          <p className="mt-1 font-display text-3xl font-bold text-gold-400">{formatPrice(s.revenue ?? 0)}</p>
        </GlassPanel>
      </div>

      {/* Market demand insights */}
      {recs && (
        <GlassPanel className="mt-8 p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="font-display text-lg font-bold text-text-primary">Market demand — last 90 days</h2>
              <p className="mt-0.5 text-xs text-text-secondary">
                {recs.stats?.orders ?? 0} orders · {(recs.stats?.units ?? 0).toLocaleString()} meters · {recs.stats?.buyers ?? 0} buyers
                {recs.stats?.buyersInMyCategories > 0 && (
                  <span className="text-teal-400"> · {recs.stats.buyersInMyCategories} in your categories</span>
                )}
              </p>
            </div>
          </div>

          <div className="mt-4 grid gap-5 lg:grid-cols-3">
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-text-muted">Hot categories</h3>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {recs.demandByCategory?.length ? (
                  recs.demandByCategory.slice(0, 6).map((c) => (
                    <Link
                      key={c.name}
                      to={`/products?category=${c.name}`}
                      className="rounded-full bg-void-700/50 px-2.5 py-1 text-xs font-semibold text-text-secondary border border-void-600/50 transition hover:border-gold-500/30 hover:text-gold-400"
                    >
                      {c.name} <span className="text-text-muted">{c.count}</span>
                    </Link>
                  ))
                ) : (
                  <span className="text-sm text-text-muted">No market demand yet.</span>
                )}
              </div>
              <h3 className="mt-4 text-xs font-semibold uppercase tracking-wider text-text-muted">Hot fabric types</h3>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {recs.demandByFabric?.length ? (
                  recs.demandByFabric.slice(0, 6).map((f) => (
                    <span
                      key={f.name}
                      className="flex items-center gap-1 rounded-full bg-void-700/50 px-2.5 py-1 text-xs font-semibold text-text-secondary border border-void-600/50"
                    >
                      <FabricIcon fabricType={f.name} className="h-3.5 w-3.5 text-text-muted" />
                      {f.name} <span className="text-text-muted">{f.count}</span>
                    </span>
                  ))
                ) : (
                  <span className="text-sm text-text-muted">No demand data yet.</span>
                )}
              </div>
              {recs.demandByColor?.length > 0 && (
                <>
                  <h3 className="mt-4 text-xs font-semibold uppercase tracking-wider text-text-muted">Trending colors</h3>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {recs.demandByColor.slice(0, 5).map((c) => (
                      <span
                        key={c.name}
                        className="flex items-center gap-1.5 rounded-full bg-void-700/50 px-2.5 py-1 text-xs font-semibold text-text-secondary border border-void-600/50"
                      >
                        <span
                          className="inline-block h-3.5 w-3.5 rounded-full ring-1 ring-void-500"
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
              <h3 className="text-xs font-semibold uppercase tracking-wider text-text-muted">Suggested to stock — in-demand fabrics you don't carry</h3>
              {recs.suggestedProducts?.length ? (
                <div className="mt-2 grid gap-3 sm:grid-cols-2">
                  {recs.suggestedProducts.map((p) => (
                    <Link
                      key={p.id}
                      to={`/products/${p.slug}`}
                      className="neo-raised flex items-start gap-3 rounded-xl p-3 transition hover:-translate-y-0.5"
                    >
                      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-void-700 text-text-secondary">
                        <FabricIcon fabricType={p.fabricType} className="h-6 w-6" />
                      </span>
                      <div className="min-w-0">
                        <p className="line-clamp-1 text-sm font-semibold text-text-primary">{p.name}</p>
                        <p className="text-xs text-text-secondary">
                          {p.category} · {p.fabricType} · {formatPrice(p.price)}/{p.unit}
                        </p>
                        {p.sustainability?.score > 0 && (
                          <p className="mt-0.5 text-xs font-semibold text-teal-400">Eco {p.sustainability.score}</p>
                        )}
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <p className="mt-2 rounded-xl border border-void-600/50 bg-void-700/30 p-4 text-sm text-text-muted">
                  No suggested additions right now — try expanding into the hot categories above.
                </p>
              )}
            </div>
          </div>
        </GlassPanel>
      )}

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        {/* Recent orders */}
        <GlassPanel className="p-5">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-lg font-bold text-text-primary">Recent orders</h2>
            <Link to="/supplier/orders" className="text-sm font-semibold text-gold-400 hover:underline">View all</Link>
          </div>
          <div className="mt-4 space-y-3">
            {data?.recentOrders?.length ? (
              data.recentOrders.map((o) => (
                <div key={o._id} className="flex items-center justify-between gap-3 rounded-xl border border-void-600/30 bg-void-700/30 px-4 py-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-text-primary">{o.orderNumber}</p>
                    <p className="text-xs text-text-muted">{o.buyer?.name} · {formatDate(o.createdAt)}</p>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <span className="text-sm font-bold text-gold-400">{formatPrice(o.total)}</span>
                    <StatusBadge status={o.status} />
                  </div>
                </div>
              ))
            ) : (
              <p className="py-6 text-center text-sm text-text-muted">No orders yet.</p>
            )}
          </div>
        </GlassPanel>

        {/* Inventory alerts */}
        <GlassPanel className="p-5">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-lg font-bold text-text-primary">Inventory alerts</h2>
            <Link to="/supplier/products" className="text-sm font-semibold text-gold-400 hover:underline">Manage</Link>
          </div>
          <div className="mt-4 space-y-3">
            {data?.inventoryAlerts?.length ? (
              data.inventoryAlerts.map((p) => (
                <Link key={p.id} to={`/supplier/products/${p.id}/edit`} className="flex items-center justify-between gap-3 rounded-xl border border-gold-500/20 bg-gold-500/5 px-4 py-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-text-primary">{p.name}</p>
                    <p className="text-xs text-coral-400">MOQ {p.moq || 100} · low stock {p.stock}</p>
                  </div>
                  <span className="shrink-0 rounded-full bg-coral-500/20 px-2.5 py-1 text-[11px] font-bold text-coral-400">
                    {p.stock} left
                  </span>
                </Link>
              ))
            ) : (
              <p className="py-6 text-center text-sm text-text-muted">All stock levels look healthy.</p>
            )}
          </div>
        </GlassPanel>
      </div>
    </div>
  );
}
