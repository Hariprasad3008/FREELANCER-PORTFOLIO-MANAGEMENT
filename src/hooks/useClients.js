// src/hooks/useClients.js
import { useQuery } from "@tanstack/react-query";
import { supabase } from "../lib/supabaseClient";

async function fetchClients(filters, includeExtras = true) {
  let select =
    "id, full_name, title, location, bio, created_at, skills" +
    (includeExtras ? ", category, gender" : "");

  let query = supabase.from("profiles").select(select).eq("role", "client");

  if (filters?.search) {
    query = query.or(
      `full_name.ilike.%${filters.search}%,title.ilike.%${filters.search}%`
    );
  }

  if (filters?.location) {
    query = query.ilike("location", `%${filters.location}%`);
  }

  const { data: clients, error } = await query;

  if (error) {
    if (includeExtras && error.code === "42703") {
      // Column missing (gender/category) – retry without them
      return fetchClients(filters, false);
    }
    throw error;
  }

  if (!clients || clients.length === 0) {
    return [];
  }

  const clientIds = clients.map((c) => c.id);

  const { data: projects, error: projectsError } = await supabase
    .from("projects")
    .select("id, client_id, status")
    .in("client_id", clientIds);

  if (projectsError) throw projectsError;

  const counts = new Map();

  projects?.forEach((project) => {
    const current = counts.get(project.client_id) || {
      total: 0,
      open: 0,
    };
    current.total += 1;
    if (project.status === "open") {
      current.open += 1;
    }
    counts.set(project.client_id, current);
  });

  return clients.map((client) => ({
    ...client,
    projectStats: counts.get(client.id) || { total: 0, open: 0 },
  }));
}

export function useClients(filters) {
  return useQuery({
    queryKey: ["clients", filters],
    queryFn: () => fetchClients(filters),
  });
}

