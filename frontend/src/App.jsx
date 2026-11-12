import React, { useState, useEffect } from 'react';
import { useAuth } from './context/AuthContext';
import { LoginPage } from './pages/LoginPage';
import { Navbar } from './components/layout/Navbar';
import { Sidebar } from './components/layout/Sidebar';
import { AdminDashboardPage } from './pages/admin/AdminDashboardPage';
import { MembersPage } from './pages/admin/MembersPage';
import { MemberDashboardPage } from './pages/member/MemberDashboardPage';

import { MemberFormModal } from './components/admin/MemberFormModal';
import { CredentialsModal } from './components/admin/CredentialsModal';
import { MemberDetailsModal } from './components/admin/MemberDetailsModal';
import { DeleteConfirmModal } from './components/admin/DeleteConfirmModal';

import { api } from './services/api';
import { Dumbbell } from 'lucide-react';

export function App() {
  const { user, loading, isAuthenticated, isAdmin, isMember } = useAuth();

  // Admin Navigation State
  const [adminTab, setAdminTab] = useState('dashboard'); // 'dashboard' | 'members' | 'expiring'
  const [membersFilter, setMembersFilter] = useState('all');

  // Modals State
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [memberToEdit, setMemberToEdit] = useState(null);

  const [isCredentialsOpen, setIsCredentialsOpen] = useState(false);
  const [provisionedCredentials, setProvisionedCredentials] = useState(null);
  const [credentialMemberName, setCredentialMemberName] = useState('');

  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);

  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [memberToDelete, setMemberToDelete] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Expiring count for sidebar badge
  const [expiringCount, setExpiringCount] = useState(0);

  // Refresh trigger counter to notify child views
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    if (isAdmin) {
      api.getDashboardStats().then((res) => {
        if (res?.success) {
          setExpiringCount(res.stats.expiringSoonMembers || 0);
        }
      }).catch(() => {});
    }
  }, [isAdmin, refreshKey]);

  if (loading) {
    return (
      <div className="min-h-screen bg-obsidian-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Dumbbell className="w-10 h-10 text-indigoVolt animate-pulse" />
          <span className="text-xs font-mono text-slate-400">Initializing FitHub Pro...</span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <LoginPage />;
  }

  // Handle viewing member details
  const handleViewMember = async (memberId) => {
    try {
      const res = await api.getMemberById(memberId);
      if (res.success && res.member) {
        setSelectedMember(res.member);
        setIsDetailsOpen(true);
      }
    } catch (err) {
      alert(err.message || 'Failed to load member dossier.');
    }
  };

  // Handle opening edit modal
  const handleEditMember = (member) => {
    setMemberToEdit(member);
    setIsDetailsOpen(false);
    setIsFormOpen(true);
  };

  // Handle password reset for member (Admin action)
  const handleResetPassword = async (member) => {
    try {
      const res = await api.resetMemberPassword(member.id);
      if (res.success) {
        setProvisionedCredentials({
          memberCode: res.memberCode,
          loginIdentifier: res.loginIdentifier,
          temporaryPassword: res.temporaryPassword
        });
        setCredentialMemberName(member.full_name);
        setIsDetailsOpen(false);
        setIsCredentialsOpen(true);
      }
    } catch (err) {
      alert(err.message || 'Failed to reset password.');
    }
  };

  // Handle delete confirmation
  const handleDeletePrompt = (member) => {
    setMemberToDelete(member);
    setIsDetailsOpen(false);
    setIsDeleteOpen(true);
  };

  const handleConfirmDelete = async (memberId) => {
    try {
      setDeleteLoading(true);
      await api.deleteMember(memberId);
      setIsDeleteOpen(false);
      setMemberToDelete(null);
      setRefreshKey((k) => k + 1);
    } catch (err) {
      alert(err.message || 'Failed to delete member.');
    } finally {
      setDeleteLoading(false);
    }
  };

  // Callback when a member is registered or updated
  const handleMemberSaved = (member, credentials) => {
    setRefreshKey((k) => k + 1);
    if (credentials) {
      // Member was registered, display provisioned credentials
      setProvisionedCredentials(credentials);
      setCredentialMemberName(member.full_name);
      setIsCredentialsOpen(true);
    }
  };

  // Navigation helper from dashboard cards
  const handleNavigateMembers = (filter) => {
    setMembersFilter(filter);
    setAdminTab('members');
  };

  // Sidebar navigation handler
  const handleSidebarTabSelect = (tab) => {
    if (tab === 'expiring') {
      setMembersFilter('expiring_soon');
      setAdminTab('members');
    } else {
      if (tab === 'members') setMembersFilter('all');
      setAdminTab(tab);
    }
  };

  return (
    <div className="min-h-screen bg-obsidian-900 text-slate-100 flex flex-col font-sans">
      <Navbar onOpenAddMember={() => { setMemberToEdit(null); setIsFormOpen(true); }} />

      {/* ADMIN PANEL */}
      {isAdmin && (
        <div className="flex-1 flex flex-col md:flex-row">
          <Sidebar
            currentTab={adminTab === 'members' && membersFilter === 'expiring_soon' ? 'expiring' : adminTab}
            onSelectTab={handleSidebarTabSelect}
            onOpenAddMember={() => { setMemberToEdit(null); setIsFormOpen(true); }}
            expiringCount={expiringCount}
          />

          <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full overflow-y-auto">
            {adminTab === 'dashboard' ? (
              <AdminDashboardPage
                key={`dashboard-${refreshKey}`}
                onOpenAddMember={() => { setMemberToEdit(null); setIsFormOpen(true); }}
                onViewMember={handleViewMember}
                onNavigateMembers={handleNavigateMembers}
              />
            ) : (
              <MembersPage
                key={`members-${refreshKey}-${membersFilter}`}
                initialFilter={membersFilter}
                onOpenAddMember={() => { setMemberToEdit(null); setIsFormOpen(true); }}
                onViewMember={handleViewMember}
                onEditMember={handleEditMember}
                onResetPassword={handleResetPassword}
                onDeleteMember={handleDeletePrompt}
              />
            )}
          </main>
        </div>
      )}

      {/* CANDIDATE / MEMBER PANEL */}
      {isMember && (
        <main className="flex-1">
          <MemberDashboardPage key={`member-portal-${refreshKey}`} />
        </main>
      )}

      {/* Global Modals for Admin Actions */}
      <MemberFormModal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        memberToEdit={memberToEdit}
        onSuccess={handleMemberSaved}
      />

      <CredentialsModal
        isOpen={isCredentialsOpen}
        onClose={() => setIsCredentialsOpen(false)}
        credentials={provisionedCredentials}
        memberName={credentialMemberName}
      />

      <MemberDetailsModal
        isOpen={isDetailsOpen}
        onClose={() => setIsDetailsOpen(false)}
        member={selectedMember}
        onEdit={handleEditMember}
        onResetPassword={handleResetPassword}
        onDelete={handleDeletePrompt}
      />

      <DeleteConfirmModal
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        member={memberToDelete}
        onConfirm={handleConfirmDelete}
        loading={deleteLoading}
      />
    </div>
  );
}
