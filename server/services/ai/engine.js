import Product from '../../models/Product.js';
import { formatPriceLine, priceToUsd } from '../../utils/currency.js';
import {
  CATEGORY_KEYWORDS,
  FABRIC_TYPE_KEYWORDS,
  COLOR_KEYWORDS,
  PRICE_HINTS,
  QUANTITY_HINTS,
  USE_CASE_KEYWORDS,
  INTENT_KEYWORDS,
  QA_KEYWORDS,
  ESTIMATE_KEYWORDS,
  GARMENT_KEYWORDS,
} from './lexicon.js';

const normalize = (text = '') => text.toLowerCase().trim();

const containsAny = (text, words) => words.some((w) => text.includes(w));

const containsWord = (text, words) =>
  words.some((w) => new RegExp(`(^|[^a-z])${w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}([^a-z]|$)`, 'i').test(text));

export function detectIntent(text) {
  const t = normalize(text);
  if (containsAny(t, INTENT_KEYWORDS.compare)) return 'compare';
  if (containsAny(t, INTENT_KEYWORDS.similar)) return 'similar';
  if (containsAny(t, ESTIMATE_KEYWORDS)) return 'estimate';
  if (containsAny(t, GARMENT_KEYWORDS.saree) && /meter|metre|fabric|cloth|material|estimate|need|required|for a/.test(t)) return 'estimate';
  if (containsWord(t, INTENT_KEYWORDS.greeting)) return 'greeting';
  if (containsAny(t, INTENT_KEYWORDS.help)) return 'help';
  if (containsAny(t, QA_KEYWORDS)) return 'qa';
  if (containsAny(t, INTENT_KEYWORDS.recommend)) return 'recommend';
  return 'search';
}

export function extractFilters(text) {
  const t = normalize(text);
  const filters = {
    categories: [],
    fabricTypes: [],
    colors: [],
    useCases: [],
    minPrice: null,
    maxPrice: null,
    sort: null,
    lowQty: false,
    bulk: false,
  };

  for (const [cat, words] of Object.entries(CATEGORY_KEYWORDS)) {
    if (containsAny(t, words)) filters.categories.push(cat);
  }
  for (const [fabric, words] of Object.entries(FABRIC_TYPE_KEYWORDS)) {
    if (containsAny(t, words)) filters.fabricTypes.push(fabric);
  }
  for (const [color, words] of Object.entries(COLOR_KEYWORDS)) {
    if (containsAny(t, words)) filters.colors.push(color);
  }
  for (const [useCase, words] of Object.entries(USE_CASE_KEYWORDS)) {
    if (containsAny(t, words)) filters.useCases.push(useCase);
  }

  if (containsAny(t, PRICE_HINTS.cheap)) filters.sort = filters.sort || 'price_asc';
  if (containsAny(t, PRICE_HINTS.premium)) filters.sort = 'price_desc';

  const priceMatches = [...t.matchAll(/\$?\s*(\d+(?:[\.,]\d+)?)\s*(k|thousand|hundred|rs|inr)?/g)];
  const prices = priceMatches
    .map((m) => {
      let v = parseFloat(m[1].replace(',', '.'));
      if (m[2]) {
        if (m[2].startsWith('k')) v *= 1000;
        else if (m[2].startsWith('h')) v *= 100;
        else if (m[2].startsWith('rs') || m[2].startsWith('inr')) v *= 1;
      }
      return priceToUsd(v, t);
    })
    .filter((v) => !Number.isNaN(v));

  if (/under|below|less than|cheaper|max|up to|within|at most/.test(t)) {
    if (prices.length) filters.maxPrice = Math.min(...prices);
  } else if (/over|above|at least|more than|min/.test(t)) {
    if (prices.length) filters.minPrice = Math.max(...prices);
  } else if (prices.length === 1) {
    filters.maxPrice = prices[0];
  }

  if (/cheap|cheapest|lowest|affordable|budget|economical/.test(t)) {
    filters.sort = 'price_asc';
  } else if (/expensive|premium|highest|luxury/.test(t)) {
    filters.sort = 'price_desc';
  } else if (/popular|trending|top|best.?seller/.test(t)) {
    filters.sort = 'featured';
  }

  filters.lowQty = containsAny(t, QUANTITY_HINTS.small);
  filters.bulk = containsAny(t, QUANTITY_HINTS.bulk);
  return filters;
}

function buildMongoQuery(filters) {
  const query = { isActive: true };
  const or = [];

  if (filters.categories.length) query.category = { $in: filters.categories };
  if (filters.fabricTypes.length) query.fabricType = { $in: filters.fabricTypes };
  if (filters.colors.length) {
    or.push(
      { tags: { $regex: filters.colors.join('|'), $options: 'i' } },
      { 'colors.name': { $in: filters.colors } }
    );
  }
  if (filters.minPrice != null || filters.maxPrice != null) {
    query.price = {};
    if (filters.minPrice != null) query.price.$gte = filters.minPrice;
    if (filters.maxPrice != null) query.price.$lte = filters.maxPrice;
  }
  if (or.length) query.$or = or;
  return query;
}

function scoreProduct(product, filters) {
  let score = 0;
  if (filters.categories.includes(product.category)) score += 3;
  if (filters.fabricTypes.includes(product.fabricType)) score += 3;
  const colorHits = filters.colors.filter((c) =>
    (product.tags || []).join(' ').includes(c) ||
    (product.colors || []).some((col) => col.name.toLowerCase().includes(c))
  );
  score += colorHits.length * 2;
  score += (product.featured ? 1 : 0);
  score += (product.stock > 0 ? 1 : 0);
  return score;
}

