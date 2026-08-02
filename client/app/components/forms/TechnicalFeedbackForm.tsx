"use client";

import React, { useState } from "react";
import { Send, Bug, AlertCircle, FileText, Paperclip, CheckCircle } from "lucide-react";
import { motion } from "framer-motion";
import { useAuthStore } from "@/store/authStore";
// Assuming there might be an API endpoint to post feedback.
// For now, we'll simulate the submission.

interface FeedbackFormData {
  title: string;
  category: string;
  description: string;
  priority: string;
  hasDocuments: boolean;
  documents: { file: File; description: string }[];
}

const INITIAL_FORM_DATA: FeedbackFormData = {
  title: "",
  category: "",
  description: "",
  priority: "",
  hasDocuments: false,
  documents: [],
};

const CATEGORY_OPTIONS = [
  { value: "ui_issue", label: "UI / Design Issue" },
  { value: "bug", label: "Bug / Error" },
  { value: "feature_request", label: "Feature Request" },
  { value: "other", label: "Other" },
];

const PRIORITY_OPTIONS = [
  { value: "low", label: "Low (Not urgent)" },
  { value: "medium", label: "Medium (Affects workflow)" },
  { value: "high", label: "High (Critical issue / Blocker)" },
];

export default function TechnicalFeedbackForm() {
  const { user } = useAuthStore();
  const [formData, setFormData] = useState<FeedbackFormData>(INITIAL_FORM_DATA);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newDocs = Array.from(e.target.files).map((file) => ({
        file,
        description: "",
      }));
      setFormData((prev) => ({
        ...prev,
        documents: [...prev.documents, ...newDocs],
      }));
    }
    e.target.value = "";
  };

  const removeDocument = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      documents: prev.documents.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulating API call
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSuccess(true);
    }, 1500);
  };

  if (isSuccess) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-2xl mx-auto mt-10 p-8 bg-card border border-secondary rounded-2xl shadow-xl text-center"
      >
        <div className="w-16 h-16 bg-zinc-100 dark:bg-zinc-800/30 text-zinc-900 dark:text-white rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold text-foreground mb-4">Feedback Submitted!</h2>
        <p className="text-foreground opacity-60 mb-8">
          Thank you for helping us improve. Our technical team has received your report and will investigate it shortly.
        </p>
        <button
          onClick={() => {
            setFormData(INITIAL_FORM_DATA);
            setIsSuccess(false);
          }}
          className="px-6 py-3 bg-zinc-900 hover:bg-zinc-800 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200 text-white font-medium rounded-xl transition-colors"
        >
          Submit Another Report
        </button>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-3xl mx-auto bg-card border border-secondary rounded-2xl shadow-xl overflow-hidden"
    >
      <div className="p-8 border-b border-secondary bg-secondary/20">
        <h2 className="text-2xl font-bold text-foreground flex items-center gap-2 mb-2">
          <Bug className="w-6 h-6 text-foreground" />
          Submit Technical Feedback
        </h2>
        <p className="text-sm text-foreground opacity-60">
          Use this form to report bugs, errors, or suggest UI/UX improvements.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="p-8 space-y-6">
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground opacity-90 flex items-center gap-2">
            <FileText className="w-4 h-4 text-zinc-400" />
            Title
          </label>
          <input
            type="text"
            name="title"
            required
            value={formData.title}
            onChange={handleInputChange}
            className="w-full px-4 py-3 rounded-xl border border-secondary bg-card text-foreground focus:ring-2 focus:ring-zinc-900 dark:focus:ring-white focus:border-transparent outline-none transition-all"
            placeholder="E.g., Button not working on dashboard"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground opacity-90 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-zinc-400" />
              Category
            </label>
            <select
              name="category"
              required
              value={formData.category}
              onChange={handleInputChange}
              className="w-full px-4 py-3 rounded-xl border border-secondary bg-card text-foreground focus:ring-2 focus:ring-zinc-900 dark:focus:ring-white focus:border-transparent outline-none transition-all appearance-none"
            >
              <option value="" disabled>Select category...</option>
              {CATEGORY_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground opacity-90">
              Priority
            </label>
            <select
              name="priority"
              required
              value={formData.priority}
              onChange={handleInputChange}
              className="w-full px-4 py-3 rounded-xl border border-secondary bg-card text-foreground focus:ring-2 focus:ring-zinc-900 dark:focus:ring-white focus:border-transparent outline-none transition-all appearance-none"
            >
              <option value="" disabled>Select priority...</option>
              {PRIORITY_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground opacity-90">
            Description
          </label>
          <textarea
            name="description"
            required
            value={formData.description}
            onChange={handleInputChange}
            rows={5}
            className="w-full px-4 py-3 rounded-xl border border-secondary bg-card text-foreground focus:ring-2 focus:ring-zinc-900 dark:focus:ring-white focus:border-transparent outline-none transition-all resize-none"
            placeholder="Please provide steps to reproduce the issue, what you expected to happen, and what actually happened..."
          />
        </div>

        <div className="pt-6 border-t border-secondary">
          <div className="flex items-start justify-between p-4 border border-secondary rounded-xl bg-zinc-50 dark:bg-zinc-800/30 mb-4">
            <div className="space-y-1 pr-4">
              <label className="text-sm font-medium text-foreground">
                Do you have screenshots or screen recordings?
              </label>
              <p className="text-xs text-foreground opacity-50">
                Visual evidence helps us resolve issues much faster.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <label className="flex items-center cursor-pointer">
                <div className="relative">
                  <input
                    type="checkbox"
                    className="sr-only"
                    checked={formData.hasDocuments}
                    onChange={(e) => setFormData(prev => ({ ...prev, hasDocuments: e.target.checked }))}
                  />
                  <div className={`block w-10 h-6 rounded-full transition-colors ${formData.hasDocuments ? 'bg-zinc-900 dark:bg-white' : 'bg-zinc-300 dark:bg-zinc-600'}`}></div>
                  <div className={`dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${formData.hasDocuments ? 'transform translate-x-4' : ''}`}></div>
                </div>
                <span className="ml-3 text-sm font-medium text-foreground opacity-90">
                  {formData.hasDocuments ? "Yes" : "No"}
                </span>
              </label>
            </div>
          </div>

          {formData.hasDocuments && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="space-y-4"
            >
              <div className="border-2 border-dashed border-secondary rounded-xl p-6 text-center bg-card/50 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors">
                <div className="mx-auto w-12 h-12 bg-zinc-100 dark:bg-zinc-800/30 text-zinc-900 dark:text-zinc-100 rounded-full flex items-center justify-center mb-3">
                  <Paperclip className="w-6 h-6" />
                </div>
                <p className="text-sm font-medium text-foreground mb-1">
                  Upload screenshots or videos
                </p>
                <label className="cursor-pointer inline-flex items-center px-4 py-2 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 text-sm font-medium rounded-lg hover:opacity-90 transition-opacity mt-4">
                  Browse Files
                  <input
                    type="file"
                    multiple
                    accept="image/*,video/*"
                    className="hidden"
                    onChange={handleFileSelect}
                  />
                </label>
              </div>

              {formData.documents.length > 0 && (
                <div className="space-y-3 mt-4">
                  {formData.documents.map((doc, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-card border border-zinc-200 dark:border-zinc-700 rounded-xl">
                      <div className="flex items-center gap-3 overflow-hidden">
                        <FileText className="w-5 h-5 text-zinc-900 dark:text-zinc-100 shrink-0" />
                        <span className="text-sm text-foreground opacity-90 truncate font-medium">
                          {doc.file.name}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeDocument(index)}
                        className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors shrink-0"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </div>

        <div className="pt-4 border-t border-secondary mt-8">
          <button
            type="submit"
            disabled={isSubmitting}
            className={`w-full py-4 rounded-xl text-white font-medium text-lg flex items-center justify-center gap-2 transition-all ${isSubmitting
                ? "bg-zinc-400 dark:bg-zinc-800 dark:text-zinc-500 cursor-not-allowed"
                : "bg-zinc-900 hover:bg-zinc-800 dark:bg-white dark:hover:bg-zinc-200 dark:text-zinc-900 shadow-lg shadow-zinc-500/10"
              }`}
          >
            {isSubmitting ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-5 w-5 text-white dark:text-zinc-900" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Submitting...
              </span>
            ) : (
              <>
                <Send className="w-5 h-5" />
                Submit Feedback
              </>
            )}
          </button>
        </div>
      </form>
    </motion.div>
  );
}
