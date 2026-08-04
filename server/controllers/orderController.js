import Order from '../models/Order.js';
import Cart from '../models/Cart.js';
import Product from '../models/Product.js';
import { asyncHandler, AppError } from '../middleware/error.js';
import { generateOrderNumber } from '../utils/order.js';
import { ORDER_STATUSES } from '../constants.js';

const populateOrder = (order) =>
  Order.populate(order, [
    { path: 'buyer', select: 'name email' },
    { path: 'supplier', select: 'name avatar supplierProfile' },
  ]);

export const createOrder = asyncHandler(async (req, res) => {
  const cart = await Cart.findOne({ user: req.user._id }).populate('items.product');
  if (!cart || !cart.items.length) throw new AppError(400, 'Your cart is empty.');

  const { shippingAddress, notes } = req.body;
  if (!shippingAddress?.fullName || !shippingAddress?.address || !shippingAddress?.city) {
    throw new AppError(400, 'Shipping name, address and city are required.');
  }

  const grouped = {};
  for (const item of cart.items) {
    const product = item.product;
    if (!product || !product.isActive) {
      throw new AppError(400, `Product no longer available: ${item.product?._id || 'unknown'}.`);
    }
    const supplierId = String(product.supplier);
    if (!grouped[supplierId]) grouped[supplierId] = [];
    grouped[supplierId].push({ item, product });
  }

  const orders = [];
  for (const [supplierId, entries] of Object.entries(grouped)) {
    const items = entries.map(({ item, product }) => ({
      product: product._id,
      name: product.name,
      image: product.images?.[0],
      color: item.color,
      price: product.price,
      quantity: item.quantity,
    }));

    const subtotal = items.reduce((sum, it) => sum + it.price * it.quantity, 0);
    const tax = Math.round(subtotal * 0.18 * 100) / 100;
    const shipping = subtotal >= 500 ? 0 : 25;
    const total = Math.round((subtotal + tax + shipping) * 100) / 100;

    const order = await Order.create({
      orderNumber: generateOrderNumber(),
      buyer: req.user._id,
      supplier: supplierId,
      items,
      shippingAddress,
      status: 'pending',
      statusHistory: [{ status: 'pending', note: 'Order placed' }],
      subtotal,
      tax,
      shipping,
      total,
      notes,
    });
    orders.push(order);

    for (const { item } of entries) {
      await Product.updateOne(
        { _id: item.product._id },
        { $inc: { stock: -item.quantity } }
      );
    }
  }

  cart.items = [];
  await cart.save();

  const populated = [];
  for (const o of orders) populated.push(await populateOrder(o));
  res.status(201).json({ orders: populated });
});

export const myOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({ buyer: req.user._id })
    .populate('supplier', 'name avatar supplierProfile')
    .sort({ createdAt: -1 });
  res.json({ orders });
});

export const getOrder = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);
  if (!order) throw new AppError(404, 'Order not found.');
  const isBuyer = String(order.buyer) === String(req.user._id);
  const isSupplier = String(order.supplier) === String(req.user._id);
  if (!isBuyer && !isSupplier) throw new AppError(403, 'You cannot view this order.');
  res.json({ order: await populateOrder(order) });
});

export const supplierOrders = asyncHandler(async (req, res) => {
  const { status } = req.query;
  const query = { supplier: req.user._id };
  if (status && ORDER_STATUSES.includes(status)) query.status = status;
  const orders = await Order.find(query)
    .populate('buyer', 'name email')
    .sort({ createdAt: -1 });
  res.json({ orders });
});

export const updateStatus = asyncHandler(async (req, res) => {
  const { status, note } = req.body;
  if (!ORDER_STATUSES.includes(status)) {
    throw new AppError(400, `Invalid status. Use one of: ${ORDER_STATUSES.join(', ')}.`);
  }

  const order = await Order.findOne({ _id: req.params.id, supplier: req.user._id });
  if (!order) throw new AppError(404, 'Order not found.');

  const fromIdx = ORDER_STATUSES.indexOf(order.status);
  const toIdx = ORDER_STATUSES.indexOf(status);
  if (toIdx < fromIdx) {
    throw new AppError(400, 'Cannot move the order backwards in the workflow.');
  }

  order.status = status;
  order.statusHistory.push({ status, note: note || `Order moved to ${status}` });
  await order.save();

  res.json({ order: await populateOrder(order) });
});
