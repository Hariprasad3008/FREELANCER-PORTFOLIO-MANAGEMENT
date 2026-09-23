import { useQuery } from "@tanstack/react-query";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";

export function useConversationList() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["conversation-list", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const res = await api.get("/messages/conversations");
      return res.data.data;
    },
    enabled: !!user,
  });
}
