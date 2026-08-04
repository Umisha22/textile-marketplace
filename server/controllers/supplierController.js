import Product from '../models/Product.js';
import Order from '../models/Order.js';
import User from '../models/User.js';
import { asyncHandler, AppError } from '../middleware/error.js';
import { createUniqueSlug } from './productController.js';

const LOW_STOCK_THRESHOLD = 300;

export const dashboard = asyncHandler(async (req, res) => {
  const supplierId = req.user._id;

  const [totalProducts, activeProducts, pendingOrders, completedOrders, recentOrders, products] =
    await Promise.all([
      Product.countDocuments({ supplier: supplierId }),
      Product.countDocuments({ supplier: supplierId, isActive: true }),
      Order.countDocuments({ supplier: supplierId, status: 'pending' }),
      Order.find({ supplier: supplierId, status: 'completed' }).select('total'),
      Order.find({ supplier: supplierId })
        .populate('buyer', 'name')
        .sort({ createdAt: -1 })
        .limit(5),
      Product.find({ supplier: supplierId }).select('name stock moq isActive').sort({ stock: 1 }).limit(6),
    ]);

  const inventoryAlerts = products
    .filter((p) => p.stock <= LOW_STOCK_THRESHOLD || p.stock <= (p.moq || 0) * 2)
    .map((p) => ({ id: p._id, name: p.name, stock: p.stock, moq: p.moq }));

  const revenue = completedOrders.reduce((sum, o) => sum + o.total, 0);

  res.json({
    stats: {
      totalProducts,
      activeProducts,
      pendingOrders,
      inProgressOrders: await Order.countDocuments({
        supplier: supplierId,
        status: { $in: ['accepted', 'preparing', 'ready_for_dispatch'] },
      }),
      completedOrders: completedOrders.length,
      revenue: Math.round(revenue * 100) / 100,
    },
    recentOrders,
    inventoryAlerts,
  });
});

export const myProducts = asyncHandler(async (req, res) => {
  const products = await Product.find({ supplier: req.user._id }).sort({ createdAt: -1 });
  res.json({ products });
});

export const createProduct = asyncHandler(async (req, res) => {
  const {
    name,
    description,
    category,
    fabricType,
    images = [],
    colors = [],
    specifications = {},
    price,
    unit,
    stock,
    moq,
    tags = [],
    isActive = true,
    featured = false,
  } = req.body;

  if (!name || !description || !category) {
    throw new AppError(400, 'Name, description and category are required.');
  }
  if (price == null || stock == null) {
    throw new AppError(400, 'Price and stock are required.');
  }

  const slug = await createUniqueSlug(name);
  const product = await Product.create({
    supplier: req.user._id,
    name,
    slug,
    description,
    category,
    fabricType,
    images,
    colors,
    specifications,
    price,
    unit: unit || 'meter',
    stock,
    moq: moq || 100,
    tags,
    isActive,
    featured,
  });

  res.status(201).json({ product });
});

export const updateProduct = asyncHandler(async (req, res) => {
  const product = await Product.findOne({ _id: req.params.id, supplier: req.user._id });
  if (!product) throw new AppError(404, 'Product not found.');

  const allowed = [
    'name',
    'description',
    'category',
    'fabricType',
    'images',
    'colors',
    'specifications',
    'price',
    'unit',
    'stock',
    'moq',
    'tags',
    'isActive',
    'featured',
  ];

  for (const key of allowed) {
    if (req.body[key] !== undefined) product[key] = req.body[key];
  }

  if (req.body.name && req.body.name !== product.name) {
    product.slug = await createUniqueSlug(req.body.name, product._id);
  }

  await product.save();
  res.json({ product });
});

export const deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findOneAndDelete({ _id: req.params.id, supplier: req.user._id });
  if (!product) throw new AppError(404, 'Product not found.');
  res.json({ message: 'Product deleted.', id: product._id });
});
