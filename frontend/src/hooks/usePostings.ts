import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api, endpoints } from '@/api/client';
import type { ProjectPosting, Proposal, PaginatedResponse, ProjectPostingBudgetType, Currency, ProjectPostingStatus } from '@/types';

// Request types
export interface CreateProjectPostingRequest {
  title: string;
  description: string;
  requirements?: string;
  categoryId?: string;
  skillsRequired: string[];
  toolsRequired: string[];
  budgetType: ProjectPostingBudgetType;
  budgetMin?: number;
  budgetMax?: number;
  currency: Currency;
  deadline?: string;
  estimatedDuration?: string;
  isUrgent: boolean;
}

export interface UpdateProjectPostingRequest extends Partial<CreateProjectPostingRequest> {
  status?: ProjectPostingStatus;
}

export interface CreateProposalRequest {
  coverLetter: string;
  proposedPrice: number;
  currency: Currency;
  proposedDuration?: string;
  proposedMilestones?: { title: string; description: string; amount: number; dueDate?: string }[];
}

export interface PostingFilters {
  status?: ProjectPostingStatus;
  categoryId?: string;
  isUrgent?: boolean;
  search?: string;
  page?: number;
  perPage?: number;
}

// Query keys
const postingKeys = {
  all: ['postings'] as const,
  lists: () => [...postingKeys.all, 'list'] as const,
  list: (filters: PostingFilters) => [...postingKeys.lists(), filters] as const,
  details: () => [...postingKeys.all, 'detail'] as const,
  detail: (id: string) => [...postingKeys.details(), id] as const,
  myPostings: () => [...postingKeys.all, 'my'] as const,
  proposals: (postingId: string) => [...postingKeys.all, 'proposals', postingId] as const,
};

// Hooks

/** List all project postings (public) */
export function usePostings(filters: PostingFilters = {}) {
  return useQuery({
    queryKey: postingKeys.list(filters),
    queryFn: async () => {
      const params: Record<string, string | number | boolean | undefined> = {};
      if (filters.status) params.status = filters.status;
      if (filters.categoryId) params.category_id = filters.categoryId;
      if (filters.isUrgent !== undefined) params.is_urgent = filters.isUrgent;
      if (filters.search) params.search = filters.search;
      if (filters.page) params.page = filters.page;
      if (filters.perPage) params.per_page = filters.perPage;

      const response = await api.get<PaginatedResponse<ProjectPosting>>(endpoints.postings.list, params);
      return response;
    },
  });
}

/** Get a single project posting by ID */
export function usePosting(id: string) {
  return useQuery({
    queryKey: postingKeys.detail(id),
    queryFn: async () => {
      const response = await api.get<{ data: ProjectPosting }>(endpoints.postings.get(id));
      return response.data;
    },
    enabled: !!id,
  });
}

/** Get my project postings (as client) */
export function useMyPostings(filters: PostingFilters = {}) {
  return useQuery({
    queryKey: postingKeys.myPostings(),
    queryFn: async () => {
      const params: Record<string, string | number | boolean | undefined> = {};
      if (filters.status) params.status = filters.status;
      if (filters.page) params.page = filters.page;
      if (filters.perPage) params.per_page = filters.perPage;

      const response = await api.get<PaginatedResponse<ProjectPosting>>(endpoints.postings.list, params);
      return response;
    },
  });
}

/** Create a new project posting */
export function useCreatePosting() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateProjectPostingRequest) => {
      const response = await api.post<{ data: ProjectPosting }>(endpoints.postings.create, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: postingKeys.all });
    },
  });
}

/** Update a project posting */
export function useUpdatePosting() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateProjectPostingRequest }) => {
      const response = await api.put<{ data: ProjectPosting }>(endpoints.postings.update(id), data);
      return response.data;
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: postingKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: postingKeys.lists() });
    },
  });
}

/** Delete a project posting */
export function useDeletePosting() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(endpoints.postings.delete(id));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: postingKeys.all });
    },
  });
}

/** Get proposals for a project posting */
export function useProposals(postingId: string) {
  return useQuery({
    queryKey: postingKeys.proposals(postingId),
    queryFn: async () => {
      const response = await api.get<PaginatedResponse<Proposal>>(endpoints.postings.proposals(postingId));
      return response;
    },
    enabled: !!postingId,
  });
}

/** Create a proposal for a project posting */
export function useCreateProposal(postingId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateProposalRequest) => {
      const response = await api.post<{ data: Proposal }>(endpoints.postings.proposals(postingId), data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: postingKeys.proposals(postingId) });
      queryClient.invalidateQueries({ queryKey: postingKeys.detail(postingId) });
    },
  });
}

/** Accept a proposal */
export function useAcceptProposal() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ proposalId }: { postingId: string; proposalId: string }) => {
      const response = await api.post<{ data: Proposal }>(endpoints.postings.acceptProposal(proposalId), {});
      return response.data;
    },
    onSuccess: (_, { postingId }) => {
      queryClient.invalidateQueries({ queryKey: postingKeys.proposals(postingId) });
      queryClient.invalidateQueries({ queryKey: postingKeys.detail(postingId) });
      queryClient.invalidateQueries({ queryKey: postingKeys.lists() });
    },
  });
}

