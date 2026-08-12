"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useProjectStore } from "@/store/projectStore";
import { ArrowLeft, Clock, FileText, CheckCircle, AlertCircle, Download } from "lucide-react";
import Link from "next/link";
import clsx from "clsx";
import Skeleton from "@/components/ui/Skeleton";

export default function ClientProjectDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { currentProject, isLoading, error, fetchProjectById } = useProjectStore();
  const projectId = typeof params.id === 'string' ? parseInt(params.id) : null;

  useEffect(() => {
    if (projectId) {
      fetchProjectById(projectId);
    }
  }, [projectId, fetchProjectById]);

  if (isLoading) {
    return (
      <main className="min-h-full p-4 md:p-6 bg-background">
        <div className="max-w-4xl mx-auto space-y-8 pb-12">
          <Skeleton className="h-4 w-32" />
          <div className="bg-card border border-white/10 rounded-2xl p-6 md:p-8">
            <div className="flex items-center gap-3 mb-4">
              <Skeleton className="h-6 w-24 rounded-lg" />
              <Skeleton className="h-6 w-20 rounded-full" />
            </div>
            <Skeleton className="h-8 w-2/3 mb-3" />
            <Skeleton className="h-4 w-40" />
          </div>
          <div className="grid grid-cols-1 gap-6">
            <Skeleton className="h-32 w-full rounded-2xl" />
            <Skeleton className="h-32 w-full rounded-2xl" />
          </div>
        </div>
      </main>
    );
  }

  if (error || !currentProject) {
    return (
      <div className="text-center py-20 animate-in fade-in">
        <h2 className="text-xl font-bold text-white mb-4">Project not found or access denied.</h2>
        <Link href="/projects" className="text-primary hover:underline">
          Return to Projects
        </Link>
      </div>
    );
  }

  return (
    <main className="min-h-full p-4 md:p-6 bg-background animate-in fade-in">
      <div className="max-w-4xl mx-auto space-y-8 pb-12">
        
        {/* Navigation */}
        <button 
          onClick={() => router.push('/projects')}
          className="inline-flex items-center gap-2 text-white/50 hover:text-white transition-colors text-sm font-semibold"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Projects
        </button>

        {/* Header */}
        <div className="bg-card border border-white/10 rounded-2xl p-6 md:p-8 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-primary opacity-50" />
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <span className="px-3 py-1 bg-white/5 border border-white/10 rounded-lg text-xs font-mono text-white/60">
                  {currentProject.project_id}
                </span>
                <span className={clsx(
                  "text-xs px-3 py-1 rounded-full font-bold",
                  currentProject.status === 'completed' ? "bg-green-500/20 text-green-400" :
                  currentProject.status === 'active' ? "bg-blue-500/20 text-blue-400" :
                  "bg-yellow-500/20 text-yellow-400"
                )}>
                  {currentProject.status_display}
                </span>
              </div>
              <h1 className="text-2xl md:text-3xl font-black text-white">{currentProject.title}</h1>
              <p className="text-primary mt-2">{currentProject.service_category_display}</p>
            </div>
            
            <div className="flex items-center text-sm text-white/50 bg-white/5 px-4 py-2 rounded-xl">
              <Clock className="w-4 h-4 mr-2" />
              Target Deadline: {currentProject.target_deadline ? new Date(currentProject.target_deadline).toLocaleDateString() : 'TBD'}
            </div>
          </div>
        </div>

        {/* Details Grid */}
        <div className="grid grid-cols-1 gap-6">
          
          <div className="bg-card border border-white/10 rounded-2xl p-6">
            <h3 className="text-sm font-bold text-white/40 uppercase tracking-wider mb-4">Project Objective</h3>
            <p className="text-white/80 leading-relaxed whitespace-pre-wrap">
              {currentProject.client_objective || "No objective detailed."}
            </p>
          </div>

          <div className="bg-card border border-white/10 rounded-2xl p-6">
            <h3 className="text-sm font-bold text-white/40 uppercase tracking-wider mb-4">Proposed Scope</h3>
            <p className="text-white/80 leading-relaxed whitespace-pre-wrap">
              {currentProject.proposed_scope || "Scope details are pending review."}
            </p>
          </div>
          
          {currentProject.expected_deliverable && currentProject.expected_deliverable.length > 0 && (
             <div className="bg-card border border-white/10 rounded-2xl p-6">
             <h3 className="text-sm font-bold text-white/40 uppercase tracking-wider mb-4">Expected Deliverables</h3>
             <ul className="list-disc pl-5 space-y-2 text-white/80">
               {currentProject.expected_deliverable.map((deliverable, index) => (
                 <li key={index}>{deliverable}</li>
               ))}
             </ul>
           </div>
          )}

        </div>

        {/* Documents Section */}
        {currentProject.documents && currentProject.documents.length > 0 && (
          <div>
            <h3 className="text-lg font-bold text-white mb-4">Project Documents</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {currentProject.documents.map((doc) => (
                <div key={doc.id} className="bg-white/5 border border-white/10 rounded-xl p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3 overflow-hidden">
                    <FileText className="w-8 h-8 text-primary flex-shrink-0" />
                    <div className="truncate">
                      <p className="text-sm font-bold text-white truncate">{doc.file_name}</p>
                      <p className="text-xs text-white/40">{new Date(doc.uploaded_at).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <a href={doc.file} target="_blank" rel="noopener noreferrer" className="p-2 hover:bg-white/10 rounded-lg transition-colors text-white/60 hover:text-white">
                    <Download className="w-5 h-5" />
                  </a>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </main>
  );
}
