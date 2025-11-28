import { useQuery } from '@tanstack/react-query';
import { api } from '@/api/client';
import type { Category, CategoryTree, Service, PaginatedResponse, ApiResponse } from '@/types';

// Query keys factory for categories
export const categoryKeys = {
  all: ['categories'] as const,
  lists: () => [...categoryKeys.all, 'list'] as const,
  list: () => [...categoryKeys.lists()] as const,
  tree: () => [...categoryKeys.all, 'tree'] as const,
  featured: () => [...categoryKeys.all, 'featured'] as const,
  details: () => [...categoryKeys.all, 'detail'] as const,
  detail: (idOrSlug: string) => [...categoryKeys.details(), idOrSlug] as const,
  services: (idOrSlug: string) => [...categoryKeys.detail(idOrSlug), 'services'] as const,
};

// Fetch all categories (flat list)
async function fetchCategories(): Promise<Category[]> {
  const response = await api.get<ApiResponse<Category[]>>('/categories');
  return response.data;
}

// Fetch category tree (hierarchical)
async function fetchCategoryTree(): Promise<CategoryTree[]> {
  const response = await api.get<ApiResponse<CategoryTree[]>>('/categories/tree');
  return response.data;
}

// Fetch featured categories
async function fetchFeaturedCategories(): Promise<Category[]> {
  const response = await api.get<ApiResponse<Category[]>>('/categories/featured');
  return response.data;
}

// Fetch single category by ID or slug
async function fetchCategory(idOrSlug: string): Promise<Category> {
  const response = await api.get<ApiResponse<Category>>(`/categories/${idOrSlug}`);
  return response.data;
}

// Fetch services in a category
async function fetchCategoryServices(
  idOrSlug: string,
  page: number = 1,
  perPage: number = 12
): Promise<PaginatedResponse<Service>> {
  const response = await api.get<ApiResponse<PaginatedResponse<Service>>>(
    `/categories/${idOrSlug}/services`,
    { page, per_page: perPage }
  );
  return response.data;
}

// Hook: Get all categories
export function useCategories() {
  return useQuery({
    queryKey: categoryKeys.list(),
    queryFn: fetchCategories,
    staleTime: 5 * 60 * 1000, // 5 minutes - categories don't change often
  });
}

// Hook: Get category tree
export function useCategoryTree() {
  return useQuery({
    queryKey: categoryKeys.tree(),
    queryFn: fetchCategoryTree,
    staleTime: 5 * 60 * 1000,
  });
}

// Hook: Get featured categories
export function useFeaturedCategories() {
  return useQuery({
    queryKey: categoryKeys.featured(),
    queryFn: fetchFeaturedCategories,
    staleTime: 5 * 60 * 1000,
  });
}

// Hook: Get single category
export function useCategory(idOrSlug: string | undefined) {
  return useQuery({
    queryKey: categoryKeys.detail(idOrSlug || ''),
    queryFn: () => fetchCategory(idOrSlug!),
    enabled: !!idOrSlug,
    staleTime: 5 * 60 * 1000,
  });
}

// Hook: Get services in a category
export function useCategoryServices(
  idOrSlug: string | undefined,
  page: number = 1,
  perPage: number = 12
) {
  return useQuery({
    queryKey: [...categoryKeys.services(idOrSlug || ''), page, perPage],
    queryFn: () => fetchCategoryServices(idOrSlug!, page, perPage),
    enabled: !!idOrSlug,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

