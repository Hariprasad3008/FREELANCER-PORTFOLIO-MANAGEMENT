// src/hooks/useFreelancers.js
import { useQuery } from "@tanstack/react-query";
import { supabase } from "../lib/supabaseClient";

async function fetchFreelancers(filters, includeExtras = true) {
  let select =
    "id, full_name, title, location, hourly_rate, experience_level, success_rate, projects_completed, rating, skills" +
    (includeExtras ? ", category, gender" : "");

  let query = supabase.from("profiles").select(select).eq("role", "freelancer");

  if (filters?.search) {
    query = query.or(
      `full_name.ilike.%${filters.search}%,title.ilike.%${filters.search}%`
    );
  }
  if (filters?.experience && filters.experience !== "any") {
    query = query.eq("experience_level", filters.experience);
  }

  const { data, error } = await query;
  if (error) {
    if (includeExtras && error.code === "42703") {
      return fetchFreelancers(filters, false);
    }
    throw error;
  }
  return data;
}

export function useFreelancers(filters) {
  return useQuery({
    queryKey: ["freelancers", filters],
    queryFn: () => fetchFreelancers(filters),
  });
}
