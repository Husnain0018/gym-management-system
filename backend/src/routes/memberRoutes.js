import { Router } from 'express';
import {
  createMember,
  getMembers,
  getMemberById,
  updateMember,
  deleteMember,
  resetMemberPassword,
  getMemberOwnProfile
} from '../controllers/memberController.js';
import { authenticateToken, requireAdmin, requireMember } from '../middleware/auth.js';
import { uploadProfilePhoto } from '../middleware/upload.js';

const router = Router();

// ============================================
// CANDIDATE / MEMBER SPECIFIC ENDPOINTS (IDOR PROTECTED)
// ============================================
router.get('/member/profile', authenticateToken, requireMember, getMemberOwnProfile);

// ============================================
// ADMIN MEMBER MANAGEMENT ENDPOINTS
// ============================================
router.get('/members', authenticateToken, requireAdmin, getMembers);
router.post('/members', authenticateToken, requireAdmin, uploadProfilePhoto.single('photo'), createMember);
router.get('/members/:id', authenticateToken, requireAdmin, getMemberById);
router.put('/members/:id', authenticateToken, requireAdmin, uploadProfilePhoto.single('photo'), updateMember);
router.delete('/members/:id', authenticateToken, requireAdmin, deleteMember);
router.post('/members/:id/reset-password', authenticateToken, requireAdmin, resetMemberPassword);

export default router;
