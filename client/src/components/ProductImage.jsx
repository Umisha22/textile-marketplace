const PALETTES = [
  ['#0f3d3e', '#347e75'],
  ['#6c2a23', '#c1442e'],
  ['#17413d', '#7abab0'],
  ['#5d4037', '#a1887f'],
  ['#283593', '#7986cb'],
  ['#4a148c', '#ab47bc'],
  ['#00695c', '#4db6ac'],
  ['#bf360c', '#ff8a65'],
];

const SHEEN = new Set(['satin', 'silk', 'chiffon', 'georgette', 'organza', 'taffeta']);

const hashString = (s = '') => {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (Math.imul(31, h) + s.charCodeAt(i)) | 0;
  return Math.abs(h);
};

const hexToRgb = (hex = '#000') => {
  const full = hex.replace('#', '');
  const h = full.length === 3 ? full.split('').map((c) => c + c).join('') : full;
  const n = parseInt(h || '0', 16);
  return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
};

const light = (c, a = 0.18) => `rgba(255,255,255,${a})`;
const dark = (c, a = 0.16) => `rgba(${c.r},${c.g},${c.b},${a})`;

const weaveBody = (c, lw = 1.2) => `
  <line x1='0' y1='2' x2='8' y2='2' stroke='${light(c, 0.22)}' stroke-width='${lw}'/>
  <line x1='0' y1='6' x2='8' y2='6' stroke='${dark(c, 0.18)}' stroke-width='${lw}'/>
  <line x1='2' y1='0' x2='2' y2='8' stroke='${light(c, 0.22)}' stroke-width='${lw}'/>
  <line x1='6' y1='0' x2='6' y2='8' stroke='${dark(c, 0.18)}' stroke-width='${lw}'/>`;

const patterns = {
  knit: { tile: 16, body: (c) => `
    <path d='M2 2 q2 -2 4 0 q2 2 4 0' stroke='${light(c, 0.35)}' stroke-width='1.7' fill='none'/>
    <path d='M2 9 q2 -2 4 0 q2 2 4 0' stroke='${light(c, 0.2)}' stroke-width='1.7' fill='none'/>
    <path d='M10 2 q2 -2 4 0 q2 2 4 0' stroke='${light(c, 0.3)}' stroke-width='1.7' fill='none'/>
    <path d='M10 9 q2 -2 4 0 q2 2 4 0' stroke='${light(c, 0.17)}' stroke-width='1.7' fill='none'/>` },
  twill: { tile: 12, body: (c) => `
    <path d='M-3 3 L15 -9' stroke='${light(c, 0.3)}' stroke-width='2.3'/>
    <path d='M-3 7 L15 -5' stroke='${dark(c, 0.22)}' stroke-width='2.3'/>
    <path d='M-3 11 L15 -1' stroke='${light(c, 0.3)}' stroke-width='2.3'/>` },
  canvas: { tile: 20, body: (c) => `
    <rect x='0' y='0' width='20' height='6' fill='${light(c, 0.16)}'/>
    <rect x='0' y='11' width='20' height='6' fill='${dark(c, 0.12)}'/>
    <rect x='0' y='0' width='6' height='20' fill='${dark(c, 0.12)}'/>
    <rect x='11' y='0' width='6' height='20' fill='${light(c, 0.16)}'/>` },
  crepe: { tile: 14, body: (c) => `
    <circle cx='4' cy='4' r='1.6' fill='${light(c, 0.3)}'/>
    <circle cx='11' cy='11' r='1.6' fill='${dark(c, 0.25)}'/>
    <circle cx='11' cy='4' r='1.1' fill='${dark(c, 0.2)}'/>
    <circle cx='4' cy='11' r='1.1' fill='${light(c, 0.22)}'/>` },
  jacquard: { tile: 32, body: (c) => `
    <path d='M16 4 L24 12 L16 20 L8 12 Z' stroke='${light(c, 0.3)}' stroke-width='1.4' fill='none'/>
    <circle cx='16' cy='12' r='2.4' stroke='${light(c, 0.22)}' stroke-width='1.2' fill='none'/>
    <circle cx='8' cy='28' r='3' stroke='${light(c, 0.16)}' stroke-width='1.2' fill='none'/>
    <circle cx='24' cy='28' r='3' stroke='${light(c, 0.16)}' stroke-width='1.2' fill='none'/>` },
  velvet: { tile: 12, body: (c) => `
    <rect x='0' y='0' width='4' height='12' fill='${light(c, 0.14)}'/>
    <rect x='8' y='0' width='4' height='12' fill='${light(c, 0.1)}'/>` },
  lace: { tile: 24, body: (c) => `
    <circle cx='12' cy='12' r='4' stroke='${light(c, 0.4)}' stroke-width='1.3' fill='none'/>
    <circle cx='0' cy='0' r='3' stroke='${light(c, 0.28)}' stroke-width='1.2' fill='none'/>
    <circle cx='24' cy='24' r='3' stroke='${light(c, 0.28)}' stroke-width='1.2' fill='none'/>
    <line x1='0' y1='12' x2='8' y2='12' stroke='${light(c, 0.3)}' stroke-width='1.1'/>
    <line x1='16' y1='12' x2='24' y2='12' stroke='${light(c, 0.3)}' stroke-width='1.1'/>` },
};

