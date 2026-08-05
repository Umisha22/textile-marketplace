import { useState, useRef } from 'react';

export default function NeoButton({
  children,
  variant = 'raised',
  color = 'gold',
  size = 'md',
  className = '',
  disabled = false,
  onClick,
  ...props
}) {
  const [pressed, setPressed] = useState(false);
  const btnRef = useRef(null);

  const colorMap = {
    gold: color === 'gold' ? '' : 'bg-gold-500 text-void-950 hover:bg-gold-400 active:bg-gold-600',
    teal: 'bg-teal-500 text-void-950 hover:bg-teal-400 active:bg-teal-600',
    coral: 'bg-coral-500 text-white hover:bg-coral-400 active:bg-coral-600',
    ghost: 'bg-transparent border border-gold-500/30 text-gold-400 hover:bg-gold-500/10 hover:border-gold-500/50',
    'ghost-teal': 'bg-transparent border border-teal-500/30 text-teal-400 hover:bg-teal-500/10 hover:border-teal-500/50',
  };

  const sizeMap = {
    sm: 'px-4 py-2 text-xs rounded-lg',
    md: 'px-6 py-3 text-sm rounded-xl',
    lg: 'px-8 py-4 text-base rounded-xl',
  };

  const shadowMap = {
    raised: pressed ? 'neo-pressed' : (color === 'gold' ? 'neo-raised-gold' : 'neo-raised'),
    flat: pressed ? 'neo-pressed' : 'neo-flat',
  };

  const spawnRipple = (e) => {
    if (disabled) return;
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
        font-semibold transition-all duration-300 ease-out btn-ripple
        ${colorMap[color] || colorMap.gold}
        ${sizeMap[size] || sizeMap.md}
        ${variant !== 'ghost' && variant !== 'ghost-teal' ? shadowMap[variant] || shadowMap.raised : ''}
        ${disabled ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer active:scale-[0.97]'}
        thread-border
        ${className}
      `}
      disabled={disabled}
      onMouseDown={(e) => { if (!disabled) { setPressed(true); spawnRipple(e); } }}
      onMouseUp={() => setPressed(false)}
      onMouseLeave={() => setPressed(false)}
      onClick={onClick}
      {...props}
    >
      {children}
    </button>
  );
}
