import React from 'react';
import { Dumbbell, LogOut, Shield, User, Bell } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Badge } from '../common/Badge';

export function Navbar({ onOpenAddMember }) {
  const { user, logout, isAdmin } = useAuth();

  return (
    <header className="sticky top-0 z-40 w-full bg-obsidian-900/90 backdrop-blur-md border-b border-borderDark-hairline">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigoVolt to-indigoVolt-hover flex items-center justify-center shadow-glow-indigo text-white font-bold">
            <Dumbbell className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-display font-bold text-xl tracking-tight text-white">
                FITHUB<span className="text-indigoVolt">PRO</span>
              </span>
              <span className="text-[10px] font-mono uppercase tracking-widest px-1.5 py-0.5 rounded bg-indigoVolt/10 text-indigoVolt border border-indigoVolt/20">
                v1.0
              </span>
            </div>
            <p className="text-[11px] font-mono text-slate-400 hidden sm:block">
              Kinetic Gym Management Platform
            </p>
          </div>
        </div>

        {/* User Session & Actions */}
        <div className="flex items-center gap-4">
          {/* Role Indicator */}
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-obsidian-850 border border-borderDark-hairline">
            {isAdmin ? (
              <>
                <Shield className="w-4 h-4 text-indigoVolt" />
                <span className="text-xs font-mono font-medium text-slate-200">Admin Control</span>
              </>
            ) : (
              <>
                <User className="w-4 h-4 text-emeraldGlow" />
                <span className="text-xs font-mono font-medium text-slate-200">Member Portal</span>
              </>
            )}
          </div>

          {/* User Profile Pill */}
          <div className="flex items-center gap-3 pl-2 border-l border-borderDark-hairline">
            <div className="text-right hidden md:block">
              <p className="text-sm font-medium text-white truncate max-w-[150px]">
                {user?.member?.fullName || user?.username || 'User'}
              </p>
              <p className="text-[11px] font-mono text-slate-400">
                {isAdmin ? 'System Administrator' : user?.member?.memberCode || 'Candidate'}
              </p>
            </div>

            {user?.member?.photoUrl ? (
              <img
                src={user.member.photoUrl}
                alt="Profile"
                className="w-9 h-9 rounded-full object-cover border border-borderDark-active"
              />
            ) : (
              <div className="w-9 h-9 rounded-full bg-obsidian-800 border border-borderDark-active flex items-center justify-center text-slate-300 font-semibold text-xs">
                {isAdmin ? 'AD' : user?.username?.slice(0, 2).toUpperCase() || 'MB'}
              </div>
            )}

            {/* Logout */}
            <button
              onClick={logout}
              title="Logout"
              className="p-2 rounded-lg text-slate-400 hover:text-roseDanger hover:bg-roseDanger/10 transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
