"use client";

import React from "react";
import ClientProblemRequestForm from "@/app/components/forms/ClientProblemRequestForm";

export default function ProblemRequestPage() {
  return (
    <main className="min-h-full p-4 md:p-6 bg-background">
      <div className="max-w-4xl mx-auto mb-8">
        <h1 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">
          Submit a Problem Request
        </h1>
        <p className="text-lg text-foreground opacity-60">
          This is the starting point of your project lifecycle. The information provided here will securely be routed to our Admin and Project Management teams for review and resource allocation.
        </p>
      </div>

      <ClientProblemRequestForm />
    </main>
  );
}
