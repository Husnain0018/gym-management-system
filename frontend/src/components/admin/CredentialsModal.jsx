import React, { useState } from 'react';
import { Copy, Check, Key, ShieldCheck, User } from 'lucide-react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';

export function CredentialsModal({ isOpen, onClose, credentials, memberName }) {
  const [copied, setCopied] = useState(false);

  if (!credentials) return null;

  const handleCopy = () => {
    const textToCopy = `FitHub Pro — Member Login Credentials\nMember: ${memberName || 'Member'}\nMember ID: ${credentials.memberCode}\nLogin Identifier (Phone): ${credentials.loginIdentifier}\nTemporary Password: ${credentials.temporaryPassword}\n\nPlease log in at the member portal and change your password upon first access.`;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Member Provisioned Credentials"
      subtitle="Initial account access details generated for candidate"
      maxWidth="max-w-md"
    >
      <div className="space-y-4">
        <div className="p-4 rounded-xl bg-emeraldGlow/10 border border-emeraldGlow/30 flex items-start gap-3">
          <ShieldCheck className="w-5 h-5 text-emeraldGlow shrink-0 mt-0.5" />
          <p className="text-xs text-emerald-200">
            Account successfully provisioned. Because email is optional, provide these login credentials to the member directly.
          </p>
        </div>

        {/* Credentials Display Card */}
        <div className="p-4 rounded-xl bg-obsidian-900 border border-borderDark-active space-y-3 font-mono text-xs">
          <div className="flex items-center justify-between pb-2 border-b border-borderDark-hairline">
            <span className="text-slate-400">Member Code:</span>
            <span className="font-semibold text-white">{credentials.memberCode}</span>
          </div>

          <div className="flex items-center justify-between pb-2 border-b border-borderDark-hairline">
            <span className="text-slate-400">Login ID / Phone:</span>
            <span className="font-semibold text-indigo-300">{credentials.loginIdentifier}</span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-slate-400">Temporary Password:</span>
            <span className="px-2 py-1 rounded bg-obsidian-800 border border-borderDark-hairline text-emerald-300 font-bold select-all">
              {credentials.temporaryPassword}
            </span>
          </div>
        </div>

        <p className="text-[11px] text-slate-400">
          The member can log into the Member Panel using either their Phone Number or Member ID.
        </p>

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-borderDark-hairline">
          <Button
            type="button"
            variant="emerald"
            onClick={handleCopy}
            icon={copied ? Check : Copy}
          >
            {copied ? 'Copied to Clipboard!' : 'Copy Credentials'}
          </Button>
          <Button type="button" variant="secondary" onClick={onClose}>
            Done
          </Button>
        </div>
      </div>
    </Modal>
  );
}
