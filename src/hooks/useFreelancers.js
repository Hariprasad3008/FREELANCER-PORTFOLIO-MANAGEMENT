// src/hooks/useFreelancers.js
import { useQuery } from "@tanstack/react-query";
import { supabase } from "../lib/supabaseClient";

export function useFreelancers(filters) {
  return useQuery({
    queryKey: ["freelancers", filters],
    queryFn: async () => {
      let query = supabase
        .from("profiles")
        .select(
          "id, full_name, title, location, hourly_rate, experience_level, success_rate, projects_completed, rating, skills"
        )
        .eq("role", "freelancer");

      if (filters?.search) {
        // Simple search on name or title
        query = query.or(
          `full_name.ilike.%${filters.search}%,title.ilike.%${filters.search}%`
        );
      }
      if (filters?.experience && filters.experience !== "any") {
        query = query.eq("experience_level", filters.experience);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });
}
