import { Router } from 'express';
import {
  dashboard,
  myProducts,
  createProduct,
  updateProduct,
  deleteProduct,
} from '../controllers/supplierController.js';
import { auth, requireRole } from '../middleware/auth.js';
import { ROLES } from '../constants.js';
import { asyncHandler } from '../middleware/error.js';

const router = Router();

router.use(auth, requireRole(ROLES.SUPPLIER));

router.get('/dashboard', asyncHandler(dashboard));
router.get('/products', asyncHandler(myProducts));
router.post('/products', asyncHandler(createProduct));
router.put('/products/:id', asyncHandler(updateProduct));
router.delete('/products/:id', asyncHandler(deleteProduct));

export default router;
