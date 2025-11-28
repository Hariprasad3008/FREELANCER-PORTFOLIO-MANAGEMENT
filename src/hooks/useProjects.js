// src/hooks/useProjects.js
import { useQuery } from "@tanstack/react-query";
import { supabase } from "../lib/supabaseClient";

async function fetchProjects(filters, includeExtras = true) {
  const clientFields = includeExtras
    ? "id, full_name, title, location, gender, category"
    : "id, full_name, title, location";

  let query = supabase
    .from("projects")
    .select(
      `
      id,
      title,
      description,
      budget_min,
      budget_max,
      budget_type,
      required_skills,
      deadline,
      status,
      client_id,
      client:profiles!projects_client_id_fkey(${clientFields})
    `
    )
    .eq("status", "open");

  if (filters?.search) {
    query = query.ilike("title", `%${filters.search}%`);
  }

  const { data, error } = await query;
  if (error) {
    if (includeExtras && error.code === "42703") {
      return fetchProjects(filters, false);
    }
    throw error;
  }
  return data;
}

export function useProjects(filters) {
  return useQuery({
    queryKey: ["projects", filters],
    queryFn: () => fetchProjects(filters),
  });
}
