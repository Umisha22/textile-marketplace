import { Router } from 'express';
import {
  createOrder,
  myOrders,
  getOrder,
  supplierOrders,
  updateStatus,
} from '../controllers/orderController.js';
import { auth, requireRole } from '../middleware/auth.js';
import { ROLES } from '../constants.js';
import { asyncHandler } from '../middleware/error.js';

const router = Router();

router.use(auth);

router.post('/', requireRole(ROLES.BUYER), asyncHandler(createOrder));
router.get('/mine', requireRole(ROLES.BUYER), asyncHandler(myOrders));
router.get('/supplier', requireRole(ROLES.SUPPLIER), asyncHandler(supplierOrders));
router.put('/:id/status', requireRole(ROLES.SUPPLIER), asyncHandler(updateStatus));
router.get('/:id', asyncHandler(getOrder));

export default router;
