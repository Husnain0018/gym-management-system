import { db } from '../config/database.js';
import { evaluateMembershipStatus } from '../utils/dateUtils.js';

/**
 * Returns Admin Dashboard metrics, statistics, and 5-day expiration notifications.
 */
export async function getDashboardStats(req, res, next) {
  try {
    const allMembers = db.prepare(`
      SELECT id, member_code, full_name, phone, email, photo_url, joining_date, expiry_date, created_at
      FROM members
      ORDER BY id DESC
    `).all();

    let totalMembers = allMembers.length;
    let activeCount = 0;
    let expiringSoonCount = 0;
    let expiredCount = 0;

    const expiringSoonList = [];
    const attentionList = [];

    // Evaluate each member dynamically
    const enrichedMembers = allMembers.map((m) => {
      const statusInfo = evaluateMembershipStatus(m.expiry_date);
      const enriched = {
        ...m,
        status: statusInfo.status,
        statusLabel: statusInfo.statusLabel,
        remainingDays: statusInfo.remainingDays,
        isExpiringSoon: statusInfo.isExpiringSoon,
        isExpired: statusInfo.isExpired,
        notificationMessage: statusInfo.notificationMessage
      };

      if (statusInfo.status === 'active') {
        activeCount++;
      } else if (statusInfo.status === 'expiring_soon') {
        expiringSoonCount++;
        expiringSoonList.push(enriched);
        attentionList.push(enriched);
      } else if (statusInfo.status === 'expired') {
        expiredCount++;
        attentionList.push(enriched);
      }

      return enriched;
    });

    // Recent 5 member registrations
    const recentMembers = enrichedMembers.slice(0, 5);

    // Sort expiring soon by shortest days remaining first
    expiringSoonList.sort((a, b) => a.remainingDays - b.remainingDays);

    return res.status(200).json({
      success: true,
      stats: {
        totalMembers,
        activeMembers: activeCount,
        expiringSoonMembers: expiringSoonCount,
        expiredMembers: expiredCount,
        attentionNeededCount: attentionList.length
      },
      notifications: expiringSoonList.map((m) => ({
        memberId: m.id,
        memberCode: m.member_code,
        fullName: m.full_name,
        phone: m.phone,
        photoUrl: m.photo_url,
        joiningDate: m.joining_date,
        expiryDate: m.expiry_date,
        remainingDays: m.remainingDays,
        status: m.status,
        message: `${m.full_name}'s membership will expire in ${m.remainingDays === 1 ? '1 day' : `${m.remainingDays} days`}.`
      })),
      recentMembers,
      membersNeedingAttention: attentionList.slice(0, 10)
    });
  } catch (err) {
    next(err);
  }
}
