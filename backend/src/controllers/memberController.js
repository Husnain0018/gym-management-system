import { db } from '../config/database.js';
import {
  calculateOneMonthExpiry,
  evaluateMembershipStatus
} from '../utils/dateUtils.js';
import {
  hashPassword,
  generateSecureTemporaryPassword,
  generateMemberCode,
  sanitizeString,
  isValidPhone,
  isValidEmail
} from '../utils/security.js';
import { verifyImageMagicBytes } from '../middleware/upload.js';
import fs from 'fs';
import path from 'path';

/**
 * Register a new Gym Member (Admin only)
 * Calculates 1-month expiry date automatically and provisions login account.
 */
export async function createMember(req, res, next) {
  let uploadedFilePath = null;
  try {
    const fullName = sanitizeString(req.body.fullName);
    const phone = sanitizeString(req.body.phone);
    const email = req.body.email ? sanitizeString(req.body.email) : null;
    const joiningDate = sanitizeString(req.body.joiningDate);

    // Validation
    if (!fullName || fullName.length < 2) {
      return res.status(400).json({
        success: false,
        message: 'Full Name is required (minimum 2 characters).'
      });
    }

    if (!phone || !isValidPhone(phone)) {
      return res.status(400).json({
        success: false,
        message: 'A valid phone number is required.'
      });
    }

    if (email && !isValidEmail(email)) {
      return res.status(400).json({
        success: false,
        message: 'The email address provided is not in a valid format.'
      });
    }

    if (!joiningDate || !/^\d{4}-\d{2}-\d{2}$/.test(joiningDate)) {
      return res.status(400).json({
        success: false,
        message: 'Joining date is required in YYYY-MM-DD format.'
      });
    }

    // Check if phone number is already registered
    const existingPhone = db.prepare('SELECT id FROM members WHERE phone = ?').get(phone);
    if (existingPhone) {
      if (req.file) fs.unlinkSync(req.file.path);
      return res.status(409).json({
        success: false,
        message: 'A gym member with this phone number is already registered.'
      });
    }

    // Verify uploaded photo if present
    let photoUrl = null;
    if (req.file) {
      uploadedFilePath = req.file.path;
      const isValidImage = await verifyImageMagicBytes(uploadedFilePath);
      if (!isValidImage) {
        fs.unlinkSync(uploadedFilePath);
        return res.status(400).json({
          success: false,
          message: 'The uploaded file does not match an authentic image format (JPEG, PNG, WEBP).'
        });
      }
      photoUrl = `/uploads/${path.basename(uploadedFilePath)}`;
    }

    // Automatically calculate 1-month expiry date with accurate month-end clamping
    const expiryDate = calculateOneMonthExpiry(joiningDate);

    // Provision secure member credentials
    const nextSeqRow = db.prepare('SELECT MAX(id) as maxId FROM members').get();
    const nextId = (nextSeqRow?.maxId || 0) + 1;
    const memberCode = generateMemberCode(nextId + 1000);
    const temporaryPassword = generateSecureTemporaryPassword(10);
    const passwordHash = await hashPassword(temporaryPassword);

    // Run atomic transaction to create user account and member profile
    const insertTransaction = db.transaction(() => {
      // 1. Create User account (username set to phone number)
      const userResult = db.prepare(`
        INSERT INTO users (username, password_hash, role)
        VALUES (?, ?, 'member')
      `).run(phone, passwordHash);

      const userId = userResult.lastInsertRowid;

      // 2. Create Member profile
      const memberResult = db.prepare(`
        INSERT INTO members (member_code, user_id, full_name, phone, email, photo_url, joining_date, expiry_date)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `).run(memberCode, userId, fullName, phone, email, photoUrl, joiningDate, expiryDate);

      return {
        memberId: memberResult.lastInsertRowid,
        userId
      };
    });

    const { memberId } = insertTransaction();

    const createdMember = db.prepare('SELECT * FROM members WHERE id = ?').get(memberId);
    const statusInfo = evaluateMembershipStatus(createdMember.expiry_date);

    return res.status(201).json({
      success: true,
      message: 'Gym member registered successfully.',
      member: {
        ...createdMember,
        status: statusInfo.status,
        statusLabel: statusInfo.statusLabel,
        remainingDays: statusInfo.remainingDays,
        isExpiringSoon: statusInfo.isExpiringSoon,
        isExpired: statusInfo.isExpired,
        notificationMessage: statusInfo.notificationMessage
      },
      provisionedCredentials: {
        memberCode,
        loginIdentifier: phone,
        temporaryPassword,
        note: 'Provide these credentials to the member. They can log in with their Phone Number or Member ID.'
      }
    });
  } catch (err) {
    if (uploadedFilePath && fs.existsSync(uploadedFilePath)) {
      try { fs.unlinkSync(uploadedFilePath); } catch (e) {}
    }
    next(err);
  }
}

