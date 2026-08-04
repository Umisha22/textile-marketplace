import mongoose from 'mongoose';
import {
  PRODUCT_CATEGORIES,
  FABRIC_TYPES,
  UNIT_TYPES,
} from '../constants.js';

const productSchema = new mongoose.Schema(
  {
    supplier: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, index: true },
    description: { type: String, required: true },
    category: { type: String, enum: PRODUCT_CATEGORIES, required: true },
    fabricType: { type: String, enum: FABRIC_TYPES },
    images: [{ type: String }],
    colors: [
      {
        name: { type: String, required: true },
        hex: { type: String },
      },
    ],
    specifications: {
      composition: String,
      width: String,
      gsm: String,
      weave: String,
      finish: String,
      shrink: String,
    },
    price: { type: Number, required: true, min: 0 },
    unit: { type: String, enum: UNIT_TYPES, default: 'meter' },
    stock: { type: Number, required: true, min: 0 },
    moq: { type: Number, default: 100 },
    tags: [{ type: String }],
    sustainability: {
      score: { type: Number, min: 0, max: 100, default: 0 },
      recycled: { type: Boolean, default: false },
      organic: { type: Boolean, default: false },
      badges: [{ type: String }],
      note: { type: String },
    },
    isActive: { type: Boolean, default: true },
    featured: { type: Boolean, default: false },
  },
  { timestamps: true }
);

productSchema.index({ name: 'text', description: 'text', tags: 'text' });
productSchema.index({ category: 1, price: 1 });
productSchema.index({ supplier: 1, isActive: 1 });

const Product = mongoose.model('Product', productSchema);

export default Product;
