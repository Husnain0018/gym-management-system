/**
 * Frontend Date Formatting and Helper Utilities
 */

/**
 * Format YYYY-MM-DD to human readable string (e.g. "12 Nov 2026")
 * @param {string} dateStr - 'YYYY-MM-DD'
 * @returns {string}
 */
export function formatDisplayDate(dateStr) {
  if (!dateStr) return 'N/A';
  try {
    const [year, month, day] = dateStr.split('T')[0].split('-').map(Number);
    if (!year || !month || !day) return dateStr;
    const date = new Date(year, month - 1, day);
    return date.toLocaleDateString('en-US', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  } catch (e) {
    return dateStr;
  }
}

/**
 * Frontend preview calculation of 1 calendar month expiry
 * Used for live form preview when admin enters a joining date
 * @param {string} dateStr - 'YYYY-MM-DD'
 * @returns {string}
 */
export function previewOneMonthExpiry(dateStr) {
  if (!dateStr || !/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return '';
  const [year, month, day] = dateStr.split('-').map(Number);
  let nextYear = year;
  let nextMonth = month + 1;
  if (nextMonth > 12) {
    nextYear += 1;
    nextMonth = 1;
  }

  // Days in next month
  const isLeap = (nextYear % 4 === 0 && nextYear % 100 !== 0) || (nextYear % 400 === 0);
  let maxDays = 31;
  if (nextMonth === 2) {
    maxDays = isLeap ? 29 : 28;
  } else if ([4, 6, 9, 11].includes(nextMonth)) {
    maxDays = 30;
  }

  const clampedDay = Math.min(day, maxDays);
  return `${nextYear}-${String(nextMonth).padStart(2, '0')}-${String(clampedDay).padStart(2, '0')}`;
}

/**
 * Get status badge style class
 */
export function getStatusBadgeConfig(status) {
  switch (status) {
    case 'active':
      return {
        bg: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30',
        dot: 'bg-emerald-400',
        label: 'Active'
      };
    case 'expiring_soon':
      return {
        bg: 'bg-amber-500/15 text-amber-300 border border-amber-500/40',
        dot: 'bg-amber-400 animate-pulse',
        label: 'Expiring Soon'
      };
    case 'expired':
      return {
        bg: 'bg-rose-500/15 text-rose-400 border border-rose-500/40',
        dot: 'bg-rose-400',
        label: 'Expired'
      };
    default:
      return {
        bg: 'bg-slate-700/30 text-slate-300 border border-slate-700',
        dot: 'bg-slate-400',
        label: status || 'Unknown'
      };
  }
}
