// src/hooks/useUserProjects.js
import { useQuery } from "@tanstack/react-query";
import { supabase } from "../lib/supabaseClient";

export function useUserProjects(userId) {
  return useQuery({
    queryKey: ["user-projects", userId],
    enabled: !!userId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("projects")
        .select("id, title, description, budget_min, budget_max, budget_type, status, deadline, required_skills")
        .eq("client_id", userId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
  });
}
