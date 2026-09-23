import { useQuery } from "@tanstack/react-query";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";

export function useCurrentProfile() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["current-profile", user?.id],
    queryFn: async () => {
      if (!user) return null;
      const res = await api.get("/auth/me");
      return res.data.user;
    },
    enabled: !!user,
  });
}
