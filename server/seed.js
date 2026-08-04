import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { connectDB } from './config/db.js';
import User from './models/User.js';
import Product from './models/Product.js';
import Cart from './models/Cart.js';
import Order from './models/Order.js';
import Conversation from './models/Conversation.js';
import { slugify } from './utils/slug.js';

const PRODUCTS = [
  {
    name: 'Egyptian Cotton Poplin 100s',
    category: 'cotton', fabricType: 'poplin',
    description: 'Crisp, fine-count Egyptian cotton poplin with a smooth handfeel. Ideal for premium shirting and formal wear. Low shrinkage, excellent drape.',
    composition: '100% Egyptian Cotton', gsm: '110', width: '150 cm', weave: 'Plain',
    price: 4.2, stock: 12000, moq: 500,
    colors: [{ name: 'White', hex: '#f7f5f0' }, { name: 'Sky Blue', hex: '#a9c7e0' }, { name: 'Navy', hex: '#1f3a5f' }, { name: 'Black', hex: '#1b1b1b' }],
    tags: ['shirting', 'formal', 'premium', 'crisp', 'white'],
    featured: true,
  },
  {
    name: 'Organic Cotton Jersey Knit',
    category: 'cotton', fabricType: 'knit',
    description: 'GOTS-certified organic cotton jersey with 4-way stretch. Perfect for t-shirts, loungewear and babywear.',
    composition: '95% Organic Cotton, 5% Spandex', gsm: '180', width: '160 cm', weave: 'Single Jersey',
    price: 5.1, stock: 8600, moq: 300,
    colors: [{ name: 'Ivory', hex: '#efe9dd' }, { name: 'Sage', hex: '#9aa883' }, { name: 'Charcoal', hex: '#3a3a3a' }],
    tags: ['knit', 'organic', 't-shirt', 'stretch', 'baby'],
    featured: true,
  },
  {
    name: 'Premium Mulberry Silk Chiffon',
    category: 'silk', fabricType: 'chiffon',
    description: 'Luxurious 100% mulberry silk chiffon with a sheer, fluid drape. A staple for evening wear, scarves and saree blouses.',
    composition: '100% Mulberry Silk', gsm: '55', width: '114 cm', weave: 'Chiffon',
    price: 12.5, stock: 4200, moq: 200,
    colors: [{ name: 'Blush', hex: '#e8b4b8' }, { name: 'Emerald', hex: '#2e8b57' }, { name: 'Black', hex: '#111' }, { name: 'Gold', hex: '#c9a227' }],
    tags: ['evening', 'bridal', 'sheer', 'luxury', 'chiffon'],
    featured: true,
  },
  {
    name: 'Banarasi Silk Jacquard',
    category: 'silk', fabricType: 'jacquard',
    description: 'Handwoven-inspired Banarasi jacquard with traditional motifs. Heavy drape suited to festive and bridal couture.',
    composition: '80% Silk, 20% Polyester', gsm: '210', width: '112 cm', weave: 'Jacquard',
    price: 18.0, stock: 1800, moq: 100,
    colors: [{ name: 'Maroon', hex: '#7b1f2b' }, { name: 'Gold', hex: '#d4af37' }, { name: 'Teal', hex: '#1f6f6f' }, { name: 'Burgundy', hex: '#5d1220' }],
    tags: ['bridal', 'festive', 'ethnic', 'jacquard', 'zari'],
    featured: true,
  },
  {
    name: 'Raw Silk Georgette',
    category: 'silk', fabricType: 'georgette',
    description: 'Textured raw silk georgette with a matte finish and subtle slub. Flows beautifully for kurtas, dresses and dupattas.',
    composition: '100% Mulberry Silk', gsm: '90', width: '114 cm', weave: 'Georgette',
    price: 9.8, stock: 5200, moq: 200,
    colors: [{ name: 'Mustard', hex: '#d8a232' }, { name: 'Olive', hex: '#6b6e43' }, { name: 'Rust', hex: '#b5582f' }],
    tags: ['ethnic', 'kurta', 'matte', 'georgette'],
    featured: false,
  },
  {
    name: 'European Flax Linen',
    category: 'linen', fabricType: 'woven',
    description: 'European flax linen with a breathable, airy hand. Gets softer with every wash. Perfect for summer tailoring and home textiles.',
    composition: '100% Linen', gsm: '150', width: '145 cm', weave: 'Plain',
    price: 6.4, stock: 7400, moq: 300,
    colors: [{ name: 'Sand', hex: '#d6c6a5' }, { name: 'Natural', hex: '#e8e0d0' }, { name: 'Olive', hex: '#6e7550' }, { name: 'Slate', hex: '#5b6472' }],
    tags: ['summer', 'breathable', 'shirting', 'home'],
    featured: true,
  },
  {
    name: 'Washed Linen Blend',
    category: 'linen', fabricType: 'blends',
    description: 'Pre-washed linen-cotton blend that is soft from day one. Wrinkle-friendly and ideal for resort wear and bed linen.',
    composition: '55% Linen, 45% Cotton', gsm: '130', width: '150 cm', weave: 'Plain',
    price: 5.8, stock: 6900, moq: 300,
    colors: [{ name: 'Beige', hex: '#cbb8ae' }, { name: 'Cream', hex: '#f3efe4' }, { name: 'Sage', hex: '#b0b89a' }],
    tags: ['summer', 'resort', 'soft', 'bedding'],
    featured: false,
  },
  {
    name: 'Merino Wool Suiting',
    category: 'wool', fabricType: 'woven',
    description: 'Fine merino suiting with a tailored drape and natural crease recovery. The foundation of premium suits and trousers.',
    composition: '100% Merino Wool', gsm: '260', width: '150 cm', weave: 'Twill',
    price: 14.0, stock: 2600, moq: 150,
    colors: [{ name: 'Charcoal', hex: '#3d3d3d' }, { name: 'Navy', hex: '#1f2d45' }, { name: 'Grey', hex: '#8a8a8a' }],
    tags: ['winter', 'suiting', 'formal', 'twill'],
    featured: true,
  },
  {
    name: 'Wool Crepe Twill',
    category: 'wool', fabricType: 'twill',
    description: 'Matte wool crepe twill with a subtle texture and fluid movement. Great for dresses, skirts and soft tailoring.',
    composition: '88% Wool, 12% Polyamide', gsm: '230', width: '150 cm', weave: 'Crepe Twill',
    price: 13.2, stock: 3100, moq: 150,
    colors: [{ name: 'Black', hex: '#151515' }, { name: 'Wine', hex: '#6d1a33' }, { name: 'Oat', hex: '#d8cbb4' }],
    tags: ['winter', 'dress', 'matte', 'crepe'],
    featured: false,
  },
  {
    name: 'Stretch Denim 12oz',
    category: 'denim', fabricType: 'denim',
    description: 'Rigid-feel 12oz denim with 2% elastane for comfortable stretch. Indigo warp with high abrasion resistance.',
    composition: '98% Cotton, 2% Elastane', gsm: '400', width: '152 cm', weave: 'Twill (3/1)',
    price: 6.9, stock: 9800, moq: 500,
    colors: [{ name: 'Indigo', hex: '#2b3a67' }, { name: 'Black Denim', hex: '#222' }],
    tags: ['jeans', 'stretch', 'indigo', 'casual'],
    featured: true,
  },
  {
    name: 'Selvedge Denim',
    category: 'denim', fabricType: 'denim',
    description: 'Slow-loom selvedge denim with red-line edge. Dense weave and characterful fades for premium casualwear.',
    composition: '100% Cotton', gsm: '430', width: '147 cm', weave: 'Twill (3/1)',
    price: 8.4, stock: 3400, moq: 300,
    colors: [{ name: 'Indigo', hex: '#25345e' }, { name: 'Raw', hex: '#2f4374' }],
    tags: ['selvedge', 'premium', 'jeans', 'raw'],
    featured: false,
  },
  {
    name: 'Recycled Polyester Jersey',
    category: 'polyester', fabricType: 'knit',
    description: 'Made from 100% rPET recycled bottles. Smooth, durable jersey for basics and active basics at a great price.',
    composition: '100% Recycled Polyester', gsm: '160', width: '165 cm', weave: 'Jersey',
    price: 3.4, stock: 15000, moq: 1000,
    colors: [{ name: 'White', hex: '#f4f4f4' }, { name: 'Black', hex: '#1c1c1c' }, { name: 'Navy', hex: '#1d2a44' }, { name: 'Grey', hex: '#9a9a9a' }],
    tags: ['recycled', 'basics', 'rpet', 'sustainable'],
    featured: false,
  },
  {
    name: 'Performance Active Knit',
    category: 'polyester', fabricType: 'knit',
    description: 'Technical moisture-wicking knit with 4-way stretch and anti-odor finish. Engineered for activewear and athleisure.',
    composition: '88% Polyester, 12% Spandex', gsm: '200', width: '160 cm', weave: 'Interlock',
    price: 4.6, stock: 11200, moq: 500,
    colors: [{ name: 'Teal', hex: '#1b7d7d' }, { name: 'Black', hex: '#1a1a1a' }, { name: 'Rust', hex: '#c05f35' }],
    tags: ['activewear', 'performance', 'moisture-wicking', 'stretch'],
    featured: true,
  },
  {
    name: 'Viscose Modal Jersey',
    category: 'viscose', fabricType: 'knit',
    description: 'Silky modal jersey with a fluid drape and cooling hand. The go-to for flowing dresses and relaxed tops.',
    composition: '95% Modal, 5% Elastane', gsm: '170', width: '158 cm', weave: 'Jersey',
    price: 4.1, stock: 8200, moq: 400,
    colors: [{ name: 'Blush', hex: '#e9b8b8' }, { name: 'Lilac', hex: '#c7b8de' }, { name: 'Black', hex: '#141414' }],
    tags: ['dress', 'soft', 'modal', 'drape'],
    featured: false,
  },
  {
    name: 'Cotton-Poly Sheeting',
    category: 'blends', fabricType: 'broadcloth',
    description: 'Crisp 50/50 sheeting that launders beautifully with minimal ironing. Workhorse fabric for uniforms and bedding.',
    composition: '50% Cotton, 50% Polyester', gsm: '120', width: '220 cm', weave: 'Plain',
    price: 2.8, stock: 20000, moq: 1000,
    colors: [{ name: 'White', hex: '#f5f5f5' }, { name: 'Sky Blue', hex: '#a7c3e0' }, { name: 'Peach', hex: '#f3cfc0' }],
    tags: ['uniform', 'bedding', 'sheeting', 'budget'],
    featured: false,
  },
  {
    name: 'Linen Cotton Blend',
    category: 'blends', fabricType: 'woven',
    description: 'Balanced linen-cotton blend with the texture of linen and the ease of cotton. Versatile for shirts and lightweight suiting.',
    composition: '60% Cotton, 40% Linen', gsm: '140', width: '148 cm', weave: 'Plain',
    price: 5.2, stock: 6400, moq: 300,
    colors: [{ name: 'Oat', hex: '#d9cbb0' }, { name: 'White', hex: '#f2efe6' }, { name: 'Sky', hex: '#a9c3d8' }],
    tags: ['shirting', 'summer', 'blend', 'breathable'],
    featured: false,
  },
  {
    name: 'Embroidered Net Fabric',
    category: 'embroidery', fabricType: 'woven',
    description: 'Sheer net base with dense machine embroidery and sequin detailing. Designed for evening gowns and bridal layers.',
    composition: '100% Nylon Net + Embroidery', gsm: '95', width: '112 cm', weave: 'Net',
    price: 7.5, stock: 2200, moq: 100,
    colors: [{ name: 'Ivory', hex: '#f0e9d8' }, { name: 'Dusty Pink', hex: '#d8a7a7' }, { name: 'Silver', hex: '#c9cdd4' }],
    tags: ['bridal', 'evening', 'embroidery', 'sequin'],
    featured: false,
  },
  {
    name: 'Chantilly Lace',
    category: 'lace', fabricType: 'woven',
    description: 'Delicate Chantilly lace with floral motifs on a fine net ground. Perfect for lingerie overlays and bridal veils.',
    composition: '100% Nylon', gsm: '80', width: '140 cm', weave: 'Lace',
    price: 6.2, stock: 3800, moq: 150,
    colors: [{ name: 'Ivory', hex: '#eee7d8' }, { name: 'Black', hex: '#1a1a1a' }, { name: 'Blush', hex: '#e2b0b0' }],
    tags: ['lingerie', 'bridal', 'lace', 'delicate'],
    featured: false,
  },
  {
    name: 'Matte Crepe Satin',
    category: 'silk', fabricType: 'satin',
    description: 'Satin weave with a matte crepe reverse — the best of both worlds. Substantial drape for gowns, jumpsuits and saris.',
    composition: '100% Polyester', gsm: '160', width: '150 cm', weave: 'Satin',
    price: 5.5, stock: 7100, moq: 300,
    colors: [{ name: 'Emerald', hex: '#2d7d5b' }, { name: 'Champagne', hex: '#d9c39a' }, { name: 'Black', hex: '#131313' }, { name: 'Burgundy', hex: '#5e1527' }],
    tags: ['gown', 'satin', 'evening', 'drape'],
    featured: false,
  },
  {
    name: 'Crushed Velvet',
    category: 'polyester', fabricType: 'velvet',
    description: 'High-sheen crushed velvet with a plush pile. Drama for eveningwear, jackets and upholstery accents.',
    composition: '92% Polyester, 8% Spandex', gsm: '260', width: '145 cm', weave: 'Velvet',
    price: 7.8, stock: 2900, moq: 150,
    colors: [{ name: 'Wine', hex: '#6e1f32' }, { name: 'Forest', hex: '#1f4d3a' }, { name: 'Gold', hex: '#c8a439' }],
    tags: ['velvet', 'evening', 'plush', 'luxury'],
    featured: true,
  },
  {
    name: 'Cotton Canvas Duck',
    category: 'cotton', fabricType: 'canvas',
    description: 'Heavyweight cotton duck canvas, tough and abrasion-resistant. For workwear, bags, aprons and upholstery.',
    composition: '100% Cotton', gsm: '380', width: '150 cm', weave: 'Canvas',
    price: 3.9, stock: 5600, moq: 400,
    colors: [{ name: 'Natural', hex: '#e0d7c3' }, { name: 'Olive', hex: '#5f6b45' }, { name: 'Black', hex: '#1c1c1c' }],
    tags: ['canvas', 'workwear', 'bags', 'upholstery'],
    featured: false,
  },
  {
    name: 'Duchess Satin',
    category: 'polyester', fabricType: 'satin',
    description: 'Crisp, heavy duchess satin with a glossy face and firm body. The classic fabric for structured ball gowns.',
    composition: '100% Polyester', gsm: '200', width: '150 cm', weave: 'Satin',
    price: 4.3, stock: 6400, moq: 300,
    colors: [{ name: 'White', hex: '#f4f1ea' }, { name: 'Royal Blue', hex: '#274d8c' }, { name: 'Magenta', hex: '#c31e6a' }],
    tags: ['gown', 'bridal', 'structured', 'satin'],
    featured: false,
  },
  {
    name: 'Taffeta',
    category: 'polyester', fabricType: 'taffeta',
    description: 'Lightweight taffeta with a signature crisp rustle. Great for petticoats, corsetry and occasionwear linings.',
    composition: '100% Polyester', gsm: '110', width: '150 cm', weave: 'Plain (Taffeta)',
    price: 4.3, stock: 4800, moq: 300,
    colors: [{ name: 'Sapphire', hex: '#1f4f8a' }, { name: 'Ruby', hex: '#8c1f2b' }, { name: 'Silver', hex: '#b9bec8' }],
    tags: ['petticoat', 'occasion', 'crisp', 'rustle'],
    featured: false,
  },
  {
    name: 'Seersucker Cotton',
    category: 'cotton', fabricType: 'woven',
    description: 'Classic puckered seersucker that never needs ironing. Breezy and timeless for summer shirting and dresses.',
    composition: '100% Cotton', gsm: '120', width: '150 cm', weave: 'Seersucker',
    price: 4.0, stock: 5200, moq: 300,
    colors: [{ name: 'Sky Stripe', hex: '#8fb2d8' }, { name: 'White', hex: '#f2f0e8' }, { name: 'Peach Stripe', hex: '#eec9b0' }],
    tags: ['summer', 'no-iron', 'shirting', 'striped'],
    featured: false,
  },
  {
    name: 'Muslin Mulmul',
    category: 'cotton', fabricType: 'muslin',
    description: 'Featherlight mulmul muslin with a soft, breathable hand. Beloved for babywear, summer kurtas and fine linens.',
    composition: '100% Cotton', gsm: '60', width: '112 cm', weave: 'Plain',
    price: 3.2, stock: 9000, moq: 500,
    colors: [{ name: 'White', hex: '#f7f4ec' }, { name: 'Ivory', hex: '#efe9da' }, { name: 'Pastel Pink', hex: '#f0cfcd' }],
    tags: ['mulmul', 'baby', 'summer', 'lightweight', 'kurta'],
    featured: true,
  },
  {
    name: 'Chanderi Silk-Cotton',
    category: 'blends', fabricType: 'woven',
    description: 'Lustrous Chanderi weave in silk-cotton with subtle golden zari motifs. Lightweight elegance for festive wear.',
    composition: '70% Cotton, 30% Silk', gsm: '85', width: '112 cm', weave: 'Chanderi',
    price: 8.9, stock: 3100, moq: 100,
    colors: [{ name: 'Gold', hex: '#cfae4d' }, { name: 'Teal', hex: '#1f6a6a' }, { name: 'Rose', hex: '#c98f8f' }],
    tags: ['ethnic', 'festive', 'zari', 'chanderi'],
    featured: false,
  },
  {
    name: 'Tussar Silk',
    category: 'silk', fabricType: 'woven',
    description: 'Wild tussar silk with natural golden tones and a rich, slubby texture. An ethical favourite for sarees and drapes.',
    composition: '100% Tussar Silk', gsm: '120', width: '112 cm', weave: 'Plain',
    price: 10.4, stock: 2600, moq: 100,
    colors: [{ name: 'Natural Gold', hex: '#c9a95c' }, { name: 'Earthy Brown', hex: '#6b4a2b' }, { name: 'Indigo', hex: '#2b3f6e' }],
    tags: ['saree', 'ethical', 'tussar', 'ethnic'],
    featured: false,
  },
  {
    name: 'Hemp Blend Canvas',
    category: 'blends', fabricType: 'canvas',
    description: 'Durable hemp-cotton canvas with an organic, textured surface. For bags, denim-tops, and statement utility wear.',
    composition: '55% Hemp, 45% Cotton', gsm: '340', width: '150 cm', weave: 'Canvas',
    price: 6.6, stock: 3900, moq: 250,
    colors: [{ name: 'Natural', hex: '#d9d0b8' }, { name: 'Olive', hex: '#5f6a42' }, { name: 'Charcoal', hex: '#3f3f3f' }],
    tags: ['hemp', 'sustainable', 'bags', 'utility'],
    featured: false,
  },
  {
    name: 'Ripstop Technical Nylon',
    category: 'technical', fabricType: 'woven',
    description: 'Lightweight ripstop nylon with DWR finish. Water-repellent and tear-resistant for outerwear and gear.',
    composition: '100% Nylon Ripstop', gsm: '70', width: '150 cm', weave: 'Ripstop',
    price: 5.9, stock: 5800, moq: 500,
    colors: [{ name: 'Black', hex: '#1b1b1b' }, { name: 'Forest', hex: '#2b4b3a' }, { name: 'High-Vis Orange', hex: '#e8632c' }],
    tags: ['outerwear', 'water-repellent', 'technical', 'ripstop'],
    featured: false,
  },
  {
    name: 'Poplin Oxford',
    category: 'cotton', fabricType: 'poplin',
    description: 'Soft-brushed oxford poplin with a subtle basket texture. A versatile shirting classic with a relaxed drape.',
    composition: '100% Cotton', gsm: '125', width: '150 cm', weave: 'Oxford',
    price: 3.6, stock: 7800, moq: 400,
    colors: [{ name: 'White', hex: '#f5f2ea' }, { name: 'Light Blue', hex: '#a5c0d8' }, { name: 'Pink', hex: '#e7b8b8' }],
    tags: ['shirting', 'oxford', 'casual', 'button-down'],
    featured: false,
  },
];

