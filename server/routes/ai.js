import { Router } from 'express';
import { chat, recommend, compare, getConversation } from '../controllers/aiController.js';
import { auth } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/error.js';

const router = Router();

function authOptional(req, res, next) {
  const header = req.headers.authorization || '';
  if (!header.startsWith('Bearer ')) return next();
  auth(req, res, next);
}

// Chat is available to everyone; authenticated users get persistent memory.
router.post('/chat', authOptional, asyncHandler(chat));
router.get('/conversation', authOptional, asyncHandler(getConversation));
router.post('/recommend', auth, asyncHandler(recommend));
router.post('/compare', authOptional, asyncHandler(compare));

export default router;
