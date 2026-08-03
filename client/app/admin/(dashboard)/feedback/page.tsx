"use client";

import React, { useState, useEffect } from "react";
import { useSupportStore } from "@/store/supportStore";
import { Loader2, MessageSquare, Send } from "lucide-react";
import { motion } from "framer-motion";

export default function FeedbackPage() {
  const { createTicket, isSubmitting } = useSupportStore();
  const [formData, setFormData] = useState({
    subject: "Platform Feedback",
    contact_name: "",
    contact_email: "",
    contact_website: "",
    description: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.description) return;
    
    try {
      await createTicket(formData);
      setFormData({ ...formData, description: "" });
    } catch (error) {
      // Error handled by store
    }
  };

  return (
    <div className="min-h-screen bg-[#050b14] text-white p-8">
      <div className="max-w-3xl mx-auto space-y-8">
        <header>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
              <MessageSquare size={24} />
            </div>
            <h1 className="text-4xl font-black tracking-tight">Feedback</h1>
          </div>
          <p className="text-white/40 font-medium">
            We value your feedback. Let us know how we can improve your experience on the ORR Solutions platform.
          </p>
        </header>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card/30 border border-white/10 rounded-[2.5rem] p-8 backdrop-blur-xl"
        >
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-widest text-white/40">
                Your Feedback / Suggestion
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Tell us what you think..."
                className="w-full h-40 bg-white/5 border border-white/10 rounded-2xl p-4 text-white placeholder-white/20 outline-none focus:border-primary/50 transition-all resize-none"
                required
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-widest text-white/40">
                  Name (Optional)
                </label>
                <input
                  type="text"
                  value={formData.contact_name}
                  onChange={(e) => setFormData({ ...formData, contact_name: e.target.value })}
                  placeholder="Your Name"
                  className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white placeholder-white/20 outline-none focus:border-primary/50 transition-all"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-widest text-white/40">
                  Email (Optional)
                </label>
                <input
                  type="email"
                  value={formData.contact_email}
                  onChange={(e) => setFormData({ ...formData, contact_email: e.target.value })}
                  placeholder="Your Email"
                  className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white placeholder-white/20 outline-none focus:border-primary/50 transition-all"
                />
              </div>
            </div>

            <div className="flex justify-end pt-4">
              <button
                type="submit"
                disabled={!formData.description || isSubmitting}
                className="bg-primary text-black px-8 py-4 rounded-2xl font-black flex items-center gap-2 hover:bg-primary/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-xl shadow-primary/20"
              >
                {isSubmitting ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    <Send size={18} />
                    Submit Feedback
                  </>
                )}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
}
