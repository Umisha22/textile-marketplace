export default function NeoCard({ children, className = '', hover = true, ...props }) {
  return (
    <div
      className={`
        neo-raised rounded-2xl p-5
        ${hover ? 'transition-all duration-400 ease-out hover:shadow-[var(--shadow-neo-hover)] hover:-translate-y-1 thread-border' : ''}
        ${className}
      `}
      {...props}
    >
      {children}
    </div>
  );
}
