'use client';

import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Send, Bot, Sparkles, User, RotateCcw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePathname } from 'next/navigation';

import { useLanguage } from '@/lib/i18n/LanguageContext';
import { getRichTextContent } from '@/lib/rich-text-utils';
import { generateKnowledgeResponse } from '@/lib/ai-knowledge';
import { useOnboardingStore } from '@/store/onboardingStore';

export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const pathname = usePathname();
  const { language, t } = useLanguage();

  const getPageName = (path: string) => {
    if (path === '/') return 'Homepage';
    if (path.includes('contact')) return 'Contact Page';
    if (path.includes('legal-policy')) return 'Terms of Service';
    if (path.includes('privacy-policy')) return 'Privacy Policy';
    if (path.includes('cookie-policy')) return 'Cookie Policy';
    if (path.includes('howweoperate')) return 'How We Operate Page';
    if (path.includes('services')) return 'Services Page';
    if (path.includes('resources-blogs')) return 'Blog & Resources';
    if (path.includes('faq')) return 'FAQ Page';
    return 'Website';
  };

  const [messages, setMessages] = useState<any[]>([]);
  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Load chat history from localStorage and purge legacy static messages
    const saved = localStorage.getItem('orr_chatbot_history');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const hasLegacyStaticText = parsed.some((m: any) =>
            typeof m.text === 'string' && (
              m.text.includes('member of our team will get back to you shortly') ||
              m.text.includes('Feel free to explore our services in the meantime')
            )
          );
          if (!hasLegacyStaticText) {
            setMessages(parsed);
            return;
          } else {
            localStorage.removeItem('orr_chatbot_history');
          }
        }
      } catch (e) {
        // Fallback
      }
    }
  }, []);

  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem('orr_chatbot_history', JSON.stringify(messages));
    }
  }, [messages]);

  useEffect(() => {
    // Set initial greeting only if there are no messages
    if (messages.length === 0) {
      setMessages([{
        id: Date.now(),
        text: `Welcome back! I’m an Agent from ORR Solution. I noticed you were checking out our ${getPageName(pathname)}. Do you have any questions about how to get started?`,
        sender: 'bot'
      }]);
    }

    // Automatically open the chatbot on the terms of service page
    if (pathname?.includes('legal-policy')) {
      const timer = setTimeout(() => {
        setIsOpen(true);
      }, 1200);

      return () => clearTimeout(timer);
    }
  }, [pathname, messages.length]);

  const clearHistory = () => {
    localStorage.removeItem('orr_chatbot_history');
    setMessages([{
      id: Date.now(),
      text: `Welcome back! I’m an Agent from ORR Solution. I noticed you were checking out our ${getPageName(pathname)}. Do you have any questions about how to get started?`,
      sender: 'bot'
    }]);
  };

  // Comprehensive AI-driven prompt suggestions
  const suggestions: string[] = [
    'Where is their office located?',
    'What does it mean that ORR is a "business GP"?',
    'What does ORR actually do?',
    'What makes ORR different from traditional consulting?',
    'How much does a consultation cost?',
    'Tell me about Strategic Advisory & Compliance'
  ];

  const toggleChat = () => setIsOpen(!isOpen);

  const handleSend = async (text: string) => {
    if (!text.trim()) return;

    const userMessage = { id: Date.now(), text, sender: 'user' };
    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);

    try {
      // Call Next.js AI API route with full conversation context
      const aiPreference = useOnboardingStore.getState().onboardingStatus?.ai_preference || 'concise';

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, userMessage],
          currentPath: pathname,
          aiPreference: aiPreference
        })
      });

      let botResponseText = '';
      if (response.ok) {
        const data = await response.json();
        botResponseText = data.reply;
      }

      if (!botResponseText) {
        botResponseText = generateKnowledgeResponse(text, pathname);
      }

      setTimeout(() => {
        setIsTyping(false);
        setMessages(prev => [...prev, {
          id: Date.now() + 1,
          text: botResponseText,
          sender: 'bot'
        }]);
      }, 600);
    } catch (error) {
      console.warn('Network error calling AI chat route, using local knowledge engine:', error);
      const fallbackReply = generateKnowledgeResponse(text, pathname);
      setTimeout(() => {
        setIsTyping(false);
        setMessages(prev => [...prev, {
          id: Date.now() + 1,
          text: fallbackReply,
          sender: 'bot'
        }]);
      }, 600);
    }
  };

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSend(inputValue);
  };

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen, isTyping]);

  // Markdown-like text formatter for clean response rendering
  const renderFormattedText = (rawText: string) => {
    if (!rawText) return null;

    const lines = rawText.split('\n');
    return lines.map((line, lIdx) => {
      // Format bold text **text**
      const parts = line.split(/(\*\*.*?\*\*)/g);
      const formattedLine = parts.map((part, pIdx) => {
        if (part.startsWith('**') && part.endsWith('**')) {
          return <strong key={pIdx} className="font-semibold text-emerald-300">{part.slice(2, -2)}</strong>;
        }
        return part;
      });

      // Check if line starts with a list bullet (- or *)
      if (line.trim().startsWith('- ') || line.trim().startsWith('* ')) {
        return (
          <div key={lIdx} className="pl-3 border-l-2 border-emerald-500/50 my-1 text-gray-200">
            {formattedLine}
          </div>
        );
      }

      return (
        <React.Fragment key={lIdx}>
          {formattedLine}
          {lIdx < lines.length - 1 && <br />}
        </React.Fragment>
      );
    });
  };

  return (
    <>
      {/* Floating Button with Notification Badge */}
      <div className="fixed bottom-6 right-6 z-50">
        <AnimatePresence>
          {!isOpen && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full z-10 border-2 border-[#0A1016]"
            />
          )}
        </AnimatePresence>
        <button
          onClick={toggleChat}
          className="relative p-4 bg-emerald-600 text-white rounded-full shadow-2xl hover:scale-105 hover:bg-emerald-500 hover:shadow-emerald-500/50 transition-all duration-300 flex items-center justify-center focus:outline-none"
          aria-label="Open chat"
        >
          {isOpen ? <X size={26} /> : <MessageSquare size={26} />}
        </button>
      </div>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="fixed bottom-24 right-6 z-50 w-[360px] sm:w-[420px] h-[580px] bg-[#0A1016] border border-white/10 rounded-2xl shadow-2xl flex flex-col overflow-hidden backdrop-blur-xl"
          >
            {/* Header */}
            <div className="p-4 bg-card border-b border-white/10 flex justify-between items-center relative overflow-hidden">
              <div className="flex items-center gap-3 relative z-10">
                <div className="relative">
                  <div className="w-11 h-11 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-full flex items-center justify-center shadow-lg">
                    <Bot size={22} className="text-white" />
                  </div>
                  <div className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-[#0A1016] rounded-full" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-base tracking-tight flex items-center gap-1.5">
                    ORR Assistant <Sparkles size={14} className="text-emerald-400" />
                  </h3>
                  <p className="text-xs text-emerald-400 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> Online & AI Powered
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={clearHistory}
                  title="Reset / Clear chat history"
                  className="text-gray-400 hover:text-emerald-400 p-1.5 rounded-lg hover:bg-white/5 transition-colors"
                  aria-label="Reset chat history"
                >
                  <RotateCcw size={18} />
                </button>
                <button
                  onClick={toggleChat}
                  className="text-gray-400 hover:text-white p-1.5 rounded-lg hover:bg-white/5 transition-colors"
                  aria-label="Close chat"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gradient-to-b from-[#0A1016] to-[#0C141D]">
              {messages.map((msg) => (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  key={msg.id}
                  className={`flex gap-3 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  {msg.sender === 'bot' && (
                    <div className="w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center shrink-0 border border-emerald-500/30">
                      <Bot size={16} className="text-emerald-400" />
                    </div>
                  )}
                  <div
                    className={`max-w-[80%] p-3.5 text-sm leading-relaxed shadow-md ${msg.sender === 'user'
                        ? 'bg-emerald-600 text-white rounded-2xl rounded-tr-sm font-medium'
                        : 'bg-white/10 text-gray-100 border border-white/10 rounded-2xl rounded-tl-sm backdrop-blur-sm'
                      }`}
                  >
                    {msg.sender === 'bot' ? renderFormattedText(msg.text) : msg.text}
                  </div>
                  {msg.sender === 'user' && (
                    <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center shrink-0 border border-emerald-500/30">
                      <User size={16} className="text-emerald-400" />
                    </div>
                  )}
                </motion.div>
              ))}

              {/* Typing Indicator */}
              {isTyping && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex gap-3 justify-start"
                >
                  <div className="w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center shrink-0 border border-emerald-500/30">
                    <Bot size={16} className="text-emerald-400" />
                  </div>
                  <div className="bg-white/10 border border-white/10 rounded-2xl rounded-tl-sm p-3.5 flex items-center gap-1.5 backdrop-blur-sm">
                    <span className="text-xs text-emerald-400 font-medium mr-1">Thinking</span>
                    <motion.div animate={{ y: [0, -4, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0 }} className="w-1.5 h-1.5 bg-emerald-400 rounded-full" />
                    <motion.div animate={{ y: [0, -4, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.2 }} className="w-1.5 h-1.5 bg-emerald-400 rounded-full" />
                    <motion.div animate={{ y: [0, -4, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.4 }} className="w-1.5 h-1.5 bg-emerald-400 rounded-full" />
                  </div>
                </motion.div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Suggestions */}
            {!isTyping && (
              <div className="px-4 py-2 bg-[#0C141D] border-t border-white/5 overflow-x-auto flex gap-2 no-scrollbar">
                {suggestions.map((suggestion, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSend(suggestion)}
                    className="text-xs bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 hover:bg-emerald-500 hover:text-white px-3 py-1.5 rounded-full transition-all duration-200 whitespace-nowrap shrink-0"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            )}

            {/* Input Area */}
            <div className="p-3.5 bg-[#0A1016] border-t border-white/10">
              <form onSubmit={onSubmit} className="flex gap-2 relative items-center">
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder="Ask anything about ORR Solution..."
                  className="flex-1 bg-white/5 border border-white/10 rounded-full pl-4 pr-11 py-2.5 text-sm text-white placeholder-gray-400 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-all"
                />
                <button
                  type="submit"
                  disabled={!inputValue.trim() || isTyping}
                  className="absolute right-1 top-1 bottom-1 w-9 h-9 bg-emerald-500 text-white rounded-full disabled:opacity-40 disabled:cursor-not-allowed hover:bg-emerald-600 transition-colors flex items-center justify-center shadow-lg"
                  aria-label="Send message"
                >
                  <Send size={15} className="ml-0.5" />
                </button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
