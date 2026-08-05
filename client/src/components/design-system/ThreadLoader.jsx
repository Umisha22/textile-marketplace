export default function ThreadLoader({ className = '', text = 'Loading…', fullPage = false }) {
  if (fullPage) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-6">
        <div className="thread-wave-full" />
        {text && (
          <div className="flex items-center gap-2">
            <div className="thread-wave-loader">
              {Array.from({ length: 7 }).map((_, i) => (
                <div key={i} className="strand" />
              ))}
            </div>
            <p className="text-xs text-text-secondary font-mono">{text}</p>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={`flex flex-col items-center gap-4 ${className}`}>
      <div className="thread-wave-loader">
        {Array.from({ length: 7 }).map((_, i) => (
          <div key={i} className="strand" />
        ))}
      </div>
      {text && <p className="text-xs text-text-secondary font-mono">{text}</p>}
    </div>
  );
}
