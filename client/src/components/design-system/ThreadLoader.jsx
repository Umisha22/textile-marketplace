export default function ThreadLoader({ className = '', text = 'Loading…' }) {
  return (
    <div className={`flex flex-col items-center gap-4 ${className}`}>
      <div className="relative h-1 w-48 overflow-hidden rounded-full bg-void-700">
        <div className="absolute inset-y-0 left-0 w-full origin-left animate-[threadWeave_1.5s_cubic-bezier(0.34,1.56,0.64,1)_infinite]">
          <div className="h-full w-full rounded-full bg-gradient-to-r from-gold-500 via-teal-500 to-gold-500" />
        </div>
      </div>
      {text && (
        <div className="flex items-center gap-2">
          <div className="flex gap-1">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-gold-500 animate-[breathe_1.2s_ease-in-out_0s_infinite]" />
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-gold-500 animate-[breathe_1.2s_ease-in-out_0.2s_infinite]" />
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-gold-500 animate-[breathe_1.2s_ease-in-out_0.4s_infinite]" />
          </div>
          <p className="text-xs text-text-secondary font-mono">{text}</p>
        </div>
      )}
    </div>
  );
}