async function ensureUser({ name, email, password, role, profile }) {
  let user = await User.findOne({ email });
  if (!user) {
    const passwordHash = await bcrypt.hash(password, 10);
    user = await User.create({ name, email, password, role, passwordHash, onboarded: true, ...profile });
    await Cart.create({ user: user._id, items: [] });
  }
  return user;
}

async function seed() {
  await connectDB();
  await mongoose.connection.dropDatabase();
  console.log('Database cleared.');

  const supplier = await ensureUser({
    name: 'Weaver Textiles Ltd.',
    email: 'supplier@demo.com',
    password: 'demo1234',
    role: 'supplier',
    profile: {
      supplierProfile: {
        businessName: 'Weaver Textiles Ltd.',
        businessType: 'Mill & Converter',
        contactEmail: 'sales@weavertextiles.in',
        contactPhone: '+91 98765 43210',
        address: { line1: 'Unit 4, SIDCO Textile Park', city: 'Surat', state: 'Gujarat', country: 'India' },
        operatingHours: 'weekdays_9_6',
        categories: ['cotton', 'silk', 'linen', 'denim'],
        fabricTypes: ['poplin', 'chiffon', 'jacquard', 'denim', 'muslin'],
        moq: 300,
        description: 'Two-decade-old mill with in-house weaving, dyeing and finishing. 12M meters annual capacity.',
      },
    },
  });

  const supplier2 = await ensureUser({
    name: 'Aurora Silk House',
    email: 'aurora@demo.com',
    password: 'demo1234',
    role: 'supplier',
    profile: {
      supplierProfile: {
        businessName: 'Aurora Silk House',
        businessType: 'Exporter',
        contactEmail: 'contact@aurorasilk.com',
        contactPhone: '+91 91234 56789',
        address: { line1: '12 MG Road, Banjara Hills', city: 'Hyderabad', state: 'Telangana', country: 'India' },
        operatingHours: 'weekdays_10_8',
        categories: ['silk', 'embroidery', 'lace'],
        fabricTypes: ['chiffon', 'satin', 'georgette', 'jacquard', 'organza'],
        moq: 100,
        description: 'Specialist silk weavers with handloom clusters across South India. Bridal & festive range.',
      },
    },
  });

  const supplier3 = await ensureUser({
    name: 'Nimbus Technical Fabrics',
    email: 'nimbus@demo.com',
    password: 'demo1234',
    role: 'supplier',
    profile: {
      supplierProfile: {
        businessName: 'Nimbus Technical Fabrics',
        businessType: 'Manufacturer',
        contactEmail: 'hello@nimbusfabrics.com',
        contactPhone: '+91 90000 11223',
        address: { line1: 'Plot 21, MIDC Industrial Area', city: 'Pune', state: 'Maharashtra', country: 'India' },
        operatingHours: 'mon_sat_9_7',
        categories: ['polyester', 'technical', 'viscose'],
        fabricTypes: ['knit', 'ripstop', 'velvet', 'interlock'],
        moq: 500,
        description: 'Performance and technical fabrics for activewear and outdoor brands.',
      },
    },
  });

  const buyer = await ensureUser({
    name: 'Ananya Sharma',
    email: 'buyer@demo.com',
    password: 'demo1234',
    role: 'buyer',
    profile: {
      buyerProfile: {
        businessType: 'brand',
        industry: 'fashion',
        interests: ['silk', 'cotton', 'linen'],
        fabricTypes: ['chiffon', 'poplin', 'linen', 'satin'],
        typicalOrderQuantity: '500_2000',
        budgetRange: '50k_200k',
        colorPreferences: ['navy', 'beige', 'white'],
        notes: 'Prefers sustainable mills with sample support.',
      },
    },
  });

  const suppliers = [supplier, supplier2, supplier3];
  const products = [];

  const sustainabilityFor = (data) => {
    const name = `${data.name} ${(data.tags || []).join(' ')} ${data.composition || ''}`.toLowerCase();
    const organic = /organic|gots|bci\b/.test(name);
    const recycled = /recycled|recycled polyester|rpet/.test(name);
    const base = {
      cotton: 62, silk: 70, linen: 74, wool: 66, viscose: 52,
      denim: 48, blends: 55, polyester: 38, lace: 58, embroidery: 58,
      technical: 42,
    }[data.category] || 50;
    let score = base + (organic ? 18 : 0) + (recycled ? 14 : 0);
    if (/poplin|muslin|broadcloth/.test(data.fabricType || '')) score += 4;
    if (['satin', 'taffeta', 'velvet'].includes(data.fabricType || '')) score -= 4;
    score = Math.max(30, Math.min(96, score));
    const badges = [];
    if (organic) badges.push('Organic certified');
    if (recycled) badges.push('Recycled content');
    if (['cotton', 'linen', 'silk', 'wool', 'viscose'].includes(data.category)) badges.push('OEKO-TEX certified');
    if (['denim', 'silk'].includes(data.category)) badges.push('Low-water dyeing');
    if (data.fabricType === 'jacquard') badges.push('Artisan woven');
    const note =
      `${organic ? 'Made from certified organic fibers. ' : ''}${recycled ? 'Contains verified recycled content. ' : ''}` +
      `Estimated eco rating derived from fiber origin, dyeing process and manufacturing footprint.`;
    return { score, recycled, organic, badges, note };
  };

  for (let i = 0; i < PRODUCTS.length; i++) {
    const data = PRODUCTS[i];
    const supplierId =
      data.category === 'silk' || data.category === 'embroidery' || data.category === 'lace'
        ? supplier2._id
        : data.category === 'polyester' || data.category === 'technical' || data.category === 'viscose'
          ? supplier3._id
          : supplier._id;

    const product = await Product.create({
      supplier: supplierId,
      name: data.name,
      slug: slugify(data.name),
      description: data.description,
      category: data.category,
      fabricType: data.fabricType,
      colors: data.colors,
      specifications: {
        composition: data.composition,
        gsm: data.gsm,
        width: data.width,
        weave: data.weave,
      },
      price: data.price,
      unit: 'meter',
      stock: data.stock,
      moq: data.moq,
      tags: data.tags,
      sustainability: sustainabilityFor(data),
      isActive: true,
      featured: data.featured,
    });
    products.push(product);
  }

  // Demo orders across the supplier workflow.
  const statuses = ['pending', 'accepted', 'preparing', 'ready_for_dispatch', 'completed'];
  const daysAgo = (d) => new Date(Date.now() - d * 86400000);

  for (let i = 0; i < 5; i++) {
    const supplierIdx = i % 3;
    const s = suppliers[supplierIdx];
    const someProducts = products.filter((p) => String(p.supplier) === String(s._id));
    if (!someProducts.length) continue;
    const a = someProducts[i % someProducts.length];
    const b = someProducts[(i + 1) % someProducts.length];
    const status = statuses[i];
    const subtotal = Math.round((a.price * 200 + b.price * 150) * 100) / 100;
    const tax = Math.round(subtotal * 0.18 * 100) / 100;
    const shipping = subtotal >= 500 ? 0 : 25;
    const total = Math.round((subtotal + tax + shipping) * 100) / 100;

    await Order.create({
      orderNumber: `TM-DEMO-${1000 + i}`,
      buyer: buyer._id,
      supplier: s._id,
      items: [
        { product: a._id, name: a.name, image: a.images?.[0], price: a.price, quantity: 200 },
        { product: b._id, name: b.name, image: b.images?.[0], price: b.price, quantity: 150 },
      ],
      shippingAddress: {
        fullName: 'Ananya Sharma',
        company: 'Astra Designs',
        address: '88 Linking Road, Bandra',
        city: 'Mumbai',
        state: 'Maharashtra',
        country: 'India',
        phone: '+91 99887 76655',
      },
      status,
      statusHistory: [
        { status: 'pending', note: 'Order placed', at: daysAgo(6 - i) },
        ...(status !== 'pending'
          ? [{ status, note: `Updated to ${status}`, at: daysAgo(5 - i) }]
          : []),
      ],
      subtotal,
      tax,
      shipping,
      total,
    });
  }

  // Sample AI conversation for the demo buyer.
  await Conversation.create({
    user: buyer._id,
    role: 'buyer',
    mode: 'assistant',
    messages: [
      { from: 'user', text: 'Recommend lightweight fabrics for a summer collection' },
      {
        from: 'assistant',
        text: 'Great choice! Here are options for summer: European Flax Linen, Muslin Mulmul, and Linen Cotton Blend — all breathable and airy.',
        products: products.slice(0, 3).map((p) => p._id),
      },
    ],
  });

  console.log('Seed complete!');
  console.log('Buyers:    buyer@demo.com / demo1234');
  console.log('Suppliers: supplier@demo.com · aurora@demo.com · nimbus@demo.com / demo1234');
  process.exit(0);
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
