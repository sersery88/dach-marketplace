import { useQuery } from '@tanstack/react-query';
import { api, endpoints } from '@/api/client';
import type { ExpertProfile, ExpertSearchFilters, ApiResponse, PaginatedResponse } from '@/types';

// Query keys for caching
export const expertKeys = {
  all: ['experts'] as const,
  lists: () => [...expertKeys.all, 'list'] as const,
  list: (filters: ExpertSearchFilters) => [...expertKeys.lists(), filters] as const,
  details: () => [...expertKeys.all, 'detail'] as const,
  detail: (id: string) => [...expertKeys.details(), id] as const,
  featured: () => [...expertKeys.all, 'featured'] as const,
};

// Fetch experts with filters and pagination
async function fetchExperts(filters: ExpertSearchFilters): Promise<PaginatedResponse<ExpertProfile>> {
  const params: Record<string, string | number | boolean | undefined> = {};
  
  if (filters.q) params.query = filters.q;
  if (filters.skills) params.skills = filters.skills;
  if (filters.tools) params.tools = filters.tools;
  if (filters.countries) params.countries = filters.countries;
  if (filters.minRate !== undefined) params.minRate = filters.minRate;
  if (filters.maxRate !== undefined) params.maxRate = filters.maxRate;
  if (filters.minRating !== undefined) params.minRating = filters.minRating;
  if (filters.verifiedOnly !== undefined) params.verifiedOnly = filters.verifiedOnly;
  if (filters.sortBy) params.sortBy = filters.sortBy;
  if (filters.page) params.page = filters.page;
  if (filters.perPage) params.perPage = filters.perPage;

  const response = await api.get<ApiResponse<PaginatedResponse<ExpertProfile>>>(
    endpoints.experts.list,
    params
  );
  return response.data;
}

// Fetch single expert by ID
async function fetchExpert(id: string): Promise<ExpertProfile> {
  const response = await api.get<ApiResponse<ExpertProfile>>(endpoints.experts.get(id));
  return response.data;
}

// Fetch featured experts
async function fetchFeaturedExperts(): Promise<ExpertProfile[]> {
  const response = await api.get<ApiResponse<ExpertProfile[]>>(endpoints.experts.featured);
  return response.data;
}

// Hook for listing experts with filters
export function useExperts(filters: ExpertSearchFilters = {}) {
  return useQuery({
    queryKey: expertKeys.list(filters),
    queryFn: () => fetchExperts(filters),
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
}

// Hook for single expert
export function useExpert(id: string | undefined) {
  return useQuery({
    queryKey: expertKeys.detail(id ?? ''),
    queryFn: () => fetchExpert(id!),
    enabled: !!id,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

// Hook for featured experts
export function useFeaturedExperts() {
  return useQuery({
    queryKey: expertKeys.featured(),
    queryFn: fetchFeaturedExperts,
    staleTime: 1000 * 60 * 10, // 10 minutes
  });
}

