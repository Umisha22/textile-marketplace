import { useCallback, useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { api } from '../../api/client.js';
import { Spinner, StatusBadge, EmptyState } from '../../components/ui.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import { formatPrice, formatDateTime } from '../../utils/format.js';
import { ORDER_STATUSES } from '../../utils/constants.js';

export default function SupplierOrders() {
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
          <h1 className="font-display text-3xl font-bold text-brand-900">Orders</h1>
          <p className="mt-1 text-sm text-brand-500">Manage incoming orders through the fulfilment workflow.</p>
        </div>
        <div className="flex gap-1 overflow-x-auto rounded-xl border border-brand-200 bg-white p-1">
          <button
            type="button"
            onClick={() => setParams({})}
            className={`whitespace-nowrap rounded-lg px-3 py-1.5 text-xs font-semibold ${!status ? 'bg-brand-800 text-white' : 'text-brand-600'}`}
          >
            All
          </button>
          {ORDER_STATUSES.map((s) => (
            <button
              key={s.value}
              type="button"
              onClick={() => setParams({ status: s.value })}
              className={`whitespace-nowrap rounded-lg px-3 py-1.5 text-xs font-semibold ${status === s.value ? 'bg-brand-800 text-white' : 'text-brand-600'}`}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-24"><Spinner className="h-10 w-10 text-brand-600" /></div>
      ) : orders.length === 0 ? (
        <div className="mt-8">
          <EmptyState
            title="No orders here"
            description="Orders from buyers will appear here as they come in."
            action={<a href="/supplier/products" className="rounded-xl bg-brand-800 px-5 py-2.5 text-sm font-semibold text-white">Check your inventory</a>}
          />
        </div>
      ) : (
        <div className="mt-8 space-y-4">
          {orders.map((o) => {
            const idx = currentIdx(o);
            const next = ORDER_STATUSES[idx + 1];
            return (
              <div key={o._id} className="overflow-hidden rounded-2xl border border-brand-100 bg-white shadow-soft">
                <button
                  type="button"
                  onClick={() => setExpanded(expanded === o._id ? null : o._id)}
                  className="flex w-full flex-wrap items-center justify-between gap-3 px-5 py-4 text-left"
                >
                  <div>
                    <p className="font-semibold text-brand-900">{o.orderNumber}</p>
                    <p className="text-xs text-brand-400">
                      {o.buyer?.name} · {formatDateTime(o.createdAt)}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-brand-900">{formatPrice(o.total)}</span>
                    <StatusBadge status={o.status} />
                    <span className="text-brand-300">{expanded === o._id ? '▲' : '▼'}</span>
                  </div>
                </button>

                {expanded === o._id && (
                  <div className="border-t border-brand-100 bg-brand-50/40 px-5 py-4">
                    <div className="grid gap-6 lg:grid-cols-2">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wider text-brand-400">Items</p>
                        <div className="mt-2 space-y-2">
                          {o.items.map((it) => (
                            <div key={it._id} className="flex items-center justify-between rounded-xl bg-white px-4 py-2.5 text-sm shadow-soft">
                              <div>
                                <p className="font-semibold text-brand-900">{it.name}</p>
                                <p className="text-xs text-brand-400">{it.quantity} × {formatPrice(it.price)}{it.color ? ` · ${it.color}` : ''}</p>
                              </div>
                              <p className="font-bold text-brand-900">{formatPrice(it.price * it.quantity)}</p>
                            </div>
                          ))}
                        </div>
                        <div className="mt-3 rounded-xl bg-white px-4 py-3 text-sm shadow-soft">
                          <div className="flex justify-between text-brand-500"><span>Subtotal</span><span>{formatPrice(o.subtotal)}</span></div>
                          <div className="flex justify-between text-brand-500"><span>Tax</span><span>{formatPrice(o.tax)}</span></div>
                          <div className="flex justify-between text-brand-500"><span>Shipping</span><span>{o.shipping === 0 ? 'Free' : formatPrice(o.shipping)}</span></div>
                          <div className="flex justify-between pt-1 font-bold text-brand-900"><span>Total</span><span>{formatPrice(o.total)}</span></div>
                        </div>
                      </div>

                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wider text-brand-400">Ship to</p>
                        <div className="mt-2 rounded-xl bg-white p-4 text-sm shadow-soft">
                          <p className="font-semibold text-brand-900">{o.shippingAddress?.fullName}</p>
                          {o.shippingAddress?.company && <p className="text-brand-600">{o.shippingAddress.company}</p>}
                          <p className="mt-1 text-brand-600">
                            {o.shippingAddress?.address}, {o.shippingAddress?.city}, {o.shippingAddress?.state}, {o.shippingAddress?.country}
                          </p>
                          {o.shippingAddress?.phone && <p className="text-brand-600">{o.shippingAddress.phone}</p>}
                        </div>
                        {o.notes && (
                          <p className="mt-3 rounded-xl bg-amber-50 p-3 text-xs text-amber-800">Buyer notes: {o.notes}</p>
                        )}

                        <p className="mt-4 text-xs font-semibold uppercase tracking-wider text-brand-400">Update status</p>
                        <div className="mt-2 flex flex-wrap gap-2">
                          {next ? (
                            <button
                              type="button"
                              disabled={updating === o._id}
                              onClick={() => setStatus(o, next.value)}
                              className="rounded-xl bg-brand-800 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-brand-700 disabled:opacity-60"
                            >
                              {updating === o._id ? 'Updating…' : `Mark ${next.label}`}
                            </button>
                          ) : (
                            <span className="rounded-xl bg-emerald-100 px-4 py-2.5 text-sm font-bold text-emerald-800">✓ Fulfilled</span>
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
