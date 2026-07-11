"use client";

import React from "react";
import ClientProblemRequestForm from "@/app/components/forms/ClientProblemRequestForm";

export default function ProblemRequestPage() {
  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 p-6 lg:p-12">
      <div className="max-w-4xl mx-auto mb-8">
        <h1 className="text-3xl lg:text-4xl font-bold text-zinc-900 dark:text-white mb-4">
          Submit a Problem Request
        </h1>
        <p className="text-lg text-zinc-600 dark:text-zinc-400">
          This is the starting point of your project lifecycle. The information provided here will securely be routed to our Admin and Project Management teams for review and resource allocation.
        </p>
      </div>

      <ClientProblemRequestForm />
    </div>
  );
}
