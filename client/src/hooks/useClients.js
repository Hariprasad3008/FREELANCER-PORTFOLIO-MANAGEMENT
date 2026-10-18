import { useQuery } from "@tanstack/react-query";
import api from "../services/api";

async function fetchClients(filters) {
  const params = {};
  if (filters?.search) params.search = filters.search;
  if (filters?.category) params.category = filters.category;

  const res = await api.get("/profiles/clients", { params });
  return res.data.data;
}

export function useClients(filters) {
  return useQuery({
    queryKey: ["clients", filters],
    queryFn: () => fetchClients(filters),
  });
}
