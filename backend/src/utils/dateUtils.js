/**
 * Date Utility Module for Membership Operations
 * Handles exact calendar month calculation, month-end edge cases,
 * leap years, remaining days, and dynamic membership status determination.
 */

/**
 * Checks if a given year is a leap year.
 * @param {number} year
 * @returns {boolean}
 */
export function isLeapYear(year) {
  return (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0);
}

/**
 * Returns the number of days in a specific month of a specific year.
 * @param {number} year
 * @param {number} month 1-12
 * @returns {number}
 */
export function getDaysInMonth(year, month) {
  switch (month) {
    case 2:
      return isLeapYear(year) ? 29 : 28;
    case 4:
    case 6:
    case 9:
    case 11:
      return 30;
    default:
      return 31;
  }
}

/**
 * Calculates the exact expiry date: exactly ONE calendar month after the joining date.
 * Accurately clamps month-end dates (e.g. Jan 31 -> Feb 28/29, Mar 31 -> Apr 30).
 *
 * @param {string|Date} joiningDateInput - YYYY-MM-DD string or Date object
 * @returns {string} Expiry date formatted as 'YYYY-MM-DD'
 */
export function calculateOneMonthExpiry(joiningDateInput) {
  let dateStr = '';
  if (joiningDateInput instanceof Date) {
    const y = joiningDateInput.getFullYear();
    const m = String(joiningDateInput.getMonth() + 1).padStart(2, '0');
    const d = String(joiningDateInput.getDate()).padStart(2, '0');
    dateStr = `${y}-${m}-${d}`;
  } else if (typeof joiningDateInput === 'string') {
    dateStr = joiningDateInput.trim().split('T')[0];
  } else {
    throw new Error('Invalid joining date provided');
  }

  const parts = dateStr.split('-');
  if (parts.length !== 3) {
    throw new Error('Invalid date format. Expected YYYY-MM-DD');
  }

  const year = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10);
  const day = parseInt(parts[2], 10);

  if (isNaN(year) || isNaN(month) || isNaN(day) || month < 1 || month > 12 || day < 1 || day > 31) {
    throw new Error('Invalid date values in joining date');
  }

  // Advance by exactly 1 calendar month
  let nextYear = year;
  let nextMonth = month + 1;
  if (nextMonth > 12) {
    nextYear += 1;
    nextMonth = 1;
  }

  // Handle month-end clamping (e.g., Jan 31 -> Feb 28 or 29)
  const maxDaysInNextMonth = getDaysInMonth(nextYear, nextMonth);
  const nextDay = Math.min(day, maxDaysInNextMonth);

  const formattedMonth = String(nextMonth).padStart(2, '0');
  const formattedDay = String(nextDay).padStart(2, '0');

  return `${nextYear}-${formattedMonth}-${formattedDay}`;
}

/**
 * Formats a Date object to YYYY-MM-DD in local time
 * @param {Date} [date]
 * @returns {string}
 */
export function formatDate(date = new Date()) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/**
 * Calculates remaining calendar days between today and expiryDate.
 *
 * @param {string} expiryDateStr - 'YYYY-MM-DD'
 * @param {string} [referenceDateStr] - Optional reference date 'YYYY-MM-DD' (defaults to today)
 * @returns {number} Days remaining (positive: future, 0: expires today, negative: expired)
 */
export function getRemainingDays(expiryDateStr, referenceDateStr) {
  const ref = referenceDateStr ? referenceDateStr : formatDate(new Date());
  
  const [expY, expM, expD] = expiryDateStr.split('-').map(Number);
  const [refY, refM, refD] = ref.split('-').map(Number);

  // Use UTC to prevent daylight saving time / timezone discrepancies
  const utcExpiry = Date.UTC(expY, expM - 1, expD);
  const utcRef = Date.UTC(refY, refM - 1, refD);

  const diffMs = utcExpiry - utcRef;
  const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));
  return diffDays;
}

/**
 * Determines current membership status and notification details.
 * - Active: > 5 days remaining
 * - Expiring Soon: 0 <= remainingDays <= 5 days
 * - Expired: remainingDays < 0
 *
 * @param {string} expiryDateStr - 'YYYY-MM-DD'
 * @param {string} [referenceDateStr] - 'YYYY-MM-DD'
 * @returns {{
 *   status: 'active' | 'expiring_soon' | 'expired',
 *   statusLabel: string,
 *   remainingDays: number,
 *   isExpiringSoon: boolean,
 *   isExpired: boolean,
 *   notificationMessage: string|null
 * }}
 */
export function evaluateMembershipStatus(expiryDateStr, referenceDateStr) {
  const remainingDays = getRemainingDays(expiryDateStr, referenceDateStr);

  if (remainingDays < 0) {
    const daysAgo = Math.abs(remainingDays);
    return {
      status: 'expired',
      statusLabel: 'Expired',
      remainingDays,
      isExpiringSoon: false,
      isExpired: true,
      notificationMessage: `Membership expired ${daysAgo === 1 ? '1 day ago' : `${daysAgo} days ago`}.`
    };
  }

  if (remainingDays <= 5) {
    let msg = '';
    if (remainingDays === 0) {
      msg = 'Membership expires today.';
    } else if (remainingDays === 1) {
      msg = 'Membership will expire in 1 day.';
    } else {
      msg = `Membership will expire in ${remainingDays} days.`;
    }

    return {
      status: 'expiring_soon',
      statusLabel: 'Expiring Soon',
      remainingDays,
      isExpiringSoon: true,
      isExpired: false,
      notificationMessage: msg
    };
  }

  return {
    status: 'active',
    statusLabel: 'Active',
    remainingDays,
    isExpiringSoon: false,
    isExpired: false,
    notificationMessage: null
  };
}
