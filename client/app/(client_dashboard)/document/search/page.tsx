'use client';

import React, { useState } from 'react';
import { 
  Search, 
  Filter, 
  FileText, 
  FileSpreadsheet, 
  Presentation, 
  ChevronRight,
  MoreVertical,
  Calendar,
  Tag,
  Hash,
  SortAsc,
  Download,
  Eye,
  Lock
} from 'lucide-react';
import { motion } from 'framer-motion';
import { clsx } from 'clsx';
import { useSearchParams } from 'next/navigation';

export default function SearchResults() {
  const searchParams = useSearchParams();
  const query = searchParams.get('q') || '';
  const [activeFilters, setActiveFilters] = useState<string[]>(['All']);

  // There is no document-search API yet, so results start empty. The list
  // below binds to `results`, so it will render real matches the moment a
  // search endpoint is wired in — until then the page shows an honest empty
  // state instead of fabricated documents.
  const results: {
    id: string; name: string; type: string; project: string;
    category: string; date: string; size: string; score: number; locked?: boolean;
  }[] = [];

  return (
    <div className="min-h-screen bg-background p-6 lg:p-10">
      {/* Header */}
      <header className="mb-10">
        <div className="flex items-center gap-3 text-white/40 mb-2">
          <Search size={16} />
          <span className="text-sm font-medium">Search Results for</span>
        </div>
        <h1 className="text-4xl font-black text-white flex items-center gap-4">
          "{query || 'Everything'}"
          <span className="bg-primary/20 text-primary text-xs px-3 py-1 rounded-full border border-primary/30 font-black tracking-widest uppercase">
            {results.length} Results
          </span>
        </h1>
      </header>

      <div className="flex flex-col lg:flex-row gap-10">
        {/* Filters Sidebar */}
        <aside className="lg:w-72 flex-shrink-0 space-y-8">
          <div>
            <h3 className="text-white/40 text-[10px] font-black uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
              <Filter size={14} />
              Filter by Type
            </h3>
            <div className="space-y-2">
              {['All', 'Documents', 'Spreadsheets', 'Presentations', 'PDFs'].map(filter => (
                <button 
                  key={filter}
                  onClick={() => setActiveFilters([filter])}
                  className={clsx(
                    "w-full text-left px-4 py-2.5 rounded-xl text-sm font-bold transition-all border",
                    activeFilters.includes(filter) ? "bg-primary text-black border-primary shadow-lg shadow-primary/20" : "bg-white/5 text-white/40 border-white/5 hover:border-white/20 hover:text-white"
                  )}
                >
                  {filter}
                </button>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-white/40 text-[10px] font-black uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
              <Tag size={14} />
              Categories
            </h3>
            <div className="flex flex-wrap gap-2">
              {['Strategy', 'Finance', 'Legal', 'Marketing', 'Operational', 'Tech'].map(cat => (
                <button key={cat} className="px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-white/60 text-[10px] font-black uppercase tracking-wider hover:bg-white/10 hover:text-white transition-all">
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div className="pt-8 border-t border-white/5">
            <button className="w-full py-3 bg-white/5 border border-white/10 rounded-2xl text-white/40 text-xs font-black uppercase tracking-widest hover:text-white transition-all">
              Clear All Filters
            </button>
          </div>
        </aside>

        {/* Results List */}
        <div className="flex-1 space-y-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <button className="flex items-center gap-2 text-white/40 hover:text-white transition-colors text-xs font-black uppercase tracking-widest">
                <SortAsc size={14} />
                Relevance
              </button>
              <button className="flex items-center gap-2 text-white/40 hover:text-white transition-colors text-xs font-black uppercase tracking-widest">
                <Calendar size={14} />
                Date
              </button>
            </div>
          </div>

          <div className="space-y-4">
            {results.map((result, i) => (
              <SearchResultCard key={result.id} result={result} index={i} />
            ))}
          </div>

          {/* Empty state — shown until a document-search endpoint exists. */}
          {results.length === 0 && (
            <div className="py-20 text-center border-t border-white/5 mt-10">
              <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-6 text-white/20 border border-white/10">
                <Search size={32} />
              </div>
              <h3 className="text-white/60 font-bold mb-2">No documents to show</h3>
              <p className="text-white/30 text-sm max-w-xs mx-auto">Document search isn&apos;t available yet. Once it&apos;s connected, matching documents will appear here.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function SearchResultCard({ result, index }: { result: any, index: number }) {
  const Icon = result.type === 'sheet' ? FileSpreadsheet : result.type === 'slide' ? Presentation : FileText;
  const colorClass = result.type === 'sheet' ? 'text-green-400' : result.type === 'slide' ? 'text-orange-400' : 'text-blue-400';

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="group bg-card/30 hover:bg-card/60 border border-white/10 rounded-3xl p-6 transition-all"
    >
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-5">
          <div className={clsx("w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center border border-white/5", colorClass)}>
            <Icon size={28} />
          </div>
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h3 className="text-white font-bold text-lg group-hover:text-primary transition-colors">{result.name}</h3>
              {result.locked && <Lock size={14} className="text-orange-400" />}
            </div>
            <div className="flex flex-wrap items-center gap-4 text-white/40 text-xs">
              <div className="flex items-center gap-1.5">
                <Hash size={12} className="text-white/20" />
                {result.project}
              </div>
              <div className="flex items-center gap-1.5">
                <Tag size={12} className="text-white/20" />
                {result.category}
              </div>
              <div className="flex items-center gap-1.5">
                <Calendar size={12} className="text-white/20" />
                {result.date}
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 ml-auto md:ml-0">
          <div className="text-right mr-4 hidden md:block">
            <div className="text-primary font-black text-xs mb-1">{result.score}% Match</div>
            <div className="text-white/20 text-[10px] font-black uppercase tracking-wider">{result.size}</div>
          </div>
          <button className="p-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-white/40 hover:text-white transition-all">
            <Download size={18} />
          </button>
          <button className="p-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-white/40 hover:text-white transition-all">
            <Eye size={18} />
          </button>
          <button className="p-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-white/20 hover:text-white transition-all">
            <MoreVertical size={18} />
          </button>
        </div>
      </div>
    </motion.div>
  );
}
