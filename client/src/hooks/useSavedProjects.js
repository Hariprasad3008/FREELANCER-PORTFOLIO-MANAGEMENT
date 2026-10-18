import { useQuery } from "@tanstack/react-query";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";

export function useSavedProjects() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["savedProjects", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const res = await api.get("/saved/projects");
      return res.data.data;
    },
    enabled: !!user && user.role === "freelancer",
  });
}
