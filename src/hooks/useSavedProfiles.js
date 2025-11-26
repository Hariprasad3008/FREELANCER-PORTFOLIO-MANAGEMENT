// src/hooks/useSavedProfiles.js
import { useQuery } from "@tanstack/react-query";
import { supabase } from "../lib/supabaseClient";
import { useAuth } from "../context/AuthContext";

export function useSavedProfiles() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["savedProfiles", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("saved_profiles")
        .select(`
          id,
          created_at,
          freelancer:profiles!saved_profiles_freelancer_id_fkey (
            id,
            full_name,
            title,
            hourly_rate,
            projects_completed,
            rating
          )
        `)
        .eq("client_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
  });
}
