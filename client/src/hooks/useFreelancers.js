import { useQuery } from "@tanstack/react-query";
import api from "../services/api";

async function fetchFreelancers(filters) {
  const params = {};
  if (filters?.search) params.search = filters.search;
  if (filters?.experience && filters.experience !== "any") params.experience = filters.experience;
  if (filters?.category) params.category = filters.category;
  if (filters?.minRate) params.minRate = filters.minRate;
  if (filters?.maxRate) params.maxRate = filters.maxRate;

  const res = await api.get("/profiles/freelancers", { params });
  return res.data.data;
}

export function useFreelancers(filters) {
  return useQuery({
    queryKey: ["freelancers", filters],
    queryFn: () => fetchFreelancers(filters),
  });
}
