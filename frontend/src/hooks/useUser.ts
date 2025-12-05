import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api, endpoints } from '@/api/client';
import type { ApiResponse } from '@/types';

// Types
export interface UserProfile {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  avatarUrl?: string;
  country: string;
  preferredCurrency: string;
  preferredLanguage: string;
}

export interface UpdateProfileRequest {
  firstName?: string;
  lastName?: string;
  phone?: string;
  country?: string;
  preferredCurrency?: string;
  preferredLanguage?: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

export interface NotificationPreferences {
  emailMessages: boolean;
  emailProjects: boolean;
  emailMarketing: boolean;
  pushMessages: boolean;
  pushProjects: boolean;
}

// Query keys
export const userKeys = {
  all: ['user'] as const,
  profile: () => [...userKeys.all, 'profile'] as const,
  notifications: () => [...userKeys.all, 'notifications'] as const,
};

// Hook: Update user profile
export function useUpdateProfile() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ userId, data }: { userId: string; data: UpdateProfileRequest }) => {
      const response = await api.put<ApiResponse<UserProfile>>(endpoints.users.update(userId), data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userKeys.profile() });
      // Also refresh auth user data
      queryClient.invalidateQueries({ queryKey: ['auth'] });
    },
  });
}

// Hook: Change password
export function useChangePassword() {
  return useMutation({
    mutationFn: async (data: ChangePasswordRequest) => {
      const response = await api.post<ApiResponse<{ message: string }>>('/users/me/password', data);
      return response.data;
    },
  });
}

// Hook: Get notification preferences
export function useNotificationPreferences() {
  return useQuery({
    queryKey: userKeys.notifications(),
    queryFn: async () => {
      try {
        const response = await api.get<ApiResponse<NotificationPreferences>>('/users/me/notifications');
        return response.data;
      } catch {
        // Return defaults if not found
        return {
          emailMessages: true,
          emailProjects: true,
          emailMarketing: false,
          pushMessages: true,
          pushProjects: true,
        };
      }
    },
    staleTime: 1000 * 60 * 5,
  });
}

// Hook: Update notification preferences
export function useUpdateNotifications() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: NotificationPreferences) => {
      const response = await api.put<ApiResponse<NotificationPreferences>>('/users/me/notifications', data);
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(userKeys.notifications(), data);
    },
  });
}

// Hook: Upload avatar
export function useUploadAvatar() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ userId, file }: { userId: string; file: File }) => {
      const formData = new FormData();
      formData.append('avatar', file);
      
      const response = await fetch(`${import.meta.env.VITE_API_URL || '/api/v1'}/users/${userId}/avatar`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
        },
        body: formData,
      });
      
      if (!response.ok) {
        const error = await response.json().catch(() => ({ message: 'Upload failed' }));
        throw new Error(error.message);
      }
      
      const result = await response.json();
      return result.data as string;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userKeys.profile() });
      queryClient.invalidateQueries({ queryKey: ['auth'] });
    },
  });
}

