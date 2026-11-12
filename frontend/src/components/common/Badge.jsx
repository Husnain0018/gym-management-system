import React from 'react';
import { getStatusBadgeConfig } from '../../utils/date';

export function Badge({ status, label, className = '' }) {
  if (status) {
    const config = getStatusBadgeConfig(status);
    return (
      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-mono font-medium ${config.bg} ${className}`}>
        <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
        <span>{label || config.label}</span>
      </span>
    );
  }

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-mono font-medium bg-slate-800 text-slate-300 border border-slate-700 ${className}`}>
      {label}
    </span>
  );
}
