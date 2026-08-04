import Product from '../models/Product.js';
import User from '../models/User.js';
import { asyncHandler, AppError } from '../middleware/error.js';
import { slugify } from '../utils/slug.js';
import { PRODUCT_CATEGORIES, FABRIC_TYPES } from '../constants.js';

const PAGE_SIZE = 12;

export const listProducts = asyncHandler(async (req, res) => {
  const {
    search,
    category,
    fabricType,
    color,
    minPrice,
    maxPrice,
    supplier,
    sort,
    page = 1,
    limit = PAGE_SIZE,
  } = req.query;

  const query = { isActive: true };

  if (search) {
    query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } },
      { tags: { $regex: search, $options: 'i' } },
      { category: { $regex: search, $options: 'i' } },
      { fabricType: { $regex: search, $options: 'i' } },
    ];
  }
  if (category) query.category = category;
  if (fabricType) query.fabricType = fabricType;
  if (supplier) query.supplier = supplier;
  if (color) {
    query.$and = [
      ...(query.$or ? [query.$or] : []),
      {
        $or: [
          { tags: { $regex: color, $options: 'i' } },
          { 'colors.name': { $regex: color, $options: 'i' } },
        ],
      },
    ];
    delete query.$or;
  }
  if (minPrice || maxPrice) {
    query.price = {};
    if (minPrice) query.price.$gte = Number(minPrice);
    if (maxPrice) query.price.$lte = Number(maxPrice);
  }

  const sortOptions = {
    newest: { createdAt: -1 },
    price_asc: { price: 1 },
    price_desc: { price: -1 },
    popular: { featured: -1, stock: -1 },
    stock: { stock: -1 },
  };

  const total = await Product.countDocuments(query);
  const products = await Product.find(query)
    .populate('supplier', 'name avatar supplierProfile')
    .sort(sortOptions[sort] || sortOptions.newest)
    .skip((Number(page) - 1) * Number(limit))
    .limit(Number(limit));

  res.json({
    products,
    pagination: {
      page: Number(page),
      limit: Number(limit),
      total,
      pages: Math.ceil(total / Number(limit)),
    },
  });
});

export const getFeatured = asyncHandler(async (req, res) => {
  const products = await Product.find({ isActive: true, featured: true })
    .populate('supplier', 'name avatar supplierProfile')
    .sort({ stock: -1 })
    .limit(8);
  res.json({ products });
});

export const getCategories = asyncHandler(async (req, res) => {
  const facets = await Product.aggregate([
    { $match: { isActive: true } },
    {
      $group: {
        _id: '$category',
        count: { $sum: 1 },
        fabricTypes: { $addToSet: '$fabricType' },
      },
    },
    { $sort: { count: -1 } },
  ]);

  const supplierCount = await User.countDocuments({ role: 'supplier', onboarded: true });

  res.json({
    categories: facets.map((f) => ({
      name: f._id,
      count: f.count,
      fabricTypes: f.fabricTypes.filter(Boolean),
    })),
    fabricTypes: FABRIC_TYPES,
    supplierCount,
  });
});

export const getProductBySlug = asyncHandler(async (req, res) => {
  const product = await Product.findOne({ slug: req.params.slug, isActive: true }).populate(
    'supplier',
    'name avatar supplierProfile'
  );
  if (!product) throw new AppError(404, 'Product not found.');
  res.json({ product });
});

export const createUniqueSlug = async (name, existingId = null) => {
  let slug = slugify(name);
  let candidate = slug;
  let i = 1;
  while (await Product.findOne({ slug: candidate, _id: { $ne: existingId } })) {
    candidate = `${slug}-${i++}`;
  }
  return candidate;
};

export { PRODUCT_CATEGORIES };
