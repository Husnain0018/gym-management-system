import React from 'react';

export function StatCard({ title, value, icon: Icon, accent = 'indigo', subtitle, className = '' }) {
  const accents = {
    indigo: {
      border: 'border-indigoVolt/30',
      iconBg: 'bg-indigoVolt/10 text-indigoVolt',
      glow: 'hover:shadow-glow-indigo'
    },
    emerald: {
      border: 'border-emeraldGlow/30',
      iconBg: 'bg-emeraldGlow/10 text-emeraldGlow',
      glow: 'hover:shadow-glow-emerald'
    },
    amber: {
      border: 'border-amberAlert/30',
      iconBg: 'bg-amberAlert/10 text-amberAlert',
      glow: 'hover:shadow-glow-amber'
    },
    rose: {
      border: 'border-roseDanger/30',
      iconBg: 'bg-roseDanger/10 text-roseDanger',
      glow: 'hover:shadow-glow-rose'
    }
  };

  const style = accents[accent] || accents.indigo;

  return (
    <div
      className={`stat-card glass-panel p-5 rounded-xl border ${style.border} transition-all duration-300 ${style.glow} ${className}`}
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-mono uppercase tracking-wider text-slate-400">{title}</span>
        <div className={`p-2.5 rounded-lg ${style.iconBg}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
      <div className="mt-3">
        <span className="text-3xl font-display font-bold text-white tracking-tight">{value}</span>
        {subtitle && (
          <p className="text-xs font-mono text-slate-400 mt-1">{subtitle}</p>
        )}
      </div>
    </div>
  );
}
