import Product from '../../models/Product.js';
import { toProductBrief, findByName } from './engine.js';

const formatColor = (c) => (c.name ? `${c.name}${c.hex ? ` (${c.hex})` : ''}` : '');

export function answerAboutProduct(text, product) {
  const t = text.toLowerCase();
  const out = [];
  const supplier = product.supplier;
  const businessName =
    supplier?.supplierProfile?.businessName || supplier?.name || 'the supplier';

  if (/moq|minimum order/.test(t)) {
    out.push(`The minimum order quantity (MOQ) for ${product.name} is ${product.moq || 100} ${product.unit}s.`);
  }
  if (/price|cost|how much|rate/.test(t)) {
    out.push(`${product.name} is priced at $${product.price} per ${product.unit} (ex-works).`);
  }
  if (/stock|available|availability|how many/.test(t)) {
    out.push(
      product.stock > 0
        ? `${product.stock} ${product.unit}s are currently in stock and ready to ship.`
        : 'This item is currently out of stock. Ask the supplier for the next production run.'
    );
  }
  if (/composi|material|content|fiber/.test(t)) {
    out.push(
      product.specifications?.composition
        ? `Composition: ${product.specifications.composition}.`
        : `This is a ${product.fabricType || product.category} fabric.`
    );
  }
  if (/gsm|weight|thickness/.test(t)) {
    out.push(
      product.specifications?.gsm
        ? `Fabric weight is ${product.specifications.gsm}.`
        : `Weight details aren't listed for this product.`
    );
  }
  if (/width|breadth/.test(t)) {
    out.push(
      product.specifications?.width
        ? `Fabric width is ${product.specifications.width}.`
        : `Width details aren't listed.`
    );
  }
  if (/color|colour/.test(t)) {
    out.push(
      product.colors?.length
        ? `Available colors: ${product.colors.map(formatColor).join(', ')}.`
        : 'Color options are not listed for this product.'
    );
  }
  if (/weave|weave type/.test(t)) {
    out.push(
      product.specifications?.weave || product.fabricType
        ? `Weave type: ${product.specifications?.weave || product.fabricType}.`
        : 'Weave details are not listed.'
    );
  }
  if (/sample|swatch/.test(t)) {
    out.push(`You can request a sample swatch directly from ${businessName} before committing to a bulk order.`);
  }
  if (/delivery|shipping|dispatch|lead/.test(t)) {
    out.push(`Typical dispatch happens within 5–10 business days after order acceptance by ${businessName}.`);
  }
  if (/finish|handfeel|feel|soft/.test(t)) {
    out.push(
      product.specifications?.finish
        ? `Finish: ${product.specifications.finish}.`
        : `This is a ${product.fabricType || 'finished'} fabric with a ${product.category} character.`
    );
  }

  if (!out.length) {
    out.push(
      `Here's a quick snapshot of ${product.name}: $${product.price}/${product.unit}, ${product.fabricType || product.category}, ${product.colors?.length || 0} colorways, stock ${product.stock} ${product.unit}s, MOQ ${product.moq || 100}. What would you like to know?`
    );
  }
  return out.join(' ');
}

export async function resolveProductReference(text, context = {}) {
  if (context.currentProduct) {
    try {
      const p = await Product.findById(context.currentProduct)
        .populate('supplier', 'name supplierProfile')
        .lean();
      if (p) return p;
    } catch {
      /* fall through */
    }
  }
  if (context.lastProducts?.length === 1) {
    const p = await Product.findById(context.lastProducts[0])
      .populate('supplier', 'name supplierProfile')
      .lean();
    if (p) return p;
  }
  const briefs = await findByName(text, 1);
  if (briefs.length) {
    return Product.findById(briefs[0].id).populate('supplier', 'name supplierProfile').lean();
  }
  return null;
}