const patternFor = (fabricType, c) => {
  if (patterns[fabricType]) return patterns[fabricType].body(c);
  if (fabricType === 'denim' || fabricType === 'twill') return patterns.twill.body(c);
  if (fabricType === 'canvas') return patterns.canvas.body(c);
  if (fabricType === 'velvet') return patterns.velvet.body(c);
  if (fabricType === 'crepe') return patterns.crepe.body(c);
  if (fabricType === 'jacquard' || fabricType === 'embroidery') return patterns.jacquard.body(c);
  if (fabricType === 'lace') return patterns.lace.body(c);
  if (fabricType === 'knit' || fabricType === 'jersey') return patterns.knit.body(c);
  return weaveBody(c);
};

const tileFor = (fabricType) => {
  if (patterns[fabricType]) return patterns[fabricType].tile;
  if (['denim', 'twill'].includes(fabricType)) return 12;
  if (fabricType === 'canvas') return 20;
  if (fabricType === 'velvet') return 12;
  if (fabricType === 'crepe') return 14;
  if (['jacquard', 'embroidery'].includes(fabricType)) return 32;
  if (fabricType === 'lace') return 24;
  if (['knit', 'jersey'].includes(fabricType)) return 16;
  return 8;
};

const pickBase = (product, seed) => {
  const colorHex = product?.colors?.[0]?.hex;
  if (colorHex && /^#?[0-9a-f]{3,8}$/i.test(colorHex)) return `#${colorHex.replace('#', '')}`;
  const palette = PALETTES[seed % PALETTES.length];
  return palette[seed % 2];
};

function buildSvg(product, seed) {
  const fabricType = product?.fabricType || '';
  const base = pickBase(product, seed);
  const c = hexToRgb(base);
  const tile = tileFor(fabricType);
  const patternBody = patternFor(fabricType, c);
  const sheen = SHEEN.has(fabricType);

  return `<svg xmlns='http://www.w3.org/2000/svg' width='600' height='450'>
  <defs>
    <linearGradient id='bg' x1='0' y1='0' x2='1' y2='1'>
      <stop offset='0%' stop-color='${base}'/>
      <stop offset='55%' stop-color='${base}'/>
      <stop offset='100%' stop-color='${shade(base, 0.22)}'/>
    </linearGradient>
    <pattern id='p' width='${tile}' height='${tile}' patternUnits='userSpaceOnUse'>
      <rect width='${tile}' height='${tile}' fill='none'/>
      ${patternBody}
    </pattern>
    <filter id='grain'>
      <feTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/>
      <feColorMatrix type='matrix' values='0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 0.55 0'/>
      <feComposite operator='over' in2='SourceGraphic'/>
    </filter>
    ${sheen ? `<linearGradient id='sheen' x1='0' y1='0' x2='1' y2='0'>
      <stop offset='0%' stop-color='white' stop-opacity='0'/>
      <stop offset='42%' stop-color='white' stop-opacity='0.28'/>
      <stop offset='50%' stop-color='white' stop-opacity='0.4'/>
      <stop offset='60%' stop-color='white' stop-opacity='0.22'/>
      <stop offset='100%' stop-color='white' stop-opacity='0'/>
    </linearGradient>` : ''}
  </defs>
  <rect width='600' height='450' fill='url(#bg)'/>
  <rect width='600' height='450' fill='url(#p)'/>
  <rect width='600' height='450' filter='url(#grain)' opacity='0.5'/>
  ${sheen ? `<rect width='600' height='450' fill='url(#sheen)'/>` : ''}
  <rect x='0' y='0' width='600' height='450' fill='none' stroke='rgba(0,0,0,0.08)' stroke-width='1'/>
</svg>`;
}

function shade(hex, amt) {
  const c = hexToRgb(hex);
  const f = amt < 0 ? 0 : 255;
  const p = Math.abs(amt);
  const mix = (v) => Math.round((f - v) * p + v);
  return `rgb(${mix(c.r)},${mix(c.g)},${mix(c.b)})`;
}

/**
 * Renders a product image. Uses a stored image URL when available,
 * otherwise draws a realistic fabric texture matched to the fabric type.
 */
export default function ProductImage({ product, src, alt, className = '', rounded = true }) {
  const url = src || product?.images?.[0];

  if (url) {
    return (
      <img
        src={url}
        alt={alt || product?.name || 'Product'}
        loading="lazy"
        className={`${rounded ? 'rounded-xl' : ''} h-full w-full object-cover ${className}`}
        onError={(e) => {
          e.currentTarget.style.display = 'none';
          e.currentTarget.nextElementSibling?.classList.remove('hidden');
        }}
      />
    );
  }

  const seed = hashString(`${product?.name}-${product?.fabricType || ''}-${product?.category || ''}`);
  const dataUri = `data:image/svg+xml;utf8,${encodeURIComponent(buildSvg(product, seed))}`;

  return (
    <div
      className={`${rounded ? 'rounded-xl' : ''} flex h-full w-full items-center justify-center overflow-hidden bg-brand-100 ${className}`}
    >
      <img src={dataUri} alt={alt || product?.name || 'Product'} className="h-full w-full object-cover" />
    </div>
  );
}
