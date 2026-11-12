import React from 'react';
import { User, Phone, Mail, Calendar, Clock, Key, Edit, Trash2 } from 'lucide-react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';
import { formatDisplayDate } from '../../utils/date';

export function MemberDetailsModal({
  isOpen,
  onClose,
  member,
  onEdit,
  onResetPassword,
  onDelete
}) {
  if (!member) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Member Subscription Dossier"
      subtitle={`Dossier record for ${member.full_name} (${member.member_code})`}
      maxWidth="max-w-lg"
    >
      <div className="space-y-6">
        {/* Profile Header */}
        <div className="flex items-center gap-5 p-4 rounded-xl bg-obsidian-900 border border-borderDark-hairline">
          {member.photo_url ? (
            <img
              src={member.photo_url}
              alt={member.full_name}
              className="w-20 h-20 rounded-full object-cover border-2 border-indigoVolt/40 shadow-glow-indigo shrink-0"
            />
          ) : (
            <div className="w-20 h-20 rounded-full bg-obsidian-800 border-2 border-indigoVolt/40 flex items-center justify-center text-xl font-bold text-slate-300 shrink-0">
              {member.full_name.slice(0, 2).toUpperCase()}
            </div>
          )}

          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-bold text-white font-display">{member.full_name}</h3>
              <Badge status={member.status} />
            </div>
            <p className="text-xs font-mono text-indigoVolt font-semibold">
              ID: {member.member_code}
            </p>
            <p className="text-xs text-slate-400">
              {member.notificationMessage || (member.status === 'active' ? 'Membership Active' : 'Requires Review')}
            </p>
          </div>
        </div>

        {/* Detailed Attribute Matrix */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div className="p-3.5 rounded-lg bg-obsidian-900 border border-borderDark-hairline space-y-1">
            <span className="text-slate-400 font-mono uppercase text-[10px] flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5 text-slate-500" /> Phone Number
            </span>
            <p className="text-slate-100 font-medium font-mono text-sm">{member.phone}</p>
          </div>

          <div className="p-3.5 rounded-lg bg-obsidian-900 border border-borderDark-hairline space-y-1">
            <span className="text-slate-400 font-mono uppercase text-[10px] flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-slate-500" /> Email Address
            </span>
            <p className="text-slate-100 font-medium text-sm">
              {member.email || <span className="text-slate-500 italic">Not provided</span>}
            </p>
          </div>

          <div className="p-3.5 rounded-lg bg-obsidian-900 border border-borderDark-hairline space-y-1">
            <span className="text-slate-400 font-mono uppercase text-[10px] flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-slate-500" /> Joining Date
            </span>
            <p className="text-slate-100 font-medium font-mono text-sm">
              {formatDisplayDate(member.joining_date)}
            </p>
          </div>

          <div className="p-3.5 rounded-lg bg-obsidian-900 border border-borderDark-hairline space-y-1">
            <span className="text-slate-400 font-mono uppercase text-[10px] flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-slate-500" /> Expiry Date (+1 Mo)
            </span>
            <p className="text-emerald-300 font-semibold font-mono text-sm">
              {formatDisplayDate(member.expiry_date)}
            </p>
          </div>
        </div>

        {/* Days Remaining Callout */}
        <div className={`p-4 rounded-xl border flex items-center justify-between ${
          member.status === 'expired'
            ? 'bg-roseDanger/10 border-roseDanger/30 text-rose-300'
            : member.status === 'expiring_soon'
            ? 'bg-amberAlert/10 border-amberAlert/30 text-amber-300'
            : 'bg-emeraldGlow/10 border-emeraldGlow/30 text-emerald-300'
        }`}>
          <div>
            <p className="text-xs font-mono uppercase tracking-wider font-semibold">Remaining Days</p>
            <p className="text-2xl font-bold font-display mt-0.5">
              {member.remainingDays < 0
                ? `${Math.abs(member.remainingDays)} Days Expired`
                : `${member.remainingDays} Days Left`}
            </p>
          </div>
          <span className="text-xs font-mono px-3 py-1.5 rounded-full bg-obsidian-900 border border-current font-bold">
            {member.statusLabel || member.status}
          </span>
        </div>

        {/* Actions */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-borderDark-hairline">
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              icon={Key}
              onClick={() => onResetPassword(member)}
            >
              Reset Credentials
            </Button>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              icon={Edit}
              onClick={() => onEdit(member)}
            >
              Edit
            </Button>
          </div>

          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="danger"
              size="sm"
              icon={Trash2}
              onClick={() => onDelete(member)}
            >
              Delete
            </Button>
            <Button type="button" variant="secondary" size="sm" onClick={onClose}>
              Close
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
}
