// src/hooks/useFreelancerReviews.js
import { useQuery } from "@tanstack/react-query";
import { supabase } from "../lib/supabaseClient";

export function useFreelancerReviews(freelancerId) {
  return useQuery({
    queryKey: ["freelancer-reviews", freelancerId],
    enabled: !!freelancerId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("reviews")
        .select(`
          id,
          rating,
          comment,
          created_at,
          client:profiles!reviews_client_id_fkey (
            id,
            full_name
          ),
          project:projects (
            id,
            title
          )
        `)
        .eq("freelancer_id", freelancerId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
  });
}
