import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../api/client.js';
import { Spinner, StatusBadge } from '../../components/ui.jsx';
import { formatPrice, formatDate } from '../../utils/format.js';

export default function SupplierDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get('/supplier/dashboard')
      .then((d) => setData(d))
      .catch(() => {})
      .finally(() => setLoading(false));
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
