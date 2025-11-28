// src/hooks/useConversationList.js
import { useQuery } from "@tanstack/react-query";
import { supabase } from "../lib/supabaseClient";
import { useAuth } from "../context/AuthContext";
import { getCachedParticipantMeta } from "../lib/conversationCache";

export function useConversationList() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["conversation-list", user?.id],
    enabled: !!user,
    queryFn: async () => {
      if (!user) return [];

      // 1) All conversations current user is in
      const { data: myParts, error: myErr } = await supabase
        .from("conversation_participants")
        .select("conversation_id")
        .eq("user_id", user.id);

      if (myErr) {
        console.error("conversation_participants (self) error:", myErr);
        return [];
      }

      const convIds = [...new Set(myParts.map((r) => r.conversation_id))];
      if (convIds.length === 0) return [];

      // 2) All participants for those conversations
      const { data: allParts, error: partsErr } = await supabase
        .from("conversation_participants")
        .select("conversation_id, user_id")
        .in("conversation_id", convIds);

      if (partsErr) {
        console.error("conversation_participants (all) error:", partsErr);
        return [];
      }

      // Prepare helper maps
      const byConv = new Map();
      for (const cid of convIds) {
        byConv.set(cid, {
          id: cid,
          participants: [],
          otherUser: null,
          lastMessage: null,
        });
      }

      // 3) Fetch profiles for all participants + anyone who has sent a message
      const senderIds = new Set(allParts.map((p) => p.user_id));

      // 4) Fetch all messages (newest first)
      const { data: msgs, error: msgErr } = await supabase
        .from("messages")
        .select("id, body, sender_id, conversation_id, created_at")
        .in("conversation_id", convIds)
        .order("created_at", { ascending: false });

      if (msgErr) {
        console.error("messages error:", msgErr);
        return [];
      }

      for (const m of msgs) {
        senderIds.add(m.sender_id);
      }

      const userIds = [...senderIds];
      const { data: profiles, error: profErr } = await supabase
        .from("profiles")
        .select("id, full_name")
        .in("id", userIds);

      if (profErr) {
        console.error("profiles error:", profErr);
        return [];
      }

      const profileMap = new Map();
      for (const p of profiles) {
        profileMap.set(p.id, p);
      }

      // Add participants
      for (const p of allParts) {
        const c = byConv.get(p.conversation_id);
        if (!c) continue;
        const prof =
          profileMap.get(p.user_id) || {
            id: p.user_id,
            full_name: `User ${p.user_id.slice(0, 6)}`,
          };
        c.participants.push(prof);
      }

      // Prepare message lookup per conversation
      const messagesByConv = new Map();
      for (const m of msgs) {
        if (!messagesByConv.has(m.conversation_id)) {
          messagesByConv.set(m.conversation_id, []);
        }
        messagesByConv.get(m.conversation_id).push(m);
      }

      // Determine otherUser (prefer participants, fallback to last non-self sender)
      let list = Array.from(byConv.values());
      for (const c of list) {
        const others = c.participants.filter((p) => p.id !== user.id);
        if (others.length === 0) {
          const nonSelfMessage = (messagesByConv.get(c.id) || []).find(
            (m) => m.sender_id !== user.id
          );
          if (nonSelfMessage) {
            const fallbackProfile =
              profileMap.get(nonSelfMessage.sender_id) || {
                id: nonSelfMessage.sender_id,
                full_name: `User ${String(nonSelfMessage.sender_id).slice(0, 6)}`,
              };
            c.otherUser = fallbackProfile;
          } else {
            c.otherUser = {
              id: null,
              full_name: "Unknown participant",
            };
          }
        } else {
          c.otherUser = others[0];
        }
      }

      // Attach lastMessage
      for (const m of msgs) {
        const c = byConv.get(m.conversation_id);
        if (!c) continue;
        if (!c.lastMessage) {
          c.lastMessage = m;
        }
      }

      // Group by otherUser.id → ONE row per person (keep newest)
      const byPartner = new Map();

      for (const c of list) {
        const partnerId = c.otherUser?.id || c.id;
        const existing = byPartner.get(partnerId);

        if (!existing) {
          byPartner.set(partnerId, c);
        } else {
          const existingTime = existing.lastMessage
            ? new Date(existing.lastMessage.created_at).getTime()
            : 0;
          const currentTime = c.lastMessage
            ? new Date(c.lastMessage.created_at).getTime()
            : 0;

          if (currentTime > existingTime) {
            byPartner.set(partnerId, c);
          }
        }
      }

      const groupedList = Array.from(byPartner.values());

      const hydratedList = groupedList.map((conversation) => {
        if (!conversation.otherUser || !conversation.otherUser.id) {
          const cached = getCachedParticipantMeta(conversation.id);
          if (cached) {
            conversation.otherUser = {
              id: cached.targetId,
              full_name: cached.targetName || "Pending participant",
            };
          }
        }
        return conversation;
      });

      // Sort newest first
      return hydratedList.sort((a, b) => {
        const da = a.lastMessage
          ? new Date(a.lastMessage.created_at).getTime()
          : 0;
        const db = b.lastMessage
          ? new Date(b.lastMessage.created_at).getTime()
          : 0;
        return db - da;
      });
    },
  });
}
