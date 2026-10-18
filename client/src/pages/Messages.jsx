import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useConversations, useMessages, useMessageMutations } from '../hooks/useMessages.js';
import { useAuth } from '../context/AuthContext.jsx';
import { getSocket } from '../services/socket.js';
import {
  MessageSquare,
  Send,
  Search,
  CheckCircle,
  Clock,
  User,
  ArrowLeft,
  Circle,
  Smile
} from 'lucide-react';

export const Messages = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const selectedConvId = searchParams.get('conv');
  const directTargetId = searchParams.get('with') || searchParams.get('user') || searchParams.get('recipient');

  const { user, token, onlineUsers } = useAuth();
  const { data: convData, refetch: refetchConversations } = useConversations();
  const { data: msgData, refetch: refetchMessages } = useMessages(selectedConvId);
  const { createConversation, markAsRead } = useMessageMutations();

  const [messageText, setMessageText] = useState('');
  const [messagesList, setMessagesList] = useState([]);
  const [typingUser, setTypingUser] = useState(null);
  const [searchFilter, setSearchFilter] = useState('');

  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  const conversations = convData?.conversations || [];
  const activeConversation = conversations.find((c) => String(c.id) === String(selectedConvId)) || (selectedConvId ? null : conversations[0]);

  // Handle direct user opening via ?with=ID or ?user=ID
  useEffect(() => {
    if (directTargetId) {
      const match = conversations.find(
        (c) => String(c.other_user_id) === String(directTargetId)
      );
      if (match) {
        setSearchParams({ conv: match.id });
      } else {
        createConversation.mutateAsync(directTargetId).then((res) => {
          if (res?.conversation_id) {
            setSearchParams({ conv: res.conversation_id });
            refetchConversations();
          }
        }).catch((err) => {
          console.warn('Could not auto-open conversation:', err.message);
        });
      }
    }
  }, [directTargetId, conversations, setSearchParams]);

  // Set initial conversation if none selected in URL
  useEffect(() => {
    if (!selectedConvId && !directTargetId && conversations.length > 0) {
      setSearchParams({ conv: conversations[0].id });
    }
  }, [selectedConvId, directTargetId, conversations, setSearchParams]);

  // Sync loaded messages
  useEffect(() => {
    if (msgData?.messages) {
      setMessagesList(msgData.messages);
      scrollToBottom();
    }
  }, [msgData]);

  // Mark active conversation read
  useEffect(() => {
    if (selectedConvId) {
      markAsRead.mutate(selectedConvId);
    }
  }, [selectedConvId]);

  // Socket.IO Room Joining & Real-Time Event Listeners
  useEffect(() => {
    const socket = getSocket(token);
    if (!socket || !selectedConvId) return;

    // Join conversation room
    socket.emit('join_conversation', { conversationId: selectedConvId });

    // Handle new incoming message
    const handleReceiveMessage = (newMsg) => {
      if (newMsg.conversation_id === selectedConvId) {
        setMessagesList((prev) => [...prev, newMsg]);
        scrollToBottom();
      }
      refetchConversations();
    };

    // Handle typing events
    const handleUserTyping = ({ conversationId, userName }) => {
      if (conversationId === selectedConvId) {
        setTypingUser(userName);
      }
    };

    const handleUserStopTyping = ({ conversationId }) => {
      if (conversationId === selectedConvId) {
        setTypingUser(null);
      }
    };

    socket.on('receive_message', handleReceiveMessage);
    socket.on('user_typing', handleUserTyping);
    socket.on('user_stop_typing', handleUserStopTyping);

    return () => {
      socket.emit('leave_conversation', { conversationId: selectedConvId });
      socket.off('receive_message', handleReceiveMessage);
      socket.off('user_typing', handleUserTyping);
      socket.off('user_stop_typing', handleUserStopTyping);
    };
  }, [selectedConvId, token, refetchConversations]);

  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 50);
  };

  const handleInputChange = (e) => {
    setMessageText(e.target.value);
    const socket = getSocket(token);
    if (!socket || !selectedConvId) return;

    socket.emit('typing', { conversationId: selectedConvId });

    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      socket.emit('stop_typing', { conversationId: selectedConvId });
    }, 2000);
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!messageText.trim() || !selectedConvId) return;

    const socket = getSocket(token);
    if (!socket) return;

    const body = messageText.trim();
    setMessageText('');

    socket.emit('stop_typing', { conversationId: selectedConvId });

    socket.emit(
      'send_message',
      { conversationId: selectedConvId, body },
      (ack) => {
        if (!ack?.success) {
          console.error('Failed to deliver message:', ack?.message);
        }
      }
    );
  };

  const formatMessageTime = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const filteredConversations = conversations.filter((c) => {
    if (!searchFilter.trim()) return true;
    return c.other_user_name?.toLowerCase().includes(searchFilter.toLowerCase());
  });

  const isOtherOnline = activeConversation && onlineUsers?.includes(activeConversation.other_user_id);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 h-[calc(100vh-140px)] min-h-[600px] flex flex-col">
      <div className="glass-card rounded-3xl flex-1 flex overflow-hidden border border-slate-200/80 shadow-xl">
        {/* Left Panel: Conversation List */}
        <div className={`w-full md:w-80 lg:w-96 border-r border-slate-200/80 bg-white/70 flex flex-col ${
          selectedConvId ? 'hidden md:flex' : 'flex'
        }`}>
          {/* Header */}
          <div className="p-4 border-b border-slate-100">
            <h2 className="text-lg font-bold text-slate-900 mb-3">Messages</h2>
            <div className="relative">
              <input
                type="text"
                placeholder="Search conversations..."
                className="input-field pl-9 py-2 text-xs"
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
              />
              <Search size={15} className="absolute left-3 top-2.5 text-slate-400" />
            </div>
          </div>

          {/* Conversation list */}
          <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
            {filteredConversations.length === 0 ? (
              <div className="text-center py-12 px-4 text-xs text-slate-400">
                No conversations found.
              </div>
            ) : (
              filteredConversations.map((conv) => {
                const isSelected = conv.id === selectedConvId;
                const isOnline = onlineUsers?.includes(conv.other_user_id);

                return (
                  <div
                    key={conv.id}
                    onClick={() => setSearchParams({ conv: conv.id })}
                    className={`p-4 flex items-center gap-3.5 cursor-pointer transition-colors ${
                      isSelected ? 'bg-brand-50/80 border-r-4 border-brand-600' : 'hover:bg-slate-50'
                    }`}
                  >
                    <div className="relative shrink-0">
                      <img
                        src={conv.other_user_avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(conv.other_user_name)}&background=6366f1&color=fff`}
                        alt={conv.other_user_name}
                        className="w-12 h-12 rounded-2xl object-cover border border-white shadow-sm"
                      />
                      {isOnline && (
                        <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-emerald-500 border-2 border-white rounded-full" />
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1 mb-1">
                        <h4 className="text-xs font-bold text-slate-900 truncate">
                          {conv.other_user_name}
                        </h4>
                        {conv.last_message_time && (
                          <span className="text-[10px] text-slate-400 shrink-0">
                            {formatMessageTime(conv.last_message_time)}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center justify-between gap-2">
                        <p className="text-xs text-slate-500 truncate">
                          {conv.last_message_body || 'Started a conversation'}
                        </p>
                        {conv.unread_count > 0 && (
                          <span className="shrink-0 px-1.5 py-0.5 bg-brand-600 text-white text-[10px] font-bold rounded-full">
                            {conv.unread_count}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Panel: Active Chat Thread */}
        {activeConversation ? (
          <div className="flex-1 flex flex-col bg-slate-50/50">
            {/* Thread Header */}
            <div className="p-4 px-6 bg-white/80 border-b border-slate-200/80 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setSearchParams({})}
                  className="md:hidden p-1.5 text-slate-500 hover:text-slate-800 rounded-lg mr-1"
                >
                  <ArrowLeft size={18} />
                </button>

                <div className="relative">
                  <img
                    src={activeConversation.other_user_avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(activeConversation.other_user_name)}&background=6366f1&color=fff`}
                    alt={activeConversation.other_user_name}
                    className="w-10 h-10 rounded-xl object-cover"
                  />
                  {isOtherOnline && (
                    <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full" />
                  )}
                </div>

                <div>
                  <div className="flex items-center gap-1.5">
                    <h3 className="text-sm font-bold text-slate-900">
                      {activeConversation.other_user_name}
                    </h3>
                    <CheckCircle size={14} className="text-brand-500" />
                  </div>
                  <p className="text-[11px] text-slate-500 flex items-center gap-1">
                    <span className={`w-1.5 h-1.5 rounded-full ${isOtherOnline ? 'bg-emerald-500' : 'bg-slate-300'}`}></span>
                    {isOtherOnline ? 'Online Now' : 'Offline'} • {activeConversation.other_user_title || activeConversation.other_user_role}
                  </p>
                </div>
              </div>

              <Link
                to={`/profile/${activeConversation.other_user_id}`}
                className="btn-secondary text-xs py-1.5 px-3"
              >
                <User size={13} /> View Profile
              </Link>
            </div>

            {/* Messages Stream */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {messagesList.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-8">
                  <div className="w-12 h-12 rounded-2xl bg-brand-50 text-brand-600 flex items-center justify-center mb-3">
                    <MessageSquare size={24} />
                  </div>
                  <h4 className="text-sm font-bold text-slate-900 mb-1">Direct Message Thread</h4>
                  <p className="text-xs text-slate-500 max-w-xs">
                    Send a message to introduce yourself, discuss project specifications, or share files.
                  </p>
                </div>
              ) : (
                messagesList.map((msg) => {
                  const isMe = msg.sender_id === user?.id;

                  return (
                    <div
                      key={msg.id}
                      className={`flex items-end gap-2.5 ${isMe ? 'justify-end' : 'justify-start'}`}
                    >
                      {!isMe && (
                        <img
                          src={msg.sender_avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(msg.sender_name || 'User')}&background=6366f1&color=fff`}
                          alt={msg.sender_name}
                          className="w-7 h-7 rounded-xl object-cover shrink-0 mb-1"
                        />
                      )}

                      <div
                        className={`max-w-[75%] sm:max-w-md px-4 py-3 rounded-2xl shadow-sm text-xs sm:text-sm leading-relaxed ${
                          isMe
                            ? 'bg-gradient-to-tr from-brand-600 to-indigo-600 text-white rounded-br-none'
                            : 'bg-white text-slate-800 border border-slate-200/80 rounded-bl-none'
                        }`}
                      >
                        <p className="whitespace-pre-wrap">{msg.body}</p>
                        <span
                          className={`text-[10px] mt-1.5 block text-right font-medium ${
                            isMe ? 'text-indigo-200' : 'text-slate-400'
                          }`}
                        >
                          {formatMessageTime(msg.created_at)}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}

              {/* Typing indicator */}
              {typingUser && (
                <div className="flex items-center gap-2 text-xs text-slate-500 italic animate-pulse">
                  <span className="w-2 h-2 rounded-full bg-brand-500 animate-ping"></span>
                  {typingUser} is typing...
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input Bar */}
            <form onSubmit={handleSendMessage} className="p-4 bg-white/90 border-t border-slate-200/80">
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder={`Message ${activeConversation.other_user_name}... (Press Enter to send)`}
                  className="input-field py-2.5 text-sm"
                  value={messageText}
                  onChange={handleInputChange}
                />
                <button
                  type="submit"
                  disabled={!messageText.trim()}
                  className="btn-primary py-2.5 px-4 rounded-xl"
                >
                  <Send size={16} />
                </button>
              </div>
            </form>
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-slate-50/30">
            <div className="w-16 h-16 rounded-3xl bg-brand-50 text-brand-600 flex items-center justify-center mb-4">
              <MessageSquare size={32} />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-1">Select a Conversation</h3>
            <p className="text-xs text-slate-500 max-w-sm">
              Choose an existing chat thread on the left or reach out to talent through their profile.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
