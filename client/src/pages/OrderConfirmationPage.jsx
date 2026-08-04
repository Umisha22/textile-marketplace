import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { api } from '../api/client.js';
import { Spinner, StatusBadge } from '../components/ui.jsx';
import { formatPrice, formatDateTime } from '../utils/format.js';
import { ORDER_STATUSES } from '../utils/constants.js';

export default function OrderConfirmationPage() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get(`/orders/${id}`)
      .then((d) => setOrder(d.order))
      .catch(() => setOrder(null))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="flex justify-center py-32">
        <Spinner className="h-10 w-10 text-brand-600" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="mx-auto max-w-xl px-4 py-24 text-center">
        <h1 className="font-display text-2xl font-bold text-brand-900">Order not found</h1>
        <Link to="/account" className="mt-3 inline-block text-brand-700 underline">Back to dashboard</Link>
      </div>
    );
  }

  const currentIdx = ORDER_STATUSES.findIndex((s) => s.value === order.status);

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 text-center sm:px-6">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-3xl">🎉</div>
      <h1 className="mt-4 font-display text-3xl font-bold text-brand-900">Order confirmed!</h1>
      <p className="mt-2 text-sm text-brand-500">
        Thank you, {order.shippingAddress?.fullName}. Your order is now with the supplier.
      </p>
      <p className="mt-1 text-sm font-semibold text-brand-700">Order number: {order.orderNumber}</p>

      <div className="mt-8 rounded-2xl border border-brand-100 bg-white p-6 text-left shadow-soft">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="font-display text-lg font-bold text-brand-900">Order status</h2>
          <StatusBadge status={order.status} />
        </div>

        <div className="mt-6 flex items-center">
          {ORDER_STATUSES.map((s, i) => (
            <div key={s.value} className="flex flex-1 flex-col items-center">
              <div
                className={`flex h-9 w-9 items-center justify-center rounded-full border-2 text-xs font-bold ${
                  i < currentIdx
                    ? 'border-emerald-500 bg-emerald-500 text-white'
                    : i === currentIdx
                      ? 'border-brand-600 bg-brand-600 text-white'
                      : 'border-brand-200 bg-white text-brand-300'
                }`}
              >
                {i < currentIdx ? '✓' : i + 1}
              </div>
              <p className={`mt-2 hidden text-center text-[11px] font-medium sm:block ${i <= currentIdx ? 'text-brand-800' : 'text-brand-400'}`}>
                {s.label}
              </p>
              {i < ORDER_STATUSES.length - 1 && (
                <div className={`-mt-5 h-0.5 w-full ${i < currentIdx ? 'bg-emerald-400' : 'bg-brand-100'}`} />
              )}
            </div>
          ))}
        </div>
        <div className="mt-2 flex justify-center gap-6 sm:hidden">
          {ORDER_STATUSES.map((s, i) => (
            <span key={s.value} className={`text-[11px] font-medium ${i <= currentIdx ? 'text-brand-800' : 'text-brand-300'}`}>{s.label}</span>
          ))}
        </div>
      </div>

      <div className="mt-6 rounded-2xl border border-brand-100 bg-white p-6 text-left shadow-soft">
        <h2 className="font-display text-lg font-bold text-brand-900">Order summary</h2>
        <div className="mt-4 space-y-3">
          {order.items.map((it) => (
            <div key={it._id} className="flex items-center justify-between gap-3 text-sm">
              <div>
                <p className="font-semibold text-brand-900">{it.name}</p>
                <p className="text-xs text-brand-500">{it.quantity} × {formatPrice(it.price)}</p>
              </div>
              <p className="font-semibold text-brand-900">{formatPrice(it.price * it.quantity)}</p>
            </div>
          ))}
        </div>
        <div className="mt-4 space-y-2 border-t border-brand-100 pt-4 text-sm">
          <div className="flex justify-between text-brand-600"><span>Subtotal</span><span>{formatPrice(order.subtotal)}</span></div>
          <div className="flex justify-between text-brand-600"><span>Tax</span><span>{formatPrice(order.tax)}</span></div>
          <div className="flex justify-between text-brand-600"><span>Shipping</span><span>{order.shipping === 0 ? 'Free' : formatPrice(order.shipping)}</span></div>
          <div className="flex justify-between border-t border-brand-100 pt-3 text-base font-bold text-brand-900">
            <span>Total</span><span>{formatPrice(order.total)}</span>
          </div>
        </div>
        <p className="mt-4 text-xs text-brand-400">Placed on {formatDateTime(order.createdAt)} · Supplier: {order.supplier?.supplierProfile?.businessName || order.supplier?.name}</p>
      </div>

      <div className="mt-8 flex justify-center gap-3">
        <Link to="/account" className="rounded-xl bg-brand-800 px-5 py-3 text-sm font-semibold text-white transition hover:bg-brand-700">
          View my orders
        </Link>
        <Link to="/products" className="rounded-xl border border-brand-300 px-5 py-3 text-sm font-semibold text-brand-700 transition hover:bg-white">
          Continue shopping
        </Link>
      </div>
    </div>
  );
}
