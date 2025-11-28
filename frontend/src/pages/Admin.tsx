import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Users, Briefcase, TrendingUp, Shield, AlertTriangle,
  CheckCircle, XCircle, Search, Eye, Ban, Trash2, Loader2, FolderTree, ExternalLink
} from 'lucide-react';
import { Button } from '@/components/ui';
import { cn } from '@/lib/utils';
import { useAdminStats, useAdminUsers, useUpdateUserStatus, useDeleteUser, useVerifyExpert, usePendingExperts, type AdminUser, type PendingExpert } from '@/hooks/useAdmin';
import { useSuccessToast, useErrorToast } from '@/components/ui/Toast';
import { CategoryManagement, ContentModeration, PlatformAnalytics } from '@/components/admin';
import type { AccountStatus } from '@/types';

type TabType = 'overview' | 'users' | 'experts' | 'categories' | 'moderation' | 'analytics';

const statusColors = {
  active: 'bg-green-100 text-green-700',
  pending: 'bg-amber-100 text-amber-700',
  suspended: 'bg-red-100 text-red-700',
  deleted: 'bg-neutral-100 text-neutral-700',
};

const statusLabels: Record<string, string> = {
  active: 'Aktiv',
  pending: 'Ausstehend',
  suspended: 'Gesperrt',
  deleted: 'Gelöscht',
};

const roleLabels: Record<string, string> = {
  client: 'Kunde',
  expert: 'Experte',
  admin: 'Admin',
};

