import { useQuery } from "@tanstack/react-query";
import { supabase } from "../lib/supabaseClient";
import { useAuth } from "../context/AuthContext";

export function useSavedProjects() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["savedProjects", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("saved_projects")
        .select(`
          id,
          created_at,
          project:projects (
            id,
            title,
            description,
            budget_min,
            budget_max,
            budget_type,
            status
          )
        `)
        .eq("freelancer_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
  });
}
