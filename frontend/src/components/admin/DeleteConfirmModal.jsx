import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';

export function DeleteConfirmModal({ isOpen, onClose, member, onConfirm, loading = false }) {
  if (!member) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Confirm Member Deletion"
      maxWidth="max-w-md"
    >
      <div className="space-y-4">
        <div className="p-4 rounded-xl bg-roseDanger/15 border border-roseDanger/30 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-roseDanger shrink-0 mt-0.5" />
          <div className="text-xs text-rose-200 space-y-1">
            <p className="font-semibold text-rose-100">
              Are you sure you want to permanently delete {member.full_name}?
            </p>
            <p>
              This action will remove their membership record, profile photo, and associated login account ({member.phone}). This cannot be undone.
            </p>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-borderDark-hairline">
          <Button type="button" variant="secondary" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button
            type="button"
            variant="danger"
            onClick={() => onConfirm(member.id)}
            loading={loading}
          >
            Permanently Delete
          </Button>
        </div>
      </div>
    </Modal>
  );
}
