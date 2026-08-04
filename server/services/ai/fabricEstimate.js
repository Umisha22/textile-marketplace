import { GARMENT_KEYWORDS } from './lexicon.js';

const GARMENTS = {
  saree: { name: 'Saree', fixed: (w) => (w >= 145 ? 6.0 : w >= 110 ? 6.5 : 7.0) },
  lehenga: {
    name: 'Lehenga',
    flare: 2.1,
    extra: 'blouse fabric not included — add 0.8 m for a matching choli.',
  },
  anarkali: {
    name: 'Anarkali / Flared Kurti',
    flare: 1.9,
    extra: 'Usually paired with a dupatta — add 2.5 m if you want a matching one.',
  },
  gown: { name: 'Gown / Maxi Dress', flare: 1.6 },
  dress: { name: 'Dress / Frock', flare: 1.35 },
  kurta: {
    name: 'Kurta / Kurti / Tunic',
    lengthFactor: 0.34,
    sleeveAllowance: 0.6,
    extra: 'Add 0.5 m more for a floor-length or heavily embroidered version.',
  },
  shirt: { name: 'Shirt / Top / Blouse', lengthFactor: 0.3, sleeveAllowance: 0.5 },
  salwar: { name: 'Salwar', lengthFactor: 0.38 },
  dupatta: { name: 'Dupatta / Stole', fixed: (w) => (w >= 110 ? 2.5 : 2.8) },
  pajama: { name: 'Trouser / Pajama / Pant', lengthFactor: 0.4 },
  skirt: { name: 'Skirt', flare: 1.4, lengthFactor: 0.3 },
  jacket: { name: 'Jacket / Blazer / Coat', lengthFactor: 0.42, sleeveAllowance: 0.9 },
};

const DEFAULT_WIDTH_CM = 112; // 44" — typical unstitched width

const num = (v, fallback) => (Number.isFinite(v) ? v : fallback);

function toCm(value, unit) {
  if (!unit) return value;
  if (/^in/i.test(unit) || unit === '"') return value * 2.54;
  if (/^f/i.test(unit) || unit === 'ft') return value * 30.48;
  if (/^m/i.test(unit)) return value * 100;
  return value;
}

function detectGarment(text) {
  const t = text.toLowerCase();
  for (const [key, words] of Object.entries(GARMENT_KEYWORDS)) {
    if (words.some((w) => t.includes(w))) return key;
  }
  return null;
}

