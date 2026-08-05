export default function ThreadLoader({ className = '', text = 'Loading…', fullPage = false }) {
  if (fullPage) {
    return (
      <div className="flex min-h-[60vh] w-full flex-col items-center justify-center gap-6 text-center">
        <div className="thread-wave-full" />
        {text && (
          <div className="flex flex-col items-center gap-3">
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
    <div className={`flex w-full flex-col items-center justify-center gap-3 py-16 text-center ${className}`}>
      <div className="thread-wave-loader">
        {Array.from({ length: 7 }).map((_, i) => (
          <div key={i} className="strand" />
        ))}
      </div>
      {text && <p className="text-xs text-text-secondary font-mono">{text}</p>}
    </div>
  );
}
