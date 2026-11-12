import React, { useState, useEffect } from 'react';
import { Search, UserPlus, Filter, Eye, Edit, Trash2, Key, RefreshCw, ChevronLeft, ChevronRight, Phone, Calendar } from 'lucide-react';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { formatDisplayDate } from '../../utils/date';
import { api } from '../../services/api';

export function MembersPage({
  initialFilter = 'all',
  onOpenAddMember,
  onViewMember,
  onEditMember,
  onResetPassword,
  onDeleteMember
}) {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState(initialFilter);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ total: 0, totalPages: 1, limit: 10 });
  const [error, setError] = useState(null);

  // Sync initialFilter prop if changed
  useEffect(() => {
    setStatusFilter(initialFilter);
    setPage(1);
  }, [initialFilter]);

  const fetchMembers = async () => {
    try {
      setLoading(true);
      const res = await api.getMembers({
        search: search.trim(),
        status: statusFilter,
        page,
        limit: 10
      });
      if (res.success) {
        setMembers(res.data);
        setPagination(res.pagination);
        setError(null);
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch members.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchMembers();
    }, 200);
    return () => clearTimeout(timer);
  }, [search, statusFilter, page]);

  const filterTabs = [
    { id: 'all', label: 'All Members' },
    { id: 'active', label: 'Active' },
    { id: 'expiring_soon', label: 'Expiring Soon (5 Days)' },
    { id: 'expired', label: 'Expired' }
  ];

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-borderDark-hairline">
        <div>
          <h1 className="text-2xl sm:text-3xl font-display font-bold text-white tracking-tight">
            Gym Members Directory
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 font-mono">
            Manage profiles, monitor 1-month expiration cycles & provision credentials
          </p>
        </div>

        <Button variant="primary" icon={UserPlus} onClick={onOpenAddMember}>
          Register Member
        </Button>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-roseDanger/15 border border-roseDanger/30 text-rose-300 text-sm">
          {error}
        </div>
      )}

      {/* Filter Tabs & Search Controls */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-stretch md:items-center">
        {/* Status Filter Tabs */}
        <div className="flex flex-wrap gap-1.5 p-1 rounded-xl bg-obsidian-850 border border-borderDark-hairline">
          {filterTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setStatusFilter(tab.id);
                setPage(1);
              }}
              className={`px-3 py-1.5 text-xs font-mono font-medium rounded-lg transition-all ${
                statusFilter === tab.id
                  ? 'bg-indigoVolt text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-obsidian-800'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Search by name, phone, code..."
            className="w-full pl-9 pr-4 py-2 rounded-lg bg-obsidian-850 border border-borderDark-hairline focus:border-indigoVolt text-xs font-mono text-white placeholder-slate-500 outline-none transition-all"
          />
        </div>
      </div>

      {/* Members Table */}
      <div className="glass-panel rounded-xl border border-borderDark-hairline overflow-hidden shadow-lg">
        {loading ? (
          <div className="p-12 text-center">
            <RefreshCw className="w-6 h-6 text-indigoVolt animate-spin mx-auto mb-2" />
            <p className="text-xs font-mono text-slate-400">Loading Members Directory...</p>
          </div>
        ) : members.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-obsidian-800 border border-borderDark-hairline flex items-center justify-center mx-auto text-slate-500">
              <Filter className="w-6 h-6" />
            </div>
            <h4 className="font-display font-medium text-white">No Members Found</h4>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              No gym members match the active search query or filter status.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono border-collapse">
              <thead>
                <tr className="bg-obsidian-850/80 border-b border-borderDark-hairline text-slate-400 uppercase tracking-wider text-[11px]">
                  <th className="py-3.5 px-4 font-semibold">Member</th>
                  <th className="py-3.5 px-4 font-semibold">Contact</th>
                  <th className="py-3.5 px-4 font-semibold">Joining Date</th>
                  <th className="py-3.5 px-4 font-semibold">Expiry (+1 Mo)</th>
                  <th className="py-3.5 px-4 font-semibold">Status</th>
                  <th className="py-3.5 px-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-borderDark-hairline/60">
                {members.map((m) => (
                  <tr
                    key={m.id}
                    className="hover:bg-obsidian-850/50 transition-colors group"
                  >
                    {/* Member Name & Photo */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        {m.photo_url ? (
                          <img
                            src={m.photo_url}
                            alt={m.full_name}
                            className="w-10 h-10 rounded-full object-cover border border-borderDark-active shrink-0"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-obsidian-800 border border-borderDark-active flex items-center justify-center text-xs font-bold text-slate-300 shrink-0">
                            {m.full_name.slice(0, 2).toUpperCase()}
                          </div>
                        )}
                        <div>
                          <p className="font-semibold text-slate-100 font-sans text-sm">
                            {m.full_name}
                          </p>
                          <span className="text-[10px] text-indigoVolt font-mono">
                            {m.member_code}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Phone & Email */}
                    <td className="py-3 px-4 text-slate-300">
                      <div>
                        <p className="font-medium text-slate-200">{m.phone}</p>
                        <p className="text-[11px] text-slate-400 truncate max-w-[160px]">
                          {m.email || '—'}
                        </p>
                      </div>
                    </td>

                    {/* Joining Date */}
                    <td className="py-3 px-4 text-slate-300">
                      {formatDisplayDate(m.joining_date)}
                    </td>

                    {/* Expiry Date & Days Left */}
                    <td className="py-3 px-4">
                      <div>
                        <p className="font-medium text-emerald-300">
                          {formatDisplayDate(m.expiry_date)}
                        </p>
                        <p className={`text-[10px] ${
                          m.remainingDays < 0
                            ? 'text-roseDanger'
                            : m.remainingDays <= 5
                            ? 'text-amberAlert font-bold'
                            : 'text-slate-400'
                        }`}>
                          {m.remainingDays < 0
                            ? `${Math.abs(m.remainingDays)}d ago`
                            : m.remainingDays === 0
                            ? 'Expires today'
                            : `${m.remainingDays}d remaining`}
                        </p>
                      </div>
                    </td>

                    {/* Status Badge */}
                    <td className="py-3 px-4">
                      <Badge status={m.status} />
                    </td>

                    {/* Action Buttons */}
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => onViewMember(m.id)}
                          title="View Dossier"
                          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-obsidian-800 transition-colors"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => onEditMember(m)}
                          title="Edit Member"
                          className="p-1.5 rounded-lg text-slate-400 hover:text-indigoVolt hover:bg-obsidian-800 transition-colors"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => onResetPassword(m)}
                          title="Reset Password"
                          className="p-1.5 rounded-lg text-slate-400 hover:text-emeraldGlow hover:bg-obsidian-800 transition-colors"
                        >
                          <Key className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => onDeleteMember(m)}
                          title="Delete Member"
                          className="p-1.5 rounded-lg text-slate-400 hover:text-roseDanger hover:bg-roseDanger/10 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Bar */}
        <div className="p-4 bg-obsidian-850/60 border-t border-borderDark-hairline flex items-center justify-between text-xs font-mono text-slate-400">
          <span>
            Total Members: <strong className="text-white">{pagination.total}</strong>
          </span>

          <div className="flex items-center gap-2">
            <span>
              Page {pagination.page} of {pagination.totalPages}
            </span>
            <div className="flex items-center gap-1">
              <button
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="p-1.5 rounded-lg bg-obsidian-800 hover:bg-obsidian-750 disabled:opacity-30 disabled:cursor-not-allowed text-slate-200 border border-borderDark-hairline transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                disabled={page >= pagination.totalPages}
                onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
                className="p-1.5 rounded-lg bg-obsidian-800 hover:bg-obsidian-750 disabled:opacity-30 disabled:cursor-not-allowed text-slate-200 border border-borderDark-hairline transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
