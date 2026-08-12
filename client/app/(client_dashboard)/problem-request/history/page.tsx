"use client";
import React, { useEffect } from "react";
import { useRequestStore } from "@/store/requestStore";
import { format } from "date-fns";
import { FileText, AlertCircle, Clock, CheckCircle, Search, ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";
import Skeleton from "@/components/ui/Skeleton";

export default function MyRequestsPage() {
  const { requests, fetchRequests, isLoading } = useRequestStore();
  const router = useRouter();

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  const getStatusConfig = (status: string) => {
    switch (status) {
      case "draft":
        return { label: "Draft", color: "bg-zinc-500/20 text-zinc-400 border-zinc-500/30", icon: <FileText className="w-3 h-3" /> };
      case "submitted":
        return { label: "Submitted", color: "bg-blue-500/20 text-blue-400 border-blue-500/30", icon: <Clock className="w-3 h-3" /> };
      case "pending_orr_review":
      case "clarification_requested":
        return { label: "In Review", color: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30", icon: <AlertCircle className="w-3 h-3" /> };
      case "approved_for_meeting":
      case "approved_for_pm_assignment":
        return { label: "Approved", color: "bg-green-500/20 text-green-400 border-green-500/30", icon: <CheckCircle className="w-3 h-3" /> };
      case "converted_to_project":
        return { label: "Project Active", color: "bg-purple-500/20 text-purple-400 border-purple-500/30", icon: <CheckCircle className="w-3 h-3" /> };
      case "rejected":
      case "closed":
      case "archived":
        return { label: "Closed", color: "bg-red-500/20 text-red-400 border-red-500/30", icon: <AlertCircle className="w-3 h-3" /> };
      default:
        return { label: status, color: "bg-zinc-500/20 text-zinc-400 border-zinc-500/30", icon: <FileText className="w-3 h-3" /> };
    }
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case "critical": return "text-red-400 bg-red-400/10";
      case "urgent": return "text-orange-400 bg-orange-400/10";
      case "priority": return "text-yellow-400 bg-yellow-400/10";
      default: return "text-blue-400 bg-blue-400/10";
    }
  };


  return (
    <main className="min-h-full p-4 md:p-6 bg-background">
      <div className="max-w-6xl mx-auto space-y-6">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground">My Requests</h1>
            <p className="text-foreground opacity-60 mt-1">Track the status of your submitted problem requests and briefs.</p>
          </div>
          <button
            onClick={() => router.push("/problem-request")}
            className="px-6 py-2.5 bg-primary text-black font-semibold rounded-xl hover:bg-primary/90 transition-all flex items-center gap-2 w-fit"
          >
            <FileText className="w-4 h-4" />
            New Request
          </button>
        </header>

        <div className="bg-card border border-secondary rounded-2xl overflow-hidden shadow-xl">
          {/* Search/Filter Bar */}
          <div className="p-4 border-b border-secondary bg-secondary/10 flex items-center gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-foreground opacity-40" />
              <input
                type="text"
                placeholder="Search requests by title or ID..."
                className="w-full pl-9 pr-4 py-2 rounded-lg bg-background border border-secondary text-sm focus:outline-none focus:border-primary/50 transition-colors"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-secondary/20 text-foreground opacity-70 text-xs uppercase tracking-wider">
                  <th className="px-6 py-4 font-medium whitespace-nowrap">Request ID</th>
                  <th className="px-6 py-4 font-medium whitespace-nowrap">Title</th>
                  <th className="px-6 py-4 font-medium whitespace-nowrap">Status</th>
                  <th className="px-6 py-4 font-medium whitespace-nowrap">Urgency</th>
                  <th className="px-6 py-4 font-medium whitespace-nowrap">Submission Date</th>
                  <th className="px-6 py-4 font-medium whitespace-nowrap text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-secondary/50">
                {isLoading ? (
                  Array.from({ length: 3 }).map((_, i) => (
                    <tr key={i} className="hover:bg-white/5 transition-colors">
                      <td className="px-6 py-4"><Skeleton width={100} height={20} /></td>
                      <td className="px-6 py-4"><Skeleton width={200} height={20} /></td>
                      <td className="px-6 py-4"><Skeleton width={80} height={24} className="rounded-full" /></td>
                      <td className="px-6 py-4"><Skeleton width={60} height={20} /></td>
                      <td className="px-6 py-4"><Skeleton width={90} height={20} /></td>
                      <td className="px-6 py-4 text-right"><Skeleton width={40} height={20} /></td>
                    </tr>
                  ))
                ) : requests.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-foreground opacity-50">
                      <FileText className="w-12 h-12 mx-auto mb-3 opacity-20" />
                      <p>You have not submitted any requests yet.</p>
                    </td>
                  </tr>
                ) : (
                  requests.map((request) => {
                    const statusConfig = getStatusConfig(request.status);
                    return (
                      <tr key={request.id} className="hover:bg-white/5 transition-colors group">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-foreground opacity-80">
                          {request.request_id || "Draft"}
                        </td>
                        <td className="px-6 py-4 text-sm font-medium text-foreground">
                          {request.request_title || "Untitled Request"}
                          {request.main_request_type && (
                            <span className="block text-xs font-normal opacity-50 mt-0.5 truncate max-w-xs">
                              {request.main_request_type.replace(/_/g, " ")}
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${statusConfig.color}`}>
                            {statusConfig.icon}
                            {statusConfig.label}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {request.urgency ? (
                            <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium uppercase ${getUrgencyColor(request.urgency)}`}>
                              {request.urgency}
                            </span>
                          ) : (
                            <span className="text-foreground opacity-40 text-xs">-</span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground opacity-70">
                          {request.submission_date
                            ? format(new Date(request.submission_date), "MMM d, yyyy")
                            : <span className="opacity-50 italic">Not submitted</span>}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          <button 
                            onClick={() => router.push(`/problem-request/history/${request.id}`)}
                            className="p-2 text-foreground opacity-40 hover:opacity-100 hover:text-primary transition-all rounded-lg hover:bg-white/5"
                            title="View Details"
                          >
                            <ArrowRight className="w-5 h-5" />
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </main>
  );
}
