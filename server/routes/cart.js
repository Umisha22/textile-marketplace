import { Router } from 'express';
import {
  getCart,
  addItem,
  updateItem,
  removeItem,
  clearCart,
} from '../controllers/cartController.js';
import { auth, requireRole } from '../middleware/auth.js';
import { ROLES } from '../constants.js';
import { asyncHandler } from '../middleware/error.js';

const router = Router();

router.use(auth, requireRole(ROLES.BUYER));

router.get('/', asyncHandler(getCart));
router.post('/items', asyncHandler(addItem));
router.put('/items/:productId', asyncHandler(updateItem));
router.delete('/items/:productId', asyncHandler(removeItem));
router.delete('/', asyncHandler(clearCart));

export default router;
