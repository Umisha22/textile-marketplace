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

const hashString = (s = '') => {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (Math.imul(31, h) + s.charCodeAt(i)) | 0;
  return Math.abs(h);
};

/**
 * Renders a product image. Uses the stored image URL when available,
 * otherwise draws a deterministic textile-like visual from product data.
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
  const palette = PALETTES[seed % PALETTES.length];
  const [c1, c2] = palette;
  const stripes = (seed >> 3) % 4;
  const pattern = ['weave', 'stripes', 'dot', 'plain'][stripes];

  const patternSvg =
    pattern === 'stripes'
      ? `<line x1='0' y1='10' x2='300' y2='10' stroke='rgba(255,255,255,0.18)' stroke-width='4'/>
         <line x1='0' y1='30' x2='300' y2='30' stroke='rgba(255,255,255,0.12)' stroke-width='2'/>`
      : pattern === 'dot'
        ? `<circle cx='24' cy='24' r='3' fill='rgba(255,255,255,0.28)'/><circle cx='72' cy='24' r='3' fill='rgba(255,255,255,0.28)'/><circle cx='120' cy='24' r='3' fill='rgba(255,255,255,0.28)'/>`
        : pattern === 'plain'
          ? `<rect width='300' height='300' fill='rgba(255,255,255,0.05)'/>`
          : `<path d='M0 40 Q 20 0 40 40 T 80 40' stroke='rgba(255,255,255,0.25)' stroke-width='2' fill='none'/>
             <path d='M0 80 Q 20 40 40 80 T 80 80' stroke='rgba(255,255,255,0.18)' stroke-width='2' fill='none'/>`;

  const dataUri = `data:image/svg+xml;utf8,${encodeURIComponent(
    `<svg xmlns='http://www.w3.org/2000/svg' width='300' height='300'>
       <defs>
         <linearGradient id='g' x1='0' y1='0' x2='1' y2='1'>
           <stop offset='0%' stop-color='${c1}'/>
           <stop offset='100%' stop-color='${c2}'/>
         </linearGradient>
       </defs>
       <rect width='300' height='300' fill='url(#g)'/>
       ${patternSvg}
     </svg>`
  )}`;

  return (
    <div
      className={`${rounded ? 'rounded-xl' : ''} flex h-full w-full items-center justify-center overflow-hidden ${className}`}
      style={{ background: `linear-gradient(135deg, ${c1}, ${c2})` }}
    >
      <img src={dataUri} alt={alt || product?.name || 'Product'} className="h-full w-full object-cover" />
    </div>
  );
}
