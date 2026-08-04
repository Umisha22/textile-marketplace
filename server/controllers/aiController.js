import Conversation from '../models/Conversation.js';
import { handleChatMessage, handleRecommend, handleCompareByIds } from '../services/ai/index.js';
import { asyncHandler, AppError } from '../middleware/error.js';

export const chat = asyncHandler(async (req, res) => {
  const { message, mode = 'assistant' } = req.body;
  if (!message || !message.trim()) throw new AppError(400, 'Message is required.');

  const context = { mode };
  let history = [];

  if (req.user) {
    let conv = await Conversation.findOne({ user: req.user._id, mode });
    if (!conv) {
      conv = await Conversation.create({
        user: req.user._id,
        role: req.user.role,
        mode,
        messages: [],
      });
    }
    if (conv.context) Object.assign(context, conv.context);
    history = conv.messages.slice(-8).map((m) => m.text);
  }

  const result = await handleChatMessage({
    text: message,
    user: req.user,
    role: req.user?.role || 'buyer',
    context,
    history,
  });

  if (req.user) {
    const conv = await Conversation.findOne({ user: req.user._id, mode });
    conv.messages.push({ from: 'user', text: message });
    conv.messages.push({
      from: 'assistant',
      text: result.reply,
      products: (result.products || []).map((p) => p.id),
    });

    // Persist onboarding state + product context for memory.
    if (context.onboarding) conv.context = { ...conv.context, ...context, mode };
    if (result.context) conv.context = { ...conv.context, ...result.context, mode };
    await conv.save();
  }

  res.json({
    reply: result.reply,
    intent: result.intent,
    products: result.products || [],
    suggestions: result.suggestions || [],
    compare: result.compare || null,
    onboardingStep: result.onboardingStep ?? null,
    onboardingComplete: result.onboardingComplete || false,
    progress: result.progress || null,
    lastSaved: result.lastSaved || null,
    profile: result.profile || null,
  });
});

export const getConversation = asyncHandler(async (req, res) => {
  const mode = req.query.mode || 'assistant';
  if (!req.user) return res.json({ messages: [] });
  const conv = await Conversation.findOne({ user: req.user._id, mode }).populate({
    path: 'messages.products',
    select: 'name slug price unit category fabricType images stock moq colors',
  });
  const messages = (conv?.messages || []).map((m) => ({
    from: m.from,
    text: m.text,
    products: m.products || [],
  }));
  res.json({ messages });
});

export const recommend = asyncHandler(async (req, res) => {
  if (!req.user) throw new AppError(401, 'Please log in to get recommendations.');
  const result = await handleRecommend(req.user);
  res.json(result);
});

export const compare = asyncHandler(async (req, res) => {
  const { ids } = req.body;
  if (!Array.isArray(ids) || ids.length < 2) {
    throw new AppError(400, 'Provide at least two product ids to compare.');
  }
  const result = await handleCompareByIds(ids);
  res.json(result);
});
