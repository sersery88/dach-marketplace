import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/api/client';
import type { PaginatedResponse, AccountStatus } from '@/types';

// Types
export interface AdminStats {
  totalUsers: number;
  totalExperts: number;
  totalClients: number;
  totalServices: number;
  totalProjects: number;
  pendingVerifications: number;
}

export interface AdminUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'client' | 'expert' | 'admin';
  accountStatus: AccountStatus;
  emailVerified: boolean;
  createdAt: string;
}

export interface UserFilters {
  role?: 'client' | 'expert' | 'admin';
  status?: AccountStatus;
  search?: string;
  page?: number;
  perPage?: number;
}

// Query keys
const adminKeys = {
  all: ['admin'] as const,
  stats: () => [...adminKeys.all, 'stats'] as const,
  users: () => [...adminKeys.all, 'users'] as const,
  userList: (filters: UserFilters) => [...adminKeys.users(), filters] as const,
  user: (id: string) => [...adminKeys.users(), id] as const,
  pendingExperts: () => [...adminKeys.all, 'pending-experts'] as const,
};

// Hooks

/** Get admin dashboard stats */
export function useAdminStats() {
  return useQuery({
    queryKey: adminKeys.stats(),
    queryFn: async () => {
      const response = await api.get<{ data: AdminStats }>('/admin/stats');
      return response.data;
    },
  });
}

/** List all users with filters */
export function useAdminUsers(filters: UserFilters = {}) {
  return useQuery({
    queryKey: adminKeys.userList(filters),
    queryFn: async () => {
      const params: Record<string, string | number | undefined> = {};
      if (filters.role) params.role = filters.role;
      if (filters.status) params.status = filters.status;
      if (filters.search) params.search = filters.search;
      if (filters.page) params.page = filters.page;
      if (filters.perPage) params.per_page = filters.perPage;

      const response = await api.get<PaginatedResponse<AdminUser>>('/admin/users', params);
      return response;
    },
  });
}

/** Get single user details */
export function useAdminUser(id: string) {
  return useQuery({
    queryKey: adminKeys.user(id),
    queryFn: async () => {
      const response = await api.get<{ data: AdminUser }>(`/admin/users/${id}`);
      return response.data;
    },
    enabled: !!id,
  });
}

/** Update user status (suspend, activate, etc.) */
export function useUpdateUserStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ userId, status }: { userId: string; status: AccountStatus }) => {
      return await api.put<{ data: AdminUser }>(`/admin/users/${userId}/status`, { status });
    },
    onSuccess: (_, { userId }) => {
      queryClient.invalidateQueries({ queryKey: adminKeys.user(userId) });
      queryClient.invalidateQueries({ queryKey: adminKeys.users() });
      queryClient.invalidateQueries({ queryKey: adminKeys.stats() });
    },
  });
}

/** Delete user */
export function useDeleteUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (userId: string) => {
      return await api.delete(`/admin/users/${userId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminKeys.users() });
      queryClient.invalidateQueries({ queryKey: adminKeys.stats() });
    },
  });
}

/** Verify expert */
export function useVerifyExpert() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (expertId: string) => {
      return await api.post(`/admin/experts/${expertId}/verify`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminKeys.users() });
      queryClient.invalidateQueries({ queryKey: adminKeys.stats() });
      queryClient.invalidateQueries({ queryKey: adminKeys.pendingExperts() });
    },
  });
}

// Pending expert type with profile details
export interface PendingExpert {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  createdAt: string;
  headline?: string;
  bio?: string;
  hourlyRate?: number;
  currency?: string;
  yearsExperience?: number;
  portfolioUrl?: string;
  linkedinUrl?: string;
}

/** Get pending expert verifications with profile details */
export function usePendingExperts() {
  return useQuery({
    queryKey: adminKeys.pendingExperts(),
    queryFn: async () => {
      const response = await api.get<{ data: PendingExpert[] }>('/admin/experts/pending');
      return response.data;
    },
  });
}

// Category management types
export interface CreateCategoryRequest {
  parentId?: string;
  name: string;
  nameDe: string;
  description?: string;
  descriptionDe?: string;
  icon?: string;
  imageUrl?: string;
  sortOrder?: number;
}

// Category hooks

/** Create category */
export function useCreateCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateCategoryRequest) => {
      return await api.post('/admin/categories', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
  });
}

/** Update category */
export function useUpdateCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: CreateCategoryRequest }) => {
      return await api.put(`/admin/categories/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
  });
}

