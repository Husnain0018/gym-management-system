import React, { useState, useEffect } from 'react';
import { Upload, Calendar, Phone, Mail, User, Sparkles, AlertCircle } from 'lucide-react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { previewOneMonthExpiry, formatDisplayDate } from '../../utils/date';
import { api } from '../../services/api';

export function MemberFormModal({ isOpen, onClose, memberToEdit = null, onSuccess }) {
  const isEditing = !!memberToEdit;

  // Form State
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [joiningDate, setJoiningDate] = useState('');
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);

  // Submission & Validation State
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Initialize form
  useEffect(() => {
    if (isOpen) {
      if (memberToEdit) {
        setFullName(memberToEdit.full_name || '');
        setPhone(memberToEdit.phone || '');
        setEmail(memberToEdit.email || '');
        setJoiningDate(memberToEdit.joining_date || '');
        setPhotoPreview(memberToEdit.photo_url || null);
        setPhotoFile(null);
      } else {
        const today = new Date().toISOString().split('T')[0];
        setFullName('');
        setPhone('');
        setEmail('');
        setJoiningDate(today);
        setPhotoPreview(null);
        setPhotoFile(null);
      }
      setError(null);
    }
  }, [isOpen, memberToEdit]);

  // Live auto-calculated 1 calendar month expiry date
  const calculatedExpiry = previewOneMonthExpiry(joiningDate);

  const handlePhotoChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError('Photo size exceeds 5MB limit. Please choose a smaller image.');
        return;
      }
      setPhotoFile(file);
      setPhotoPreview(URL.createObjectURL(file));
      setError(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!fullName.trim()) {
      setError('Full Name is required.');
      return;
    }

    if (!phone.trim()) {
      setError('Phone Number is required.');
      return;
    }

    if (!joiningDate) {
      setError('Joining Date is required.');
      return;
    }

    try {
      setLoading(true);

      const formData = new FormData();
      formData.append('fullName', fullName.trim());
      formData.append('phone', phone.trim());
      if (email.trim()) formData.append('email', email.trim());
      formData.append('joiningDate', joiningDate);
      if (photoFile) {
        formData.append('photo', photoFile);
      }

      if (isEditing) {
        const res = await api.updateMember(memberToEdit.id, formData);
        onSuccess(res.member, null);
      } else {
        const res = await api.createMember(formData);
        onSuccess(res.member, res.provisionedCredentials);
      }

      onClose();
    } catch (err) {
      setError(err.message || 'Operation failed. Please verify the inputs.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? 'Edit Gym Member' : 'Register New Gym Member'}
      subtitle={
        isEditing
          ? 'Update member profile and subscription parameters'
          : 'Membership duration will be automatically calculated as 1 calendar month'
      }
      maxWidth="max-w-xl"
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        {error && (
          <div className="p-3.5 rounded-lg bg-roseDanger/15 border border-roseDanger/40 flex items-start gap-3 text-rose-300 text-xs">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Photo Upload Section */}
        <div>
          <label className="block text-xs font-mono uppercase tracking-wider text-slate-300 mb-2">
            Profile Photo
          </label>
          <div className="flex items-center gap-4">
            <div className="relative w-16 h-16 rounded-full overflow-hidden bg-obsidian-800 border-2 border-borderDark-active shrink-0 flex items-center justify-center">
              {photoPreview ? (
                <img src={photoPreview} alt="Preview" className="w-full h-full object-cover" />
              ) : (
                <User className="w-7 h-7 text-slate-500" />
              )}
            </div>
            <div className="flex-1">
              <label className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-obsidian-800 hover:bg-obsidian-750 text-slate-200 text-xs font-mono border border-borderDark-active cursor-pointer transition-colors">
                <Upload className="w-3.5 h-3.5 text-indigoVolt" />
                <span>Choose Image (JPG, PNG, WEBP)</span>
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handlePhotoChange}
                  className="hidden"
                />
              </label>
              <p className="text-[11px] text-slate-500 mt-1">
                Max 5MB. Verified for security on server.
              </p>
            </div>
          </div>
        </div>

        {/* Full Name */}
        <div>
          <label className="block text-xs font-mono uppercase tracking-wider text-slate-300 mb-1.5">
            Full Name <span className="text-indigoVolt">*</span>
          </label>
          <div className="relative">
            <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="e.g. Kashif Ali"
              className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-obsidian-900 border border-borderDark-hairline focus:border-indigoVolt focus:ring-1 focus:ring-indigoVolt text-sm text-white placeholder-slate-500 transition-all outline-none"
            />
          </div>
        </div>

        {/* Phone & Email */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-mono uppercase tracking-wider text-slate-300 mb-1.5">
              Phone Number <span className="text-indigoVolt">*</span>
            </label>
            <div className="relative">
              <Phone className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+92 300 1234567"
                className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-obsidian-900 border border-borderDark-hairline focus:border-indigoVolt focus:ring-1 focus:ring-indigoVolt text-sm text-white placeholder-slate-500 transition-all outline-none"
              />
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              Used as primary member login identifier.
            </p>
          </div>

          <div>
            <label className="block text-xs font-mono uppercase tracking-wider text-slate-300 mb-1.5">
              Email Address <span className="text-slate-500 font-normal">(Optional)</span>
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="optional@example.com"
                className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-obsidian-900 border border-borderDark-hairline focus:border-indigoVolt focus:ring-1 focus:ring-indigoVolt text-sm text-white placeholder-slate-500 transition-all outline-none"
              />
            </div>
          </div>
        </div>

        {/* Dates & Auto-Calculation Preview */}
        <div className="p-4 rounded-xl bg-obsidian-900 border border-borderDark-active space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono uppercase tracking-wider text-indigo-300 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-indigoVolt" />
              Automatic Expiration Engine
            </span>
            <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-indigoVolt/10 text-indigoVolt border border-indigoVolt/20">
              1 Calendar Month
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Joining Date Input */}
            <div>
              <label className="block text-xs font-mono text-slate-400 mb-1">
                Joining Date (Required)
              </label>
              <div className="relative">
                <Calendar className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="date"
                  required
                  value={joiningDate}
                  onChange={(e) => setJoiningDate(e.target.value)}
                  className="w-full pl-10 pr-3 py-2 rounded-lg bg-obsidian-850 border border-borderDark-hairline focus:border-indigoVolt text-sm text-white transition-all outline-none"
                />
              </div>
            </div>

            {/* Calculated Expiry Preview */}
            <div>
              <label className="block text-xs font-mono text-slate-400 mb-1">
                Auto-Calculated Expiry Date
              </label>
              <div className="flex items-center h-[38px] px-3.5 rounded-lg bg-emeraldGlow/10 border border-emeraldGlow/30 text-emerald-300 font-mono text-sm font-semibold">
                {calculatedExpiry ? (
                  <span>{formatDisplayDate(calculatedExpiry)}</span>
                ) : (
                  <span className="text-slate-500 font-normal">Select joining date</span>
                )}
              </div>
            </div>
          </div>
          <p className="text-[11px] text-slate-400">
            Engine automatically compensates for variable month lengths (28, 29, 30, and 31 days) and leap years.
          </p>
        </div>

        {/* Form Actions */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-borderDark-hairline">
          <Button type="button" variant="secondary" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" loading={loading}>
            {isEditing ? 'Save Changes' : 'Register Member'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
