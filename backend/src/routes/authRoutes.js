import { Router } from 'express';
import { login, getCurrentUser, changePassword } from '../controllers/authController.js';
import { authenticateToken } from '../middleware/auth.js';
import { loginLimiter } from '../middleware/rateLimiter.js';

const router = Router();

// Public auth endpoints
router.post('/login', loginLimiter, login);

// Authenticated session endpoints
router.get('/me', authenticateToken, getCurrentUser);
router.post('/change-password', authenticateToken, changePassword);

export default router;
