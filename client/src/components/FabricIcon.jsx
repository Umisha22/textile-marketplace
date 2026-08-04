const ICONS = {
  woven: (
    <>
      <line x1="3" y1="7" x2="21" y2="7" />
      <line x1="3" y1="12" x2="21" y2="12" />
      <line x1="3" y1="17" x2="21" y2="17" />
      <line x1="8" y1="3" x2="8" y2="21" />
      <line x1="16" y1="3" x2="16" y2="21" />
    </>
  ),
  knit: (
    <>
      <path d="M6 3q1.5-1.5 3 0t3 0 3 0 3 0" />
      <path d="M6 8.5q1.5-1.5 3 0t3 0 3 0 3 0" />
      <path d="M6 14q1.5-1.5 3 0t3 0 3 0 3 0" />
      <path d="M6 19.5q1.5-1.5 3 0t3 0 3 0 3 0" />
    </>
  ),
  denim: (
    <>
      <path d="M2 4h20v16H2z" />
      <path d="M2 14l8-8M8 14l8-8M14 14l8-8M6 17l8-8M12 17l8-8M10 20l8-8" />
    </>
  ),
  satin: (
    <>
      <path d="M3 5c6 0 6 4 12 4s6-4 9-4" />
      <path d="M3 11c6 0 6 4 12 4s6-4 9-4" />
      <path d="M3 17c6 0 6 4 12 4s6-4 9-4" />
    </>
  ),
  silk: (
    <>
      <path d="M4 4c8-2 8 6 16 4v12H4z" />
      <path d="M4 4c8 2 8 10 16 8" />
    </>
  ),
  chiffon: (
    <>
      <rect x="3" y="3" width="18" height="18" rx="1" />
      <line x1="3" y1="12" x2="21" y2="12" />
      <line x1="12" y1="3" x2="12" y2="21" />
    </>
  ),
  georgette: (
    <>
      <rect x="3" y="3" width="18" height="18" rx="1" />
      <line x1="3" y1="12" x2="21" y2="12" />
      <line x1="12" y1="3" x2="12" y2="21" />
      <line x1="3" y1="7" x2="21" y2="7" />
      <line x1="3" y1="17" x2="21" y2="17" />
    </>
  ),
  organza: (
    <>
      <rect x="3" y="3" width="18" height="18" rx="1" />
      <line x1="6" y1="3" x2="6" y2="21" />
      <line x1="12" y1="3" x2="12" y2="21" />
      <line x1="18" y1="3" x2="18" y2="21" />
    </>
  ),
  jacquard: (
    <>
      <circle cx="12" cy="12" r="8" />
      <path d="M12 5l2.2 3.2 3.8.6-2.7 2.7.6 3.8L12 16.6 8.1 15.3l.6-3.8L6 8.8l3.8-.6z" />
      <circle cx="12" cy="12" r="1.5" />
    </>
  ),
  poplin: (
    <>
      <line x1="4" y1="6" x2="20" y2="6" />
      <line x1="4" y1="12" x2="20" y2="12" />
      <line x1="4" y1="18" x2="20" y2="18" />
      <line x1="8" y1="3" x2="8" y2="21" />
      <line x1="16" y1="3" x2="16" y2="21" />
    </>
  ),
  muslin: (
    <>
      <line x1="4" y1="8" x2="20" y2="8" />
      <line x1="4" y1="16" x2="20" y2="16" />
      <line x1="8" y1="4" x2="8" y2="20" />
      <line x1="16" y1="4" x2="16" y2="20" />
    </>
  ),
  canvas: (
    <>
      <rect x="4" y="4" width="6" height="16" />
      <rect x="14" y="4" width="6" height="16" />
      <rect x="4" y="4" width="16" height="5" />
      <rect x="4" y="15" width="16" height="5" />
    </>
  ),
  twill: (
    <>
      <path d="M4 4l16 6M4 8l16 6M4 12l16 6M4 16l16 6" />
      <path d="M20 4l-6 2M8 4l-4 1" opacity="0.4" />
    </>
  ),
  velvet: (
    <>
      <rect x="4" y="4" width="16" height="16" rx="2" />
      <line x1="8" y1="4" x2="8" y2="20" />
      <line x1="12" y1="4" x2="12" y2="20" />
      <line x1="16" y1="4" x2="16" y2="20" />
    </>
  ),
  crepe: (
    <>
      <circle cx="7" cy="7" r="1.6" />
      <circle cx="13" cy="13" r="1.6" />
      <circle cx="19" cy="7" r="1.6" />
      <circle cx="7" cy="19" r="1.6" />
      <circle cx="19" cy="19" r="1.6" />
    </>
  ),
  broadcloth: (
    <>
      <line x1="4" y1="5" x2="20" y2="5" />
      <line x1="4" y1="19" x2="20" y2="19" />
      <line x1="6" y1="3" x2="6" y2="21" />
      <line x1="18" y1="3" x2="18" y2="21" />
    </>
  ),
  taffeta: (
    <>
      <path d="M3 6c5 0 5 3 9 3s5-3 9-3v12c-5 0-5-3-9-3s-5 3-9 3z" />
      <path d="M3 11c5 0 5 2 9 2s5-2 9-2" opacity="0.5" />
    </>
  ),
  lace: (
    <>
      <circle cx="7" cy="7" r="4" />
      <circle cx="17" cy="7" r="4" />
      <circle cx="7" cy="17" r="4" />
      <circle cx="17" cy="17" r="4" />
      <line x1="11" y1="7" x2="13" y2="7" />
      <line x1="7" y1="11" x2="7" y2="13" />
      <line x1="17" y1="11" x2="17" y2="13" />
      <line x1="11" y1="17" x2="13" y2="17" />
    </>
  ),
  blends: (
    <>
      <line x1="4" y1="7" x2="20" y2="7" />
      <line x1="4" y1="17" x2="20" y2="17" />
      <line x1="9" y1="3" x2="9" y2="21" />
      <line x1="15" y1="3" x2="15" y2="21" />
      <circle cx="12" cy="12" r="1.6" />
    </>
  ),
};

/**
 * Small vector icon for a fabric type. Falls back to a generic weave icon.
 */
export default function FabricIcon({ fabricType, className = 'h-5 w-5' }) {
  const body = ICONS[fabricType] || ICONS.woven;
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      {body}
    </svg>
  );
}

export const FABRIC_ICON_TYPES = Object.keys(ICONS);
