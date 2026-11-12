import bcrypt from 'bcryptjs';
import crypto from 'crypto';

/**
 * Hash password with bcrypt
 * @param {string} password
 * @returns {Promise<string>}
 */
export async function hashPassword(password) {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

/**
 * Compare password with hash
 * @param {string} password
 * @param {string} hash
 * @returns {Promise<boolean>}
 */
export async function comparePassword(password, hash) {
  return bcrypt.compare(password, hash);
}

/**
 * Generates a cryptographically strong random password for member provisioning
 * @param {number} [length=10]
 * @returns {string}
 */
export function generateSecureTemporaryPassword(length = 10) {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$%';
  let password = '';
  const bytes = crypto.randomBytes(length);
  for (let i = 0; i < length; i++) {
    password += chars[bytes[i] % chars.length];
  }
  return password;
}

/**
 * Generates sequential or randomized member code (e.g. MEM-1042)
 * @param {number} nextId
 * @returns {string}
 */
export function generateMemberCode(nextId) {
  return `MEM-${String(nextId).padStart(4, '0')}`;
}

/**
 * Sanitizes generic string to strip dangerous HTML / script tags
 * @param {string} str
 * @returns {string}
 */
export function sanitizeString(str) {
  if (typeof str !== 'string') return '';
  return str
    .replace(/[<>]/g, '') // remove HTML tag brackets
    .trim();
}

/**
 * Validates phone numbers (standard international/local formats: 7-15 digits, optional +)
 * @param {string} phone
 * @returns {boolean}
 */
export function isValidPhone(phone) {
  if (!phone || typeof phone !== 'string') return false;
  const cleanPhone = phone.trim();
  const phoneRegex = /^[+]?[(]?[0-9]{1,4}[)]?[-\s./0-9]{6,15}$/;
  return phoneRegex.test(cleanPhone);
}

/**
 * Validates email format if provided
 * @param {string} email
 * @returns {boolean}
 */
export function isValidEmail(email) {
  if (!email) return true; // email is optional
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email.trim());
}
