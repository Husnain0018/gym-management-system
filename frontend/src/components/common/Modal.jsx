import React, { useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import { useGsapAnimations } from '../../hooks/useGsapAnimations';

export function Modal({ isOpen, onClose, title, children, maxWidth = 'max-w-lg', subtitle }) {
  const modalRef = useRef(null);
  const { animateModalIn } = useGsapAnimations();

  useEffect(() => {
    if (isOpen && modalRef.current) {
      animateModalIn(modalRef.current);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-obsidian-950/80 backdrop-blur-md overflow-y-auto">
      <div
        ref={modalRef}
        className={`w-full ${maxWidth} bg-obsidian-850 border border-borderDark-active rounded-xl shadow-glass-card overflow-hidden my-8`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-borderDark-hairline bg-obsidian-800/60">
          <div>
            <h3 className="text-lg font-display font-semibold text-white tracking-wide">{title}</h3>
            {subtitle && <p className="text-xs text-slate-400 mt-0.5">{subtitle}</p>}
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-obsidian-750 transition-colors"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}
