"use client";

import React, { useEffect } from "react";
import { useProjectStore } from "@/store/projectStore";
import { Folder, Clock, CheckCircle, ArrowRight, Loader2 } from "lucide-react";
import Link from "next/link";
import clsx from "clsx";
import Skeleton from "@/components/ui/Skeleton";
import { useLanguage } from "@/app/components/LanguageProvider";

export default function ClientProjectsPage() {
  const { projects, isLoading, fetchProjects } = useProjectStore();
  const { t } = useLanguage();

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  return (
    <main className="min-h-full p-4 md:p-6 bg-background animate-in fade-in">
      <div className="max-w-6xl mx-auto space-y-6">
        <header>
          <h1 className="text-3xl font-bold text-foreground">My Projects</h1>
          <p className="text-foreground/60 mt-1">Track the progress of your active and past projects.</p>
        </header>

        {isLoading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="w-10 h-10 animate-spin text-primary" />
          </div>
        ) : projects.length === 0 ? (
          <div className="bg-card border border-white/10 rounded-2xl p-12 flex flex-col items-center justify-center text-center">
            <Folder className="w-16 h-16 text-white/20 mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">No Projects Yet</h3>
            <p className="text-white/60 mb-6">You don't have any active projects at the moment.</p>
            <Link 
              href="/problem-request" 
              className="px-6 py-3 bg-primary text-black font-bold rounded-xl hover:bg-primary/90 transition-colors"
            >
              Submit a Problem Request
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project) => (
              <Link 
                key={project.id} 
                href={`/projects/${project.id}`}
                className="group bg-card border border-white/10 rounded-2xl p-6 hover:bg-white/5 transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 block"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="p-3 bg-primary/10 rounded-xl text-primary">
                    <Folder className="w-6 h-6" />
                  </div>
                  <span className={clsx(
                    "text-xs px-3 py-1 rounded-full font-bold",
                    project.status === 'completed' ? "bg-green-500/20 text-green-400" :
                    project.status === 'active' ? "bg-blue-500/20 text-blue-400" :
                    "bg-yellow-500/20 text-yellow-400"
                  )}>
                    {project.status_display}
                  </span>
                </div>
                
                <h3 className="text-lg font-bold text-white mb-2 line-clamp-2">{project.title}</h3>
                <p className="text-sm text-white/50 mb-4">{project.service_category_display}</p>
                
                <div className="flex items-center justify-between mt-6 pt-4 border-t border-white/5">
                  <div className="flex items-center text-xs text-white/40">
                    <Clock className="w-4 h-4 mr-1" />
                    {new Date(project.created_at).toLocaleDateString()}
                  </div>
                  <div className="text-primary opacity-0 group-hover:opacity-100 transition-opacity flex items-center text-sm font-semibold">
                    View Details <ArrowRight className="w-4 h-4 ml-1" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
