import { useState } from 'react';

export default function NeoInput({
  label,
  icon,
  className = '',
  ...props
}) {
  const [focused, setFocused] = useState(false);

  return (
    <div className={`relative ${className}`}>
      {label && (
        <label className="mb-2 block text-xs font-medium text-text-secondary">
          {label}
        </label>
      )}
      <div
        className={`
          relative rounded-xl transition-all duration-300
          ${focused
            ? 'neo-pressed ring-1 ring-gold-500/30'
            : 'neo-flat hover:ring-1 hover:ring-white/5'
          }
        `}
      >
        {icon && (
          <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-text-muted">
            {icon}
          </span>
        )}
        <input
          className={`
            w-full bg-transparent px-4 py-3 text-sm text-text-primary
            placeholder:text-text-muted outline-none
            ${icon ? 'pl-11' : ''}
          `}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          {...props}
        />
        {focused && (
          <div className="pointer-events-none absolute inset-0 rounded-xl border border-gold-500/20" />
        )}
      </div>
    </div>
  );
}