/**
 * List gym members with search, status filtering, and pagination (Admin only)
 */
export async function getMembers(req, res, next) {
  try {
    const search = sanitizeString(req.query.search || '');
    const filterStatus = req.query.status || 'all'; // all | active | expiring_soon | expired
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 10));
    const offset = (page - 1) * limit;

    let query = `
      SELECT m.*, u.username
      FROM members m
      JOIN users u ON m.user_id = u.id
    `;
    const params = [];

    if (search) {
      query += ` WHERE (m.full_name LIKE ? OR m.phone LIKE ? OR m.member_code LIKE ? OR m.email LIKE ?)`;
      const searchWildcard = `%${search}%`;
      params.push(searchWildcard, searchWildcard, searchWildcard, searchWildcard);
    }

    query += ` ORDER BY m.id DESC`;

    const allRows = db.prepare(query).all(...params);

    // Map dynamic status
    const mappedRows = allRows.map((m) => {
      const statusInfo = evaluateMembershipStatus(m.expiry_date);
      return {
        ...m,
        status: statusInfo.status,
        statusLabel: statusInfo.statusLabel,
        remainingDays: statusInfo.remainingDays,
        isExpiringSoon: statusInfo.isExpiringSoon,
        isExpired: statusInfo.isExpired,
        notificationMessage: statusInfo.notificationMessage
      };
    });

    // Apply status filter if not 'all'
    const filteredRows = filterStatus === 'all'
      ? mappedRows
      : mappedRows.filter((m) => m.status === filterStatus);

    const total = filteredRows.length;
    const paginated = filteredRows.slice(offset, offset + limit);

    return res.status(200).json({
      success: true,
      data: paginated,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit) || 1
      }
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Get individual member details by ID (Admin only)
 */
export async function getMemberById(req, res, next) {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      return res.status(400).json({ success: false, message: 'Invalid member ID.' });
    }

    const member = db.prepare(`
      SELECT m.*, u.username, u.created_at as account_created_at
      FROM members m
      JOIN users u ON m.user_id = u.id
      WHERE m.id = ?
    `).get(id);

    if (!member) {
      return res.status(404).json({
        success: false,
        message: 'Member record not found.'
      });
    }

    const statusInfo = evaluateMembershipStatus(member.expiry_date);

    return res.status(200).json({
      success: true,
      member: {
        ...member,
        status: statusInfo.status,
        statusLabel: statusInfo.statusLabel,
        remainingDays: statusInfo.remainingDays,
        isExpiringSoon: statusInfo.isExpiringSoon,
        isExpired: statusInfo.isExpired,
        notificationMessage: statusInfo.notificationMessage
      }
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Update member details (Admin only)
 */
export async function updateMember(req, res, next) {
  let uploadedFilePath = null;
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      return res.status(400).json({ success: false, message: 'Invalid member ID.' });
    }

    const existing = db.prepare('SELECT * FROM members WHERE id = ?').get(id);
    if (!existing) {
      if (req.file) fs.unlinkSync(req.file.path);
      return res.status(404).json({ success: false, message: 'Member not found.' });
    }

    const fullName = req.body.fullName ? sanitizeString(req.body.fullName) : existing.full_name;
    const phone = req.body.phone ? sanitizeString(req.body.phone) : existing.phone;
    const email = req.body.email !== undefined ? (req.body.email ? sanitizeString(req.body.email) : null) : existing.email;
    const joiningDate = req.body.joiningDate ? sanitizeString(req.body.joiningDate) : existing.joining_date;

    if (!fullName || fullName.length < 2) {
      return res.status(400).json({ success: false, message: 'Full name must be at least 2 characters.' });
    }

    if (!isValidPhone(phone)) {
      return res.status(400).json({ success: false, message: 'Invalid phone number format.' });
    }

    if (email && !isValidEmail(email)) {
      return res.status(400).json({ success: false, message: 'Invalid email address format.' });
    }

    // Check unique phone conflict with other members
    const phoneConflict = db.prepare('SELECT id FROM members WHERE phone = ? AND id != ?').get(phone, id);
    if (phoneConflict) {
      if (req.file) fs.unlinkSync(req.file.path);
      return res.status(409).json({ success: false, message: 'Another member already has this phone number.' });
    }

    // Photo handling
    let photoUrl = existing.photo_url;
    if (req.file) {
      uploadedFilePath = req.file.path;
      const isValidImage = await verifyImageMagicBytes(uploadedFilePath);
      if (!isValidImage) {
        fs.unlinkSync(uploadedFilePath);
        return res.status(400).json({ success: false, message: 'Invalid image format uploaded.' });
      }
      photoUrl = `/uploads/${path.basename(uploadedFilePath)}`;

      // Remove old photo file if it was a local upload
      if (existing.photo_url && existing.photo_url.startsWith('/uploads/')) {
        const oldFile = path.join(__dirname, '../../uploads', path.basename(existing.photo_url));
        if (fs.existsSync(oldFile)) {
          try { fs.unlinkSync(oldFile); } catch (e) {}
        }
      }
    }

    // Recalculate expiry date if joiningDate was updated
    let expiryDate = existing.expiry_date;
    if (joiningDate !== existing.joining_date) {
      expiryDate = calculateOneMonthExpiry(joiningDate);
    }

    // Atomic update
    const updateTx = db.transaction(() => {
      db.prepare(`
        UPDATE members
        SET full_name = ?, phone = ?, email = ?, photo_url = ?, joining_date = ?, expiry_date = ?, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `).run(fullName, phone, email, photoUrl, joiningDate, expiryDate, id);

      // Keep user login username synchronized with phone number
      db.prepare(`
        UPDATE users
        SET username = ?, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `).run(phone, existing.user_id);
    });

    updateTx();

    const updated = db.prepare('SELECT * FROM members WHERE id = ?').get(id);
    const statusInfo = evaluateMembershipStatus(updated.expiry_date);

    return res.status(200).json({
      success: true,
      message: 'Member details updated successfully.',
      member: {
        ...updated,
        status: statusInfo.status,
        statusLabel: statusInfo.statusLabel,
        remainingDays: statusInfo.remainingDays,
        isExpiringSoon: statusInfo.isExpiringSoon,
        isExpired: statusInfo.isExpired,
        notificationMessage: statusInfo.notificationMessage
      }
    });
  } catch (err) {
    if (uploadedFilePath && fs.existsSync(uploadedFilePath)) {
      try { fs.unlinkSync(uploadedFilePath); } catch (e) {}
    }
    next(err);
  }
}

