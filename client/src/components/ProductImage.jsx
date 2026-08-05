import { useState } from 'react';
import { fabricImage } from '../utils/fabricImages.js';

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

const SHEEN_TYPES = new Set(['silk', 'satin', 'taffeta', 'organza', 'georgette', 'chiffon']);
const MESH_TYPES = new Set(['chiffon', 'georgette', 'organza', 'lace']);

const hashString = (s = '') => {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (Math.imul(31, h) + s.charCodeAt(i)) | 0;
  return Math.abs(h);
};

const hexToRgb = (hex = '#8a8a8a') => {
  const full = hex.replace('#', '').trim();
  const h = full.length === 3 ? full.split('').map((c) => c + c).join('') : full;
  const n = parseInt(h || '8a8a8a', 16);
  return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
};

const toHex = (c) =>
  `#${[c.r, c.g, c.b].map((v) => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, '0')).join('')}`;

const lum = (hex) => {
  const c = hexToRgb(hex);
  return (0.299 * c.r + 0.587 * c.g + 0.114 * c.b) / 255;
};

// Mix hex with black (amt<0) or white (amt>0).
const mix = (hex, amt) => {
  const c = hexToRgb(hex);
  const f = amt < 0 ? 0 : 255;
  const p = Math.abs(amt);
  return toHex({ r: (f - c.r) * p + c.r, g: (f - c.g) * p + c.g, b: (f - c.b) * p + c.b });
};

const white = (hex, a) => `rgba(255,255,255,${a})`;
const black = (hex, a) => `rgba(0,0,0,${a})`;

