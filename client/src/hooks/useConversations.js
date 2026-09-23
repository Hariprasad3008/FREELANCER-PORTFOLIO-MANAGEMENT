import { useQuery } from "@tanstack/react-query";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";

export function useConversations() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["conversations", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const res = await api.get("/messages/conversations");
      return res.data.data;
    },
  });
}
