// src/hooks/useProjects.js
import { useQuery } from "@tanstack/react-query";
import { supabase } from "../lib/supabaseClient";

export function useProjects(filters) {
  return useQuery({
    queryKey: ["projects", filters],
    queryFn: async () => {
      let query = supabase
        .from("projects")
        .select(
          "id, title, description, budget_min, budget_max, budget_type, required_skills, deadline, status"
        )
        .eq("status", "open");

      if (filters?.search) {
        query = query.ilike("title", `%${filters.search}%`);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });
}
