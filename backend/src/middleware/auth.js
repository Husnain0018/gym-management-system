import jwt from 'jsonwebtoken';
import { db } from '../config/database.js';

const JWT_SECRET = process.env.JWT_SECRET || 'fithub-gym-secret-key-production-strength-2026';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '24h';

/**
 * Sign JWT token for authenticated user
 * @param {object} payload - { id, username, role, memberId }
 * @returns {string}
 */
export function generateToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

/**
 * Express middleware to authenticate token from Bearer header or cookie
 */
export function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  let token = null;

  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.substring(7);
  } else if (req.cookies && req.cookies.token) {
    token = req.cookies.token;
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Access denied. Authentication token required.'
    });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);

    // Validate that user still exists in database
    const userStmt = db.prepare('SELECT id, username, role FROM users WHERE id = ?');
    const user = userStmt.get(decoded.id);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid session: user no longer exists.'
      });
    }

    // Attach user information to request
    req.user = {
      id: user.id,
      username: user.username,
      role: user.role,
      memberId: decoded.memberId || null
    };

    next();
  } catch (err) {
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired authentication token.'
    });
  }
}

/**
 * Require Admin role
 */
export function requireAdmin(req, res, next) {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Forbidden: Administrator privileges required.'
    });
  }
  next();
}

/**
 * Require Member role
 */
export function requireMember(req, res, next) {
  if (!req.user || req.user.role !== 'member') {
    return res.status(403).json({
      success: false,
      message: 'Forbidden: Member privileges required.'
    });
  }
  next();
}
