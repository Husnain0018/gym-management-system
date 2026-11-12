import React from 'react';
import { AlertTriangle, Clock, ArrowRight, Phone, Calendar } from 'lucide-react';
import { Badge } from '../common/Badge';
import { formatDisplayDate } from '../../utils/date';

export function ExpiryNotificationsCard({ notifications = [], onViewMember }) {
  if (!notifications || notifications.length === 0) {
    return (
      <div className="glass-panel rounded-xl p-6 border border-borderDark-hairline text-center">
        <div className="w-12 h-12 rounded-full bg-emeraldGlow/10 text-emeraldGlow flex items-center justify-center mx-auto mb-3">
          <Clock className="w-6 h-6" />
        </div>
        <h4 className="font-display font-medium text-white">No Immediate Expirations</h4>
        <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
          No members are within the 5-day expiration window. All active members have healthy subscription timelines.
        </p>
      </div>
    );
  }

  return (
    <div className="glass-panel rounded-xl border border-amberAlert/40 overflow-hidden shadow-glow-amber">
      {/* Header */}
      <div className="bg-amberAlert/10 border-b border-amberAlert/30 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-amberAlert/20 text-amber-300 flex items-center justify-center shrink-0">
            <AlertTriangle className="w-4 h-4 animate-pulse text-amber-400" />
          </div>
          <div>
            <h3 className="font-display font-semibold text-white text-base">
              5-Day Membership Expiration Warnings
            </h3>
            <p className="text-xs text-amber-200/80">
              {notifications.length} {notifications.length === 1 ? 'member requires' : 'members require'} renewal attention
            </p>
          </div>
        </div>
        <span className="text-xs font-mono px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
          5-Day Threshold
        </span>
      </div>

      {/* Notifications List */}
      <div className="divide-y divide-borderDark-hairline">
        {notifications.map((item) => (
          <div
            key={item.memberId}
            className="p-4 sm:p-5 hover:bg-obsidian-850/60 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4"
          >
            <div className="flex items-center gap-4">
              {/* Member Photo */}
              {item.photoUrl ? (
                <img
                  src={item.photoUrl}
                  alt={item.fullName}
                  className="w-12 h-12 rounded-full object-cover border-2 border-amberAlert/40 shrink-0"
                />
              ) : (
                <div className="w-12 h-12 rounded-full bg-obsidian-800 border-2 border-amberAlert/40 flex items-center justify-center text-slate-300 font-bold shrink-0">
                  {item.fullName.slice(0, 2).toUpperCase()}
                </div>
              )}

              <div>
                <div className="flex items-center gap-2">
                  <h4 className="font-semibold text-white text-sm sm:text-base">{item.fullName}</h4>
                  <span className="text-xs font-mono text-slate-400">({item.memberCode})</span>
                  <Badge status="expiring_soon" />
                </div>

                <p className="text-xs font-medium text-amber-300 mt-0.5">
                  ⚠️ {item.message}
                </p>

                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs font-mono text-slate-400 mt-1.5">
                  <span className="flex items-center gap-1">
                    <Phone className="w-3 h-3 text-slate-500" />
                    {item.phone}
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-slate-500" />
                    Joined: {formatDisplayDate(item.joiningDate)}
                  </span>
                  <span className="flex items-center gap-1 text-amber-300 font-medium">
                    <Clock className="w-3 h-3" />
                    Expires: {formatDisplayDate(item.expiryDate)} ({item.remainingDays} days left)
                  </span>
                </div>
              </div>
            </div>

            <button
              onClick={() => onViewMember && onViewMember(item.memberId)}
              className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-mono bg-obsidian-800 hover:bg-obsidian-750 text-slate-200 border border-borderDark-active hover:border-indigoVolt transition-colors shrink-0"
            >
              <span>View Details</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