function parseMeasurements(text) {
  const t = text.toLowerCase();
  const out = {};

  const cmMatch = (pattern, key) => {
    const m = t.match(pattern);
    if (!m) return;
    const value = parseFloat(m[1]);
    const raw = m[2] || '';
    out[key] = Math.round(toCm(value, raw.trim()));
  };

  cmMatch(/height\s*(?:of\s*)?(\d+(?:\.\d+)?)\s*(cm|inch|inches|in|"|'|ft|feet|foot|m|meter|metre)?/i, 'height');
  const ftIn = t.match(/(\d)\s*['\u2019]\s*(\d{1,2})\s*["\u201d]?/);
  if (ftIn) out.height = Math.round((parseInt(ftIn[1], 10) * 12 + parseInt(ftIn[2], 10)) * 2.54);
  const loneFeet = t.match(/(\d+(?:\.\d+)?)\s*(?:ft|feet|foot)/);
  if (loneFeet && out.height == null) out.height = Math.round(parseFloat(loneFeet[1]) * 30.48);

  cmMatch(/(?:chest|bust)\s*(?:of\s*)?(\d+(?:\.\d+)?)\s*(cm|inch|inches|in|")?/, 'bust');
  cmMatch(/waist\s*(?:of\s*)?(\d+(?:\.\d+)?)\s*(cm|inch|inches|in|")?/, 'waist');
  cmMatch(/hip\s*(?:of\s*)?(\d+(?:\.\d+)?)\s*(cm|inch|inches|in|")?/, 'hip');
  cmMatch(/(?:sleeve|sleeves)\s*(?:of\s*)?(\d+(?:\.\d+)?)\s*(cm|inch|inches|in|")?/, 'sleeve');
  cmMatch(/(?:length|knee)\s*(?:of\s*)?(\d+(?:\.\d+)?)\s*(cm|inch|inches|in|")?/, 'length');
  cmMatch(/(?:width|breadth|broad)\s*(?:of\s*)?(\d+(?:\.\d+)?)\s*(cm|inch|inches|in|")?/, 'width');

  return out;
}

function roundMeters(m) {
  return Math.round(m * 100) / 100;
}

export function estimateFabric(rawText) {
  const text = rawText.toLowerCase();
  const garment = detectGarment(text) || 'dress';
  const m = parseMeasurements(text);

  const height = num(m.height, 165);
  const length = num(m.length, Math.round(height * (GARMENTS[garment].lengthFactor || 0.33)));
  const widthCm = num(m.width, DEFAULT_WIDTH_CM);
  const widthInch = Math.round(widthCm / 2.54);
  const wastage = 1.08;

  const steps = [];
  const assumptions = [];
  let meters = 0;

  if (GARMENTS[garment].fixed) {
    meters = GARMENTS[garment].fixed(widthCm);
    steps.push(`Standard ${GARMENTS[garment].name} length: ${meters} m of fabric (${widthInch}" width).`);
    assumptions.push(`Saree/dupatta quantities follow the standard retail length for a ${widthInch}" wide fabric.`);
  } else {
    const flare = GARMENTS[garment].flare || 1;
    const bodyM = (2 * (length + 22) * flare) / 100;
    steps.push(`Body panels: 2 panels of ${Math.round(length + 22)} cm (length + allowances) × flare ${flare.toFixed(2)} ≈ ${bodyM.toFixed(2)} m`);
    assumptions.push(`Garment length estimated at ${length} cm${m.length == null ? ` (typical for height ${height} cm)` : ' (as you gave)'}.`);

    let total = bodyM;

    if (garment === 'shirt' || garment === 'kurta' || garment === 'jacket') {
      const sleeve = num(m.sleeve, 22);
      const sleeveM = (2 * (sleeve + 10)) / 100;
      total += sleeveM;
      steps.push(`Sleeves: 2 × ${Math.round(sleeve + 10)} cm ≈ ${sleeveM.toFixed(2)} m`);
    } else if (garment === 'salwar' || garment === 'pajama') {
      const add = (2 * 10) / 100;
      total += add;
      steps.push(`Waistband & crotch allowance: +${add.toFixed(2)} m`);
    } else if (garment === 'skirt') {
      const add = (1 * 15) / 100;
      total += add;
      steps.push(`Waistband & hem allowance: +${add.toFixed(2)} m`);
    } else if (garment === 'blouse' || garment === 'lehenga' || garment === 'dress' || garment === 'gown' || garment === 'anarkali') {
      if (garment === 'lehenga' || garment === 'gown' || garment === 'anarkali') {
        total += 0.3;
        steps.push('Waistband, hem & flare ease: +0.30 m');
      } else {
        total += 0.35;
        steps.push('Sleeves & collar allowance: +0.35 m');
      }
    } else {
      total += 0.3;
    }

    meters = roundMeters(total * wastage);
    steps.push(`Cutting & wastage buffer (8%): total ≈ ${meters.toFixed(2)} m`);
  }

  meters = roundMeters(meters);

  // Wider fabric needs less length.
  const adjusted = roundMeters(meters * (DEFAULT_WIDTH_CM / widthCm));
  if (Math.abs(adjusted - meters) > 0.05) {
    meters = adjusted;
    steps.push(`Adjusted for ${widthInch}" wide fabric (vs standard 44"): ≈ ${meters.toFixed(2)} m`);
  }

  const note = GARMENTS[garment].extra || null;
  if (note) assumptions.push(note);

  assumptions.push('Estimate is a guide — always add 10–15% extra or confirm with a tailor/sampler before bulk cutting.');

  return {
    garment,
    garmentName: GARMENTS[garment].name,
    meters,
    suggestMeters: roundMeters(Math.ceil(meters * 2) / 2),
    widthCm,
    widthInch,
    measurements: { height, length, bust: num(m.bust, 96), waist: num(m.waist, 80), hip: num(m.hip, 100), sleeve: m.sleeve ?? null },
    steps,
    assumptions,
  };
}

export function buildEstimateReply(estimate) {
  const lines = [
    `For a ${estimate.garmentName} (${estimate.widthInch}" / ${estimate.widthCm} cm wide fabric) I'd estimate:`,
    ``,
    `🪡 About ${estimate.meters} m of fabric — round up to ${estimate.suggestMeters} m to be safe.`,
    ``,
    `How I calculated it:`,
    ...estimate.steps.map((s, i) => `${i + 1}. ${s}`),
    ``,
    `Assumptions:`,
    ...estimate.assumptions.map((a) => `• ${a}`),
  ];
  return lines.join('\n');
}
