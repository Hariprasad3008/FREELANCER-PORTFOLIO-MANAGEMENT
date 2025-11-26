// src/hooks/useConversations.js
import { useQuery } from "@tanstack/react-query";
import { supabase } from "../lib/supabaseClient";
import { useAuth } from "../context/AuthContext";

export function useConversations() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["conversations", user?.id],
    enabled: !!user,
    queryFn: async () => {
      // Get all conversations where current user is a participant
      const { data, error } = await supabase
        .from("conversation_participants")
        .select("conversation_id")
        .eq("user_id", user.id);

      if (error) throw error;

      // unique conversation ids
      const ids = [...new Set(data.map((row) => row.conversation_id))];
      return ids;
    },
  });
}
