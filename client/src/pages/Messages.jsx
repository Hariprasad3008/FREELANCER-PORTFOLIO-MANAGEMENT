import { useEffect, useState, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { useConversationList } from "../hooks/useConversationList";
import { useMessages } from "../hooks/useMessages";
import { useAuth } from "../context/AuthContext";
import { getSocket } from "../services/socket";
import api from "../services/api";

export default function Messages() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: conversations, isLoading: convLoading } = useConversationList();

  const [searchParams] = useSearchParams();
  const initialFromUrl = searchParams.get("c");

  const [selectedId, setSelectedId] = useState(initialFromUrl || null);
  const [text, setText] = useState("");
  const [realtimeMessages, setRealtimeMessages] = useState([]);
  const [typingUser, setTypingUser] = useState(null);
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);

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
    data: initialMessages,
    isLoading: msgLoading,
    isError,
    error,
  } = useMessages(selectedId);

  // Sync initial query messages to local state
  useEffect(() => {
    if (initialMessages) {
      setRealtimeMessages(initialMessages);
    }
  }, [initialMessages]);

  // Socket.IO Room Joining & Real-Time Event Listeners
  useEffect(() => {
    const socket = getSocket();
    if (!socket || !selectedId) return;

    // Join the active conversation room
    socket.emit("join_conversation", selectedId);

    // Handler for incoming messages
    function handleReceiveMessage(msg) {
      if (msg.conversation_id === selectedId) {
        setRealtimeMessages((prev) => {
          // Prevent duplicates
          if (prev.some((m) => m.id === msg.id)) return prev;
          return [...prev, msg];
        });
        queryClient.invalidateQueries(["conversation-list", user?.id]);
      }
    }

    // Handler for typing indicator
    function handleUserTyping(data) {
      if (data.conversationId === selectedId && data.userId !== user?.id) {
        setTypingUser(data.userName);
      }
    }

    function handleUserStopTyping(data) {
      if (data.conversationId === selectedId) {
        setTypingUser(null);
      }
    }

    socket.on("receive_message", handleReceiveMessage);
    socket.on("user_typing", handleUserTyping);
    socket.on("user_stop_typing", handleUserStopTyping);

    return () => {
      socket.emit("leave_conversation", selectedId);
      socket.off("receive_message", handleReceiveMessage);
      socket.off("user_typing", handleUserTyping);
      socket.off("user_stop_typing", handleUserStopTyping);
    };
  }, [selectedId, user?.id, queryClient]);

  // Auto-scroll to bottom of chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [realtimeMessages]);

  const selectedConversation =
    conversations?.find((c) => c.id === selectedId) || null;

  function handleTyping(e) {
    setText(e.target.value);
    const socket = getSocket();
    if (!socket || !selectedId) return;

    socket.emit("typing", { conversationId: selectedId });

    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      socket.emit("stop_typing", { conversationId: selectedId });
    }, 2000);
  }

  async function handleSend(e) {
    e.preventDefault();
    if (!text.trim() || !selectedId || !user) return;

    const body = text.trim();
    setText("");

    const socket = getSocket();
    if (socket) {
      socket.emit("stop_typing", { conversationId: selectedId });
    }

    try {
      const res = await api.post(`/messages/conversations/${selectedId}/messages`, {
        body,
      });

      if (res.data.success) {
        const sentMsg = res.data.data;
        // Optimistically add if not already received via socket
        setRealtimeMessages((prev) => {
          if (prev.some((m) => m.id === sentMsg.id)) return prev;
          return [...prev, sentMsg];
        });
        queryClient.invalidateQueries(["conversation-list", user.id]);
      }
    } catch (err) {
      console.error("Failed to send message:", err);
    }
  }

  const noConversations =
    !convLoading && (!conversations || conversations.length === 0);

  return (
    <div className="grid gap-4 md:grid-cols-[280px,1fr] h-[75vh] rounded-3xl border border-slate-800 bg-slate-950/80 shadow-2xl overflow-hidden backdrop-blur">
      {/* LEFT: CONVERSATION LIST */}
      <aside className="border-r border-slate-800 bg-slate-900/60 flex flex-col">
        <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-100">Messages</h2>
          <span className="text-[10px] bg-brand-500/15 text-brand-300 px-2 py-0.5 rounded-full font-semibold border border-brand-500/20">
            Live Chat
          </span>
        </div>

        <div className="flex-1 overflow-y-auto text-xs divide-y divide-slate-800/50">
          {convLoading && (
            <p className="px-5 py-4 text-slate-400">Loading conversations...</p>
          )}

          {noConversations && (
            <div className="px-5 py-6 text-center text-slate-400 space-y-2">
              <p>No active conversations yet.</p>
              <p className="text-[11px] text-slate-500">
                Browse profiles or projects to start a conversation.
              </p>
            </div>
          )}

          {conversations?.map((conv) => {
            const other = conv.otherUser;
            const name = other?.full_name || "Marketplace User";
            const initials = name
              .split(" ")
              .map((n) => n[0])
              .join("");

            return (
              <button
                key={conv.id}
                onClick={() => setSelectedId(conv.id)}
                className={`w-full text-left px-4 py-3.5 hover:bg-slate-800/60 flex items-start gap-3 transition ${
                  conv.id === selectedId ? "bg-slate-800/90 border-l-4 border-brand-500" : ""
                }`}
              >
                <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-brand-600/30 to-indigo-600/30 border border-brand-500/30 flex items-center justify-center text-xs font-bold text-brand-300 shrink-0">
                  {initials}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-bold text-slate-100 truncate">{name}</p>
                    <span className="text-[9px] text-slate-500 capitalize">{other?.role}</span>
                  </div>
                  <p className="text-[11px] text-slate-400 truncate mt-0.5">
                    {conv.lastMessage?.body || "No messages yet"}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </aside>

      {/* RIGHT: CHAT WORKSPACE */}
      <section className="flex flex-col bg-slate-900/40">
        {/* Chat Header */}
        <div className="px-6 py-3.5 border-b border-slate-800 flex items-center justify-between bg-slate-900/60">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-xs font-bold text-slate-200">
              {selectedConversation
                ? (selectedConversation.otherUser?.full_name || "U")[0]
                : "–"}
            </div>
            <div>
              <p className="text-xs font-bold text-slate-100">
                {selectedConversation?.otherUser?.full_name || "No conversation selected"}
              </p>
              <p className="text-[10px] text-emerald-400 font-medium">
                {selectedConversation ? "● Real-time connection active" : "Select a thread"}
              </p>
            </div>
          </div>
        </div>

        {/* Message Stream */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4 text-xs">
          {!selectedId && (
            <div className="h-full flex items-center justify-center text-slate-400">
              Select a conversation from the sidebar to chat in real time.
            </div>
          )}

          {selectedId && msgLoading && (
            <p className="text-slate-400">Loading messages...</p>
          )}

          {selectedId && isError && (
            <p className="text-red-400">Error: {error?.message}</p>
          )}

          {selectedId &&
            !msgLoading &&
            realtimeMessages.length === 0 && (
              <div className="h-full flex flex-col items-center justify-center text-slate-400 space-y-1">
                <p className="font-semibold text-slate-300">No messages yet</p>
                <p className="text-[11px]">Send a greeting to start collaborating!</p>
              </div>
            )}

          {realtimeMessages.map((m) => {
            const isMe = m.sender_id === user?.id;
            return (
              <div
                key={m.id || m.created_at}
                className={`flex ${isMe ? "justify-end" : "justify-start"}`}
              >
                <div className="max-w-[70%] space-y-1">
                  {!isMe && (
                    <p className="text-[10px] text-slate-400 px-1 font-medium">
                      {m.sender_name || selectedConversation?.otherUser?.full_name}
                    </p>
                  )}
                  <div
                    className={`rounded-2xl px-4 py-2.5 shadow-sm text-xs ${
                      isMe
                        ? "bg-brand-600 text-white rounded-br-none"
                        : "bg-slate-800 text-slate-100 rounded-bl-none border border-slate-700/60"
                    }`}
                  >
                    <p className="leading-relaxed whitespace-pre-line">{m.body}</p>
                  </div>
                  <p
                    className={`text-[9px] text-slate-500 px-1 ${
                      isMe ? "text-right" : "text-left"
                    }`}
                  >
                    {new Date(m.created_at || Date.now()).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              </div>
            );
          })}

          {/* Typing Indicator */}
          {typingUser && (
            <div className="flex items-center gap-2 text-[11px] text-slate-400 italic animate-pulse">
              <span>{typingUser} is typing...</span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Message Input Form */}
        <form
          className="border-t border-slate-800 p-4 bg-slate-900/60 flex items-center gap-3"
          onSubmit={handleSend}
        >
          <input
            type="text"
            placeholder={
              selectedId
                ? "Type a message (Press Enter to send)..."
                : "Select a conversation to start typing"
            }
            value={text}
            onChange={handleTyping}
            disabled={!selectedId}
            className="flex-1 rounded-xl border border-slate-700 bg-slate-950/70 px-4 py-2.5 text-xs text-slate-100 outline-none focus:border-brand-500 transition disabled:opacity-50"
          />
          <button
            disabled={!selectedId || !text.trim()}
            className="rounded-xl bg-brand-600 px-5 py-2.5 text-xs font-semibold text-white shadow-md shadow-brand-600/25 hover:bg-brand-500 transition disabled:opacity-50"
          >
            Send
          </button>
        </form>
      </section>
    </div>
  );
}