function patternFor(type, hex) {
  const dark = lum(hex) > 0.55;
  const L1 = dark ? white(hex, 0.28) : white(hex, 0.16);
  const D1 = dark ? black(hex, 0.22) : black(hex, 0.18);
  const D2 = dark ? black(hex, 0.1) : black(hex, 0.08);

  switch (type) {
    case 'silk':
    case 'satin':
    case 'taffeta':
      // Satin weave: long horizontal floats catching light.
      return {
        tile: 12,
        body: `
          <rect x='0' y='1' width='12' height='1.4' fill='${L1}'/>
          <rect x='0' y='6.5' width='12' height='1.2' fill='${D2}'/>
          <rect x='0' y='11' width='12' height='0.8' fill='${L1}'/>
          <line x1='0' y1='3.6' x2='12' y2='3.6' stroke='${D1}' stroke-width='0.5'/>`,
      };
    case 'chiffon':
    case 'georgette':
    case 'organza':
      // Translucent gauze: fine open mesh.
      return {
        tile: 10,
        body: `
          <rect x='0' y='0' width='10' height='10' fill='none' stroke='${D1}' stroke-width='0.7'/>
          <line x1='0' y1='5' x2='10' y2='5' stroke='${L1}' stroke-width='0.5'/>
          <line x1='5' y1='0' x2='5' y2='10' stroke='${L1}' stroke-width='0.5'/>`,
      };
    case 'twill':
      return {
        tile: 14,
        body: `
          <path d='M-4 4 L18 -8' stroke='${L1}' stroke-width='2.6'/>
          <path d='M-4 8 L18 -4' stroke='${D1}' stroke-width='2.6'/>
          <path d='M-4 12 L18 0' stroke='${L1}' stroke-width='2.6'/>`,
      };
    case 'denim':
      return {
        tile: 14,
        body: `
          <path d='M-4 4 L18 -8' stroke='${L1}' stroke-width='2.6'/>
          <path d='M-4 8 L18 -4' stroke='${D1}' stroke-width='2.6'/>
          <circle cx='5' cy='10' r='0.9' fill='${white(hex, 0.35)}'/>
          <circle cx='11' cy='3' r='0.7' fill='${black(hex, 0.3)}'/>
          <circle cx='2' cy='2' r='0.8' fill='${white(hex, 0.3)}'/>`,
      };
    case 'canvas':
      return {
        tile: 22,
        body: `
          <rect x='0' y='0' width='22' height='7' fill='${L1}'/>
          <rect x='0' y='12' width='22' height='7' fill='${D1}'/>
          <rect x='0' y='0' width='7' height='22' fill='${D1}'/>
          <rect x='12' y='0' width='7' height='22' fill='${L1}'/>`,
      };
    case 'knit':
      return {
        tile: 18,
        body: `
          <path d='M3 2 q2.5 -2.6 5 0 q2.5 2.6 5 0' stroke='${L1}' stroke-width='1.8' fill='none'/>
          <path d='M3 9.5 q2.5 -2.6 5 0 q2.5 2.6 5 0' stroke='${D1}' stroke-width='1.8' fill='none'/>
          <path d='M3 17 q2.5 -2.6 5 0 q2.5 2.6 5 0' stroke='${L1}' stroke-width='1.8' fill='none'/>`,
      };
    case 'velvet':
      return {
        tile: 10,
        body: `
          <rect x='0' y='0' width='3.4' height='10' fill='${L1}'/>
          <rect x='6.6' y='0' width='3.4' height='10' fill='${D2}'/>`,
      };
    case 'crepe':
      return {
        tile: 12,
        body: `
          <circle cx='3' cy='3' r='1.7' fill='${D1}'/>
          <circle cx='9' cy='9' r='1.7' fill='${L1}'/>
          <circle cx='9' cy='3' r='1.1' fill='${L1}'/>
          <circle cx='3' cy='9' r='1.1' fill='${D1}'/>`,
      };
    case 'jacquard':
      return {
        tile: 36,
        body: `
          <path d='M18 6 L26 14 L18 22 L10 14 Z' stroke='${L1}' stroke-width='1.6' fill='none'/>
          <path d='M18 12 L23 17 L18 22 L13 17 Z' fill='${D2}'/>
          <circle cx='6' cy='30' r='3.4' stroke='${D1}' stroke-width='1.3' fill='none'/>
          <circle cx='30' cy='30' r='3.4' stroke='${D1}' stroke-width='1.3' fill='none'/>`,
      };
    case 'lace':
      return {
        tile: 28,
        body: `
          <circle cx='14' cy='14' r='5' stroke='${L1}' stroke-width='1.6' fill='none'/>
          <circle cx='14' cy='14' r='2' fill='${D2}'/>
          <circle cx='0' cy='0' r='3.5' stroke='${L1}' stroke-width='1.4' fill='none'/>
          <circle cx='28' cy='28' r='3.5' stroke='${L1}' stroke-width='1.4' fill='none'/>
          <line x1='0' y1='14' x2='9' y2='14' stroke='${L1}' stroke-width='1.3'/>
          <line x1='19' y1='14' x2='28' y2='14' stroke='${L1}' stroke-width='1.3'/>`,
      };
    case 'poplin':
    case 'muslin':
    case 'broadcloth':
    case 'wool':
      return {
        tile: 8,
        body: `
          <line x1='0' y1='2' x2='8' y2='2' stroke='${L1}' stroke-width='1.3'/>
          <line x1='0' y1='6' x2='8' y2='6' stroke='${D1}' stroke-width='1.3'/>
          <line x1='2' y1='0' x2='2' y2='8' stroke='${L1}' stroke-width='1.3'/>
          <line x1='6' y1='0' x2='6' y2='8' stroke='${D1}' stroke-width='1.3'/>`,
      };
    case 'blends':
      return {
        tile: 8,
        body: `
          <line x1='0' y1='2' x2='8' y2='2' stroke='${L1}' stroke-width='1.3'/>
          <line x1='0' y1='6' x2='8' y2='6' stroke='${D1}' stroke-width='1.3'/>
          <line x1='2' y1='0' x2='2' y2='8' stroke='${L1}' stroke-width='1.3'/>
          <line x1='6' y1='0' x2='6' y2='8' stroke='${D1}' stroke-width='1.3'/>
          <circle cx='1' cy='4' r='0.8' fill='${white(hex, 0.5)}'/>
          <circle cx='5' cy='7' r='0.7' fill='${black(hex, 0.35)}'/>`,
      };
    default:
      // Woven / linen: classic interlaced weave.
      return {
        tile: 8,
        body: `
          <line x1='0' y1='2' x2='8' y2='2' stroke='${L1}' stroke-width='1.4'/>
          <line x1='0' y1='6' x2='8' y2='6' stroke='${D1}' stroke-width='1.4'/>
          <line x1='2' y1='0' x2='2' y2='8' stroke='${L1}' stroke-width='1.4'/>
          <line x1='6' y1='0' x2='6' y2='8' stroke='${D1}' stroke-width='1.4'/>`,
      };
  }
}

