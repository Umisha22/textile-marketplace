import { Router } from 'express';
import { register, login, me, updateProfile } from '../controllers/authController.js';
import { auth } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/error.js';

const router = Router();

router.post('/register', asyncHandler(register));
router.post('/login', asyncHandler(login));
router.get('/me', auth, asyncHandler(me));
router.put('/profile', auth, asyncHandler(updateProfile));

export default router;
