import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { api } from '../api/client.js';
import { Spinner, StatusBadge } from '../components/ui.jsx';
import GlassPanel from '../components/design-system/GlassPanel.jsx';
import NeoButton from '../components/design-system/NeoButton.jsx';
import { formatPrice, formatDateTime } from '../utils/format.js';
import { ORDER_STATUSES } from '../utils/constants.js';
import { useCurrency } from '../hooks/useCurrency.js';

export default function OrderConfirmationPage() {
  useCurrency();
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
        <Spinner className="h-10 w-10 text-gold-400" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="mx-auto max-w-xl px-4 py-24 text-center">
        <h1 className="font-display text-2xl font-bold text-text-primary">Order not found</h1>
        <Link to="/account" className="mt-3 inline-block text-gold-400 underline">Back to dashboard</Link>
      </div>
    );
  }

  const currentIdx = ORDER_STATUSES.findIndex((s) => s.value === order.status);

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 text-center sm:px-6">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-teal-500/20 text-3xl text-teal-400 border border-teal-500/20">
        Order confirmed
      </div>
      <h1 className="mt-4 font-display text-3xl font-bold text-text-primary">Order confirmed!</h1>
      <p className="mt-2 text-sm text-text-secondary">
        Thank you, {order.shippingAddress?.fullName}. Your order is now with the supplier.
      </p>
      <p className="mt-1 text-sm font-semibold text-gold-400">Order number: {order.orderNumber}</p>

      <GlassPanel className="mt-8 p-6 text-left">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="font-display text-lg font-bold text-text-primary">Order status</h2>
          <StatusBadge status={order.status} />
        </div>

        <div className="mt-6 flex items-center">
          {ORDER_STATUSES.map((s, i) => (
            <div key={s.value} className="flex flex-1 flex-col items-center">
              <div
                className={`flex h-9 w-9 items-center justify-center rounded-full border-2 text-xs font-bold ${
                  i < currentIdx
                    ? 'border-teal-500 bg-teal-500 text-white'
                    : i === currentIdx
                      ? 'border-gold-500 bg-gold-500 text-void-950'
                      : 'border-void-500 bg-void-700 text-text-muted'
                }`}
              >
                {i < currentIdx ? '✓' : i + 1}
              </div>
              <p className={`mt-2 hidden text-center text-[11px] font-medium sm:block ${i <= currentIdx ? 'text-text-primary' : 'text-text-muted'}`}>
                {s.label}
              </p>
              {i < ORDER_STATUSES.length - 1 && (
                <div className={`-mt-5 h-0.5 w-full ${i < currentIdx ? 'bg-teal-500' : 'bg-void-600'}`} />
              )}
            </div>
          ))}
        </div>
        <div className="mt-2 flex justify-center gap-6 sm:hidden">
          {ORDER_STATUSES.map((s, i) => (
            <span key={s.value} className={`text-[11px] font-medium ${i <= currentIdx ? 'text-text-primary' : 'text-text-muted'}`}>{s.label}</span>
          ))}
        </div>
      </GlassPanel>

      <GlassPanel className="mt-6 p-6 text-left">
        <h2 className="font-display text-lg font-bold text-text-primary">Order summary</h2>
        <div className="mt-4 space-y-3">
          {order.items.map((it) => (
            <div key={it._id} className="flex items-center justify-between gap-3 text-sm">
              <div>
                <p className="font-semibold text-text-primary">{it.name}</p>
                <p className="text-xs text-text-secondary">{it.quantity} × {formatPrice(it.price)}</p>
              </div>
              <p className="font-semibold text-gold-400">{formatPrice(it.price * it.quantity)}</p>
            </div>
          ))}
        </div>
        <div className="mt-4 space-y-2 border-t border-void-600/50 pt-4 text-sm">
          <div className="flex justify-between text-text-secondary"><span>Subtotal</span><span>{formatPrice(order.subtotal)}</span></div>
          <div className="flex justify-between text-text-secondary"><span>Tax</span><span>{formatPrice(order.tax)}</span></div>
          <div className="flex justify-between text-text-secondary"><span>Shipping</span><span>{order.shipping === 0 ? 'Free' : formatPrice(order.shipping)}</span></div>
          <div className="flex justify-between border-t border-void-600/50 pt-3 text-base font-bold text-text-primary">
            <span>Total</span><span className="text-gold-400">{formatPrice(order.total)}</span>
          </div>
        </div>
        <p className="mt-4 text-xs text-text-muted">Placed on {formatDateTime(order.createdAt)} · Supplier: {order.supplier?.supplierProfile?.businessName || order.supplier?.name}</p>
      </GlassPanel>

      <div className="mt-8 flex justify-center gap-3">
        <Link to="/account">
          <NeoButton>View my orders</NeoButton>
        </Link>
        <Link to="/products" className="rounded-xl border border-void-500/50 px-5 py-3 text-sm font-semibold text-text-secondary transition hover:border-gold-500/30 hover:text-gold-400">
          Continue shopping
        </Link>
      </div>
    </div>
  );
}
