import React, { useState, useEffect, useRef } from 'react';
import { User, Phone, Mail, Calendar, Clock, AlertTriangle, Key, ShieldCheck, Dumbbell, CheckCircle2, Lock } from 'lucide-react';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { Modal } from '../../components/common/Modal';
import { formatDisplayDate } from '../../utils/date';
import { api } from '../../services/api';
import { useGsapAnimations } from '../../hooks/useGsapAnimations';

export function MemberDashboardPage() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Change Password Modal State
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordMsg, setPasswordMsg] = useState(null);
  const [passwordError, setPasswordError] = useState(null);

  const bannerRef = useRef(null);
  const { animateWarningPulse, animateCardsIn } = useGsapAnimations();

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const res = await api.getMemberOwnProfile();
      if (res.success) {
        setProfile(res.profile);
        setError(null);
      }
    } catch (err) {
      setError(err.message || 'Failed to retrieve membership information.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  useEffect(() => {
    if (profile) {
      animateCardsIn('.member-card-stagger');
      if (profile.isExpiringSoon && bannerRef.current) {
        animateWarningPulse(bannerRef.current);
      }
    }
  }, [profile]);

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPasswordError(null);
    setPasswordMsg(null);

    if (newPassword !== confirmPassword) {
      setPasswordError('New password and confirmation do not match.');
      return;
    }

    if (newPassword.length < 6) {
      setPasswordError('New password must be at least 6 characters long.');
      return;
    }

    try {
      setPasswordLoading(true);
      const res = await api.changePassword({ currentPassword, newPassword });
      if (res.success) {
        setPasswordMsg('Password changed successfully.');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        setTimeout(() => setIsPasswordModalOpen(false), 2000);
      }
    } catch (err) {
      setPasswordError(err.message || 'Failed to update password.');
    } finally {
      setPasswordLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <Dumbbell className="w-8 h-8 text-emeraldGlow animate-bounce" />
          <span className="text-xs font-mono text-slate-400">Loading Member Portal...</span>
        </div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="max-w-xl mx-auto p-8 rounded-xl bg-obsidian-850 border border-borderDark-hairline text-center my-12">
        <AlertTriangle className="w-10 h-10 text-roseDanger mx-auto mb-3" />
        <h3 className="text-lg font-display font-semibold text-white">Membership Record Unavailable</h3>
        <p className="text-xs text-slate-400 mt-2">{error || 'Could not locate membership profile.'}</p>
        <Button variant="secondary" size="sm" className="mt-5" onClick={fetchProfile}>
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
      {/* Welcome Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-borderDark-hairline">
        <div>
          <span className="text-xs font-mono uppercase tracking-widest text-emerald-400 font-semibold">
            Member Active Session
          </span>
          <h1 className="text-3xl font-display font-bold text-white tracking-tight mt-1">
            Welcome back, {profile.fullName}
          </h1>
          <p className="text-xs font-mono text-slate-400 mt-1">
            Member ID: <span className="text-indigoVolt font-semibold">{profile.memberCode}</span>
          </p>
        </div>

        <Button
          variant="secondary"
          size="sm"
          icon={Key}
          onClick={() => {
            setPasswordError(null);
            setPasswordMsg(null);
            setIsPasswordModalOpen(true);
          }}
        >
          Change Password
        </Button>
      </div>

      {/* Prominent 5-Day Expiration / Status Notification Banner */}
      {profile.isExpiringSoon && (
        <div
          ref={bannerRef}
          className="p-5 rounded-xl bg-gradient-to-r from-amberAlert/25 to-amberAlert/10 border-2 border-amberAlert/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-glow-amber transition-all"
        >
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-amberAlert/30 text-amber-300 flex items-center justify-center shrink-0">
              <AlertTriangle className="w-6 h-6 animate-pulse text-amber-300" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white font-display">
                ⚠️ Attention: Your gym membership will expire in {profile.remainingDays === 1 ? '1 day' : `${profile.remainingDays} days`}!
              </h3>
              <p className="text-xs text-amber-200/90 mt-1">
                Your monthly membership cycle ends on{' '}
                <strong className="text-white font-mono">{formatDisplayDate(profile.expiryDate)}</strong>.
                Please visit the front desk or renew your membership to continue uninterrupted access.
              </p>
            </div>
          </div>
          <span className="text-xs font-mono px-3 py-1.5 rounded-full bg-amber-500/30 text-amber-200 border border-amber-400/40 shrink-0 font-bold self-start sm:self-auto">
            {profile.remainingDays} Days Left
          </span>
        </div>
      )}

      {profile.isExpired && (
        <div className="p-5 rounded-xl bg-roseDanger/20 border-2 border-roseDanger/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-glow-rose">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-roseDanger/30 text-rose-300 flex items-center justify-center shrink-0">
              <AlertTriangle className="w-6 h-6 text-roseDanger" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white font-display">
                Membership Expired
              </h3>
              <p className="text-xs text-rose-200 mt-1">
                Your monthly gym membership expired on{' '}
                <strong className="text-white font-mono">{formatDisplayDate(profile.expiryDate)}</strong> ({Math.abs(profile.remainingDays)} days ago).
                Please contact the gym administration to renew your membership.
              </p>
            </div>
          </div>
          <span className="text-xs font-mono px-3 py-1.5 rounded-full bg-rose-500/30 text-rose-200 border border-rose-400/40 shrink-0 font-bold self-start sm:self-auto">
            Expired
          </span>
        </div>
      )}

      {profile.status === 'active' && !profile.isExpiringSoon && (
        <div className="p-4 rounded-xl bg-emeraldGlow/10 border border-emeraldGlow/30 flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 text-emeraldGlow shrink-0" />
          <p className="text-xs text-emerald-200 font-mono">
            Your membership is in good standing with <strong className="text-white">{profile.remainingDays} days</strong> remaining in your current monthly cycle.
          </p>
        </div>
      )}

      {/* Main Profile & Membership Card */}
      <div className="member-card-stagger glass-panel-elevated rounded-2xl p-6 sm:p-8 border border-borderDark-active space-y-8">
        {/* Profile Header */}
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 pb-6 border-b border-borderDark-hairline">
          {profile.photoUrl ? (
            <img
              src={profile.photoUrl}
              alt={profile.fullName}
              className="w-28 h-28 rounded-2xl object-cover border-2 border-indigoVolt/40 shadow-glow-indigo shrink-0"
            />
          ) : (
            <div className="w-28 h-28 rounded-2xl bg-obsidian-800 border-2 border-indigoVolt/40 flex items-center justify-center text-3xl font-bold text-slate-300 shrink-0">
              {profile.fullName.slice(0, 2).toUpperCase()}
            </div>
          )}

          <div className="space-y-2 text-center sm:text-left flex-1">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2.5">
              <h2 className="text-2xl font-bold text-white font-display">{profile.fullName}</h2>
              <Badge status={profile.status} />
            </div>

            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 text-xs font-mono text-slate-400 pt-1">
              <span className="flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-slate-500" />
                {profile.phone}
              </span>
              <span className="flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-slate-500" />
                {profile.email}
              </span>
            </div>

            <p className="text-[11px] font-mono text-slate-500">
              Enrolled: {formatDisplayDate(profile.joiningDate)}
            </p>
          </div>
        </div>

        {/* Membership Details Matrix */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Joining Date */}
          <div className="p-4 rounded-xl bg-obsidian-900 border border-borderDark-hairline space-y-1">
            <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-indigoVolt" />
              Joining Date
            </span>
            <p className="text-base font-semibold text-white font-mono">
              {formatDisplayDate(profile.joiningDate)}
            </p>
            <p className="text-[10px] text-slate-500">Cycle start date</p>
          </div>

          {/* Expiry Date */}
          <div className="p-4 rounded-xl bg-obsidian-900 border border-borderDark-hairline space-y-1">
            <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-emeraldGlow" />
              Membership Expiry
            </span>
            <p className="text-base font-semibold text-emerald-300 font-mono">
              {formatDisplayDate(profile.expiryDate)}
            </p>
            <p className="text-[10px] text-slate-500">1 calendar month term</p>
          </div>

          {/* Remaining Days Counter */}
          <div className={`p-4 rounded-xl border space-y-1 ${
            profile.status === 'expired'
              ? 'bg-roseDanger/10 border-roseDanger/30 text-rose-300'
              : profile.status === 'expiring_soon'
              ? 'bg-amberAlert/10 border-amberAlert/30 text-amber-300'
              : 'bg-emeraldGlow/10 border-emeraldGlow/30 text-emerald-300'
          }`}>
            <span className="text-[10px] font-mono uppercase tracking-wider flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5" />
              Remaining Days
            </span>
            <p className="text-2xl font-bold font-display">
              {profile.remainingDays < 0
                ? `${Math.abs(profile.remainingDays)} Days Ago`
                : profile.remainingDays === 0
                ? 'Expires Today'
                : `${profile.remainingDays} Days Left`}
            </p>
            <p className="text-[10px] opacity-80">
              Calculated on server
            </p>
          </div>
        </div>

        {/* Security & Access Protection Info */}
        <div className="p-4 rounded-xl bg-obsidian-900/60 border border-borderDark-hairline flex items-center gap-3 text-xs font-mono text-slate-400">
          <ShieldCheck className="w-5 h-5 text-indigoVolt shrink-0" />
          <span>
            Protected Candidate Area: End-to-end authenticated session. Real-time server-side expiry calculations prevent stale credentials.
          </span>
        </div>
      </div>

      {/* Change Password Modal */}
      <Modal
        isOpen={isPasswordModalOpen}
        onClose={() => setIsPasswordModalOpen(false)}
        title="Update Account Password"
        subtitle="Set a secure new password for your member login account"
        maxWidth="max-w-md"
      >
        <form onSubmit={handleChangePassword} className="space-y-4">
          {passwordError && (
            <div className="p-3 rounded-lg bg-roseDanger/15 border border-roseDanger/30 text-rose-300 text-xs">
              {passwordError}
            </div>
          )}
          {passwordMsg && (
            <div className="p-3 rounded-lg bg-emeraldGlow/15 border border-emeraldGlow/30 text-emerald-300 text-xs">
              {passwordMsg}
            </div>
          )}

          <div>
            <label className="block text-xs font-mono uppercase tracking-wider text-slate-300 mb-1">
              Current Password
            </label>
            <input
              type="password"
              required
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-obsidian-900 border border-borderDark-hairline text-sm text-white focus:border-indigoVolt outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-mono uppercase tracking-wider text-slate-300 mb-1">
              New Password
            </label>
            <input
              type="password"
              required
              minLength={6}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-obsidian-900 border border-borderDark-hairline text-sm text-white focus:border-indigoVolt outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-mono uppercase tracking-wider text-slate-300 mb-1">
              Confirm New Password
            </label>
            <input
              type="password"
              required
              minLength={6}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-obsidian-900 border border-borderDark-hairline text-sm text-white focus:border-indigoVolt outline-none"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-borderDark-hairline">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setIsPasswordModalOpen(false)}
              disabled={passwordLoading}
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary" loading={passwordLoading}>
              Update Password
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