export function Admin() {
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<'client' | 'expert' | 'admin' | undefined>();
  const [page, setPage] = useState(1);

  const showSuccess = useSuccessToast();
  const showError = useErrorToast();

  // API hooks
  const { data: stats, isLoading: statsLoading } = useAdminStats();
  const { data: usersData, isLoading: usersLoading } = useAdminUsers({
    role: roleFilter,
    search: searchQuery || undefined,
    page,
    perPage: 20,
  });
  const { data: pendingExperts, isLoading: pendingExpertsLoading } = usePendingExperts();
  const updateStatusMutation = useUpdateUserStatus();
  const deleteUserMutation = useDeleteUser();
  const verifyExpertMutation = useVerifyExpert();

  const users = usersData?.data || [];

  const handleUpdateStatus = async (userId: string, status: AccountStatus) => {
    try {
      await updateStatusMutation.mutateAsync({ userId, status });
      showSuccess(`Benutzerstatus auf "${statusLabels[status]}" geändert`);
    } catch {
      showError('Fehler beim Aktualisieren des Status');
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm('Sind Sie sicher, dass Sie diesen Benutzer löschen möchten?')) return;
    try {
      await deleteUserMutation.mutateAsync(userId);
      showSuccess('Benutzer erfolgreich gelöscht');
    } catch {
      showError('Fehler beim Löschen des Benutzers');
    }
  };

  const handleVerifyExpert = async (expertId: string) => {
    try {
      await verifyExpertMutation.mutateAsync(expertId);
      showSuccess('Experte erfolgreich verifiziert');
    } catch {
      showError('Fehler bei der Verifizierung');
    }
  };

  const tabs = [
    { id: 'overview' as const, label: 'Übersicht', icon: TrendingUp },
    { id: 'analytics' as const, label: 'Analytics', icon: TrendingUp },
    { id: 'users' as const, label: 'Benutzer', icon: Users },
    { id: 'experts' as const, label: 'Experten', icon: Briefcase },
    { id: 'categories' as const, label: 'Kategorien', icon: FolderTree },
    { id: 'moderation' as const, label: 'Moderation', icon: Shield },
  ];

  const statCards = stats ? [
    { label: 'Benutzer gesamt', value: stats.totalUsers, icon: Users, color: 'bg-blue-100 text-blue-600' },
    { label: 'Experten', value: stats.totalExperts, icon: Briefcase, color: 'bg-purple-100 text-purple-600' },
    { label: 'Kunden', value: stats.totalClients, icon: Users, color: 'bg-green-100 text-green-600' },
    { label: 'Services', value: stats.totalServices, icon: TrendingUp, color: 'bg-amber-100 text-amber-600' },
    { label: 'Projekte', value: stats.totalProjects, icon: Briefcase, color: 'bg-cyan-100 text-cyan-600' },
    { label: 'Ausstehende Verifizierungen', value: stats.pendingVerifications, icon: AlertTriangle, color: 'bg-red-100 text-red-600' },
  ] : [];

  return (
    <div className="min-h-screen bg-neutral-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-neutral-900">Admin Dashboard</h1>
          <p className="text-neutral-600 mt-1">Plattform-Verwaltung und Moderation</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                'flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors whitespace-nowrap',
                activeTab === tab.id
                  ? 'bg-primary-600 text-white'
                  : 'bg-white text-neutral-600 hover:bg-neutral-100'
              )}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
            {statsLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {statCards.map((stat, index) => (
                  <div key={index} className="bg-white rounded-xl p-6 border border-neutral-200">
                    <div className="flex items-center gap-3 mb-2">
                      <div className={cn('w-10 h-10 rounded-lg flex items-center justify-center', stat.color)}>
                        <stat.icon className="w-5 h-5" />
                      </div>
                      <span className="text-sm text-neutral-600">{stat.label}</span>
                    </div>
                    <div className="text-2xl font-bold text-neutral-900">{stat.value.toLocaleString('de-CH')}</div>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        )}

        {/* Users Tab */}
        {activeTab === 'users' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
            {/* Search & Filter */}
            <div className="flex gap-4 flex-wrap">
              <div className="flex-1 min-w-[200px] relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                <input
                  type="text"
                  placeholder="Benutzer suchen..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-neutral-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
              <select
                value={roleFilter || ''}
                onChange={(e) => setRoleFilter(e.target.value as 'client' | 'expert' | 'admin' | undefined || undefined)}
                className="px-4 py-2 border border-neutral-200 rounded-lg focus:ring-2 focus:ring-primary-500"
              >
                <option value="">Alle Rollen</option>
                <option value="client">Kunden</option>
                <option value="expert">Experten</option>
                <option value="admin">Admins</option>
              </select>
            </div>

            {/* Users Table */}
            <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden">
              {usersLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
                </div>
              ) : users.length === 0 ? (
                <div className="text-center py-12 text-neutral-500">
                  <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Keine Benutzer gefunden</p>
                </div>
              ) : (
                <table className="w-full">
                  <thead className="bg-neutral-50 border-b border-neutral-200">
                    <tr>
                      <th className="text-left px-4 py-3 text-sm font-medium text-neutral-600">Benutzer</th>
                      <th className="text-left px-4 py-3 text-sm font-medium text-neutral-600">Rolle</th>
                      <th className="text-left px-4 py-3 text-sm font-medium text-neutral-600">Status</th>
                      <th className="text-left px-4 py-3 text-sm font-medium text-neutral-600">Registriert</th>
                      <th className="text-right px-4 py-3 text-sm font-medium text-neutral-600">Aktionen</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-100">
                    {users.map((user: AdminUser) => (
                      <tr key={user.id} className="hover:bg-neutral-50">
                        <td className="px-4 py-3">
                          <div>
                            <div className="font-medium text-neutral-900">{user.firstName} {user.lastName}</div>
                            <div className="text-sm text-neutral-500">{user.email}</div>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-sm text-neutral-700">{roleLabels[user.role]}</span>
                        </td>
                        <td className="px-4 py-3">
                          <span className={cn('text-xs px-2 py-1 rounded-full', statusColors[user.accountStatus])}>
                            {statusLabels[user.accountStatus]}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm text-neutral-600">
                          {new Date(user.createdAt).toLocaleDateString('de-CH')}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button className="p-1 hover:bg-neutral-100 rounded" title="Details anzeigen">
                              <Eye className="w-4 h-4 text-neutral-500" />
                            </button>
                            {user.accountStatus === 'active' ? (
                              <button
                                onClick={() => handleUpdateStatus(user.id, 'suspended')}
                                className="p-1 hover:bg-neutral-100 rounded"
                                title="Sperren"
                              >
                                <Ban className="w-4 h-4 text-amber-500" />
                              </button>
                            ) : user.accountStatus === 'suspended' ? (
                              <button
                                onClick={() => handleUpdateStatus(user.id, 'active')}
                                className="p-1 hover:bg-neutral-100 rounded"
                                title="Aktivieren"
                              >
                                <CheckCircle className="w-4 h-4 text-green-500" />
                              </button>
                            ) : null}
                            <button
                              onClick={() => handleDeleteUser(user.id)}
                              className="p-1 hover:bg-neutral-100 rounded"
                              title="Löschen"
                            >
                              <Trash2 className="w-4 h-4 text-red-500" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            {/* Pagination */}
            {usersData && usersData.meta.totalPages > 1 && (
              <div className="flex justify-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page === 1}
                  onClick={() => setPage(p => p - 1)}
                >
                  Zurück
                </Button>
                <span className="px-4 py-2 text-sm text-neutral-600">
                  Seite {page} von {usersData.meta.totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page >= usersData.meta.totalPages}
                  onClick={() => setPage(p => p + 1)}
                >
                  Weiter
                </Button>
              </div>
            )}
          </motion.div>
        )}

        {/* Experts Tab */}
        {activeTab === 'experts' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-white rounded-xl border border-neutral-200 p-6">
            <h2 className="text-lg font-semibold text-neutral-900 mb-4">Ausstehende Verifizierungen</h2>
            {pendingExpertsLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
              </div>
            ) : !pendingExperts || pendingExperts.length === 0 ? (
              <div className="text-center py-12 text-neutral-500">
                <CheckCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Keine ausstehenden Verifizierungen</p>
              </div>
            ) : (
              <div className="space-y-4">
                {pendingExperts.map((expert: PendingExpert) => (
                  <div key={expert.id} className="p-4 border border-neutral-200 rounded-lg">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-neutral-900">{expert.firstName} {expert.lastName}</span>
                          {expert.yearsExperience && (
                            <span className="text-xs bg-neutral-100 text-neutral-600 px-2 py-0.5 rounded">
                              {expert.yearsExperience} Jahre Erfahrung
                            </span>
                          )}
                        </div>
                        <div className="text-sm text-neutral-500">{expert.email}</div>
                        {expert.headline && (
                          <div className="text-sm text-neutral-700 mt-1">{expert.headline}</div>
                        )}
                        {expert.hourlyRate && (
                          <div className="text-sm text-primary-600 mt-1">
                            {expert.hourlyRate} {expert.currency || 'CHF'}/Stunde
                          </div>
                        )}
                        {expert.bio && (
                          <div className="text-sm text-neutral-600 mt-2 line-clamp-2">{expert.bio}</div>
                        )}
                        <div className="flex gap-2 mt-2">
                          {expert.portfolioUrl && (
                            <a href={expert.portfolioUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-primary-600 hover:underline flex items-center gap-1">
                              <ExternalLink className="w-3 h-3" /> Portfolio
                            </a>
                          )}
                          {expert.linkedinUrl && (
                            <a href={expert.linkedinUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-primary-600 hover:underline flex items-center gap-1">
                              <ExternalLink className="w-3 h-3" /> LinkedIn
                            </a>
                          )}
                        </div>
                        <div className="text-xs text-neutral-400 mt-2">
                          Registriert: {new Date(expert.createdAt).toLocaleDateString('de-DE')}
                        </div>
                      </div>
                      <div className="flex gap-2 ml-4">
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-green-600 border-green-200 hover:bg-green-50"
                          onClick={() => handleVerifyExpert(expert.id)}
                          disabled={verifyExpertMutation.isPending}
                        >
                          <CheckCircle className="w-4 h-4 mr-1" />
                          Verifizieren
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-red-600 border-red-200 hover:bg-red-50"
                          onClick={() => handleUpdateStatus(expert.id, 'suspended')}
                        >
                          <XCircle className="w-4 h-4 mr-1" />
                          Ablehnen
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        )}

        {/* Categories Tab */}
        {activeTab === 'categories' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <CategoryManagement />
          </motion.div>
        )}

        {/* Moderation Tab */}
        {activeTab === 'moderation' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-white rounded-xl border border-neutral-200 p-6">
            <h2 className="text-lg font-semibold text-neutral-900 mb-4">Gemeldete Inhalte</h2>
            <ContentModeration />
          </motion.div>
        )}

        {/* Analytics Tab */}
        {activeTab === 'analytics' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <PlatformAnalytics />
          </motion.div>
        )}
      </div>
    </div>
  );
}

export default Admin;

