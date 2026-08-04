import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import Cart from '../models/Cart.js';
import { ROLES } from '../constants.js';
import { JWT_SECRET, JWT_EXPIRES_IN } from '../config/env.js';
import { asyncHandler, AppError } from '../middleware/error.js';

const signToken = (id) => jwt.sign({ id }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });

export const register = asyncHandler(async (req, res) => {
  const { name, email, password, role } = req.body;

  if (!name || !email || !password) {
    throw new AppError(400, 'Name, email and password are required.');
  }
  if (!Object.values(ROLES).includes(role)) {
    throw new AppError(400, 'Role must be either "buyer" or "supplier".');
  }
  if (password.length < 6) {
    throw new AppError(400, 'Password must be at least 6 characters.');
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await User.create({ name, email, role, passwordHash });
  await Cart.create({ user: user._id, items: [] });

  const token = signToken(user._id);
  res.status(201).json({ token, user: user.toSafeJSON() });
});

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    throw new AppError(400, 'Email and password are required.');
  }

  const user = await User.findOne({ email }).select('+passwordHash');
  if (!user || !(await user.comparePassword(password))) {
    throw new AppError(401, 'Invalid email or password.');
  }

  const token = signToken(user._id);
  res.json({ token, user: user.toSafeJSON() });
});

export const me = asyncHandler(async (req, res) => {
  res.json({ user: req.user.toSafeJSON() });
});

export const updateProfile = asyncHandler(async (req, res) => {
  const { role } = req.user;
  const body = req.body;

  const updates = {};

  if (body.name) updates.name = body.name;
  if (body.avatar) updates.avatar = body.avatar;

  if (role === ROLES.BUYER && body.buyerProfile) {
    updates.buyerProfile = {
      ...(req.user.buyerProfile || {}),
      ...body.buyerProfile,
    };
    updates.onboarded = true;
  }

  if (role === ROLES.SUPPLIER && body.supplierProfile) {
    updates.supplierProfile = {
      ...(req.user.supplierProfile || {}),
      ...body.supplierProfile,
    };
    updates.onboarded = true;
  }

  const user = await User.findByIdAndUpdate(req.user._id, updates, {
    new: true,
    runValidators: true,
  });
  res.json({ user: user.toSafeJSON() });
});