function folds(hex) {
  const d = lum(hex) > 0.55;
  return `
    <path d='M-40 470 Q 150 300 240 470 Z' fill='${d ? black(hex, 0.1) : black(hex, 0.16)}'/>
    <path d='M210 470 Q 400 260 640 470 Z' fill='${d ? black(hex, 0.07) : black(hex, 0.12)}'/>
    <path d='M480 -30 Q 300 120 620 320 L 620 -30 Z' fill='${white(hex, d ? 0.14 : 0.1)}'/>`;
}

function buildSvg(fabricType, hex, seed) {
  const p = patternFor(fabricType, hex);
  const sheen = SHEEN_TYPES.has(fabricType);
  const mesh = MESH_TYPES.has(fabricType);
  const light = lum(hex) > 0.6;

  return `<svg xmlns='http://www.w3.org/2000/svg' width='600' height='450' viewBox='0 0 600 450'>
  <defs>
    <linearGradient id='base' x1='0' y1='0' x2='0.35' y2='1'>
      <stop offset='0%' stop-color='${mix(hex, light ? 0.08 : 0.14)}'/>
      <stop offset='38%' stop-color='${hex}'/>
      <stop offset='82%' stop-color='${mix(hex, -0.1)}'/>
      <stop offset='100%' stop-color='${mix(hex, -0.22)}'/>
    </linearGradient>
    <radialGradient id='glow' cx='0.3' cy='0.25' r='1'>
      <stop offset='0%' stop-color='${white(hex, light ? 0.3 : 0.22)}'/>
      <stop offset='55%' stop-color='${white(hex, 0)}'/>
      <stop offset='100%' stop-color='${black(hex, 0.12)}'/>
    </radialGradient>
    <linearGradient id='sheenBand' x1='0' y1='0' x2='0.8' y2='0.9'>
      <stop offset='0%' stop-color='${white(hex, 0)}'/>
      <stop offset='38%' stop-color='${white(hex, 0.05)}'/>
      <stop offset='46%' stop-color='${white(hex, sheen ? 0.45 : 0.18)}'/>
      <stop offset='54%' stop-color='${white(hex, sheen ? 0.3 : 0.1)}'/>
      <stop offset='62%' stop-color='${white(hex, 0.04)}'/>
      <stop offset='100%' stop-color='${white(hex, 0)}'/>
    </linearGradient>
    <linearGradient id='vignette' x1='0.5' y1='0.5' r='0.75'>
    </linearGradient>
    <radialGradient id='vig' cx='0.5' cy='0.45' r='0.75'>
      <stop offset='0%' stop-color='${black(hex, 0)}'/>
      <stop offset='78%' stop-color='${black(hex, 0.03)}'/>
      <stop offset='100%' stop-color='${black(hex, 0.28)}'/>
    </radialGradient>
    <pattern id='tex' width='${p.tile}' height='${p.tile}' patternUnits='userSpaceOnUse'>
      <rect width='${p.tile}' height='${p.tile}' fill='none'/>
      ${p.body}
    </pattern>
    <filter id='grain'>
      <feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/>
      <feColorMatrix type='matrix' values='0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 0.5 0'/>
    </filter>
    <filter id='softBlur' x='-20%' y='-20%' width='140%' height='140%'>
      <feGaussianBlur stdDeviation='14'/>
    </filter>
  </defs>

  <rect width='600' height='450' fill='url(#base)'/>
  ${mesh ? `<rect width='600' height='450' fill='${white(hex, 0.18)}'/>` : ''}
  <rect width='600' height='450' fill='url(#tex)'/>
  <rect width='600' height='450' fill='url(#glow)'/>
  ${sheen ? `<rect width='600' height='450' fill='url(#sheenBand)'/>` : ''}

  <g filter='url(#softBlur)'>${folds(hex)}</g>

  <rect width='600' height='450' filter='url(#grain)' opacity='${light ? 0.5 : 0.42}'/>
  <rect width='600' height='450' fill='url(#sheenBand)' opacity='${sheen ? 1 : 0.35}'/>
  <rect width='600' height='450' fill='url(#vig)'/>
  <rect x='0.5' y='0.5' width='599' height='449' fill='none' stroke='${black(hex, 0.14)}' stroke-width='1'/>
</svg>`;
}

