import { Router } from 'express';
import {
  listProducts,
  getFeatured,
  getCategories,
  getProductBySlug,
} from '../controllers/productController.js';
import { asyncHandler } from '../middleware/error.js';

const router = Router();

router.get('/', asyncHandler(listProducts));
router.get('/featured', asyncHandler(getFeatured));
router.get('/categories', asyncHandler(getCategories));
router.get('/:slug', asyncHandler(getProductBySlug));

export default router;
