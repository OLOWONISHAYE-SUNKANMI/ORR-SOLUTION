"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useRequestStore } from "@/store/requestStore";
import { format } from "date-fns";
import { ArrowLeft, Clock, FileText, Download, CheckCircle, AlertCircle, Paperclip } from "lucide-react";
import Skeleton from "@/components/ui/Skeleton";

interface RequestDetailsClientProps {
  id: string;
}

export default function RequestDetailsClient({ id }: RequestDetailsClientProps) {
  const router = useRouter();
  const { currentRequest, fetchRequestDetail, isLoading, clearCurrentRequest } = useRequestStore();

  useEffect(() => {
    if (id) {
      fetchRequestDetail(Number(id));
    }
    return () => {
      clearCurrentRequest();
    };
  }, [id, fetchRequestDetail, clearCurrentRequest]);

  if (isLoading || !currentRequest) {
    return (
      <main className="min-h-full p-4 md:p-6 bg-background flex flex-col gap-6">
        <Skeleton width="30%" height={40} />
        <Skeleton width="100%" height={300} className="rounded-2xl" />
        <Skeleton width="100%" height={300} className="rounded-2xl" />
      </main>
    );
  }

  const getStatusConfig = (status: string) => {
    switch (status) {
      case "draft": return { label: "Draft", color: "bg-zinc-500/20 text-zinc-400 border-zinc-500/30", icon: <FileText className="w-4 h-4" /> };
      case "submitted": return { label: "Submitted", color: "bg-blue-500/20 text-blue-400 border-blue-500/30", icon: <Clock className="w-4 h-4" /> };
      case "pending_orr_review":
      case "clarification_requested": return { label: "In Review", color: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30", icon: <AlertCircle className="w-4 h-4" /> };
      case "approved_for_meeting":
      case "approved_for_pm_assignment": return { label: "Approved", color: "bg-green-500/20 text-green-400 border-green-500/30", icon: <CheckCircle className="w-4 h-4" /> };
      case "converted_to_project": return { label: "Project Active", color: "bg-purple-500/20 text-purple-400 border-purple-500/30", icon: <CheckCircle className="w-4 h-4" /> };
      case "rejected":
      case "closed":
      case "archived": return { label: "Closed", color: "bg-red-500/20 text-red-400 border-red-500/30", icon: <AlertCircle className="w-4 h-4" /> };
      default: return { label: status, color: "bg-zinc-500/20 text-zinc-400 border-zinc-500/30", icon: <FileText className="w-4 h-4" /> };
    }
  };

  const statusConfig = getStatusConfig(currentRequest.status);

  return (
    <main className="min-h-full p-4 md:p-6 bg-background pb-20">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Header & Back Button */}
        <div className="flex items-center gap-4">
          <button 
            onClick={() => router.back()}
            className="p-2 hover:bg-white/10 rounded-xl transition-colors text-foreground opacity-70 hover:opacity-100"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Request Details</h1>
            <p className="text-foreground opacity-60 text-sm">
              {currentRequest.request_id || "Draft"} • {currentRequest.submission_date ? format(new Date(currentRequest.submission_date), "PPP") : "Not submitted"}
            </p>
          </div>
        </div>

        {/* Status Banner */}
        <div className={`p-4 rounded-xl border flex items-center justify-between ${statusConfig.color.replace('border-', 'border-').replace('text-', 'text-').replace('bg-', 'bg-').replace('/20', '/10')}`}>
          <div className="flex items-center gap-3">
            {statusConfig.icon}
            <div>
              <p className="font-semibold">{statusConfig.label}</p>
              <p className="text-xs opacity-70">Current status of your request in the ORR pipeline.</p>
            </div>
          </div>
          {currentRequest.urgency && (
             <div className="px-3 py-1 rounded-full bg-white/10 border border-white/20 text-xs font-bold uppercase tracking-wider">
               {currentRequest.urgency} Priority
             </div>
          )}
        </div>

        {/* Content Details */}
        <div className="bg-card border border-secondary rounded-2xl p-6 md:p-8 space-y-8 shadow-xl">
          
          {/* Section 1: Overview */}
          <div>
            <h2 className="text-xl font-bold text-foreground mb-4">Overview</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-foreground opacity-50 mb-1">Title</p>
                <p className="text-foreground font-medium">{currentRequest.request_title || "N/A"}</p>
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-foreground opacity-50 mb-1">Request Type</p>
                <p className="text-foreground font-medium capitalize">{currentRequest.main_request_type?.replace(/_/g, " ") || "N/A"}</p>
              </div>
            </div>
            
            <div className="mt-6">
              <p className="text-xs font-bold uppercase tracking-wider text-foreground opacity-50 mb-2">Short Description</p>
              <div className="p-4 bg-secondary/20 rounded-xl text-foreground text-sm leading-relaxed border border-secondary/50">
                {currentRequest.short_description || "No description provided."}
              </div>
            </div>

            <div className="mt-6">
              <p className="text-xs font-bold uppercase tracking-wider text-foreground opacity-50 mb-2">Desired Outcome</p>
              <div className="p-4 bg-secondary/20 rounded-xl text-foreground text-sm leading-relaxed border border-secondary/50">
                {currentRequest.desired_outcome || "No outcome specified."}
              </div>
            </div>
          </div>

          <hr className="border-secondary" />

          {/* Section 2: Deep Dive */}
          <div>
            <h2 className="text-xl font-bold text-foreground mb-4">Problem Detail & Context</h2>
            <div className="space-y-6">
              {currentRequest.background_context && (
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-foreground opacity-50 mb-1">Background Context</p>
                  <p className="text-foreground text-sm">{currentRequest.background_context}</p>
                </div>
              )}
              {currentRequest.current_challenge && (
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-foreground opacity-50 mb-1">Current Challenge</p>
                  <p className="text-foreground text-sm">{currentRequest.current_challenge}</p>
                </div>
              )}
              {currentRequest.main_question && (
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-foreground opacity-50 mb-1">Main Question for ORR</p>
                  <p className="text-foreground text-sm font-medium italic">"{currentRequest.main_question}"</p>
                </div>
              )}
            </div>
          </div>

          <hr className="border-secondary" />

          {/* Section 3: Scope & Domains */}
          <div>
            <h2 className="text-xl font-bold text-foreground mb-4">Scope & Logistics</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-foreground opacity-50 mb-1">Target Date</p>
                <p className="text-foreground text-sm">{currentRequest.target_date ? format(new Date(currentRequest.target_date), "MMM d, yyyy") : "Not specified"}</p>
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-foreground opacity-50 mb-1">Budget</p>
                <p className="text-foreground text-sm capitalize">{currentRequest.budget_expectation?.replace(/_/g, " ") || "Not specified"}</p>
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-foreground opacity-50 mb-1">Sensitivity</p>
                <p className="text-foreground text-sm capitalize">{currentRequest.sensitivity_level?.replace(/_/g, " ") || "Standard"}</p>
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-foreground opacity-50 mb-1">Jurisdiction</p>
                <p className="text-foreground text-sm">{currentRequest.jurisdiction || "Not specified"}</p>
              </div>
              <div className="sm:col-span-2">
                <p className="text-xs font-bold uppercase tracking-wider text-foreground opacity-50 mb-1">Expected Deliverables</p>
                <div className="flex flex-wrap gap-2 mt-1">
                  {currentRequest.expected_deliverable?.length > 0 ? (
                    currentRequest.expected_deliverable.map(d => (
                      <span key={d} className="px-2 py-1 bg-primary/10 text-primary border border-primary/20 rounded-md text-xs">{d}</span>
                    ))
                  ) : <span className="text-foreground opacity-50 text-sm">None selected</span>}
                </div>
              </div>
            </div>
          </div>

          {/* Section 4: Attachments */}
          {currentRequest.has_documents && currentRequest.documents_list?.length > 0 && (
            <>
              <hr className="border-secondary" />
              <div>
                <h2 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
                  <Paperclip className="w-5 h-5" />
                  Attached Documents
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {currentRequest.documents_list.map((doc) => (
                    <div key={doc.id} className="p-3 border border-secondary rounded-xl bg-secondary/10 flex items-center justify-between group">
                      <div className="flex items-center gap-3 overflow-hidden">
                        <div className="w-10 h-10 bg-blue-500/10 text-blue-400 rounded-lg flex items-center justify-center shrink-0">
                          <FileText className="w-5 h-5" />
                        </div>
                        <div className="truncate">
                          <p className="text-sm font-medium text-foreground truncate" title={doc.file_name}>{doc.file_name}</p>
                          <p className="text-xs text-foreground opacity-50 truncate">{doc.description || "No description"}</p>
                        </div>
                      </div>
                      <a 
                        href={doc.file} 
                        target="_blank" 
                        rel="noreferrer"
                        className="p-2 text-foreground opacity-50 hover:opacity-100 hover:text-primary transition-colors bg-card hover:bg-white/10 rounded-lg shrink-0 border border-secondary"
                        title="Download Document"
                      >
                        <Download className="w-4 h-4" />
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </main>
  );
}
