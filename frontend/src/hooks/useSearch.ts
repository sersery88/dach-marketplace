import { useQuery } from '@tanstack/react-query';
import { api } from '@/api/client';
import type { 
  ExpertSearchResult, 
  ServiceSearchResult, 
  ExpertSearchFilters, 
  ServiceSearchFilters,
  ApiResponse,
  PaginatedResponse 
} from '@/types';

// Query keys factory for search
export const searchKeys = {
  all: ['search'] as const,
  experts: (filters: ExpertSearchFilters) => [...searchKeys.all, 'experts', filters] as const,
  services: (filters: ServiceSearchFilters) => [...searchKeys.all, 'services', filters] as const,
};

// Fetch experts with filters
async function searchExperts(filters: ExpertSearchFilters): Promise<PaginatedResponse<ExpertSearchResult>> {
  const params: Record<string, string | number | boolean | undefined> = {};
  
  if (filters.q) params.q = filters.q;
  if (filters.skills) params.skills = filters.skills;
  if (filters.tools) params.tools = filters.tools;
  if (filters.countries) params.countries = filters.countries;
  if (filters.minRate !== undefined) params.min_rate = filters.minRate;
  if (filters.maxRate !== undefined) params.max_rate = filters.maxRate;
  if (filters.minRating !== undefined) params.min_rating = filters.minRating;
  if (filters.verifiedOnly) params.verified_only = filters.verifiedOnly;
  if (filters.page) params.page = filters.page;
  if (filters.perPage) params.per_page = filters.perPage;
  
  const response = await api.get<ApiResponse<PaginatedResponse<ExpertSearchResult>>>('/search/experts', params);
  return response.data;
}

// Fetch services with filters
async function searchServices(filters: ServiceSearchFilters): Promise<PaginatedResponse<ServiceSearchResult>> {
  const params: Record<string, string | number | boolean | undefined> = {};
  
  if (filters.q) params.q = filters.q;
  if (filters.categoryId) params.category_id = filters.categoryId;
  if (filters.minPrice !== undefined) params.min_price = filters.minPrice;
  if (filters.maxPrice !== undefined) params.max_price = filters.maxPrice;
  if (filters.minRating !== undefined) params.min_rating = filters.minRating;
  if (filters.maxDeliveryDays !== undefined) params.max_delivery_days = filters.maxDeliveryDays;
  if (filters.tags) params.tags = filters.tags;
  if (filters.page) params.page = filters.page;
  if (filters.perPage) params.per_page = filters.perPage;
  
  const response = await api.get<ApiResponse<PaginatedResponse<ServiceSearchResult>>>('/search/services', params);
  return response.data;
}

// Hook: Search experts
export function useSearchExperts(filters: ExpertSearchFilters, enabled: boolean = true) {
  return useQuery({
    queryKey: searchKeys.experts(filters),
    queryFn: () => searchExperts(filters),
    enabled,
    staleTime: 30 * 1000, // 30 seconds
  });
}

// Hook: Search services
export function useSearchServices(filters: ServiceSearchFilters, enabled: boolean = true) {
  return useQuery({
    queryKey: searchKeys.services(filters),
    queryFn: () => searchServices(filters),
    enabled,
    staleTime: 30 * 1000, // 30 seconds
  });
}

