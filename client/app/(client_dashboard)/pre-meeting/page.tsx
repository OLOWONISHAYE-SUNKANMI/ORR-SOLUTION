"use client";
import { Loader2 } from "lucide-react";
import React, { useState } from "react";
import { usePreMeetingStore } from "@/store/preMeetingStore";
import { useToastStore } from "@/store/toastStore";
import { useSearchParams, useRouter } from "next/navigation";
import { useLanguage, interpolate } from "@/lib/i18n/LanguageContext";

export default function PreMeetingPage() {
  const { t } = useLanguage();
  const [formData, setFormData] = useState({
    basic_context: '',
    goals: '',
    pain_points: ''
  });
  const { submitPreMeetingForm, isLoading } = usePreMeetingStore();
  const { addToast } = useToastStore();
  const searchParams = useSearchParams();
  const router = useRouter();
  const meetingId = parseInt(searchParams.get('meetingId') || '1');

  const handleSubmit = async () => {
    if (!formData.basic_context.trim() || !formData.goals.trim() || !formData.pain_points.trim()) {
      addToast(interpolate(t.dashboard.consultations.book.error), 'error');
      return;
    }
    await submitPreMeetingForm(meetingId, formData);
    router.push('/meeting-request');
  };


  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4 animate-in fade-in duration-500">
        <Loader2 className="w-12 h-12 text-primary animate-spin" />
        <p className="text-sm text-foreground/50 font-medium">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-background flex justify-center items-start py-20 px-4">
      <div className="w-full max-w-xl bg-card rounded-3xl p-10 border border-secondary shadow-xl">
        <h1 className="text-3xl font-semibold text-primary mb-8">{interpolate(t.dashboard.consultations.prep.title)}</h1>

        <div className="space-y-10">
          {/* Basic context */}
          <div>
            <h2 className="text-lg font-semibold text-foreground mb-2">{interpolate(t.dashboard.consultations.prep.context)}</h2>
            <p className="text-sm text-foreground opacity-70 leading-relaxed mb-4">
              {interpolate(t.dashboard.consultations.prep.contextDesc)}
            </p>
            <textarea
              value={formData.basic_context}
              onChange={(e) => setFormData({...formData, basic_context: e.target.value})}
              className="w-full h-24 bg-secondary text-foreground rounded-lg p-4 text-sm outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          {/* Goals */}
          <div>
            <h2 className="text-lg font-semibold text-foreground mb-2">{interpolate(t.dashboard.consultations.prep.goals)}</h2>
            <p className="text-sm text-foreground opacity-70 leading-relaxed mb-4">
              {interpolate(t.dashboard.consultations.prep.goalsDesc)}
            </p>
            <textarea
              value={formData.goals}
              onChange={(e) => setFormData({...formData, goals: e.target.value})}
              className="w-full h-24 bg-secondary text-foreground rounded-lg p-4 text-sm outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          {/* Main pain points */}
          <div>
            <h2 className="text-lg font-semibold text-foreground mb-2">{interpolate(t.dashboard.consultations.prep.painPoints)}</h2>
            <p className="text-sm text-foreground opacity-70 leading-relaxed mb-4">
              {interpolate(t.dashboard.consultations.prep.painPointsDesc)}
            </p>
            <textarea
              value={formData.pain_points}
              onChange={(e) => setFormData({...formData, pain_points: e.target.value})}
              placeholder={interpolate(t.dashboard.consultations.prep.write)}
              className="w-full h-28 bg-secondary text-foreground rounded-lg p-4 text-sm outline-none focus:ring-2 focus:ring-primary placeholder:text-foreground placeholder:opacity-50"
            />
          </div>
        </div>

        {/* AI Meeting Prep Section */}
        <div className="mt-8 pt-8 border-t border-secondary">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
                <span className="text-xl">✨</span> AI Meeting Prep
              </h2>
              <p className="text-sm text-foreground opacity-70">
                Let Gemini AI generate suggested talking points and goals based on your project history.
              </p>
            </div>
            <button
              onClick={async () => {
                try {
                  const { default: api } = await import('@/lib/axios');
                  addToast("Generating AI suggestions...", "success");
                  const response = await api.post('/ai/meeting-prep/', { meeting_id: meetingId });
                  if (response.data) {
                    setFormData({
                      basic_context: response.data.summary || formData.basic_context,
                      goals: (response.data.recommendations || []).join('\n') || formData.goals,
                      pain_points: (response.data.talking_points || []).join('\n') || formData.pain_points,
                    });
                    addToast("AI suggestions applied successfully", "success");
                  }
                } catch (error) {
                  addToast("Failed to generate AI suggestions", "error");
                }
              }}
              className="bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-500 border border-emerald-500/20 px-4 py-2 rounded-lg text-sm font-semibold transition-all flex items-center gap-2"
            >
              Generate with AI
            </button>
          </div>
        </div>

        {/* Save button */}
        <button 
          onClick={handleSubmit}
          disabled={isLoading}
          className="mt-6 w-full bg-primary hover:bg-opacity-90 text-background font-semibold px-6 py-4 rounded-xl transition-all disabled:opacity-50 text-lg"
        >
          {isLoading ? interpolate(t.dashboard.account.settings.saving) : interpolate(t.dashboard.common.save)}
        </button>
      </div>
    </div>
  );
}
