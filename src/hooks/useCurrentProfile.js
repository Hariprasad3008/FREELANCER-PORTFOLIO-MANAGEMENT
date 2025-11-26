// src/hooks/useCurrentProfile.js
import { useQuery } from "@tanstack/react-query";
import { supabase } from "../lib/supabaseClient";
import { useAuth } from "../context/AuthContext";

export function useCurrentProfile() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["current-profile", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (error) throw error;
      return data;
    },
  });
}