function applySort(products, filters) {
  const copy = [...products];
  if (filters.sort === 'price_asc') copy.sort((a, b) => a.price - b.price);
  else if (filters.sort === 'price_desc') copy.sort((a, b) => b.price - a.price);
  else if (filters.sort === 'featured') copy.sort((a, b) => (b.featured - a.featured) || (b.stock - a.stock));
  else copy.sort((a, b) => b.createdAt - a.createdAt);
  return copy;
}

export const toProductBrief = (p) => ({
  id: p._id,
  slug: p.slug,
  name: p.name,
  category: p.category,
  fabricType: p.fabricType,
  price: p.price,
  unit: p.unit,
  stock: p.stock,
  moq: p.moq,
  colors: (p.colors || []).slice(0, 4).map((c) => ({ name: c.name, hex: c.hex })),
  image: p.images && p.images[0],
  sustainability: p.sustainability,
});

export async function findProducts(filters, limit = 6) {
  const query = buildMongoQuery(filters);
  let products = await Product.find(query)
    .populate('supplier', 'name supplierProfile')
    .limit(40)
    .lean();

  products = products.map((p) => ({ ...p, _score: scoreProduct(p, filters) }));
  products.sort((a, b) => b._score - a._score);
  products = applySort(products, filters);
  return products.slice(0, limit).map(toProductBrief);
}

export async function recommendProducts(profile, limit = 6) {
  const query = { isActive: true, $or: [] };
  if (profile?.interests?.length) query.$or.push({ category: { $in: profile.interests } });
  if (profile?.fabricTypes?.length) query.$or.push({ fabricType: { $in: profile.fabricTypes } });
  if (profile?.colorPreferences?.length) {
    query.$or.push({ tags: { $regex: profile.colorPreferences.join('|'), $options: 'i' } });
  }
  if (profile?.budgetRange) {
    const range = profile.budgetRange;
    if (range === 'under_50k') query.price = { $lte: 3 };
    else if (range === '50k_200k') query.price = { $gte: 3, $lte: 8 };
    else if (range === '200k_500k') query.price = { $gte: 8 };
    else if (range === 'over_500k') query.price = { $gte: 12 };
  }

  const products = await Product.find(query.$or.length ? query : { isActive: true })
    .populate('supplier', 'name supplierProfile')
    .limit(40)
    .lean();
  return applySort(products.map((p) => ({ ...p, _score: 0 })), { sort: 'featured' })
    .slice(0, limit)
    .map(toProductBrief);
}

export async function similarProducts(product, limit = 4) {
  const query = {
    isActive: true,
    _id: { $ne: product._id },
    $or: [{ category: product.category }, { fabricType: product.fabricType }],
  };
  const products = await Product.find(query)
    .populate('supplier', 'name supplierProfile')
    .limit(limit)
    .lean();
  return products.map(toProductBrief);
}

const hexToRgb = (hex = '#888888') => {
  const h = hex.replace('#', '').trim();
  const full = h.length === 3 ? h.split('').map((c) => c + c).join('') : h;
  const n = parseInt(full || '888888', 16);
  return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
};

const colorDistance = (a, b) => {
  const dr = a.r - b.r;
  const dg = a.g - b.g;
  const db = a.b - b.b;
  return Math.sqrt(dr * dr + dg * dg + db * db);
};

// Find fabrics whose available colors are closest to the hex colors mentioned.
export async function findByColorHex(text, limit = 6) {
  const hexes = (text.match(/#?[0-9a-fA-F]{6}\b/g) || []).slice(0, 4).map((h) => hexToRgb(h));
  if (!hexes.length) return [];
  const products = await Product.find({ isActive: true })
    .populate('supplier', 'name supplierProfile')
    .limit(200)
    .lean();
  return products
    .map((p) => {
      const colors = p.colors || [];
      if (!colors.length) return { p, d: Infinity };
      const d = Math.min(
        ...colors.map((c) => {
          const cRgb = hexToRgb(c.hex);
          return Math.min(...hexes.map((h) => colorDistance(cRgb, h)));
        })
      );
      return { p, d };
    })
    .filter((x) => Number.isFinite(x.d))
    .sort((a, b) => a.d - b.d)
    .slice(0, limit)
    .map((x) => toProductBrief(x.p));
}

export async function findByName(queryText, limit = 3) {
  const products = await Product.find({
    $text: { $search: normalize(queryText) },
    isActive: true,
  })
    .limit(limit)
    .lean();
  return products.map(toProductBrief);
}

export function buildReply(intent, products, filters, currency = 'USD') {
  const names = products.map((p) => p.name);
  const list = products.length
    ? products.map((p, i) => `${i + 1}. ${p.name} — ${formatPriceLine(p.price, p.unit, currency)}`).join('\n')
    : '';

  if (!products.length) {
    return {
      reply:
        "I couldn't find exact matches for that. Try different keywords like fabric type (silk, cotton), category, color, or a price range — or tell me your use case and I'll recommend options.",
      suggestions: ['Show me lightweight cotton', 'Silk for a wedding collection', 'Fabrics under $5'],
    };
  }

  let lead = '';
  if (filters?.categories?.length || filters?.fabricTypes?.length) {
    lead = `Here are great matches for your request:`;
  } else if (intent === 'compare') {
    lead = `Here's what I found for comparison:`;
  } else if (intent === 'similar') {
    lead = `Similar options you may like:`;
  } else if (intent === 'recommend') {
    lead = `Based on what you're looking for, I recommend:`;
  } else {
    lead = `Here's what I found:`;
  }

  const hints = [];
  if (products.length) hints.push(`"Add ${products[0].name} to cart"`);
  hints.push('Compare the top two');
  hints.push('Show me cheaper options');
  if (products.length > 1) hints.push(`More like ${products[1].name}`);

  return { reply: `${lead}\n${list}`, suggestions: hints };
}

export { normalize };
