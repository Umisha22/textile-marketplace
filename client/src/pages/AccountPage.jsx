import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api/client.js';
import { Spinner, StatusBadge, EmptyState } from '../components/ui.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { formatPrice, formatDate } from '../utils/format.js';
import { CATEGORY_LABELS, BUSINESS_TYPE_LABELS, INDUSTRY_LABELS } from '../utils/constants.js';
import { useCurrency } from '../hooks/useCurrency.js';

export default function AccountPage() {
  useCurrency();
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get('/orders/mine')
      .then((d) => setOrders(d.orders))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const profile = user?.buyerProfile || {};

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-800 font-display text-xl font-bold text-cream-100">
            {user?.name?.[0]?.toUpperCase()}
          </span>
          <div>
            <h1 className="font-display text-2xl font-bold text-brand-900">{user?.name}</h1>
            <p className="text-sm text-brand-500">{user?.email} · Buyer</p>
          </div>
        </div>
        <div className="flex gap-3">
          <Link to="/products" className="rounded-xl border border-brand-300 px-4 py-2.5 text-sm font-semibold text-brand-700 hover:bg-white">Shop fabrics</Link>
          <Link to="/assistant" className="rounded-xl bg-brand-800 px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-700">Ask Weaver AI</Link>
        </div>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-[300px_1fr]">
        {/* Profile */}
        <div className="h-fit rounded-2xl border border-brand-100 bg-white p-5 shadow-soft">
          <h2 className="font-display text-lg font-bold text-brand-900">Profile</h2>
          <dl className="mt-3 space-y-2.5 text-sm">
            {[
              ['Business type', profile.businessType ? BUSINESS_TYPE_LABELS[profile.businessType] || profile.businessType : '—'],
              ['Industry', profile.industry ? INDUSTRY_LABELS[profile.industry] || profile.industry : '—'],
              ['Interests', profile.interests?.length ? profile.interests.map((c) => CATEGORY_LABELS[c] || c).join(', ') : '—'],
              ['Fabric types', profile.fabricTypes?.length ? profile.fabricTypes.join(', ') : '—'],
              ['Order quantity', profile.typicalOrderQuantity ? profile.typicalOrderQuantity.replaceAll('_', '-') : '—'],
              ['Budget', profile.budgetRange ? profile.budgetRange.replaceAll('_', ' ').replace('k', 'K') : '—'],
              ['Colors', profile.colorPreferences?.length ? profile.colorPreferences.join(', ') : '—'],
            ].map(([k, v]) => (
              <div key={k} className="flex justify-between gap-3">
                <dt className="text-brand-400">{k}</dt>
                <dd className="text-right font-medium text-brand-900">{v}</dd>
              </div>
            ))}
          </dl>
          {!user?.onboarded && (
            <Link to="/onboarding" className="mt-4 block rounded-xl bg-clay-500 py-2.5 text-center text-sm font-semibold text-white">
              Complete onboarding
            </Link>
          )}
        </div>

        {/* Orders */}
        <div>
          <h2 className="font-display text-lg font-bold text-brand-900">My orders</h2>
          {loading ? (
            <div className="flex justify-center py-20"><Spinner className="h-8 w-8 text-brand-600" /></div>
          ) : orders.length === 0 ? (
            <div className="mt-4">
              <EmptyState
                title="No orders yet"
                description="Your placed orders will appear here with live status tracking."
                action={<Link to="/products" className="rounded-xl bg-brand-800 px-5 py-2.5 text-sm font-semibold text-white">Start sourcing</Link>}
              />
            </div>
          ) : (
            <div className="mt-4 space-y-4">
              {orders.map((o) => (
                <Link
                  key={o._id}
                  to={`/order-confirmation/${o._id}`}
                  className="block rounded-2xl border border-brand-100 bg-white p-5 shadow-soft transition hover:border-brand-300"
                >
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="font-semibold text-brand-900">{o.orderNumber}</p>
                      <p className="text-xs text-brand-400">{formatDate(o.createdAt)}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-bold text-brand-900">{formatPrice(o.total)}</span>
                      <StatusBadge status={o.status} />
                    </div>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {o.items.map((it) => (
                      <span key={it._id} className="rounded-lg bg-brand-50 px-2.5 py-1 text-xs font-medium text-brand-700">
                        {it.name} × {it.quantity}
                      </span>
                    ))}
                  </div>
                  <p className="mt-2 text-xs text-brand-400">
                    Supplier: {o.supplier?.supplierProfile?.businessName || o.supplier?.name}
                  </p>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
