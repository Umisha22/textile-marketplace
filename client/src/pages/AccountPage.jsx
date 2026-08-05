import { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api/client.js';
import { Spinner, StatusBadge } from '../components/ui.jsx';
import GlassPanel from '../components/design-system/GlassPanel.jsx';
import NeoButton from '../components/design-system/NeoButton.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { formatPrice, formatDate } from '../utils/format.js';
import { CATEGORY_LABELS, BUSINESS_TYPE_LABELS, INDUSTRY_LABELS } from '../utils/constants.js';
import { useCurrency } from '../hooks/useCurrency.js';

function StatCard({ icon, label, value, trend }) {
  return (
    <div className="neo-raised group rounded-2xl p-5 transition-all duration-500 hover:-translate-y-1 thread-border">
      <div className="flex items-center justify-between">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gold-500/10 text-gold-400">
          {icon}
        </div>
        {trend && <span className="text-[10px] font-semibold text-teal-400">{trend}</span>}
      </div>
      <p className="mt-3 font-display text-2xl font-bold text-text-primary">{value}</p>
      <p className="mt-1 text-xs text-text-muted">{label}</p>
    </div>
  );
}

function OrderTimeline({ orders }) {
  if (!orders.length) return null;
  return (
    <div className="relative">
      {/* Golden thread line */}
      <div className="absolute top-5 left-0 right-0 h-[2px] bg-gradient-to-r from-gold-500/50 via-gold-500 to-gold-500/50" />
      <div className="flex gap-6 overflow-x-auto pb-4">
        {orders.map((o) => {
          const statusColors = {
            pending: 'bg-gold-500 animate-glow-pulse',
            accepted: 'bg-teal-500',
            preparing: 'bg-violet-500 animate-spin',
            ready_for_dispatch: 'bg-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.5)]',
            completed: 'bg-teal-500',
          };
          return (
            <div key={o._id} className="group relative shrink-0">
              {/* Node on thread */}
              <div className={`relative z-10 mx-auto h-5 w-5 rounded-full ${statusColors[o.status] || 'bg-void-500'} border-2 border-void-900 transition-transform group-hover:scale-125`} />
              {/* Card below */}
              <div className="mt-3 w-48 rounded-xl border border-void-600/30 bg-void-700/50 p-3 transition-all duration-300 group-hover:border-gold-500/30 group-hover:-translate-y-1">
                <p className="text-xs font-mono font-semibold text-text-primary">{o.orderNumber}</p>
                <p className="text-[10px] text-text-muted">{formatDate(o.createdAt)}</p>
                <div className="mt-1.5 flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-gold-400">{formatPrice(o.total)}</span>
                  <StatusBadge status={o.status} />
                </div>
                <p className="mt-1 text-[10px] text-text-muted">{o.items?.length} item{o.items?.length !== 1 ? 's' : ''}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function SelfDrawingChart({ data, label }) {
  const canvasRef = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !data.length) return;
    const ctx = canvas.getContext('2d');
    const w = canvas.width = canvas.offsetWidth * 2;
    const h = canvas.height = canvas.offsetHeight * 2;
    ctx.scale(2, 2);
    const dW = w / 2, dH = h / 2;
    const max = Math.max(...data);
    const padding = 20;

    let progress = 0;
    const draw = () => {
      ctx.clearRect(0, 0, dW, dH);
      ctx.strokeStyle = '#D4A853';
      ctx.lineWidth = 2;
      ctx.lineCap = 'round';
      ctx.beginPath();

      const points = data.map((v, i) => ({
        x: padding + (i / (data.length - 1)) * (dW - padding * 2),
        y: dH - padding - (v / max) * (dH - padding * 2),
      }));

      const totalLen = points.reduce((sum, p, i) => {
        if (i === 0) return 0;
        const dx = p.x - points[i - 1].x;
        const dy = p.y - points[i - 1].y;
        return sum + Math.sqrt(dx * dx + dy * dy);
      }, 0);

      let drawn = 0;
      ctx.moveTo(points[0].x, points[0].y);
      for (let i = 1; i < points.length; i++) {
        const dx = points[i].x - points[i - 1].x;
        const dy = points[i].y - points[i - 1].y;
        const segLen = Math.sqrt(dx * dx + dy * dy);
        const segProgress = Math.min(1, (progress * totalLen - drawn) / segLen);
        if (segProgress <= 0) break;
        const ex = points[i - 1].x + dx * segProgress;
        const ey = points[i - 1].y + dy * segProgress;
        ctx.lineTo(ex, ey);
        drawn += segLen;
      }
      ctx.stroke();

      // Glow dots
      points.forEach((p, i) => {
        const dotProgress = Math.min(1, Math.max(0, (progress * totalLen - (drawn * i / points.length)) / 20));
        if (dotProgress > 0.8) {
          ctx.beginPath();
          ctx.arc(p.x, p.y, 3, 0, Math.PI * 2);
          ctx.fillStyle = '#D4A853';
          ctx.fill();
        }
      });

      if (progress < 1) {
        progress += 0.015;
        requestAnimationFrame(draw);
      }
    };
    const raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, [data]);

  return (
    <div>
      <p className="text-[10px] font-semibold uppercase tracking-wider text-text-muted mb-2">{label}</p>
      <canvas ref={canvasRef} className="w-full h-24" />
    </div>
  );
}

export default function AccountPage() {
  useCurrency();
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/orders/mine').then((d) => setOrders(d.orders)).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const profile = user?.buyerProfile || {};
  const totalSpent = orders.reduce((sum, o) => sum + (o.total || 0), 0);
  const activeOrders = orders.filter((o) => o.status !== 'completed').length;

  const chartData = [120, 250, 180, 340, 290, 420, 380];

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
          <Link to="/products" className="rounded-xl border border-void-500/50 px-4 py-2.5 text-sm font-semibold text-text-secondary hover:border-gold-500/30 transition">Shop fabrics</Link>
          <Link to="/assistant"><NeoButton className="text-sm">Ask Weaver AI</NeoButton></Link>
        </div>
      </div>

      {/* Stat cards */}
      <div className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="9" cy="21" r="1.4" /><circle cx="19" cy="21" r="1.4" /><path d="M2.5 3h2l2.6 12.5a2 2 0 0 0 2 1.5h8.8a2 2 0 0 0 2-1.6L21.5 8H6.1" /></svg>} label="Active Orders" value={activeOrders} trend={activeOrders > 0 ? `${activeOrders} pending` : null} />
        <StatCard icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" /></svg>} label="Total Spent" value={formatPrice(totalSpent)} />
        <StatCard icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" /></svg>} label="Saved Fabrics" value="0" />
        <StatCard icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>} label="Messages" value="0" />
      </div>

      {/* Kinetic Order Timeline */}
      {orders.length > 0 && (
        <div className="mt-8">
          <h2 className="font-display text-lg font-bold text-text-primary mb-4">Order Timeline</h2>
          <GlassPanel className="p-5 overflow-hidden">
            <OrderTimeline orders={orders.slice(0, 8)} />
          </GlassPanel>
        </div>
      )}

      <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_320px]">
        {/* Orders list */}
        <div>
          <h2 className="font-display text-lg font-bold text-text-primary">My Orders</h2>
          {loading ? (
            <div className="flex justify-center py-20"><Spinner className="h-8 w-8 text-gold-400" /></div>
          ) : orders.length === 0 ? (
            <div className="mt-4 rounded-2xl border border-dashed border-void-600 bg-void-800/50 p-8 text-center">
              <p className="text-sm text-text-muted">No orders yet</p>
              <Link to="/products" className="mt-3 inline-block rounded-xl bg-gold-500 px-4 py-2 text-xs font-bold text-void-950">Start sourcing</Link>
            </div>
          ) : (
            <div className="mt-4 space-y-3">
              {orders.map((o) => (
                <Link key={o._id} to={`/order-confirmation/${o._id}`} className="block rounded-2xl border border-void-600/50 glass-strong p-4 transition-all duration-300 hover:border-gold-500/30 hover:-translate-y-0.5">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="font-mono text-sm font-semibold text-text-primary">{o.orderNumber}</p>
                      <p className="text-xs text-text-muted">{formatDate(o.createdAt)}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-sm font-bold text-gold-400">{formatPrice(o.total)}</span>
                      <StatusBadge status={o.status} />
                    </div>
                  </div>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {o.items.map((it) => (
                      <span key={it._id} className="rounded-lg bg-void-700/50 border border-void-600/30 px-2 py-0.5 text-[10px] font-medium text-text-secondary">{it.name} × {it.quantity}</span>
                    ))}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* AI Sourcing Insights */}
        <div className="space-y-4">
          <GlassPanel className="p-5">
            <h3 className="font-display text-sm font-bold text-text-primary mb-3">AI Sourcing Insights</h3>
            <SelfDrawingChart data={chartData} label="Spending trend (6 months)" />
            <div className="mt-4 space-y-2">
              <p className="text-[10px] text-text-muted">Recommended restocks:</p>
              {['Cotton Poplin', 'Silk Chiffon'].map((f) => (
                <div key={f} className="flex items-center gap-2 rounded-lg border border-void-600/30 bg-void-700/30 px-3 py-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-gold-500" />
                  <span className="text-xs text-text-secondary">{f}</span>
                </div>
              ))}
            </div>
          </GlassPanel>

          {/* Profile summary */}
          <GlassPanel className="p-5">
            <h3 className="font-display text-sm font-bold text-text-primary mb-3">Profile</h3>
            <dl className="space-y-1.5 text-xs">
              {[
                ['Business', profile.businessType ? BUSINESS_TYPE_LABELS[profile.businessType] || profile.businessType : '—'],
                ['Industry', profile.industry ? INDUSTRY_LABELS[profile.industry] || profile.industry : '—'],
                ['Budget', profile.budgetRange ? profile.budgetRange.replaceAll('_', ' ').replace('k', 'K') : '—'],
              ].map(([k, v]) => (
                <div key={k} className="flex justify-between"><dt className="text-text-muted">{k}</dt><dd className="text-text-primary font-medium">{v}</dd></div>
              ))}
            </dl>
            {!user?.onboarded && (
              <Link to="/onboarding" className="mt-3 block rounded-lg bg-gold-500/10 border border-gold-500/20 py-2 text-center text-xs font-semibold text-gold-400 transition hover:bg-gold-500/20">
                Complete onboarding
              </Link>
            )}
          </GlassPanel>
        </div>
      </div>
    </div>
  );
}
