"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  Send,
  Search,
  Phone,
  Video,
  MoreVertical,
  Paperclip,
  Smile,
  MessageSquare,
  CheckCircle,
} from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useLanguage, interpolate } from "@/lib/i18n/LanguageContext";
import api from "@/lib/axios";
import Skeleton from "@/components/ui/Skeleton";
import { SkeletonList } from "@/components/ui/SkeletonPresets";

interface TicketMessage {
  id: number;
  message: string;
  sender_name: string;
  sender_type: string;
  created_at: string;
  is_internal: boolean;
}

interface Ticket {
  id: number;
  ticket_id: string;
  subject: string;
  status: string;
  priority: string;
  source: string;
  created_at: string;
  client: {
    user: {
      first_name: string;
      last_name: string;
    };
    company: string;
  };
  messages_count?: number;
}

interface Chat {
  id: number;
  name: string;
  lastMessage: string;
  timestamp: string;
  unread: number;
  avatar: string;
  online: boolean;
  ticket?: Ticket;
}

export default function MessagesPage() {
  const searchParams = useSearchParams();
  const requestedTicketId = searchParams?.get('ticketId');
  const { t, language: currentLang } = useLanguage();
  const [chats, setChats] = useState<Chat[]>([]);
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null);
  const [messages, setMessages] = useState<TicketMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [seenCounts, setSeenCounts] = useState<Record<number, number>>({});
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = (force = false) => {
    if (force || !scrollContainerRef.current) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
      return;
    }

    const container = scrollContainerRef.current;
    const isAtBottom = container.scrollHeight - container.scrollTop <= container.clientHeight + 100;

    if (isAtBottom) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  };

  useEffect(() => {
    scrollToBottom(false);
  }, [messages]);

  useEffect(() => {
    const saved = localStorage.getItem("seenMessages");
    if (saved) setSeenCounts(JSON.parse(saved));
  }, []);

  useEffect(() => {
    fetchTickets(true);

    // Refresh ticket list every 10 seconds
    const ticketInterval = setInterval(() => fetchTickets(false), 10000);
    return () => clearInterval(ticketInterval);
  }, []);

  useEffect(() => {
    if (selectedChat) {
      // Fetch messages immediately when chat changes
      fetchMessages(selectedChat.id);

      // Force initial scroll
      setTimeout(() => scrollToBottom(true), 100);

      // Poll for new messages every 2 seconds
      const messageInterval = setInterval(() => {
        fetchMessages(selectedChat.id);
      }, 2000);

      return () => clearInterval(messageInterval);
    }
  }, [selectedChat]);

  const fetchTickets = async (isInitial = false) => {
    try {
      if (isInitial) setLoading(true);

      const response = await api.get("/tickets/");

      console.log("Response status:", response.status);

      if (response.status === 200) {
        const data = response.data;
        console.log("Messages API Response:", data);

        // Handle different response formats
        let ticketsArray = [];
        if (Array.isArray(data)) {
          ticketsArray = data;
        } else if (data && Array.isArray(data.data)) {
          ticketsArray = data.data;
        } else if (data && Array.isArray(data.results)) {
          ticketsArray = data.results;
        } else if (data && Array.isArray(data.tickets)) {
          ticketsArray = data.tickets;
        } else if (data && data.data && typeof data.data === "object") {
          // Handle case where data.data is an object with tickets property
          if (Array.isArray(data.data.tickets)) {
            ticketsArray = data.data.tickets;
          } else if (Array.isArray(data.data.results)) {
            ticketsArray = data.data.results;
          } else {
            // Convert single object to array or handle pagination
            ticketsArray = Object.values(data.data).filter(
              (item: any) => item && typeof item === "object" && item.id,
            );
          }
        } else {
          console.error("Unexpected response format:", data);
          setLoading(false);
          return;
        }

        // Convert tickets to chat format
        const sortedTickets = [...ticketsArray].sort((a, b) => {
          const timeA = new Date(a.last_message_at || a.created_at).getTime();
          const timeB = new Date(b.last_message_at || b.created_at).getTime();
          return timeB - timeA;
        });

        const ticketChats: Chat[] = sortedTickets.map((ticket: any) => {
          const totalMessages = ticket.messages_count || 0;
          const seen = seenCounts[ticket.id] || 0;
          const unread = Math.max(0, totalMessages - seen);

          return {
            id: ticket.id,
            name: `Support - ${ticket.ticket_id}`,
            lastMessage: ticket.subject || "No subject",
            timestamp: new Date(ticket.last_message_at || ticket.created_at).toLocaleDateString(),
            unread: unread,
            avatar: "🎧",
            online: ticket.status !== "resolved",
            ticket,
          };
        });

        setChats(ticketChats);
        if (ticketChats.length > 0 && !selectedChat) {
          let chatToSelect = ticketChats[0];
          if (requestedTicketId) {
            const foundChat = ticketChats.find(c => String(c.id) === requestedTicketId || c.ticket?.ticket_id === requestedTicketId);
            if (foundChat) {
              chatToSelect = foundChat;
            }
          }
          setSelectedChat(chatToSelect);
          fetchMessages(chatToSelect.id);
        }
      } else {
        console.error(
          "Failed to fetch tickets:",
          response.status,
          response.statusText,
        );
        if (response.status === 401) {
          console.error(
            "Authentication failed - token may be expired or invalid",
          );
          // Optionally redirect to login
          // window.location.href = '/login';
        }
      }
    } catch (error) {
      console.error("Failed to fetch tickets:", error);
    } finally {
      if (isInitial) setLoading(false);
    }
  };

  const fetchMessages = async (ticketId: number) => {
    try {
      console.log("Fetching messages for ticket ID:", ticketId);

      if (!ticketId || ticketId === undefined) {
        console.error("Invalid ticket ID:", ticketId);
        return;
      }

      const response = await api.get(`/tickets/${ticketId}/messages/`);

      if (response && response.status === 200) {
        const result = response.data;
        // Normalize different API response shapes into an array
        let messagesArray: TicketMessage[] = [];
        if (Array.isArray(result)) {
          messagesArray = result;
        } else if (result && Array.isArray(result.data)) {
          messagesArray = result.data;
        } else if (result && Array.isArray(result.results)) {
          messagesArray = result.results;
        } else if (result && result.data && typeof result.data === "object") {
          // Convert object collections into an array of values that look like messages
          messagesArray = (Object.values(result.data) as TicketMessage[]).filter(
            (item) => item && item.id,
          );
        } else {
          messagesArray = [];
        }

        setMessages(messagesArray);
      } else {
        console.error(
          "Failed to fetch messages:",
          response.status,
          response.statusText,
        );
      }
    } catch (error) {
      console.error("Failed to fetch messages:", error);
    }
  };

  const handleSendMessage = async () => {
    if (newMessage.trim() && selectedChat) {
      try {
        const response = await api.post(`/tickets/${selectedChat.id}/send-message/`, {
          message: newMessage,
        });

        if (response.status === 200 || response.status === 201) {
          setNewMessage("");
          // Refresh messages and force scroll
          await fetchMessages(selectedChat.id);
          scrollToBottom(true);
          // Refresh ticket list to update last activity and move it to top
          fetchTickets(false);
        } else {
          console.error(
            "Failed to send message:",
            response.status,
            response.statusText,
          );
        }
      } catch (error) {
        console.error("Failed to send message:", error);
      }
    }
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString(currentLang === 'it' ? 'it-IT' : 'en-US', {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  const filteredChats = chats.filter((chat) =>
    chat.name.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const hasAutoReply =
    Array.isArray(messages) &&
    messages.some(
      (msg) =>
        msg &&
        (msg.sender_type === "system" ||
          (msg.sender_name && msg.sender_name.includes("Auto Reply"))),
    );

  if (loading) {
    return (
      <div className="h-screen bg-background flex">
        <div className="w-80 bg-card border-r border-secondary flex flex-col">
          <div className="p-4 border-b border-secondary space-y-4">
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-10 w-full rounded-full" />
          </div>
          <div className="p-4">
            <SkeletonList rows={6} />
          </div>
        </div>
        <div className="flex-1 flex flex-col">
          <div className="p-4 border-b border-secondary flex items-center gap-3">
            <Skeleton variant="circle" width={40} height={40} />
            <div className="flex flex-col gap-2">
              <Skeleton className="h-4 w-40" />
              <Skeleton className="h-3 w-24" />
            </div>
          </div>
          <div className="flex-1 p-6 space-y-4">
            <Skeleton className="h-16 w-2/3 rounded-2xl" />
            <Skeleton className="h-16 w-1/2 rounded-2xl ml-auto" />
            <Skeleton className="h-16 w-3/5 rounded-2xl" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-background flex">
      {/* Sidebar - Chat List */}
      <div className="w-80 bg-card border-r border-secondary flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-secondary">
          <h1 className="text-xl font-semibold text-foreground mb-4">
            {interpolate(t.dashboard.support.sidebarTitle)}
          </h1>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-foreground opacity-40 w-4 h-4" />
            <input
              type="text"
              placeholder={interpolate(t.dashboard.support.searchConversations)}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-secondary border border-secondary rounded-lg text-foreground placeholder:opacity-60 focus:border-primary outline-none"
            />
          </div>
        </div>

        {/* Chat List */}
        <div className="flex-1 overflow-y-auto">
          {filteredChats.length === 0 ? (
            <div className="p-4 text-center text-foreground/60">
              {interpolate(t.dashboard.support.noTicketsFound)}
            </div>
          ) : (
            filteredChats.map((chat) => (
              <div
                key={chat.id}
                onClick={() => {
                  setSelectedChat(chat);
                  if (chat.unread > 0) {
                    const newSeen = { ...seenCounts, [chat.id]: chat.ticket?.messages_count || 0 };
                    setSeenCounts(newSeen);
                    localStorage.setItem("seenMessages", JSON.stringify(newSeen));
                  }
                }}
                className={`p-4 border-b border-secondary cursor-pointer hover:bg-secondary/50 transition-colors ${selectedChat?.id === chat.id
                    ? "bg-secondary/30 border-l-4 border-l-primary"
                    : ""
                  }`}
              >
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div className="w-12 h-12 rounded-full bg-gradient-primary flex items-center justify-center text-xl">
                      {chat.avatar}
                    </div>
                    {chat.online && (
                      <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-card"></div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="font-medium text-foreground truncate">
                        {chat.name}
                      </h3>
                      <div className="flex flex-col items-end gap-1">
                        <span className="text-xs text-foreground opacity-60">
                          {chat.timestamp}
                        </span>
                        <div className="flex items-center gap-1.5">
                          {chat.unread > 0 && (
                            <span className="bg-primary text-black text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center">
                              {chat.unread}
                            </span>
                          )}
                          <span className="text-[10px] text-foreground opacity-40 bg-secondary/50 px-1.5 rounded">
                            {chat.ticket?.messages_count || 0} msgs
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-foreground opacity-70 truncate">
                        {chat.lastMessage}
                      </p>
                      {chat.ticket?.status && (
                        <span
                          className={`text-xs px-2 py-1 rounded ${chat.ticket.status === "resolved"
                              ? "bg-green-500/20 text-green-300"
                              : chat.ticket.status === "new"
                                ? "bg-blue-500/20 text-blue-300"
                                : "bg-yellow-500/20 text-yellow-300"
                            }`}
                        >
                          {chat.ticket.status}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {selectedChat ? (
          <>
            {/* Chat Header */}
            <div className="p-4 bg-card border-b border-secondary flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="w-10 h-10 rounded-full bg-gradient-primary flex items-center justify-center text-lg">
                    {selectedChat.avatar}
                  </div>
                  {selectedChat.online && (
                    <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-card"></div>
                  )}
                </div>
                <div>
                  <h2 className="font-semibold text-foreground">
                    {selectedChat.name}
                  </h2>
                  <div className="flex items-center gap-2">
                    <p className="text-xs text-foreground opacity-60">
                      {selectedChat.online ? interpolate(t.dashboard.support.active) : interpolate(t.dashboard.support.resolved)}
                    </p>
                    {hasAutoReply && (
                      <span className="text-xs px-2 py-1 rounded bg-green-500/20 text-green-300 flex items-center gap-1">
                        <CheckCircle size={10} />
                        {interpolate(t.dashboard.support.autoReplied)}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button className="p-2 rounded-lg bg-secondary hover:bg-secondary/80 transition-colors">
                  <Phone className="w-5 h-5 text-foreground" />
                </button>
                <button className="p-2 rounded-lg bg-secondary hover:bg-secondary/80 transition-colors">
                  <Video className="w-5 h-5 text-foreground" />
                </button>
                <button className="p-2 rounded-lg bg-secondary hover:bg-secondary/80 transition-colors">
                  <MoreVertical className="w-5 h-5 text-foreground" />
                </button>
              </div>
            </div>

            {/* Messages */}
            <div
              ref={scrollContainerRef}
              className="flex-1 overflow-y-auto p-4 space-y-4"
            >
              {messages.map((message) => {
                const isSystemMessage =
                  message.sender_type === "system" ||
                  message.sender_name.includes("Auto Reply");
                const isUserMessage = message.sender_type === "client";

                return (
                  <div
                    key={message.id}
                    className={`flex ${isUserMessage ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${isUserMessage
                          ? "bg-primary text-black"
                          : isSystemMessage
                            ? "bg-green-500/20 text-green-300 border border-green-500/30"
                            : "bg-secondary text-foreground"
                        }`}
                    >
                      {isSystemMessage && (
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-semibold">
                            🤖 Auto Reply System
                          </span>
                        </div>
                      )}
                      <p className="text-sm">{message.message}</p>
                      <p
                        className={`text-xs mt-1 ${isUserMessage ? "text-black/70" : "text-foreground/60"
                          }`}
                      >
                        {formatTime(message.created_at)}
                      </p>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <div className="p-4 bg-card border-t border-secondary">
              <div className="flex items-center gap-2">
                <button className="p-2 rounded-lg bg-secondary hover:bg-secondary/80 transition-colors">
                  <Paperclip className="w-5 h-5 text-foreground" />
                </button>

                <div className="flex-1 relative">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                    placeholder={interpolate(t.dashboard.support.typeMessage)}
                    className="w-full px-4 py-3 bg-secondary border border-secondary rounded-lg text-foreground placeholder:opacity-60 focus:border-primary outline-none pr-12"
                  />
                  <button className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-lg hover:bg-secondary/80 transition-colors">
                    <Smile className="w-5 h-5 text-foreground opacity-60" />
                  </button>
                </div>

                <button
                  onClick={handleSendMessage}
                  disabled={!newMessage.trim()}
                  className="p-3 rounded-lg bg-primary text-black hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Send className="w-5 h-5" />
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center text-foreground/60">
              <MessageSquare size={48} className="mx-auto mb-4 opacity-40" />
              <p>{interpolate(t.dashboard.support.selectToStart)}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
