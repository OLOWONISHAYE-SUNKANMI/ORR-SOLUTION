"use client";

import { useState, useEffect } from "react";
import { ChevronDown, Search, MessageSquare, Clock, CheckCircle, Send } from "lucide-react";
import { useSupportStore } from "@/store/supportStore";
import api from "@/lib/axios";
import { useLanguage, interpolate } from "@/lib/i18n/LanguageContext";

interface TicketMessage {
  id: number;
  message: string;
  sender: {
    username: string;
    first_name: string;
    last_name: string;
  };
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
  messages?: TicketMessage[];
}

export default function SupportHistory() {
  const { t, language: currentLang } = useLanguage();
  const { tickets, isLoading, fetchTickets } = useSupportStore();
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const [ticketMessages, setTicketMessages] = useState<{[key: string]: TicketMessage[]}>({});
  const [newMessage, setNewMessage] = useState<{[key: string]: string}>({});
  const [sendingMessage, setSendingMessage] = useState<string | null>(null);

  useEffect(() => {
    fetchTickets();
  }, [fetchTickets]);

  const fetchTicketMessages = async (ticketId: string) => {
    try {
      const response = await api.get(`/tickets/${ticketId}/messages/`);
      const messages = response.data?.data || response.data || [];
      setTicketMessages(prev => ({ ...prev, [ticketId]: messages }));
    } catch (error) {
      console.error('Failed to fetch ticket messages:', error);
    }
  };

  const sendMessage = async (ticketId: string) => {
    const message = newMessage[ticketId]?.trim();
    if (!message) return;

    try {
      setSendingMessage(ticketId as any);
      const response = await api.post(`/tickets/${ticketId}/send-message/`, { message });
      
      if (response.status === 201 || response.status === 200) {
        // Refresh messages
        await fetchTicketMessages(ticketId);
        setNewMessage(prev => ({ ...prev, [ticketId]: '' }));
      }
    } catch (error) {
      console.error('Failed to send message:', error);
    } finally {
      setSendingMessage(null);
    }
  };

  const handleTicketClick = async (index: number, ticketId: string) => {
    if (openIndex === index) {
      setOpenIndex(null);
    } else {
      setOpenIndex(index);
      if (!ticketMessages[ticketId]) {
        await fetchTicketMessages(ticketId);
      }
    }
  };

  const allTickets = tickets || [];

  return (
    <div className="min-h-screen w-full bg-background text-foreground p-6 md:p-12">
      <div className=" mx-auto">
        <div className="flex ">
          <h1 className="text-lemon text-xl font-semibold mb-6 text-nowrap">
            {interpolate(t.dashboard.support.historyTitle)}
          </h1>
          <div className="w-full flex justify-center mb-10">
            <div className="w-full max-w-xl bg-card border border-lemon rounded-full px-5 py-3 flex items-center">
              <input
                placeholder={interpolate(t.dashboard.common.search)}
                className="flex-1 bg-card outline-none text-sm placeholder-foreground/50 text-foreground"
              />
              <Search className="text-lemon text-lg" />
            </div>
          </div>
        </div>

        <div className="bg-card p-4 rounded-3xl">
          <div className="w-full bg-card rounded-3xl p-10 shadow-lg relative border border-secondary">
            <h2 className="text-2xl font-semibold mb-10 text-foreground">{interpolate(t.dashboard.support.historyHeading)}</h2>

            <div className="absolute left-10 top-32 bottom-10 w-[4px] bg-lemon rounded-full" />

            <div className="flex flex-col gap-6 ml-10">
              {isLoading ? (
                <div className="text-center py-8 text-foreground/70">
                  {interpolate(t.dashboard.common.loading)}
                </div>
              ) : allTickets.length === 0 ? (
                <div className="text-center py-8 text-foreground/70">
                  {interpolate(t.dashboard.support.noTicketsFound)}
                </div>
              ) : (
                allTickets.map((ticket, i) => {
                  const ticketId = String((ticket as any).id || ticket.ticket_id);
                  const messages = ticketMessages[ticketId] || [];
                  const hasAutoReply = messages.some(msg => msg.sender.username === 'system_auto_reply');
                  
                  return (
                    <div
                      key={ticket.ticket_id}
                      className="w-full bg-lemon rounded-xl p-6 pr-12 relative transition-all text-background"
                    >
                      <div 
                        className="cursor-pointer"
                        onClick={() => handleTicketClick(i, ticketId)}
                      >
                        <div className="flex justify-between items-start mb-2">
                          <p className="text-sm font-bold">ID: {ticket.ticket_id}</p>
                          <div className="flex items-center gap-2">
                            {hasAutoReply && (
                              <span className="text-xs px-2 py-1 rounded bg-green-600 text-white font-semibold flex items-center gap-1">
                                <CheckCircle size={12} />
                                {interpolate(t.dashboard.support.autoReplied)}
                              </span>
                            )}
                            <span className="text-xs px-2 py-1 rounded bg-background/20 font-semibold uppercase">
                              {ticket.status}
                            </span>
                          </div>
                        </div>
                        <h3 className="text-lg font-semibold mb-2">{ticket.subject || 'No Subject'}</h3>
                        <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm opacity-90 mb-2">
                          <p><span className="font-medium">Priority:</span> {ticket.priority}</p>
                          <p><span className="font-medium">{interpolate(t.dashboard.support.sourceLabel)}:</span> {ticket.source}</p>
                          <p><span className="font-medium">{interpolate(t.dashboard.billing.history.table.date)}:</span> {new Date(ticket.created_at).toLocaleDateString(currentLang === 'it' ? 'it-IT' : 'en-US')}</p>
                          {messages.length > 0 && (
                            <p><span className="font-medium">{interpolate(t.dashboard.support.messagesLabel)}:</span> {messages.length}</p>
                          )}
                        </div>

                        <div className="absolute right-6 top-1/2 -translate-y-1/2">
                          <ChevronDown
                            className={`text-background text-xl transition-all ${
                              openIndex === i ? "rotate-180" : ""
                            }`}
                          />
                        </div>
                      </div>

                      {/* Expanded Section */}
                      {openIndex === i && (
                        <div className="mt-4 text-sm text-background/90 border-t border-background/20 pt-4">
                          {/* Messages */}
                          {messages.length > 0 && (
                            <div className="mb-4">
                              <div className="flex items-center justify-between mb-3">
                                <h4 className="font-semibold flex items-center gap-2">
                                  <MessageSquare size={16} />
                                  {interpolate(t.dashboard.support.conversation)}
                                </h4>
                                <a 
                                  href={`/messages?ticketId=${ticketId}`}
                                  className="text-xs bg-lemon/20 text-lemon px-3 py-1 rounded-full hover:bg-lemon/30 transition-colors"
                                >
                                  Open in Live Chat
                                </a>
                              </div>
                              <div className="space-y-3 max-h-60 overflow-y-auto">
                                {messages.map((message) => (
                                  <div key={message.id} className="bg-background/10 rounded-lg p-3">
                                    <div className="flex items-center justify-between mb-2">
                                      <span className="font-medium">
                                        {message.sender.username === 'system_auto_reply' 
                                          ? interpolate(t.dashboard.support.systemReply)
                                          : `${message.sender.first_name} ${message.sender.last_name}`.trim() || message.sender.username
                                        }
                                      </span>
                                      <span className="text-xs opacity-70">
                                        {new Date(message.created_at).toLocaleString(currentLang === 'it' ? 'it-IT' : 'en-US')}
                                      </span>
                                    </div>
                                    <p className="text-sm">{message.message}</p>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                          
                          {/* Send Message */}
                          <div className="mt-4">
                            <div className="flex gap-2">
                              <input
                                type="text"
                                placeholder={interpolate(t.dashboard.support.typeMessage)}
                                value={newMessage[ticketId] || ''}
                                onChange={(e) => setNewMessage(prev => ({ ...prev, [ticketId]: e.target.value }))}
                                onKeyPress={(e) => e.key === 'Enter' && sendMessage(ticketId)}
                                className="flex-1 px-3 py-2 bg-background/20 border border-background/30 rounded-lg text-background placeholder-background/60 focus:outline-none focus:border-background/50"
                              />
                              <button
                                onClick={() => sendMessage(ticketId)}
                                disabled={sendingMessage === ticketId || !newMessage[ticketId]?.trim()}
                                className="px-4 py-2 bg-background text-lemon rounded-lg hover:bg-background/90 transition-colors disabled:opacity-50 flex items-center gap-2"
                              >
                                {sendingMessage === ticketId ? (
                                  <Clock className="animate-spin" size={16} />
                                ) : (
                                  <Send size={16} />
                                )}
                                {interpolate(t.dashboard.support.send)}
                              </button>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
