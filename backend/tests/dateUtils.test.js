import { describe, it, expect } from 'vitest';
import {
  calculateOneMonthExpiry,
  isLeapYear,
  getDaysInMonth,
  getRemainingDays,
  evaluateMembershipStatus
} from '../src/utils/dateUtils.js';

describe('Date Logic & Membership Expiration Utility Tests', () => {
  describe('Leap Year & Month Days Calculation', () => {
    it('accurately identifies leap years and non-leap years', () => {
      expect(isLeapYear(2024)).toBe(true);
      expect(isLeapYear(2028)).toBe(true);
      expect(isLeapYear(2000)).toBe(true);

      expect(isLeapYear(2025)).toBe(false);
      expect(isLeapYear(2026)).toBe(false);
      expect(isLeapYear(2027)).toBe(false);
      expect(isLeapYear(1900)).toBe(false);
    });

    it('returns exact days in February for leap and non-leap years', () => {
      expect(getDaysInMonth(2024, 2)).toBe(29);
      expect(getDaysInMonth(2026, 2)).toBe(28);
    });

    it('returns 30 days for April, June, September, November', () => {
      expect(getDaysInMonth(2026, 4)).toBe(30);
      expect(getDaysInMonth(2026, 6)).toBe(30);
      expect(getDaysInMonth(2026, 9)).toBe(30);
      expect(getDaysInMonth(2026, 11)).toBe(30);
    });
  });

  describe('calculateOneMonthExpiry', () => {
    it('calculates standard 1-month addition correctly', () => {
      expect(calculateOneMonthExpiry('2026-11-12')).toBe('2026-12-12');
      expect(calculateOneMonthExpiry('2026-05-15')).toBe('2026-06-15');
      expect(calculateOneMonthExpiry('2026-12-01')).toBe('2027-01-01');
    });

    it('handles year rollover seamlessly (December to January)', () => {
      expect(calculateOneMonthExpiry('2026-12-15')).toBe('2027-01-15');
      expect(calculateOneMonthExpiry('2026-12-31')).toBe('2027-01-31');
    });

    it('handles month-end 31st clamped to 30th for 30-day months', () => {
      // March 31 -> April 30
      expect(calculateOneMonthExpiry('2026-03-31')).toBe('2026-04-30');
      // May 31 -> June 30
      expect(calculateOneMonthExpiry('2026-05-31')).toBe('2026-06-30');
      // August 31 -> September 30
      expect(calculateOneMonthExpiry('2026-08-31')).toBe('2026-09-30');
      // October 31 -> November 30
      expect(calculateOneMonthExpiry('2026-10-31')).toBe('2026-11-30');
    });

    it('handles January 31 in a non-leap year (clamped to Feb 28)', () => {
      expect(calculateOneMonthExpiry('2026-01-31')).toBe('2026-02-28');
      expect(calculateOneMonthExpiry('2025-01-30')).toBe('2025-02-28');
      expect(calculateOneMonthExpiry('2025-01-29')).toBe('2025-02-28');
    });

    it('handles January 31 in a leap year (clamped to Feb 29)', () => {
      expect(calculateOneMonthExpiry('2024-01-31')).toBe('2024-02-29');
      expect(calculateOneMonthExpiry('2028-01-31')).toBe('2028-02-29');
    });

    it('handles February 28/29 to March correctly', () => {
      expect(calculateOneMonthExpiry('2026-02-28')).toBe('2026-03-28');
      expect(calculateOneMonthExpiry('2024-02-29')).toBe('2024-03-29');
    });

    it('throws error on invalid date inputs', () => {
      expect(() => calculateOneMonthExpiry('invalid-date')).toThrow();
      expect(() => calculateOneMonthExpiry('2026-99-99')).toThrow();
    });
  });

  describe('Remaining Days & Status Evaluation', () => {
    it('calculates remaining calendar days accurately', () => {
      // Today: 2026-11-12, Expiry: 2026-11-17 -> 5 days
      expect(getRemainingDays('2026-11-17', '2026-11-12')).toBe(5);
      // Today: 2026-11-12, Expiry: 2026-11-12 -> 0 days
      expect(getRemainingDays('2026-11-12', '2026-11-12')).toBe(0);
      // Today: 2026-11-12, Expiry: 2026-11-10 -> -2 days
      expect(getRemainingDays('2026-11-10', '2026-11-12')).toBe(-2);
    });

    it('evaluates status as "active" when > 5 days remain', () => {
      const status = evaluateMembershipStatus('2026-11-20', '2026-11-12');
      expect(status.status).toBe('active');
      expect(status.remainingDays).toBe(8);
      expect(status.isExpiringSoon).toBe(false);
      expect(status.isExpired).toBe(false);
      expect(status.notificationMessage).toBeNull();
    });

    it('evaluates status as "expiring_soon" when exactly 5 days remain and formats 5-day warning', () => {
      const status = evaluateMembershipStatus('2026-11-17', '2026-11-12');
      expect(status.status).toBe('expiring_soon');
      expect(status.remainingDays).toBe(5);
      expect(status.isExpiringSoon).toBe(true);
      expect(status.isExpired).toBe(false);
      expect(status.notificationMessage).toBe('Membership will expire in 5 days.');
    });

    it('evaluates status as "expiring_soon" when 1 day remains', () => {
      const status = evaluateMembershipStatus('2026-11-13', '2026-11-12');
      expect(status.status).toBe('expiring_soon');
      expect(status.remainingDays).toBe(1);
      expect(status.notificationMessage).toBe('Membership will expire in 1 day.');
    });

    it('evaluates status as "expiring_soon" on the expiry day (0 days left)', () => {
      const status = evaluateMembershipStatus('2026-11-12', '2026-11-12');
      expect(status.status).toBe('expiring_soon');
      expect(status.remainingDays).toBe(0);
      expect(status.notificationMessage).toBe('Membership expires today.');
    });

    it('evaluates status as "expired" when remaining days < 0', () => {
      const status = evaluateMembershipStatus('2026-11-09', '2026-11-12');
      expect(status.status).toBe('expired');
      expect(status.remainingDays).toBe(-3);
      expect(status.isExpiringSoon).toBe(false);
      expect(status.isExpired).toBe(true);
      expect(status.notificationMessage).toBe('Membership expired 3 days ago.');
    });
  });
});
