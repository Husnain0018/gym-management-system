import React, { useState, useEffect, useRef } from 'react';
import { Dumbbell, Shield, User, Lock, ArrowRight, AlertCircle, Sparkles } from 'lucide-react';
import { Button } from '../components/common/Button';
import { useAuth } from '../context/AuthContext';
import { useGsapAnimations } from '../hooks/useGsapAnimations';

export function LoginPage() {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const { login } = useAuth();
  const cardRef = useRef(null);
  const { animateModalIn } = useGsapAnimations();

  useEffect(() => {
    if (cardRef.current) {
      animateModalIn(cardRef.current);
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!identifier.trim() || !password) {
      setError('Please provide your login identifier and password.');
      return;
    }

    try {
      setLoading(true);
      await login(identifier.trim(), password);
    } catch (err) {
      setError(err.message || 'Login failed. Please verify credentials.');
    } finally {
      setLoading(false);
    }
  };

  const fillQuickDemo = (demoId, demoPass) => {
    setIdentifier(demoId);
    setPassword(demoPass);
    setError(null);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-obsidian-950 relative overflow-hidden">
      {/* Background kinetic ambient lighting */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigoVolt/15 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-emeraldGlow/10 rounded-full blur-[120px] pointer-events-none" />

      <div
        ref={cardRef}
        className="w-full max-w-md glass-panel-elevated rounded-2xl border border-borderDark-active p-8 relative z-10 shadow-glass-card"
      >
        {/* Brand Header */}
        <div className="text-center space-y-2 mb-8">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigoVolt to-indigoVolt-hover flex items-center justify-center mx-auto shadow-glow-indigo text-white font-bold mb-4">
            <Dumbbell className="w-7 h-7" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-display font-bold text-white tracking-tight">
            FITHUB<span className="text-indigoVolt">PRO</span>
          </h1>
          <p className="text-xs font-mono text-slate-400">
            Unified Access Portal for Administrators & Members
          </p>
        </div>

        {error && (
          <div className="mb-5 p-3.5 rounded-xl bg-roseDanger/15 border border-roseDanger/30 flex items-start gap-2.5 text-rose-300 text-xs">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-mono uppercase tracking-wider text-slate-300 mb-1.5">
              Login Identifier
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="Phone, Member ID, or Username"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-obsidian-900 border border-borderDark-hairline focus:border-indigoVolt focus:ring-1 focus:ring-indigoVolt text-sm text-white placeholder-slate-500 transition-all outline-none"
              />
            </div>
            <p className="text-[11px] font-mono text-slate-500 mt-1">
              Members: enter your registered phone number or Member ID (e.g. MEM-1001).
            </p>
          </div>

          <div>
            <label className="block text-xs font-mono uppercase tracking-wider text-slate-300 mb-1.5">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-obsidian-900 border border-borderDark-hairline focus:border-indigoVolt focus:ring-1 focus:ring-indigoVolt text-sm text-white placeholder-slate-500 transition-all outline-none"
              />
            </div>
          </div>

          <Button
            type="submit"
            variant="primary"
            size="lg"
            className="w-full mt-2 font-display tracking-wide"
            loading={loading}
            icon={ArrowRight}
          >
            Access Account
          </Button>
        </form>

        {/* Quick Demo Credentials Panel for Seamless Evaluation */}
        <div className="mt-8 pt-6 border-t border-borderDark-hairline space-y-3">
          <div className="flex items-center justify-between text-xs font-mono text-slate-400">
            <span className="flex items-center gap-1.5 text-indigo-300 font-semibold">
              <Sparkles className="w-3.5 h-3.5 text-indigoVolt" />
              Instant Evaluation Logins
            </span>
            <span className="text-[10px] text-slate-500">1-Click Fill</span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-[11px] font-mono">
            {/* Admin */}
            <button
              type="button"
              onClick={() => fillQuickDemo('admin', 'AdminPassword123!')}
              className="p-2.5 rounded-lg bg-obsidian-900 hover:bg-obsidian-800 border border-borderDark-hairline hover:border-indigoVolt text-left transition-all group"
            >
              <div className="flex items-center gap-1.5 text-indigo-400 font-semibold">
                <Shield className="w-3 h-3" />
                <span>Admin Login</span>
              </div>
              <p className="text-[10px] text-slate-500 mt-0.5 truncate">admin</p>
            </button>

            {/* Ahmed Khan - Expiring in 5 days */}
            <button
              type="button"
              onClick={() => fillQuickDemo('+92 300 1234567', 'MemberPass123!')}
              className="p-2.5 rounded-lg bg-obsidian-900 hover:bg-obsidian-800 border border-borderDark-hairline hover:border-amberAlert text-left transition-all group"
            >
              <div className="flex items-center gap-1.5 text-amber-300 font-semibold truncate">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                <span>Ahmed (Exp 5d)</span>
              </div>
              <p className="text-[10px] text-slate-500 mt-0.5 truncate">+92 300 1234567</p>
            </button>

            {/* Sara Malik - Active */}
            <button
              type="button"
              onClick={() => fillQuickDemo('+92 321 9876543', 'MemberPass123!')}
              className="p-2.5 rounded-lg bg-obsidian-900 hover:bg-obsidian-800 border border-borderDark-hairline hover:border-emeraldGlow text-left transition-all group"
            >
              <div className="flex items-center gap-1.5 text-emerald-400 font-semibold truncate">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                <span>Sara (Active)</span>
              </div>
              <p className="text-[10px] text-slate-500 mt-0.5 truncate">+92 321 9876543</p>
            </button>

            {/* Hamza Bilal - Expired */}
            <button
              type="button"
              onClick={() => fillQuickDemo('+92 345 5678901', 'MemberPass123!')}
              className="p-2.5 rounded-lg bg-obsidian-900 hover:bg-obsidian-800 border border-borderDark-hairline hover:border-roseDanger text-left transition-all group"
            >
              <div className="flex items-center gap-1.5 text-rose-400 font-semibold truncate">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
                <span>Hamza (Expired)</span>
              </div>
              <p className="text-[10px] text-slate-500 mt-0.5 truncate">+92 345 5678901</p>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
