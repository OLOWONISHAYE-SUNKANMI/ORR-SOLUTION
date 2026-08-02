"use client";

import React from "react";
import TechnicalFeedbackForm from "@/app/components/forms/TechnicalFeedbackForm";

export default function TechnicalFeedbackPage() {
  return (
    <main className="min-h-full p-4 md:p-6 bg-background">
      <div className="max-w-4xl mx-auto mb-8">
        <h1 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">
          Submit Technical Feedback
        </h1>
        <p className="text-lg text-foreground opacity-60">
          Use this page to report any technical issues, UI bugs, or feature requests directly to our technical team.
        </p>
      </div>

      <TechnicalFeedbackForm />
    </main>
  );
}
