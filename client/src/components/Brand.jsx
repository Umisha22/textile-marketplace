export function Logo({ className = 'h-9 w-9' }) {
  return (
    <span className={`relative inline-flex shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-void-700 via-void-800 to-void-900 ring-1 ring-gold-500/20 ${className}`}>
      <svg viewBox="0 0 32 32" className="h-[62%] w-[62%]" fill="none">
        <path d="M16 6 L9.5 26 M16 6 L22.5 26" stroke="#D4A853" strokeWidth="2.6" strokeLinecap="round" />
        <path d="M12 19.2 L20 19.2" stroke="#D4A853" strokeWidth="2.2" strokeLinecap="round" opacity="0.5" />
        <circle cx="16" cy="5" r="2.1" fill="#D4A853" />
        <path d="M25.5 7.5 l-3 3" stroke="#D4A853" strokeWidth="1.6" strokeLinecap="round" opacity="0.4" />
      </svg>
    </span>
  );
}

export default function Brand({ className = '', compact = false }) {
  return (
    <span className={`inline-flex items-center gap-2.5 ${className}`}>
      <Logo />
      {!compact && (
        <span className="font-display text-xl font-semibold tracking-tight text-text-primary">
          Astra <span className="text-gold-500">Threads</span>
        </span>
      )}
    </span>
  );
}
