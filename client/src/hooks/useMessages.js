import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../services/api.js';

export const useConversations = () => {
  return useQuery({
    queryKey: ['conversations'],
    queryFn: async () => {
      const res = await api.get('/messages/conversations');
      return res.data;
    },
    staleTime: 1000 * 30, // 30s
  });
};

export const useMessages = (conversationId) => {
  return useQuery({
    queryKey: ['messages', conversationId],
    queryFn: async () => {
      if (!conversationId) return null;
      const res = await api.get(`/messages/conversations/${conversationId}/messages`);
      return res.data;
    },
    enabled: !!conversationId,
  });
};

export const useMessageMutations = () => {
  const queryClient = useQueryClient();

  const createConversation = useMutation({
    mutationFn: async (recipientId) => {
      const res = await api.post('/messages/conversations', { recipientId });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    },
  });

  const markAsRead = useMutation({
    mutationFn: async (conversationId) => {
      const res = await api.put(`/messages/conversations/${conversationId}/read`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    },
  });

  return {
    createConversation,
    markAsRead,
  };
};
