import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api/client.js';
import { Spinner, StatusBadge, EmptyState } from '../components/ui.jsx';
import GlassPanel from '../components/design-system/GlassPanel.jsx';
import NeoButton from '../components/design-system/NeoButton.jsx';
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
          <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gold-500/20 font-display text-xl font-bold text-gold-400 border border-gold-500/20">
            {user?.name?.[0]?.toUpperCase()}
          </span>
          <div>
            <h1 className="font-display text-2xl font-bold text-text-primary">{user?.name}</h1>
            <p className="text-sm text-text-secondary">{user?.email} · Buyer</p>
          </div>
        </div>
        <div className="flex gap-3">
          <Link to="/products">
            <button className="rounded-xl border border-void-500/50 px-4 py-2.5 text-sm font-semibold text-text-secondary hover:border-gold-500/30 hover:text-gold-400 transition">Shop fabrics</button>
          </Link>
          <Link to="/assistant">
            <NeoButton className="text-sm">Ask Weaver AI</NeoButton>
          </Link>
        </div>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-[300px_1fr]">
        {/* Profile */}
        <GlassPanel className="h-fit p-5">
          <h2 className="font-display text-lg font-bold text-text-primary">Profile</h2>
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
                <dt className="text-text-muted">{k}</dt>
                <dd className="text-right font-medium text-text-primary">{v}</dd>
              </div>
            ))}
          </dl>
          {!user?.onboarded && (
            <Link to="/onboarding" className="mt-4 block rounded-xl bg-gold-500/10 border border-gold-500/20 py-2.5 text-center text-sm font-semibold text-gold-400 transition hover:bg-gold-500/20">
              Complete onboarding
            </Link>
          )}
        </GlassPanel>

        {/* Orders */}
        <div>
          <h2 className="font-display text-lg font-bold text-text-primary">My orders</h2>
          {loading ? (
            <div className="flex justify-center py-20"><Spinner className="h-8 w-8 text-gold-400" /></div>
          ) : orders.length === 0 ? (
            <div className="mt-4">
              <EmptyState
                title="No orders yet"
                description="Your placed orders will appear here with live status tracking."
                action={<Link to="/products" className="rounded-xl bg-gold-500 px-5 py-2.5 text-sm font-bold text-void-950">Start sourcing</Link>}
              />
            </div>
          ) : (
            <div className="mt-4 space-y-4">
              {orders.map((o) => (
                <Link
                  key={o._id}
                  to={`/order-confirmation/${o._id}`}
                  className="block rounded-2xl border border-void-600/50 glass-strong p-5 transition hover:border-gold-500/30"
                >
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="font-semibold text-text-primary">{o.orderNumber}</p>
                      <p className="text-xs text-text-muted">{formatDate(o.createdAt)}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-bold text-gold-400">{formatPrice(o.total)}</span>
                      <StatusBadge status={o.status} />
                    </div>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {o.items.map((it) => (
                      <span key={it._id} className="rounded-lg bg-void-700/50 border border-void-600/30 px-2.5 py-1 text-xs font-medium text-text-secondary">
                        {it.name} × {it.quantity}
                      </span>
                    ))}
                  </div>
                  <p className="mt-2 text-xs text-text-muted">
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
