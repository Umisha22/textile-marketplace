export function Badge({ children, className = '' }) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ${className}`}
    >
      {children}
    </span>
  );
}

export function Spinner({ className = '' }) {
  return (
    <span className={`inline-flex items-center gap-1 ${className}`} aria-label="Loading">
      <span className="thread-wave-loader !h-4 !gap-0.5">
        {Array.from({ length: 5 }).map((_, i) => (
          <span key={i} className="strand !w-[2px]" style={{ animationDelay: `${i * 0.1}s` }} />
        ))}
      </span>
    </span>
  );
}

export function EmptyState({ title, description, action }) {
  return (
    <div className="glass-strong flex flex-col items-center justify-center rounded-2xl px-6 py-16 text-center">
      <div className="empty-orb mb-6" />
      <h3 className="font-display text-xl font-semibold text-text-primary">{title}</h3>
      {description && <p className="mt-2 max-w-sm text-sm text-text-secondary">{description}</p>}
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}

export function StatusBadge({ status }) {
  const map = {
    pending: 'bg-amber-100 text-amber-800 ring-amber-200',
    accepted: 'bg-sky-100 text-sky-800 ring-sky-200',
    preparing: 'bg-violet-100 text-violet-800 ring-violet-200',
    ready_for_dispatch: 'bg-amber-100 text-amber-800 ring-amber-200',
    completed: 'bg-emerald-100 text-emerald-800 ring-emerald-200',
  };
  const label = {
    pending: 'Pending',
    accepted: 'Accepted',
    preparing: 'Preparing',
    ready_for_dispatch: 'Ready for Dispatch',
    completed: 'Completed',
  };
  return <Badge className={map[status] || 'bg-gray-100 text-gray-700 ring-gray-200'}>{label[status] || status}</Badge>;
}
