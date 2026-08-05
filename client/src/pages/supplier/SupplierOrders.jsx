import { useCallback, useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { api } from '../../api/client.js';
import { StatusBadge, EmptyState } from '../../components/ui.jsx';
import ThreadLoader from '../../components/design-system/ThreadLoader.jsx';
import GlassPanel from '../../components/design-system/GlassPanel.jsx';
import NeoButton from '../../components/design-system/NeoButton.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import { formatPrice, formatDateTime } from '../../utils/format.js';
import { ORDER_STATUSES } from '../../utils/constants.js';
import { useCurrency } from '../../hooks/useCurrency.js';

export default function SupplierOrders() {
  useCurrency();
  const [params, setParams] = useSearchParams();
  const status = params.get('status') || '';
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(null);
  const [updating, setUpdating] = useState(null);
  const { toast } = useToast();

  const load = useCallback(() => {
    setLoading(true);
    const q = status ? `?status=${status}` : '';
    api
      .get(`/orders/supplier${q}`)
      .then((d) => setOrders(d.orders))
      .catch(() => toast('Could not load orders.', 'error'))
      .finally(() => setLoading(false));
  }, [status, toast]);

  useEffect(() => {
    load();
  }, [load]);

  const setStatus = async (order, next) => {
    setUpdating(order._id);
    try {
      await api.put(`/orders/${order._id}/status`, { status: next });
      toast(`Order ${order.orderNumber} → ${next.replaceAll('_', ' ')}`);
      load();
    } catch (e) {
      toast(e.message, 'error');
    } finally {
      setUpdating(null);
    }
  };

  const currentIdx = (o) => ORDER_STATUSES.findIndex((s) => s.value === o.status);

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold text-text-primary">Orders</h1>
          <p className="mt-1 text-sm text-text-secondary">Manage incoming orders through the fulfilment workflow.</p>
        </div>
        <div className="flex gap-1 overflow-x-auto rounded-xl border border-void-600/50 bg-void-700/50 p-1">
          <button
            type="button"
            onClick={() => setParams({})}
            className={`whitespace-nowrap rounded-lg px-3 py-1.5 text-xs font-semibold transition ${!status ? 'bg-gold-500/20 text-gold-400 border border-gold-500/30' : 'text-text-muted hover:text-text-secondary'}`}
          >
            All
          </button>
          {ORDER_STATUSES.map((s) => (
            <button
              key={s.value}
              type="button"
              onClick={() => setParams({ status: s.value })}
              className={`whitespace-nowrap rounded-lg px-3 py-1.5 text-xs font-semibold transition ${status === s.value ? 'bg-gold-500/20 text-gold-400 border border-gold-500/30' : 'text-text-muted hover:text-text-secondary'}`}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <ThreadLoader text="Loading orders…" />
      ) : orders.length === 0 ? (
        <div className="mt-8">
          <EmptyState
            title="No orders here"
            description="Orders from buyers will appear here as they come in."
            action={<a href="/supplier/products" className="neo-raised-gold rounded-xl px-5 py-2.5 text-sm font-bold">Check your inventory</a>}
          />
        </div>
      ) : (
        <div className="mt-8 space-y-4">
          {orders.map((o) => {
            const idx = currentIdx(o);
            const next = ORDER_STATUSES[idx + 1];
            return (
              <div key={o._id} className="overflow-hidden rounded-2xl border border-void-600/50 glass-strong">
                <button
                  type="button"
                  onClick={() => setExpanded(expanded === o._id ? null : o._id)}
                  className="flex w-full flex-wrap items-center justify-between gap-3 px-5 py-4 text-left"
                >
                  <div>
                    <p className="font-semibold text-text-primary">{o.orderNumber}</p>
                    <p className="text-xs text-text-muted">
                      {o.buyer?.name} · {formatDateTime(o.createdAt)}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-gold-400">{formatPrice(o.total)}</span>
                    <StatusBadge status={o.status} />
                    <span className="text-text-muted">{expanded === o._id ? '▲' : '▼'}</span>
                  </div>
                </button>

                {expanded === o._id && (
                  <div className="border-t border-void-600/50 bg-void-700/30 px-5 py-4">
                    <div className="grid gap-6 lg:grid-cols-2">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wider text-text-muted">Items</p>
                        <div className="mt-2 space-y-2">
                          {o.items.map((it) => (
                            <div key={it._id} className="flex items-center justify-between rounded-xl bg-void-700/50 px-4 py-2.5 text-sm border border-void-600/30">
                              <div>
                                <p className="font-semibold text-text-primary">{it.name}</p>
                                <p className="text-xs text-text-muted">{it.quantity} × {formatPrice(it.price)}{it.color ? ` · ${it.color}` : ''}</p>
                              </div>
                              <p className="font-bold text-gold-400">{formatPrice(it.price * it.quantity)}</p>
                            </div>
                          ))}
                        </div>
                        <div className="mt-3 rounded-xl bg-void-700/50 px-4 py-3 text-sm border border-void-600/30">
                          <div className="flex justify-between text-text-secondary"><span>Subtotal</span><span>{formatPrice(o.subtotal)}</span></div>
                          <div className="flex justify-between text-text-secondary"><span>Tax</span><span>{formatPrice(o.tax)}</span></div>
                          <div className="flex justify-between text-text-secondary"><span>Shipping</span><span>{o.shipping === 0 ? 'Free' : formatPrice(o.shipping)}</span></div>
                          <div className="flex justify-between pt-1 font-bold text-text-primary"><span>Total</span><span>{formatPrice(o.total)}</span></div>
                        </div>
                      </div>

                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wider text-text-muted">Ship to</p>
                        <div className="mt-2 rounded-xl bg-void-700/50 p-4 text-sm border border-void-600/30">
                          <p className="font-semibold text-text-primary">{o.shippingAddress?.fullName}</p>
                          {o.shippingAddress?.company && <p className="text-text-secondary">{o.shippingAddress.company}</p>}
                          <p className="mt-1 text-text-secondary">
                            {o.shippingAddress?.address}, {o.shippingAddress?.city}, {o.shippingAddress?.state}, {o.shippingAddress?.country}
                          </p>
                          {o.shippingAddress?.phone && <p className="text-text-secondary">{o.shippingAddress.phone}</p>}
                        </div>
                        {o.notes && (
                          <p className="mt-3 rounded-xl bg-gold-500/10 border border-gold-500/20 p-3 text-xs text-gold-400">Buyer notes: {o.notes}</p>
                        )}

                        <p className="mt-4 text-xs font-semibold uppercase tracking-wider text-text-muted">Update status</p>
                        <div className="mt-2 flex flex-wrap gap-2">
                          {next ? (
                            <NeoButton
                              disabled={updating === o._id}
                              onClick={() => setStatus(o, next)}
                              className="text-sm"
                            >
                              {updating === o._id ? 'Updating…' : `Mark ${next.label}`}
                            </NeoButton>
                          ) : (
                            <span className="rounded-xl bg-teal-500/20 px-4 py-2.5 text-sm font-bold text-teal-400 border border-teal-500/30">Fulfilled</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
