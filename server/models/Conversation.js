import mongoose from 'mongoose';
import { ROLES } from '../constants.js';

const messageSchema = new mongoose.Schema(
  {
    from: { type: String, enum: ['user', 'assistant'], required: true },
    text: { type: String, required: true },
    products: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }],
  },
  { timestamps: true }
);

const conversationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    role: { type: String, enum: Object.values(ROLES), required: true },
    mode: {
      type: String,
      enum: ['assistant', 'onboarding'],
      default: 'assistant',
    },
    messages: [messageSchema],
    context: { type: mongoose.Schema.Types.Mixed, default: {} },
  },
  { timestamps: true }
);

const Conversation = mongoose.model('Conversation', conversationSchema);

export default Conversation;
