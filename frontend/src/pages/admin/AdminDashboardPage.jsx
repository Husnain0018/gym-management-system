import React, { useEffect, useState, useRef } from 'react';
import { Users, UserCheck, AlertTriangle, UserX, Clock, UserPlus, RefreshCw, ArrowRight } from 'lucide-react';
import { StatCard } from '../../components/admin/StatCard';
import { ExpiryNotificationsCard } from '../../components/admin/ExpiryNotificationsCard';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { formatDisplayDate } from '../../utils/date';
import { api } from '../../services/api';
import { useGsapAnimations } from '../../hooks/useGsapAnimations';

export function AdminDashboardPage({ onOpenAddMember, onViewMember, onNavigateMembers }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const containerRef = useRef(null);
  const { animateCardsIn } = useGsapAnimations();

  const fetchDashboardData = async (isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);
      const res = await api.getDashboardStats();
      if (res.success) {
        setData(res);
        setError(null);
      }
    } catch (err) {
      setError(err.message || 'Failed to load dashboard metrics.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  useEffect(() => {
    if (!loading && data) {
      animateCardsIn('.stat-card-stagger');
    }
  }, [loading, data]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="flex flex-col items-center gap-3">
          <RefreshCw className="w-8 h-8 text-indigoVolt animate-spin" />
          <span className="text-xs font-mono text-slate-400">Loading Gym Telemetry...</span>
        </div>
      </div>
    );
  }

  const { stats, notifications, recentMembers, membersNeedingAttention } = data || {
    stats: { totalMembers: 0, activeMembers: 0, expiringSoonMembers: 0, expiredMembers: 0, attentionNeededCount: 0 },
    notifications: [],
    recentMembers: [],
    membersNeedingAttention: []
  };

  return (
    <div ref={containerRef} className="space-y-8">
      {/* Page Title & Quick Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-borderDark-hairline">
        <div>
          <h1 className="text-2xl sm:text-3xl font-display font-bold text-white tracking-tight">
            Club Executive Telemetry
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 font-mono">
            Real-time membership oversight & automatic 1-month lifecycle tracking
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="secondary"
            size="sm"
            icon={RefreshCw}
            onClick={() => fetchDashboardData(true)}
            loading={refreshing}
          >
            Refresh
          </Button>
          <Button
            variant="primary"
            size="sm"
            icon={UserPlus}
            onClick={onOpenAddMember}
          >
            Add Member
          </Button>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-roseDanger/15 border border-roseDanger/30 text-rose-300 text-sm">
          {error}
        </div>
      )}

      {/* Top 4 Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          className="stat-card-stagger"
          title="Total Registered Members"
          value={stats.totalMembers}
          icon={Users}
          accent="indigo"
          subtitle="All-time membership directory"
        />
        <StatCard
          className="stat-card-stagger"
          title="Active Members"
          value={stats.activeMembers}
          icon={UserCheck}
          accent="emerald"
          subtitle="Currently valid access (> 5 days)"
        />
        <StatCard
          className="stat-card-stagger"
          title="Expiring Soon (5 Days)"
          value={stats.expiringSoonMembers}
          icon={AlertTriangle}
          accent="amber"
          subtitle="Warning window threshold active"
        />
        <StatCard
          className="stat-card-stagger"
          title="Expired Memberships"
          value={stats.expiredMembers}
          icon={UserX}
          accent="rose"
          subtitle="Overdue for renewal"
        />
      </div>

      {/* 5-Day Expiration Notifications Module */}
      <ExpiryNotificationsCard
        notifications={notifications}
        onViewMember={onViewMember}
      />

      {/* Two Column Grid: Recent Registrations & Attention Needed */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Registrations */}
        <div className="glass-panel rounded-xl border border-borderDark-hairline p-5">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-borderDark-hairline">
            <h3 className="font-display font-semibold text-white text-base">
              Recent Registrations
            </h3>
            <button
              onClick={() => onNavigateMembers('all')}
              className="text-xs font-mono text-indigoVolt hover:text-indigoVolt-hover flex items-center gap-1 transition-colors"
            >
              <span>View All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {recentMembers.length === 0 ? (
            <p className="text-xs text-slate-500 py-6 text-center font-mono">
              No recent member registrations recorded.
            </p>
          ) : (
            <div className="space-y-3">
              {recentMembers.map((m) => (
                <div
                  key={m.id}
                  onClick={() => onViewMember(m.id)}
                  className="flex items-center justify-between p-3 rounded-lg bg-obsidian-900/60 hover:bg-obsidian-850 border border-borderDark-hairline cursor-pointer transition-all"
                >
                  <div className="flex items-center gap-3">
                    {m.photo_url ? (
                      <img
                        src={m.photo_url}
                        alt={m.full_name}
                        className="w-9 h-9 rounded-full object-cover border border-borderDark-active"
                      />
                    ) : (
                      <div className="w-9 h-9 rounded-full bg-obsidian-800 border border-borderDark-active flex items-center justify-center text-xs font-bold text-slate-300">
                        {m.full_name.slice(0, 2).toUpperCase()}
                      </div>
                    )}
                    <div>
                      <p className="text-sm font-medium text-white">{m.full_name}</p>
                      <p className="text-[11px] font-mono text-slate-400">
                        Joined {formatDisplayDate(m.joining_date)}
                      </p>
                    </div>
                  </div>
                  <Badge status={m.status} />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Members Needing Attention */}
        <div className="glass-panel rounded-xl border border-borderDark-hairline p-5">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-borderDark-hairline">
            <h3 className="font-display font-semibold text-white text-base flex items-center gap-2">
              <span>Members Needing Attention</span>
              <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-amberAlert/20 text-amber-300 border border-amberAlert/30">
                {stats.attentionNeededCount}
              </span>
            </h3>
            <button
              onClick={() => onNavigateMembers('expiring_soon')}
              className="text-xs font-mono text-amber-300 hover:text-amber-200 flex items-center gap-1 transition-colors"
            >
              <span>Manage Expirations</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {membersNeedingAttention.length === 0 ? (
            <p className="text-xs text-slate-500 py-6 text-center font-mono">
              All member accounts are healthy. No immediate attention needed.
            </p>
          ) : (
            <div className="space-y-3">
              {membersNeedingAttention.slice(0, 5).map((m) => (
                <div
                  key={m.id}
                  onClick={() => onViewMember(m.id)}
                  className="flex items-center justify-between p-3 rounded-lg bg-obsidian-900/60 hover:bg-obsidian-850 border border-borderDark-hairline cursor-pointer transition-all"
                >
                  <div className="flex items-center gap-3">
                    {m.photo_url ? (
                      <img
                        src={m.photo_url}
                        alt={m.full_name}
                        className="w-9 h-9 rounded-full object-cover border border-borderDark-active"
                      />
                    ) : (
                      <div className="w-9 h-9 rounded-full bg-obsidian-800 border border-borderDark-active flex items-center justify-center text-xs font-bold text-slate-300">
                        {m.full_name.slice(0, 2).toUpperCase()}
                      </div>
                    )}
                    <div>
                      <p className="text-sm font-medium text-white">{m.full_name}</p>
                      <p className="text-[11px] font-mono text-slate-400">
                        {m.phone}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge status={m.status} />
                    <p className="text-[10px] font-mono text-slate-400 mt-1">
                      {m.remainingDays < 0 ? `${Math.abs(m.remainingDays)}d overdue` : `${m.remainingDays}d left`}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
