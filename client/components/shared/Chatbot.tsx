'use client';

import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Send, Bot, Sparkles, User, MoreHorizontal } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePathname } from 'next/navigation';

import { useLanguage } from '@/lib/i18n/LanguageContext';
import { getRichTextContent } from '@/lib/rich-text-utils';

export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const pathname = usePathname();
  const { language, t } = useLanguage();
  const faqs = t.dashboard?.faq?.items || [];

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

  const stripHtml = (data: any) => {
    const textContent = getRichTextContent(data, language);
    return typeof textContent === 'string' ? textContent.replace(/<[^>]*>?/gm, '') : '';
  };

  useEffect(() => {
    // Load from localStorage first
    const saved = localStorage.getItem('orr_chatbot_history');
    if (saved) {
      try {
        setMessages(JSON.parse(saved));
      } catch (e) {
        // Failed to parse, use default
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
      }, 1500);

      return () => clearTimeout(timer);
    }
  }, [pathname, messages.length]);

  const faqSuggestions: string[] = faqs.slice(0, 3).map((faq: any) => stripHtml(faq.question));
  const suggestions: string[] = faqSuggestions.length > 0 ? faqSuggestions : [
    "Tell me about your services",
    "How does pricing work?",
    "Book a consultation"
  ];

  const toggleChat = () => setIsOpen(!isOpen);

  const handleSend = (text: string) => {
    if (!text.trim()) return;

    const userMessage = { id: Date.now(), text, sender: 'user' };
    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);

    const userMessageText = text.toLowerCase();

    // Find best matching FAQ
    let bestMatch: any = null;
    let highestScore = 0;

    faqs.forEach((faq: any) => {
      const question = stripHtml(faq.question).toLowerCase();
      // Simple word match scoring
      const words = userMessageText.split(/\s+/).filter(w => w.length > 3);
      let score = 0;

      // Check exact match first
      if (question === userMessageText) {
        score = 100;
      } else {
        words.forEach(word => {
          if (question.includes(word)) score++;
        });
      }

      if (score > highestScore) {
        highestScore = score;
        bestMatch = faq;
      }
    });

    // Simulate bot response
    setTimeout(() => {
      setIsTyping(false);

      let botResponse = "Thanks for reaching out! A member of our team will get back to you shortly. Feel free to explore our services in the meantime.";

      if (bestMatch && highestScore > 0) {
        botResponse = stripHtml(bestMatch.answer);
      } else if (text.toLowerCase().includes('hello') || text.toLowerCase().includes('hi')) {
        botResponse = "Hello! How can I assist you with ORR-SOLUTION today?";
      }

      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        text: botResponse,
        sender: 'bot'
      }]);
    }, 1500);
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

  return (
    <>
      {/* Floating Button with Pulse Effect */}
      <div className="fixed bottom-6 right-6 z-50">
        <AnimatePresence>
          {!isOpen && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              className="absolute -top-2 -right-2 w-4 h-4 bg-red-500 rounded-full z-10"
            />
          )}
        </AnimatePresence>
        <button
          onClick={toggleChat}
          className="relative p-4 bg-card text-white rounded-full shadow-2xl hover:scale-110 hover:shadow-emerald-500/50 transition-all duration-300 flex items-center justify-center focus:outline-none"
          aria-label="Open chat"
        >
          {isOpen ? <X size={28} /> : <MessageSquare size={28} />}
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
            className="fixed bottom-24 right-6 z-50 w-[350px] sm:w-[400px] h-[550px] bg-[#0A1016] border border-white/10 rounded-2xl shadow-2xl flex flex-col overflow-hidden backdrop-blur-xl"
          >
            {/* Header */}
            <div className="p-5 bg-card border-b border-white/5 flex justify-between items-center relative overflow-hidden">
              <div className="absolute inset-0 bg-[url('/bgSvg.svg')] opacity-5 pointer-events-none mix-blend-screen" />
              <div className="flex items-center gap-4 relative z-10">
                <div className="relative">
                  <div className="w-12 h-12 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-full flex items-center justify-center shadow-lg">
                    <Bot size={24} className="text-white" />
                  </div>
                  <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-[#0A1016] rounded-full" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-lg tracking-tight">ORR Assistant</h3>
                  <p className="text-xs text-emerald-400 flex items-center gap-1">
                    <Sparkles size={10} /> Online
                  </p>
                </div>
              </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-gradient-to-b from-[#0A1016] to-[#0C141D]">
              {messages.map((msg) => (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  key={msg.id}
                  className={`flex gap-3 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  {msg.sender === 'bot' && (
                    <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center shrink-0 border border-white/10">
                      <Bot size={16} className="text-emerald-400" />
                    </div>
                  )}
                  <div
                    className={`max-w-[75%] p-3.5 text-sm shadow-md ${msg.sender === 'user'
                      ? 'bg-emerald-500 text-white rounded-2xl rounded-tr-sm'
                      : 'bg-white/10 text-gray-200 border border-white/5 rounded-2xl rounded-tl-sm backdrop-blur-sm'
                      }`}
                  >
                    {msg.text}
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
                  <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center shrink-0 border border-white/10">
                    <Bot size={16} className="text-emerald-400" />
                  </div>
                  <div className="bg-white/10 border border-white/5 rounded-2xl rounded-tl-sm p-3.5 flex items-center gap-1 backdrop-blur-sm">
                    <motion.div animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0 }} className="w-1.5 h-1.5 bg-gray-400 rounded-full" />
                    <motion.div animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.2 }} className="w-1.5 h-1.5 bg-gray-400 rounded-full" />
                    <motion.div animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.4 }} className="w-1.5 h-1.5 bg-gray-400 rounded-full" />
                  </div>
                </motion.div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Suggestions */}
            {!isTyping && messages[messages.length - 1]?.sender === 'bot' && (
              <div className="px-5 pb-3 flex flex-wrap gap-2 bg-[#0C141D]">
                {suggestions.map((suggestion, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSend(suggestion)}
                    className="text-xs bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500 hover:text-white px-3 py-1.5 rounded-full transition-all duration-200 whitespace-nowrap"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            )}

            {/* Input Area */}
            <div className="p-4 bg-[#0A1016] border-t border-white/10">
              <form onSubmit={onSubmit} className="flex gap-3 relative">
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder="Type your message..."
                  className="flex-1 bg-white/5 border border-white/10 rounded-full pl-5 pr-12 py-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-all"
                />
                <button
                  type="submit"
                  disabled={!inputValue.trim() || isTyping}
                  className="absolute right-1.5 top-1.5 bottom-1.5 aspect-square bg-emerald-500 text-white rounded-full disabled:opacity-50 disabled:cursor-not-allowed hover:bg-emerald-600 transition-colors flex items-center justify-center shadow-lg"
                >
                  <Send size={16} className="ml-0.5" />
                </button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
