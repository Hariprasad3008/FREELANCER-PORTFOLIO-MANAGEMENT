import { useQuery } from "@tanstack/react-query";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";

export function useSavedProfiles() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["savedProfiles", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const res = await api.get("/saved/profiles");
      return res.data.data;
    },
    enabled: !!user && user.role === "client",
  });
}