const pickHex = (product, seed, colorProp) => {
  if (colorProp) {
    const isHex = /^#?[0-9a-f]{3,8}$/i.test(String(colorProp).trim());
    if (isHex) return `#${String(colorProp).trim().replace('#', '')}`;
    const byName = (product?.colors || []).find((c) => c.name.toLowerCase() === String(colorProp).toLowerCase());
    if (byName?.hex) return `#${byName.hex.replace('#', '')}`;
  }
  const first = product?.colors?.[0]?.hex;
  if (first && /^#?[0-9a-f]{3,8}$/i.test(first)) return `#${first.replace('#', '')}`;
  const palette = PALETTES[seed % PALETTES.length];
  return palette[seed % 2];
};

/**
 * Renders a product image.
 * - Uses a stored image URL when available (`src` or `product.images[0]`).
 * - Otherwise uses a real fabric-type photo when one is mapped.
 * - Falls back to a photorealistic SVG fabric texture for any fabric type.
 * - `color` (hex or color name) recolors the fabric — when a real photo is
 *   shown it is recolored via a color-blend overlay; the SVG version is fully recolored.
 */
export default function ProductImage({ product, src, alt, className = '', rounded = true, color }) {
  const [imgFailed, setImgFailed] = useState(false);

  const url = src || product?.images?.[0] || fabricImage(product?.fabricType);

  if (url && !imgFailed) {
    const tint = color
      ? /^#?[0-9a-f]{3,8}$/i.test(String(color).trim())
        ? `#${String(color).trim().replace('#', '')}`
        : product?.colors?.find((c) => c.name.toLowerCase() === String(color).toLowerCase())?.hex
      : null;

    return (
      <div data-fabric-image className={`${rounded ? 'rounded-xl' : ''} relative h-full w-full overflow-hidden ${className}`}>
        <img
          src={url}
          alt={alt || product?.name || 'Product'}
          loading="lazy"
          className="h-full w-full object-cover"
          onError={() => setImgFailed(true)}
        />
        {tint && (
          <div
            className="pointer-events-none absolute inset-0"
            style={{ backgroundColor: tint, mixBlendMode: 'color', opacity: 0.95 }}
          />
        )}
      </div>
    );
  }

  const seed = hashString(`${product?.name}-${product?.fabricType || ''}-${product?.category || ''}`);
  const hex = pickHex(product, seed, color);
  const fabricType = product?.fabricType || 'woven';
  const dataUri = `data:image/svg+xml;utf8,${encodeURIComponent(buildSvg(fabricType, hex, seed))}`;

  return (
    <div
      data-fabric-image
      className={`${rounded ? 'rounded-xl' : ''} flex h-full w-full items-center justify-center overflow-hidden bg-void-700 ${className}`}
    >
      <img src={dataUri} alt={alt || product?.name || 'Product'} className="h-full w-full object-cover" />
    </div>
  );
}
