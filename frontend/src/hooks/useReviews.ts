import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api, endpoints } from '../api/client';
import type {
  Review,
  ReviewWithReviewer,
  CreateReviewRequest,
  ReviewResponseRequest,
  ReviewSummary,
  ReviewFilters,
  PaginatedResponse,
} from '../types';

// Query keys
const reviewKeys = {
  all: ['reviews'] as const,
  lists: () => [...reviewKeys.all, 'list'] as const,
  list: (filters: ReviewFilters) => [...reviewKeys.lists(), filters] as const,
  details: () => [...reviewKeys.all, 'detail'] as const,
  detail: (id: string) => [...reviewKeys.details(), id] as const,
  summaries: () => [...reviewKeys.all, 'summary'] as const,
  summary: (expertId: string) => [...reviewKeys.summaries(), expertId] as const,
};

// List reviews with filters
export function useReviews(filters: ReviewFilters = {}, page = 1, perPage = 10) {
  return useQuery({
    queryKey: [...reviewKeys.list(filters), page, perPage],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters.expertId) params.append('expertId', filters.expertId);
      if (filters.serviceId) params.append('serviceId', filters.serviceId);
      if (filters.minRating) params.append('minRating', filters.minRating.toString());
      if (filters.verifiedOnly) params.append('verifiedOnly', 'true');
      params.append('page', page.toString());
      params.append('perPage', perPage.toString());
      
      const url = `${endpoints.reviews.list}?${params.toString()}`;
      return api.get<PaginatedResponse<ReviewWithReviewer>>(url);
    },
  });
}

// Get single review
export function useReview(id: string) {
  return useQuery({
    queryKey: reviewKeys.detail(id),
    queryFn: () => api.get<ReviewWithReviewer>(endpoints.reviews.get(id)),
    enabled: !!id,
  });
}

// Get review summary for expert
export function useReviewSummary(expertId: string) {
  return useQuery({
    queryKey: reviewKeys.summary(expertId),
    queryFn: () => api.get<ReviewSummary>(endpoints.reviews.summary(expertId)),
    enabled: !!expertId,
  });
}

// Create review mutation
export function useCreateReview() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateReviewRequest) =>
      api.post<Review>(endpoints.reviews.create, data),
    onSuccess: (_, variables) => {
      // Invalidate reviews list
      queryClient.invalidateQueries({ queryKey: reviewKeys.lists() });
      // Invalidate project to update review status
      queryClient.invalidateQueries({ queryKey: ['projects', variables.projectId] });
    },
  });
}

// Respond to review (expert)
export function useRespondToReview() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ reviewId, data }: { reviewId: string; data: ReviewResponseRequest }) =>
      api.post<Review>(endpoints.reviews.respond(reviewId), data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: reviewKeys.detail(variables.reviewId) });
      queryClient.invalidateQueries({ queryKey: reviewKeys.lists() });
    },
  });
}

// Mark review as helpful
export function useMarkReviewHelpful() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (reviewId: string) =>
      api.post<void>(endpoints.reviews.helpful(reviewId), {}),
    onSuccess: (_, reviewId) => {
      queryClient.invalidateQueries({ queryKey: reviewKeys.detail(reviewId) });
      queryClient.invalidateQueries({ queryKey: reviewKeys.lists() });
    },
  });
}

