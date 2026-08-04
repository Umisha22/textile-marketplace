import Cart from '../models/Cart.js';
import Product from '../models/Product.js';
import { asyncHandler, AppError } from '../middleware/error.js';

const populateOptions = {
  path: 'items.product',
  populate: { path: 'supplier', select: 'name supplierProfile' },
};

export const getCart = asyncHandler(async (req, res) => {
  let cart = await Cart.findOne({ user: req.user._id }).populate(populateOptions);
  if (!cart) {
    cart = await Cart.create({ user: req.user._id, items: [] });
  }
  res.json({ cart });
});

export const addItem = asyncHandler(async (req, res) => {
  const { productId, quantity = 1, color } = req.body;
  if (!productId) throw new AppError(400, 'Product is required.');

  const product = await Product.findById(productId);
  if (!product || !product.isActive) throw new AppError(404, 'Product not found.');
  if (product.supplier.equals(req.user._id)) {
    throw new AppError(400, 'You cannot add your own products to cart.');
  }

  const qty = Math.max(1, Math.floor(Number(quantity) || 1));
  let cart = await Cart.findOne({ user: req.user._id });

  if (!cart) {
    cart = await Cart.create({ user: req.user._id, items: [] });
  }

  const existing = cart.items.find((it) => String(it.product) === String(productId));
  if (existing) {
    existing.quantity = Math.min(qty + existing.quantity, Math.max(product.stock, qty + existing.quantity));
  } else {
    cart.items.push({ product: productId, quantity: qty, color });
  }

  await cart.save();
  cart = await Cart.findById(cart._id).populate(populateOptions);
  res.json({ cart });
});

export const updateItem = asyncHandler(async (req, res) => {
  const { quantity } = req.body;
  const cart = await Cart.findOne({ user: req.user._id });
  if (!cart) throw new AppError(404, 'Cart not found.');

  const item = cart.items.find((it) => String(it.product) === String(req.params.productId));
  if (!item) throw new AppError(404, 'Item not in cart.');

  const product = await Product.findById(item.product);
  const qty = Math.max(1, Math.floor(Number(quantity) || 1));
  item.quantity = product ? Math.min(qty, Math.max(product.stock, qty)) : qty;

  await cart.save();
  res.json({ cart: await Cart.findById(cart._id).populate(populateOptions) });
});

export const removeItem = asyncHandler(async (req, res) => {
  const cart = await Cart.findOne({ user: req.user._id });
  if (!cart) throw new AppError(404, 'Cart not found.');
  cart.items = cart.items.filter((it) => String(it.product) !== String(req.params.productId));
  await cart.save();
  res.json({ cart: await Cart.findById(cart._id).populate(populateOptions) });
});

export const clearCart = asyncHandler(async (req, res) => {
  const cart = await Cart.findOne({ user: req.user._id });
  if (!cart) throw new AppError(404, 'Cart not found.');
  cart.items = [];
  await cart.save();
  res.json({ cart });
});
