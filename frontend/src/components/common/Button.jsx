import React from 'react';
import { Loader2 } from 'lucide-react';

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  loading = false,
  disabled = false,
  icon: Icon,
  ...props
}) {
  const baseStyles = 'inline-flex items-center justify-center font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-obsidian-900 disabled:opacity-50 disabled:cursor-not-allowed select-none rounded-lg';

  const variants = {
    primary: 'bg-indigoVolt hover:bg-indigoVolt-hover text-white shadow-glow-indigo focus:ring-indigoVolt',
    secondary: 'bg-obsidian-850 hover:bg-obsidian-800 text-slate-200 border border-borderDark-hairline hover:border-borderDark-active focus:ring-indigoVolt',
    emerald: 'bg-emeraldGlow hover:bg-emerald-600 text-obsidian-950 font-semibold shadow-glow-emerald focus:ring-emeraldGlow',
    danger: 'bg-roseDanger/15 hover:bg-roseDanger/25 text-rose-300 border border-roseDanger/40 focus:ring-roseDanger',
    ghost: 'bg-transparent hover:bg-obsidian-800 text-slate-300 hover:text-white'
  };

  const sizes = {
    sm: 'text-xs px-2.5 py-1.5 gap-1.5',
    md: 'text-sm px-4 py-2.5 gap-2',
    lg: 'text-base px-5 py-3 gap-2.5'
  };

  return (
    <button
      className={`${baseStyles} ${variants[variant] || variants.primary} ${sizes[size] || sizes.md} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : Icon ? (
        <Icon className="w-4 h-4 shrink-0" />
      ) : null}
      <span>{children}</span>
    </button>
  );
}
