import { useQuery } from "@tanstack/react-query";
import api from "../services/api";

export function useMessages(conversationId) {
  return useQuery({
    queryKey: ["messages", conversationId],
    queryFn: async () => {
      if (!conversationId) return [];
      const res = await api.get(`/messages/conversations/${conversationId}/messages`);
      return res.data.data;
    },
    enabled: !!conversationId,
  });
}
