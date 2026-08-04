export function Badge({ children, className = '' }) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ${className}`}
    >
      {children}
    </span>
  );
}

export function Spinner({ className = 'h-6 w-6' }) {
  return (
    <div
      className={`animate-spin rounded-full border-[3px] border-current border-t-transparent ${className}`}
      aria-label="Loading"
    />
  );
}

export function EmptyState({ title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-brand-200 bg-white/60 px-6 py-16 text-center">
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-brand-100 text-2xl">
        🧵
      </div>
      <h3 className="font-display text-xl font-semibold text-brand-900">{title}</h3>
      {description && <p className="mt-1 max-w-sm text-sm text-brand-600">{description}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

export function StatusBadge({ status }) {
  const map = {
    pending: 'bg-amber-100 text-amber-800 ring-amber-200',
    accepted: 'bg-sky-100 text-sky-800 ring-sky-200',
    preparing: 'bg-violet-100 text-violet-800 ring-violet-200',
    ready_for_dispatch: 'bg-brand-100 text-brand-800 ring-brand-200',
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
