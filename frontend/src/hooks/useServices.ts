import { useQuery } from '@tanstack/react-query';
import { api, endpoints } from '@/api/client';
import type { Service, ServiceSearchFilters, ApiResponse, PaginatedResponse } from '@/types';

// Query keys for caching
export const serviceKeys = {
  all: ['services'] as const,
  lists: () => [...serviceKeys.all, 'list'] as const,
  list: (filters: ServiceSearchFilters) => [...serviceKeys.lists(), filters] as const,
  details: () => [...serviceKeys.all, 'detail'] as const,
  detail: (id: string) => [...serviceKeys.details(), id] as const,
  featured: () => [...serviceKeys.all, 'featured'] as const,
};

// Fetch services with filters and pagination
async function fetchServices(filters: ServiceSearchFilters): Promise<PaginatedResponse<Service>> {
  const params: Record<string, string | number | boolean | undefined> = {};
  
  if (filters.q) params.query = filters.q;
  if (filters.categoryId) params.categoryId = filters.categoryId;
  if (filters.minPrice !== undefined) params.minPrice = filters.minPrice;
  if (filters.maxPrice !== undefined) params.maxPrice = filters.maxPrice;
  if (filters.minRating !== undefined) params.minRating = filters.minRating;
  if (filters.maxDeliveryDays !== undefined) params.maxDeliveryDays = filters.maxDeliveryDays;
  if (filters.tags) params.tags = filters.tags;
  if (filters.sortBy) params.sortBy = filters.sortBy;
  if (filters.page) params.page = filters.page;
  if (filters.perPage) params.perPage = filters.perPage;

  const response = await api.get<ApiResponse<PaginatedResponse<Service>>>(
    endpoints.services.list,
    params
  );
  return response.data;
}

// Fetch single service by ID
async function fetchService(id: string): Promise<Service> {
  const response = await api.get<ApiResponse<Service>>(endpoints.services.get(id));
  return response.data;
}

// Fetch featured services
async function fetchFeaturedServices(): Promise<Service[]> {
  const response = await api.get<ApiResponse<Service[]>>(endpoints.services.featured);
  return response.data;
}

// Hook for listing services with filters
export function useServices(filters: ServiceSearchFilters = {}) {
  return useQuery({
    queryKey: serviceKeys.list(filters),
    queryFn: () => fetchServices(filters),
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
}

// Hook for single service
export function useService(id: string | undefined) {
  return useQuery({
    queryKey: serviceKeys.detail(id ?? ''),
    queryFn: () => fetchService(id!),
    enabled: !!id,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

// Hook for featured services
export function useFeaturedServices() {
  return useQuery({
    queryKey: serviceKeys.featured(),
    queryFn: fetchFeaturedServices,
    staleTime: 1000 * 60 * 10, // 10 minutes
  });
}