/**
 * Delete a gym member (Admin only)
 */
export async function deleteMember(req, res, next) {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      return res.status(400).json({ success: false, message: 'Invalid member ID.' });
    }

    const member = db.prepare('SELECT * FROM members WHERE id = ?').get(id);
    if (!member) {
      return res.status(404).json({ success: false, message: 'Member not found.' });
    }

    // Delete photo file if exists
    if (member.photo_url && member.photo_url.startsWith('/uploads/')) {
      const filePath = path.join(__dirname, '../../uploads', path.basename(member.photo_url));
      if (fs.existsSync(filePath)) {
        try { fs.unlinkSync(filePath); } catch (e) {}
      }
    }

    // Delete user which cascade-deletes the member
    db.prepare('DELETE FROM users WHERE id = ?').run(member.user_id);

    return res.status(200).json({
      success: true,
      message: `Member ${member.full_name} (${member.member_code}) deleted successfully.`
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Reset member password and return new temporary password for admin handover
 */
export async function resetMemberPassword(req, res, next) {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      return res.status(400).json({ success: false, message: 'Invalid member ID.' });
    }

    const member = db.prepare('SELECT * FROM members WHERE id = ?').get(id);
    if (!member) {
      return res.status(404).json({ success: false, message: 'Member not found.' });
    }

    const newTempPassword = generateSecureTemporaryPassword(10);
    const passwordHash = await hashPassword(newTempPassword);

    db.prepare('UPDATE users SET password_hash = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?')
      .run(passwordHash, member.user_id);

    return res.status(200).json({
      success: true,
      message: 'Temporary password generated successfully.',
      temporaryPassword: newTempPassword,
      memberCode: member.member_code,
      loginIdentifier: member.phone
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Candidate / Member Panel Profile
 * STRICT IDOR PROTECTION:
 * Always fetches the logged-in member's own record from req.user.memberId / req.user.id.
 * No external ID or query parameter is accepted or trusted.
 */
export async function getMemberOwnProfile(req, res, next) {
  try {
    const member = db.prepare(`
      SELECT m.id, m.member_code, m.full_name, m.phone, m.email, m.photo_url, m.joining_date, m.expiry_date,
             u.username, u.created_at as member_since
      FROM members m
      JOIN users u ON m.user_id = u.id
      WHERE m.user_id = ?
    `).get(req.user.id);

    if (!member) {
      return res.status(404).json({
        success: false,
        message: 'Member profile could not be located.'
      });
    }

    const statusInfo = evaluateMembershipStatus(member.expiry_date);

    return res.status(200).json({
      success: true,
      profile: {
        id: member.id,
        memberCode: member.member_code,
        fullName: member.full_name,
        phone: member.phone,
        email: member.email || 'Not provided',
        photoUrl: member.photo_url,
        joiningDate: member.joining_date,
        expiryDate: member.expiry_date,
        memberSince: member.member_since,
        status: statusInfo.status,
        statusLabel: statusInfo.statusLabel,
        remainingDays: statusInfo.remainingDays,
        isExpiringSoon: statusInfo.isExpiringSoon,
        isExpired: statusInfo.isExpired,
        notificationMessage: statusInfo.notificationMessage
      }
    });
  } catch (err) {
    next(err);
  }
}
