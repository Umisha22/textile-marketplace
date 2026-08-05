export default function GlassPanel({ children, className = '', variant = 'default', ...props }) {
  const variants = {
    default: 'glass',
    strong: 'glass-strong',
    subtle: 'glass-subtle',
  };

  return (
    <div
      className={`${variants[variant]} rounded-3xl transition-all duration-300 ease-out ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
