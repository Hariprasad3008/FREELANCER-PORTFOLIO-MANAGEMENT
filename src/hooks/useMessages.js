// src/hooks/useMessages.js
import { useQuery } from "@tanstack/react-query";
import { supabase } from "../lib/supabaseClient";
import { useAuth } from "../context/AuthContext";

export function useMessages(conversationId) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["messages", conversationId],
    enabled: !!conversationId,
    queryFn: async () => {
      const { data: msgs, error } = await supabase
        .from("messages")
        .select("id, body, sender_id, conversation_id, created_at")
        .eq("conversation_id", conversationId)
        .order("created_at", { ascending: true });

      if (error) throw error;
      if (!msgs || msgs.length === 0) return [];

      const senderIds = [...new Set(msgs.map((m) => m.sender_id))];

      const { data: profiles, error: profErr } = await supabase
        .from("profiles")
        .select("id, full_name")
        .in("id", senderIds);

      if (profErr) throw profErr;

      const profileMap = new Map();
      for (const p of profiles) {
        profileMap.set(p.id, p.full_name || "Unknown");
      }

      return msgs.map((m) => ({
        ...m,
        sender_name:
          m.sender_id === user?.id
            ? "You"
            : profileMap.get(m.sender_id) || "Unknown",
      }));
    },
  });
}
