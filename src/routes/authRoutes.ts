import { Router } from 'express';
import AuthController from '../controllers/authController';
import { protect } from '../middlewares/authMiddleware';
import { authLimiter } from '../middlewares/rateLimiter';
import { registerValidation, loginValidation } from '../validations/authValidation';

const router = Router();

// Public routes
router.post('/register', authLimiter, registerValidation, AuthController.register);
router.post('/login', authLimiter, loginValidation, AuthController.login);
router.post('/refresh-token', AuthController.refreshToken);
router.post('/logout', AuthController.logout);

// Protected routes
router.get('/me', protect, AuthController.getCurrentUser);

export default router;