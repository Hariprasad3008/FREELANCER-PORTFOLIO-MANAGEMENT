import { useQuery } from "@tanstack/react-query";
import api from "../services/api";

export function useFreelancerReviews(freelancerId) {
  return useQuery({
    queryKey: ["freelancer-reviews", freelancerId],
    queryFn: async () => {
      if (!freelancerId) return [];
      const res = await api.get(`/reviews/freelancer/${freelancerId}`);
      return res.data.data;
    },
    enabled: !!freelancerId,
  });
}
