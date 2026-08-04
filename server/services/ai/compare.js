import Product from '../../models/Product.js';
import { formatPriceLine } from '../../utils/currency.js';

export async function buildComparisonByIds(ids) {
  const products = [];
  for (const id of ids.slice(0, 4)) {
    try {
      const p = await Product.findById(id)
        .populate('supplier', 'name supplierProfile')
        .lean();
      if (p) products.push(p);
    } catch {
      /* skip invalid id */
    }
  }
  if (products.length < 2) return null;
  return buildComparison(products);
}

export function buildComparison(products, currency = 'USD') {
  const rows = [
    { label: 'Price', get: (p) => formatPriceLine(p.price, p.unit, currency) },
    { label: 'Category', get: (p) => p.category },
    { label: 'Fabric type', get: (p) => p.fabricType || '—' },
    { label: 'Composition', get: (p) => p.specifications?.composition || '—' },
    { label: 'GSM', get: (p) => p.specifications?.gsm || '—' },
    { label: 'Width', get: (p) => p.specifications?.width || '—' },
    { label: 'Weave', get: (p) => p.specifications?.weave || '—' },
    { label: 'Finish', get: (p) => p.specifications?.finish || '—' },
    { label: 'Stock', get: (p) => `${p.stock} ${p.unit}s` },
    { label: 'MOQ', get: (p) => `${p.moq || 100} ${p.unit}s` },
    { label: 'Colors', get: (p) => (p.colors?.length ? p.colors.map((c) => c.name).join(', ') : '—') },
  ];

  return {
    products: products.map((p) => ({
      id: p._id,
      slug: p.slug,
      name: p.name,
      image: p.images?.[0],
      price: p.price,
      unit: p.unit,
    })),
    rows: rows.map((r) => ({
      label: r.label,
      values: products.map((p) => r.get(p)),
    })),
  };
}
