export default function NeoToggle({ active, onChange, disabled = false, className = '' }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={active}
      disabled={disabled}
      onClick={() => !disabled && onChange?.(!active)}
      className={`neo-toggle ${active ? 'active' : ''} ${disabled ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'} ${className}`}
    >
      <span className="toggle-knob" />
    </button>
  );
}
