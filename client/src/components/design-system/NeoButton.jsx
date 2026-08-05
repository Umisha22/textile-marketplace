import { useState, useRef } from 'react';

export default function NeoButton({
  children,
  variant = 'raised',
  color = 'gold',
  size = 'md',
  className = '',
  disabled = false,
  loading = false,
  onClick,
  ...props
}) {
  const [pressed, setPressed] = useState(false);
  const btnRef = useRef(null);

  const colorMap = {
    gold: color === 'gold' ? '' : 'bg-gold-500 text-void-950',
    teal: 'bg-teal-500 text-void-950',
    coral: 'bg-coral-500 text-white',
    ghost: 'bg-transparent border border-gold-500/30 text-gold-400 hover:bg-gold-500/10',
    'ghost-teal': 'bg-transparent border border-teal-500/30 text-teal-400 hover:bg-teal-500/10',
  };

  const sizeMap = {
    sm: 'px-4 py-2 text-xs rounded-xl',
    md: 'px-6 py-3 text-sm rounded-2xl',
    lg: 'px-8 py-4 text-base rounded-2xl',
  };

  const shadowMap = {
    raised: pressed ? 'neo-pressed' : (color === 'gold' ? 'neo-raised-gold' : 'neo-raised'),
    flat: pressed ? 'neo-pressed' : 'neo-flat',
  };

  const spawnRipple = (e) => {
    if (disabled || loading) return;
    const btn = btnRef.current;
    if (!btn) return;
    const rect = btn.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height) * 2;
    const x = e.clientX - rect.left - size / 2;
    const y = e.clientY - rect.top - size / 2;
    const wave = document.createElement('span');
    wave.className = 'ripple-wave';
    wave.style.width = wave.style.height = `${size}px`;
    wave.style.left = `${x}px`;
    wave.style.top = `${y}px`;
    btn.appendChild(wave);
    setTimeout(() => wave.remove(), 600);
  };

  return (
    <button
      ref={btnRef}
      className={`
        font-semibold btn-ripple
        transition-all duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)]
        ${colorMap[color] || colorMap.gold}
        ${sizeMap[size] || sizeMap.md}
        ${variant !== 'ghost' && variant !== 'ghost-teal' ? shadowMap[variant] || shadowMap.raised : ''}
        ${disabled ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer active:scale-[0.97]'}
        focus:outline-none focus:ring-2 focus:ring-gold-500/40 focus:ring-offset-2 focus:ring-offset-void-950
        thread-border
        ${className}
      `}
      disabled={disabled || loading}
      onMouseDown={(e) => { if (!disabled && !loading) { setPressed(true); spawnRipple(e); } }}
      onMouseUp={() => setPressed(false)}
      onMouseLeave={() => setPressed(false)}
      onClick={onClick}
      {...props}
    >
      {loading ? (
        <span className="flex items-center gap-2">
          <span className="thread-wave-loader !h-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="strand !h-4" style={{ animationDelay: `${i * 0.1}s` }} />
            ))}
          </span>
          <span className="opacity-70">{children}</span>
        </span>
      ) : children}
    </button>
  );
}
