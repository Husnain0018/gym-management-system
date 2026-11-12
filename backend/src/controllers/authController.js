import { db } from '../config/database.js';
import { comparePassword, hashPassword, sanitizeString } from '../utils/security.js';
import { generateToken } from '../middleware/auth.js';
import { evaluateMembershipStatus } from '../utils/dateUtils.js';

/**
 * Universal Login: Supports Admin (username) and Members (Phone, Member ID, or Email)
 */
export async function login(req, res, next) {
  try {
    const identifier = sanitizeString(req.body.identifier || req.body.username || req.body.phone);
    const password = req.body.password;

    if (!identifier || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both your login identifier and password.'
      });
    }

    // Lookup user by username directly or through member records (phone, member_code, email)
    let user = db.prepare('SELECT id, username, password_hash, role FROM users WHERE username = ? COLLATE NOCASE').get(identifier);

    let member = null;

    if (!user) {
      // Check if identifier matches a member's phone, member_code, or email
      member = db.prepare(`
        SELECT m.id, m.member_code, m.user_id, m.full_name, m.phone, m.email, m.photo_url, m.joining_date, m.expiry_date,
               u.id as u_id, u.username, u.password_hash, u.role
        FROM members m
        JOIN users u ON m.user_id = u.id
        WHERE m.phone = ? OR m.member_code = ? OR (m.email = ? AND m.email IS NOT NULL AND m.email != '')
      `).get(identifier, identifier, identifier);

      if (member) {
        user = {
          id: member.u_id,
          username: member.username,
          password_hash: member.password_hash,
          role: member.role
        };
      }
    } else if (user.role === 'member') {
      // User found by username, fetch corresponding member record
      member = db.prepare('SELECT * FROM members WHERE user_id = ?').get(user.id);
    }

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials. Please verify your login details and try again.'
      });
    }

    // Verify password
    const isMatch = await comparePassword(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials. Please verify your login details and try again.'
      });
    }

    // Build payload and sign token
    const tokenPayload = {
      id: user.id,
      username: user.username,
      role: user.role,
      memberId: member ? member.id : null
    };

    const token = generateToken(tokenPayload);

    let membershipDetails = null;
    if (member) {
      const statusInfo = evaluateMembershipStatus(member.expiry_date);
      membershipDetails = {
        memberId: member.id,
        memberCode: member.member_code,
        fullName: member.full_name,
        phone: member.phone,
        email: member.email,
        photoUrl: member.photo_url,
        joiningDate: member.joining_date,
        expiryDate: member.expiry_date,
        status: statusInfo.status,
        statusLabel: statusInfo.statusLabel,
        remainingDays: statusInfo.remainingDays,
        isExpiringSoon: statusInfo.isExpiringSoon,
        isExpired: statusInfo.isExpired,
        notificationMessage: statusInfo.notificationMessage
      };
    }

    return res.status(200).json({
      success: true,
      message: 'Login successful.',
      token,
      user: {
        id: user.id,
        username: user.username,
        role: user.role,
        member: membershipDetails
      }
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Get authenticated user's current session & profile
 */
export async function getCurrentUser(req, res, next) {
  try {
    const user = db.prepare('SELECT id, username, role, created_at FROM users WHERE id = ?').get(req.user.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User account not found.'
      });
    }

    let memberData = null;
    if (user.role === 'member') {
      const member = db.prepare('SELECT * FROM members WHERE user_id = ?').get(user.id);
      if (member) {
        const statusInfo = evaluateMembershipStatus(member.expiry_date);
        memberData = {
          memberId: member.id,
          memberCode: member.member_code,
          fullName: member.full_name,
          phone: member.phone,
          email: member.email,
          photoUrl: member.photo_url,
          joiningDate: member.joining_date,
          expiryDate: member.expiry_date,
          status: statusInfo.status,
          statusLabel: statusInfo.statusLabel,
          remainingDays: statusInfo.remainingDays,
          isExpiringSoon: statusInfo.isExpiringSoon,
          isExpired: statusInfo.isExpired,
          notificationMessage: statusInfo.notificationMessage
        };
      }
    }

    return res.status(200).json({
      success: true,
      user: {
        id: user.id,
        username: user.username,
        role: user.role,
        createdAt: user.created_at,
        member: memberData
      }
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Change authenticated user's password
 */
export async function changePassword(req, res, next) {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Current password and new password are required.'
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'New password must be at least 6 characters long.'
      });
    }

    const user = db.prepare('SELECT id, password_hash FROM users WHERE id = ?').get(req.user.id);
    const isMatch = await comparePassword(currentPassword, user.password_hash);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: 'Incorrect current password.'
      });
    }

    const newHash = await hashPassword(newPassword);
    db.prepare('UPDATE users SET password_hash = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?').run(newHash, user.id);

    return res.status(200).json({
      success: true,
      message: 'Password changed successfully.'
    });
  } catch (err) {
    next(err);
  }
}