/** Delete category */
export function useDeleteCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      return await api.delete(`/admin/categories/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
  });
}

/** Toggle category featured status */
export function useToggleCategoryFeatured() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      return await api.post(`/admin/categories/${id}/featured`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
  });
}

// ============ Content Moderation ============

export type ReportedType = 'service' | 'review' | 'message' | 'user' | 'project_posting';
export type ReportReason = 'spam' | 'inappropriate' | 'fraud' | 'harassment' | 'copyright' | 'other';
export type ReportStatus = 'pending' | 'reviewing' | 'resolved' | 'dismissed';
export type ReportAction = 'none' | 'warning' | 'content_removed' | 'user_suspended' | 'user_banned';

export interface ContentReport {
  id: string;
  reporterId: string;
  reporterName: string;
  reporterEmail: string;
  reportedType: ReportedType;
  reportedId: string;
  reportedContentPreview?: string;
  reason: ReportReason;
  description?: string;
  status: ReportStatus;
  resolvedBy?: string;
  resolverName?: string;
  resolutionNotes?: string;
  actionTaken?: ReportAction;
  createdAt: string;
  resolvedAt?: string;
}

export interface ReportFilters {
  status?: ReportStatus;
  reportedType?: ReportedType;
  reason?: ReportReason;
  page?: number;
  perPage?: number;
}

export interface ResolveReportRequest {
  action: ReportAction;
  notes?: string;
}

const reportKeys = {
  all: ['admin', 'reports'] as const,
  list: (filters: ReportFilters) => [...reportKeys.all, 'list', filters] as const,
  detail: (id: string) => [...reportKeys.all, 'detail', id] as const,
};

/** List content reports */
export function useContentReports(filters: ReportFilters = {}) {
  return useQuery({
    queryKey: reportKeys.list(filters),
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters.status) params.append('status', filters.status);
      if (filters.reportedType) params.append('reported_type', filters.reportedType);
      if (filters.reason) params.append('reason', filters.reason);
      if (filters.page) params.append('page', filters.page.toString());
      if (filters.perPage) params.append('per_page', filters.perPage.toString());

      const response = await api.get<PaginatedResponse<ContentReport>>(`/admin/reports?${params}`);
      return response;
    },
  });
}

/** Resolve a report */
export function useResolveReport() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: ResolveReportRequest }) => {
      return await api.post(`/admin/reports/${id}/resolve`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: reportKeys.all });
    },
  });
}

/** Dismiss a report */
export function useDismissReport() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      return await api.post(`/admin/reports/${id}/dismiss`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: reportKeys.all });
    },
  });
}

// ============ Platform Analytics ============

export interface RevenueMetrics {
  totalGmv: number;
  totalPlatformRevenue: number;
  totalTransactions: number;
  averageOrderValue: number;
}

export interface GrowthMetrics {
  newUsers30d: number;
  newUsers7d: number;
  newExperts30d: number;
  newServices30d: number;
}

export interface PopularCategory {
  id: string;
  name: string;
  slug: string;
  serviceCount: number;
  totalOrders: number;
}

export interface TopExpert {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  headline?: string;
  totalEarnings: number;
  completedProjects: number;
  rating: number;
}

export interface ConversionMetrics {
  openPostings: number;
  activeProjects: number;
  completedPostings: number;
  totalProposals: number;
  acceptedProposals: number;
}

export interface PlatformAnalytics {
  revenue: RevenueMetrics;
  userGrowth: GrowthMetrics;
  popularCategories: PopularCategory[];
  topExperts: TopExpert[];
  conversions: ConversionMetrics;
}

const analyticsKeys = {
  all: ['admin', 'analytics'] as const,
  platform: () => [...analyticsKeys.all, 'platform'] as const,
};

/** Get platform analytics */
export function usePlatformAnalytics() {
  return useQuery({
    queryKey: analyticsKeys.platform(),
    queryFn: async () => {
      const response = await api.get<{ data: PlatformAnalytics }>('/admin/analytics');
      return response.data;
    },
  });
}
