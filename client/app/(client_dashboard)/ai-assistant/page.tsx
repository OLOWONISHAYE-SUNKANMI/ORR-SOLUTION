"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  Send,
  Bot,
  User,
  Sparkles,
  Lightbulb,
  MessageSquare,
  RotateCcw,
  Loader2,
} from "lucide-react";
import api from "@/lib/axios";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

const SUGGESTION_CHIPS = [
  { label: "What services does ORR offer?", icon: "🏢" },
  { label: "Help me understand my current stage", icon: "📊" },
  { label: "How can I prepare for my next meeting?", icon: "📋" },
  { label: "Explain Strategic Advisory & Compliance", icon: "⚖️" },
  { label: "What is the 5D journey?", icon: "🗺️" },
  { label: "How do I submit a support ticket?", icon: "🎧" },
];

export default function AIAssistantPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingHistory, setIsFetchingHistory] = useState(true);
  const [sessionId] = useState("global_client");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const response = await api.get(`/ai/chat/?session_id=${sessionId}&t=${Date.now()}`);
        const historyMessages = response.data?.data?.messages || response.data?.messages;
        if (historyMessages && Array.isArray(historyMessages) && historyMessages.length > 0) {
          setMessages(
            historyMessages.map((m: any, idx: number) => ({
              id: `hist-${idx}`,
              role: m.role === "assistant" ? "assistant" : "user",
              content: m.content,
              timestamp: new Date(),
            }))
          );
        }
      } catch (err) {
        console.error("Failed to fetch chat history:", err);
      } finally {
        setIsFetchingHistory(false);
      }
    };
    fetchHistory();
  }, [sessionId]);

  const sendMessage = async (text: string) => {
    if (!text.trim() || isLoading) return;

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: "user",
      content: text.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      // Build conversation history for context
      const history = messages.map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const response = await api.post("/ai/chat/", {
        message: text.trim(),
        conversation_history: history,
        session_id: sessionId,
      });

      const aiReply =
        response.data?.reply ||
        response.data?.data?.reply ||
        "I'm sorry, I couldn't process your request. Please try again.";

      const assistantMessage: Message = {
        id: `ai-${Date.now()}`,
        role: "assistant",
        content: aiReply,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error: any) {
      console.error("AI chat error:", error);
      const errorMessage: Message = {
        id: `error-${Date.now()}`,
        role: "assistant",
        content:
          "I apologise — I'm experiencing a temporary issue. Please try again in a moment, or contact the ORR team directly via the Support page.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
      inputRef.current?.focus();
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  const resetConversation = () => {
    setMessages([]);
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Header */}
      <div className="border-b border-secondary bg-card/80 backdrop-blur-xl px-6 py-4 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 via-primary to-teal-400 flex items-center justify-center shadow-lg shadow-primary/30">
              <Bot className="w-6 h-6 text-white" />
            </div>
            <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-emerald-500 border-2 border-card rounded-full" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-foreground flex items-center gap-2">
              ORR AI Assistant
              <span className="text-xs font-medium text-primary bg-primary/10 px-2 py-0.5 rounded-full border border-primary/20">
                Powered by Gemini
              </span>
            </h1>
            <p className="text-xs text-foreground/50">
              Your intelligent guide to ORR Solutions services
            </p>
          </div>
        </div>

        <button
          onClick={resetConversation}
          className="p-2.5 rounded-xl bg-secondary/50 hover:bg-secondary border border-secondary text-foreground/60 hover:text-foreground transition-all"
          title="Reset conversation"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto px-4 py-6">
        <div className="max-w-3xl mx-auto space-y-6">
          {/* Welcome State */}
          {isFetchingHistory ? (
            <div className="flex flex-col items-center justify-center py-20 space-y-4 animate-in fade-in duration-500">
              <Loader2 className="w-10 h-10 text-primary animate-spin" />
              <p className="text-sm text-foreground/50 font-medium">Loading conversation...</p>
            </div>
          ) : messages.length === 0 && (
            <div className="text-center py-12 space-y-8 animate-in fade-in duration-500">
              <div className="space-y-4">
                <div className="w-20 h-20 mx-auto rounded-3xl bg-gradient-to-br from-emerald-500/20 via-primary/20 to-teal-400/20 border border-primary/20 flex items-center justify-center">
                  <Sparkles className="w-10 h-10 text-primary" />
                </div>
                <h2 className="text-2xl font-bold text-foreground">
                  How can I help you today?
                </h2>
                <p className="text-foreground/50 max-w-md mx-auto text-sm leading-relaxed">
                  I'm your AI assistant, here to help you navigate ORR
                  Solutions' services, prepare for meetings, and answer
                  questions about your business journey.
                </p>
              </div>

              {/* Suggestion Chips */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-xl mx-auto">
                {SUGGESTION_CHIPS.map((chip, idx) => (
                  <button
                    key={idx}
                    onClick={() => sendMessage(chip.label)}
                    className="group flex items-center gap-3 p-4 rounded-2xl bg-card border border-secondary hover:border-primary/40 text-left transition-all hover:shadow-lg hover:shadow-primary/5 hover:-translate-y-0.5"
                  >
                    <span className="text-xl flex-shrink-0">{chip.icon}</span>
                    <span className="text-sm font-medium text-foreground/80 group-hover:text-foreground transition-colors">
                      {chip.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Message Bubbles */}
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex gap-3 ${
                msg.role === "user" ? "justify-end" : "justify-start"
              } animate-in fade-in slide-in-from-bottom-2 duration-300`}
            >
              {/* AI Avatar */}
              {msg.role === "assistant" && (
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-emerald-500 to-primary flex items-center justify-center flex-shrink-0 mt-1 shadow-sm">
                  <Bot className="w-4 h-4 text-white" />
                </div>
              )}

              <div
                className={`max-w-[75%] space-y-1 ${
                  msg.role === "user" ? "items-end" : "items-start"
                } flex flex-col`}
              >
                <div
                  className={`px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap ${
                    msg.role === "user"
                      ? "bg-primary text-black rounded-2xl rounded-br-md font-medium shadow-md shadow-primary/20"
                      : "bg-card border border-secondary text-foreground rounded-2xl rounded-bl-md shadow-sm"
                  }`}
                >
                  {msg.content}
                </div>
                <span className="text-[10px] text-foreground/30 px-1 font-medium">
                  {formatTime(msg.timestamp)}
                </span>
              </div>

              {/* User Avatar */}
              {msg.role === "user" && (
                <div className="w-8 h-8 rounded-xl bg-secondary border border-secondary flex items-center justify-center flex-shrink-0 mt-1">
                  <User className="w-4 h-4 text-foreground/60" />
                </div>
              )}
            </div>
          ))}

          {/* Typing Indicator */}
          {isLoading && (
            <div className="flex gap-3 justify-start animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-emerald-500 to-primary flex items-center justify-center flex-shrink-0 mt-1 shadow-sm">
                <Bot className="w-4 h-4 text-white" />
              </div>
              <div className="bg-card border border-secondary rounded-2xl rounded-bl-md px-5 py-4 shadow-sm">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 bg-primary/60 rounded-full animate-bounce" />
                  <span
                    className="w-2 h-2 bg-primary/60 rounded-full animate-bounce"
                    style={{ animationDelay: "0.15s" }}
                  />
                  <span
                    className="w-2 h-2 bg-primary/60 rounded-full animate-bounce"
                    style={{ animationDelay: "0.3s" }}
                  />
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} className="h-1" />
        </div>
      </div>

      {/* Input Area */}
      <div className="border-t border-secondary bg-card/80 backdrop-blur-xl px-4 py-4 flex-shrink-0">
        <form
          onSubmit={handleSubmit}
          className="max-w-3xl mx-auto flex items-end gap-3"
        >
          <div className="flex-1 relative">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask anything about ORR Solutions..."
              rows={1}
              className="w-full pl-5 pr-4 py-3.5 bg-background border border-secondary focus:border-primary/50 rounded-2xl text-sm font-medium text-foreground placeholder:text-foreground/30 focus:outline-none transition-colors resize-none min-h-[52px] max-h-[120px]"
            />
          </div>
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="w-[52px] h-[52px] rounded-2xl bg-primary hover:bg-primary/90 text-black transition-all flex items-center justify-center shadow-lg shadow-primary/20 disabled:opacity-40 disabled:cursor-not-allowed hover:scale-105 active:scale-95 flex-shrink-0"
          >
            {isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Send className="w-5 h-5" />
            )}
          </button>
        </form>
        <p className="text-center text-[10px] text-foreground/25 mt-2 max-w-3xl mx-auto">
          AI responses are generated by Gemini and may not always be accurate.
          For critical matters, consult with the ORR Solutions team directly.
        </p>
      </div>
    </div>
  );
}
