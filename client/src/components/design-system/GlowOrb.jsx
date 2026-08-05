export default function GlowOrb({ color = 'gold', size = 'md', pulse = true, className = '' }) {
  const colors = {
    gold: { bg: 'bg-gold-500', glow: 'shadow-[0_0_30px_rgba(212,168,83,0.3)]' },
    teal: { bg: 'bg-teal-500', glow: 'shadow-[0_0_30px_rgba(0,212,170,0.3)]' },
    coral: { bg: 'bg-coral-500', glow: 'shadow-[0_0_30px_rgba(255,107,107,0.3)]' },
  };
  const sizes = {
    sm: 'h-2 w-2',
    md: 'h-3 w-3',
    lg: 'h-5 w-5',
  };
  const c = colors[color] || colors.gold;

  return (
    <span
      className={`
        inline-block rounded-full ${c.bg}
        ${pulse ? 'animate-orb-float' : ''}
        ${c.glow}
        ${sizes[size] || sizes.md}
        ${className}
      `}
    />
  );
}
