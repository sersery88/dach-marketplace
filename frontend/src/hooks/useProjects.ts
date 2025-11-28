import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/api/client';
import type { Project, PaginatedResponse, ProjectStatus } from '@/types';

interface ProjectFilters {
  status?: ProjectStatus;
  role?: 'client' | 'expert';
  page?: number;
  limit?: number;
}

interface DeliverProjectRequest {
  message: string;
  attachments?: string[];
}

interface RequestRevisionRequest {
  reason: string;
  details?: string;
}

// Fetch all projects for current user
export function useProjects(filters: ProjectFilters = {}) {
  return useQuery({
    queryKey: ['projects', filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters.status) params.append('status', filters.status);
      if (filters.role) params.append('role', filters.role);
      if (filters.page) params.append('page', filters.page.toString());
      if (filters.limit) params.append('limit', filters.limit.toString());
      
      const response = await api.get<PaginatedResponse<Project>>(`/projects?${params}`);
      return response.data;
    },
  });
}

// Fetch single project by ID
export function useProject(id: string) {
  return useQuery({
    queryKey: ['project', id],
    queryFn: async () => {
      return await api.get<Project>(`/projects/${id}`);
    },
    enabled: !!id,
  });
}

// Deliver project (expert submits deliverables)
export function useDeliverProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ projectId, data }: { projectId: string; data: DeliverProjectRequest }) => {
      return await api.post<Project>(`/projects/${projectId}/deliver`, data);
    },
    onSuccess: (_, { projectId }) => {
      queryClient.invalidateQueries({ queryKey: ['project', projectId] });
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
  });
}

// Request revision (client)
export function useRequestRevision() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ projectId, data }: { projectId: string; data: RequestRevisionRequest }) => {
      return await api.post<Project>(`/projects/${projectId}/revision`, data);
    },
    onSuccess: (_, { projectId }) => {
      queryClient.invalidateQueries({ queryKey: ['project', projectId] });
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
  });
}

// Complete project (client approves)
export function useCompleteProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (projectId: string) => {
      return await api.post<Project>(`/projects/${projectId}/complete`);
    },
    onSuccess: (_, projectId) => {
      queryClient.invalidateQueries({ queryKey: ['project', projectId] });
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
  });
}

// Cancel project
export function useCancelProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ projectId, reason }: { projectId: string; reason?: string }) => {
      return await api.post<Project>(`/projects/${projectId}/cancel`, { reason });
    },
    onSuccess: (_, { projectId }) => {
      queryClient.invalidateQueries({ queryKey: ['project', projectId] });
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
  });
}

