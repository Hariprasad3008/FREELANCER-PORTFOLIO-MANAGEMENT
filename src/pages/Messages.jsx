// src/pages/Messages.jsx
import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { useConversationList } from "../hooks/useConversationList";
import { useMessages } from "../hooks/useMessages";
import { useAuth } from "../context/AuthContext";
import { supabase } from "../lib/supabaseClient";

export default function Messages() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: conversations, isLoading: convLoading } =
    useConversationList();

  const [searchParams] = useSearchParams();
  const initialFromUrl = searchParams.get("c");

  const [selectedId, setSelectedId] = useState(initialFromUrl || null);
  const [text, setText] = useState("");

  // Apply ?c= from URL
  useEffect(() => {
    if (!selectedId && initialFromUrl) {
      setSelectedId(initialFromUrl);
    }
  }, [initialFromUrl, selectedId]);

  // Auto-select first conversation if none selected
  useEffect(() => {
    if (!selectedId && conversations && conversations.length > 0) {
      setSelectedId(conversations[0].id);
    }
  }, [conversations, selectedId]);

  const {
    data: messages,
    isLoading: msgLoading,
    isError,
    error,
  } = useMessages(selectedId);

  const selectedConversation =
    conversations?.find((c) => c.id === selectedId) || null;

  // Optional: mark as read (won't break if RLS blocks it)
  useEffect(() => {
    if (!selectedId || !user) return;

    async function markAsRead() {
      const { error: upErr } = await supabase
        .from("conversation_reads")
        .upsert(
          {
            conversation_id: selectedId,
            user_id: user.id,
            last_read_at: new Date().toISOString(),
          },
          { onConflict: "conversation_id,user_id" }
        );

      if (upErr) {
        console.error("Failed to mark as read:", upErr);
      } else {
        queryClient.invalidateQueries(["conversation-list", user.id]);
      }
    }

    markAsRead();
  }, [selectedId, user, messages, queryClient]);

  async function handleSend(e) {
    e.preventDefault();
    if (!text.trim() || !selectedId || !user) return;

    const body = text.trim();
    setText("");

    const { error: insertError } = await supabase.from("messages").insert({
      conversation_id: selectedId,
      sender_id: user.id,
      body,
    });

    if (insertError) {
      console.error(insertError);
      return;
    }

    queryClient.invalidateQueries(["messages", selectedId]);
    queryClient.invalidateQueries(["conversation-list", user.id]);
  }

  const noConversations =
    !convLoading && (!conversations || conversations.length === 0);

  return (
    <div className="grid gap-4 md:grid-cols-[260px,1fr] h-[70vh]">
      {/* Conversation List */}
      <aside className="rounded-2xl border border-slate-800 bg-slate-900/80 flex flex-col">
        <div className="px-4 py-3 border-b border-slate-800">
          <h2 className="text-sm font-semibold">Messages</h2>
        </div>

        <div className="flex-1 overflow-y-auto text-xs">
          {convLoading && (
            <p className="px-4 py-3 text-slate-400">Loading conversations...</p>
          )}

          {noConversations && (
            <p className="px-4 py-3 text-slate-400">
              No conversations yet. Start messaging from a profile or project.
            </p>
          )}

          {conversations &&
            conversations.map((conv) => {
              const other = conv.otherUser;
              const name = other?.full_name || "Unknown user";
              const initials = name
                .split(" ")
                .map((n) => n[0])
                .join("");

              return (
                <button
                  key={conv.id}
                  onClick={() => setSelectedId(conv.id)}
                  className={`w-full text-left px-4 py-3 border-b border-slate-900 hover:bg-slate-800/80 flex items-start gap-2 text-xs ${
                    conv.id === selectedId ? "bg-slate-800/70" : ""
                  }`}
                >
                  <div className="h-8 w-8 rounded-2xl bg-slate-800 flex items-center justify-center text-[11px] font-semibold">
                    {initials}
                  </div>
                  <div className="flex-1">
                    <p className="text-xs font-semibold text-slate-100 line-clamp-1">
                      {name}
                    </p>
                    <p className="text-[11px] text-slate-400 line-clamp-1">
                      {conv.lastMessage?.body || "No messages yet"}
                    </p>
                  </div>
                </button>
              );
            })}
        </div>
      </aside>

      {/* Chat Area */}
      <section className="rounded-2xl border border-slate-800 bg-slate-900/80 flex flex-col">
        <div className="px-4 py-3 border-b border-slate-800 flex items-center gap-2">
          <div className="h-8 w-8 rounded-2xl bg-slate-800 flex items-center justify-center text-[11px] font-semibold">
            {selectedConversation
              ? selectedConversation.otherUser.full_name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")
              : "–"}
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-100">
              {selectedConversation?.otherUser?.full_name ||
                "No conversation selected"}
            </p>
            <p className="text-[11px] text-slate-400">
              {selectedConversation
                ? "Messages are loaded from Supabase."
                : "Choose a conversation on the left or start from a profile."}
            </p>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3 text-xs">
          {!selectedId && (
            <p className="text-slate-400">
              Select a conversation on the left to start chatting.
            </p>
          )}

          {selectedId && msgLoading && (
            <p className="text-slate-400">Loading messages...</p>
          )}
          {selectedId && isError && (
            <p className="text-red-400">Error: {error.message}</p>
          )}
          {selectedId &&
            !msgLoading &&
            messages &&
            messages.length === 0 && (
              <p className="text-slate-400">No messages yet.</p>
            )}

          {messages &&
            messages.map((m) => {
              const isMe = m.sender_id === user?.id;
              return (
                <div
                  key={m.id}
                  className={`flex ${isMe ? "justify-end" : "justify-start"}`}
                >
                  <div className="max-w-[75%] space-y-1">
                    <p className="text-[10px] text-slate-400 px-1">
                      {m.sender_name}
                    </p>
                    <div
                      className={`rounded-2xl px-3 py-2 ${
                        isMe
                          ? "bg-brand-600 text-white rounded-br-sm"
                          : "bg-slate-800 text-slate-100 rounded-bl-sm"
                      }`}
                    >
                      <p>{m.body}</p>
                    </div>
                  </div>
                </div>
              );
            })}
        </div>

        <form
          className="border-t border-slate-800 px-4 py-3 flex gap-2"
          onSubmit={handleSend}
        >
          <input
            type="text"
            placeholder={
              selectedId
                ? "Type a message..."
                : "Select a conversation to start messaging"
            }
            value={text}
            onChange={(e) => setText(e.target.value)}
            disabled={!selectedId}
            className="flex-1 rounded-xl border border-slate-700 bg-slate-950/60 px-3 py-2 text-xs outline-none focus:border-brand-500 disabled:opacity-50"
          />
          <button
            disabled={!selectedId || !text.trim()}
            className="rounded-xl bg-brand-600 px-4 py-2 text-xs font-medium hover:bg-brand-700 transition disabled:opacity-50"
          >
            Send
          </button>
        </form>
      </section>
    </div>
  );
}
