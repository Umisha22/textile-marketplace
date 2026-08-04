import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import {
  ROLES,
  BUSINESS_TYPES,
  INDUSTRIES,
  ORDER_QUANTITY_RANGES,
  BUDGET_RANGES,
  OPERATING_HOURS,
} from '../constants.js';
import { CURRENCY_CODES } from '../utils/currency.js';

const buyerProfileSchema = new mongoose.Schema(
  {
    businessType: { type: String, enum: BUSINESS_TYPES },
    industry: { type: String, enum: INDUSTRIES },
    interests: [{ type: String }],
    fabricTypes: [{ type: String }],
    typicalOrderQuantity: { type: String, enum: ORDER_QUANTITY_RANGES },
    budgetRange: { type: String, enum: BUDGET_RANGES },
    colorPreferences: [{ type: String }],
    notes: { type: String },
    currency: { type: String, enum: CURRENCY_CODES, default: 'USD' },
  },
  { _id: false }
);

const supplierProfileSchema = new mongoose.Schema(
  {
    businessName: { type: String },
    businessType: { type: String },
    contactEmail: { type: String },
    contactPhone: { type: String },
    address: {
      line1: String,
      city: String,
      state: String,
      country: String,
    },
    operatingHours: { type: String, enum: OPERATING_HOURS },
    categories: [{ type: String }],
    fabricTypes: [{ type: String }],
    moq: { type: Number },
    description: { type: String },
    currency: { type: String, enum: CURRENCY_CODES, default: 'USD' },
  },
  { _id: false }
);

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    passwordHash: { type: String, required: true, select: false },
    role: { type: String, enum: Object.values(ROLES), required: true },
    avatar: { type: String },
    onboarded: { type: Boolean, default: false },
    buyerProfile: buyerProfileSchema,
    supplierProfile: supplierProfileSchema,
  },
  { timestamps: true }
);

userSchema.methods.comparePassword = function (candidate) {
  return bcrypt.compare(candidate, this.passwordHash);
};

userSchema.methods.toSafeJSON = function () {
  const obj = this.toObject();
  delete obj.passwordHash;
  return obj;
};

const User = mongoose.model('User', userSchema);

export default User;
