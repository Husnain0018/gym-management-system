import { Router } from 'express';
import { getDashboardStats } from '../controllers/dashboardController.js';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';

const router = Router();

// Admin Dashboard stats & 5-day notifications
router.get('/stats', authenticateToken, requireAdmin, getDashboardStats);

export default router;
