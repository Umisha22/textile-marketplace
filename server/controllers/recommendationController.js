import Order from '../models/Order.js';
import Product from '../models/Product.js';
import { asyncHandler } from '../middleware/error.js';

const recentDays = 90;
const since = () => new Date(Date.now() - recentDays * 86400000);

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

const byCount = (map) =>
  [...map.entries()]
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count);

const collectProductIds = (orders) => {
  const ids = new Set();
  orders.forEach((o) => o.items.forEach((it) => ids.add(String(it.product))));
  return [...ids];
};

const toBrief = (p) => ({
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
  supplier: p.supplier,
  sustainability: p.sustainability,
});

export const getRecommendations = asyncHandler(async (req, res) => {
  const payload =
    req.user.role === 'supplier'
      ? await supplierRecommendations(req.user)
      : await buyerRecommendations(req.user);
  res.json({ role: req.user.role, ...payload });
});

async function buyerRecommendations(user) {
  const orders = await Order.find({ buyer: user._id, createdAt: { $gte: since() } }).lean();
  const orderIds = collectProductIds(orders);
  const pastProducts = orderIds.length
    ? await Product.find({ _id: { $in: orderIds }, isActive: true }).lean()
    : [];

  const catFreq = new Map();
  const ftFreq = new Map();
  const colorFreq = new Map();
  pastProducts.forEach((p) => {
    catFreq.set(p.category, (catFreq.get(p.category) || 0) + 1);
    if (p.fabricType) ftFreq.set(p.fabricType, (ftFreq.get(p.fabricType) || 0) + 1);
    (p.colors || []).forEach((c) => c.hex && colorFreq.set(c.hex, (colorFreq.get(c.hex) || 0) + 1));
  });

  const profile = user.buyerProfile || {};
  (profile.interests || profile.categories || []).forEach((c) =>
    catFreq.set(c, (catFreq.get(c) || 0) + 2)
  );
  (profile.fabricTypes || []).forEach((f) => ftFreq.set(f, (ftFreq.get(f) || 0) + 2));

  const topCats = byCount(catFreq).slice(0, 3).map((x) => x.name);
  const topFabs = byCount(ftFreq).slice(0, 3).map((x) => x.name);
  const topHexes = byCount(colorFreq).slice(0, 3).map((x) => x.name);

  const query = { isActive: true };
  const ors = [];
  if (topCats.length) ors.push({ category: { $in: topCats } });
  if (topFabs.length) ors.push({ fabricType: { $in: topFabs } });
  if (ors.length) query.$or = ors;

  const bought = new Set(orderIds);
  const hexes = topHexes.map(hexToRgb);
  let products = await Product.find(query).populate('supplier', 'name supplierProfile').limit(200).lean();
  products = products.filter((p) => !bought.has(String(p._id)));

  const score = (p) => {
    let s = 0;
    if (topCats.includes(p.category)) s += 10;
    if (topFabs.includes(p.fabricType)) s += 8;
    if (hexes.length && p.colors?.length) {
      const best = Math.min(
        ...p.colors.map((c) => Math.min(...hexes.map((h) => colorDistance(hexToRgb(c.hex), h))))
      );
      s += Math.max(0, 12 - best / 60);
    }
    s += Math.min(6, (p.stock || 0) / 500);
    return s;
  };
  products.sort((a, b) => score(b) - score(a));
  products = products.slice(0, 6);

  const reasons = [];
  if (orders.length) {
    reasons.push(`Based on your ${orders.length} recent order${orders.length > 1 ? 's' : ''}`);
  }
  if (topCats.length) reasons.push(`From your interest in ${topCats.join(', ')}`);
  if (topFabs.length) reasons.push(`Favoring ${topFabs.join(', ')} fabrics`);
  if (!reasons.length) reasons.push('Recommended from our current catalog');

  return {
    recommendedProducts: products.map(toBrief),
    reasons,
    stats: { orders: orders.length, categories: topCats.length, fabricTypes: topFabs.length },
  };
}

async function supplierRecommendations(user) {
  const myProducts = await Product.find({ supplier: user._id }).lean();
  const myCats = new Set(myProducts.map((p) => p.category));
  const myFabs = new Set(myProducts.map((p) => p.fabricType));

  const orders = await Order.find({
    createdAt: { $gte: since() },
    status: { $ne: 'cancelled' },
  }).lean();
  const ids = collectProductIds(orders);
  const ordered = ids.length ? await Product.find({ _id: { $in: ids } }).lean() : [];
  const byId = new Map(ordered.map((p) => [String(p._id), p]));

  const catFreq = new Map();
  const fabFreq = new Map();
  const colorFreq = new Map();
  let units = 0;
  const buyers = new Set();
  orders.forEach((o) => {
    buyers.add(String(o.buyer));
    o.items.forEach((it) => {
      units += it.quantity;
      const p = byId.get(String(it.product));
      if (p) {
        catFreq.set(p.category, (catFreq.get(p.category) || 0) + it.quantity);
        if (p.fabricType) fabFreq.set(p.fabricType, (fabFreq.get(p.fabricType) || 0) + it.quantity);
        (p.colors || []).forEach((c) =>
          c.hex && colorFreq.set(c.hex, (colorFreq.get(c.hex) || 0) + it.quantity)
        );
      }
    });
  });

  const topCats = byCount(catFreq).slice(0, 5).map((x) => x.name);
  const topFabs = byCount(fabFreq).slice(0, 5).map((x) => x.name);
  const topHexes = byCount(colorFreq).slice(0, 5).map((x) => x.name);

  const query = { isActive: true, supplier: { $ne: user._id } };
  const ors = [];
  if (topCats.length) ors.push({ category: { $in: topCats } });
  if (topFabs.length) ors.push({ fabricType: { $in: topFabs } });
  if (ors.length) query.$or = ors;

  const hexes = topHexes.map(hexToRgb);
  const candidates = await Product.find(query)
    .populate('supplier', 'name supplierProfile')
    .limit(200)
    .lean();

  const score = (p) => {
    let s = 0;
    if (topCats.includes(p.category)) s += 10;
    if (topFabs.includes(p.fabricType)) s += 8;
    if (hexes.length && p.colors?.length) {
      const best = Math.min(
        ...p.colors.map((c) => Math.min(...hexes.map((h) => colorDistance(hexToRgb(c.hex), h))))
      );
      s += Math.max(0, 12 - best / 60);
    }
    return s;
  };
  candidates.sort((a, b) => score(b) - score(a));
  const suggestedProducts = candidates.slice(0, 4).map(toBrief);

  const buyersInMyCategories = orders.filter((o) =>
    o.items.some((it) => {
      const p = byId.get(String(it.product));
      return p && (myCats.has(p.category) || myFabs.has(p.fabricType));
    })
  ).length;

  return {
    demandByCategory: byCount(catFreq),
    demandByFabric: byCount(fabFreq),
    demandByColor: byCount(colorFreq),
    suggestedProducts,
    stats: {
      orders: orders.length,
      units,
      buyers: buyers.size,
      buyersInMyCategories,
      myStockCount: myProducts.length,
    },
  };
}
