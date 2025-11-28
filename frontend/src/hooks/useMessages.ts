import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api, endpoints } from '@/api/client';
import type { Message, ConversationPreview, SendMessageRequest, ApiResponse, PaginatedResponse } from '@/types';

// Query keys
export const messageKeys = {
  all: ['messages'] as const,
  conversations: () => [...messageKeys.all, 'conversations'] as const,
  conversation: (id: string) => [...messageKeys.all, 'conversation', id] as const,
  messages: (conversationId: string) => [...messageKeys.all, 'messages', conversationId] as const,
};

// Fetch conversations
async function fetchConversations(): Promise<ConversationPreview[]> {
  try {
    const response = await api.get<ApiResponse<PaginatedResponse<ConversationPreview>>>(
      endpoints.messages.conversations
    );
    return response.data?.data || [];
  } catch {
    return [];
  }
}

// Fetch messages for a conversation
async function fetchMessages(conversationId: string): Promise<Message[]> {
  try {
    const response = await api.get<ApiResponse<PaginatedResponse<Message>>>(
      endpoints.messages.conversation(conversationId)
    );
    return response.data?.data || [];
  } catch {
    return [];
  }
}

// Hook for conversations list
export function useConversations() {
  return useQuery({
    queryKey: messageKeys.conversations(),
    queryFn: fetchConversations,
    staleTime: 1000 * 30, // 30 seconds - messages should be fresh
    refetchInterval: 1000 * 60, // Refetch every minute
  });
}

// Hook for messages in a conversation
export function useMessages(conversationId: string | undefined) {
  return useQuery({
    queryKey: messageKeys.messages(conversationId ?? ''),
    queryFn: () => fetchMessages(conversationId!),
    enabled: !!conversationId,
    staleTime: 1000 * 10, // 10 seconds
    refetchInterval: 1000 * 30, // Refetch every 30 seconds
  });
}

// Mutation for sending a message
export function useSendMessage() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (request: SendMessageRequest) => {
      const response = await api.post<ApiResponse<Message>>(endpoints.messages.send, request);
      return response.data;
    },
    onSuccess: (_, variables) => {
      // Invalidate messages for the conversation
      if (variables.conversationId) {
        queryClient.invalidateQueries({ queryKey: messageKeys.messages(variables.conversationId) });
      }
      // Invalidate conversations list to update last message
      queryClient.invalidateQueries({ queryKey: messageKeys.conversations() });
    },
  });
}

// Mutation for marking messages as read
export function useMarkMessagesRead() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ conversationId, messageIds }: { conversationId: string; messageIds: string[] }) => {
      const response = await api.post<ApiResponse<void>>(
        `${endpoints.messages.conversation(conversationId)}/read`,
        { messageIds }
      );
      return response;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: messageKeys.messages(variables.conversationId) });
      queryClient.invalidateQueries({ queryKey: messageKeys.conversations() });
    },
  });
}

