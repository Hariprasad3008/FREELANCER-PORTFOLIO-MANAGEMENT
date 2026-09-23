import { useQuery } from "@tanstack/react-query";
import api from "../services/api";

async function fetchProjects(filters) {
  const params = {};
  if (filters?.search) params.search = filters.search;
  if (filters?.category) params.category = filters.category;
  if (filters?.minBudget) params.minBudget = filters.minBudget;
  if (filters?.maxBudget) params.maxBudget = filters.maxBudget;

  const res = await api.get("/projects", { params });
  return res.data.data;
}

export function useProjects(filters) {
  return useQuery({
    queryKey: ["projects", filters],
    queryFn: () => fetchProjects(filters),
  });
}
