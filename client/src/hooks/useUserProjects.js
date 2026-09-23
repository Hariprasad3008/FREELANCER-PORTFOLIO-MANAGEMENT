import { useQuery } from "@tanstack/react-query";
import api from "../services/api";

export function useUserProjects(userId) {
  return useQuery({
    queryKey: ["user-projects", userId],
    queryFn: async () => {
      if (!userId) return [];
      const res = await api.get(`/projects/user/${userId}`);
      return res.data.data;
    },
    enabled: !!userId,
  });
}
