"use client";

import React, { useState, useEffect } from 'react';
import { 
  Calendar, Clock, User, FileText, Star, 
  Search, Filter, Link as LinkIcon,
  ChevronRight, MoreVertical, Download, Mail,
  X, CheckCircle2, AlertCircle, CalendarDays
} from 'lucide-react';
import Link from 'next/link';
import { useLanguage, interpolate } from '@/lib/i18n/LanguageContext';
import { SkeletonCardGrid } from '@/components/ui/SkeletonPresets';

interface PastConsultation {
  id: number;
  client_name: string;
  title: string;
  type_display: string;
  status: 'requested' | 'scheduled' | 'completed' | 'cancelled' | 'no-show';
  status_display: string;
  color: string;
  formatted_date: string;
  formatted_time: string;
  meeting_notes: string;
  outcome: string;
  rating: string;
  meeting_link: string;
}

const StatusBadge = ({ status }: { status: string }) => {
  const getStatusStyles = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'completed':
        return 'bg-primary/10 text-primary border-primary/20';
      case 'cancelled':
        return 'bg-red-500/10 text-red-400 border-red-500/20';
      case 'no-show':
        return 'bg-orange-500/10 text-orange-400 border-orange-500/20';
      default:
        return 'bg-white/5 text-gray-400 border-white/10';
    }
  };

  return (
    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${getStatusStyles(status)}`}>
      {status || 'Unknown'}
    </span>
  );
};

const RatingStars = ({ rating }: { rating?: string }) => {
  if (!rating) return null;
  const numericRating = parseFloat(rating) || 0;
  
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          size={12}
          className={`${star <= numericRating ? 'fill-primary text-primary' : 'text-white/20'}`}
        />
      ))}
    </div>
  );
};

export default function PastConsultationsPage() {
  const { t } = useLanguage();
  const [consultations, setConsultations] = useState<PastConsultation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [sortBy, setSortBy] = useState('-formatted_date');

  const fetchPastConsultations = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const token = localStorage.getItem('accessToken');
      if (!token) {
        setError('Authentication required');
        setIsLoading(false);
        return;
      }

      const params = new URLSearchParams();
      if (searchTerm) params.append('search', searchTerm);
      if (sortBy) params.append('ordering', sortBy);
      
      const queryString = params.toString();
      const url = `${process.env.NEXT_PUBLIC_API_URL || 'https://orr-backend-105825824472.asia-southeast2.run.app'}/past-consultations/${queryString ? `?${queryString}` : ''}`;
      
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        let consultationsArray: PastConsultation[] = [];
        if (Array.isArray(data)) consultationsArray = data;
        else if (data && Array.isArray(data.data)) consultationsArray = data.data;
        else if (data && Array.isArray(data.results)) consultationsArray = data.results;
        
        setConsultations(consultationsArray);
      } else {
        setError('Failed to load consultation history');
      }
    } catch (err) {
      setError('A connection error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPastConsultations();
  }, [sortBy]);

  useEffect(() => {
    const timer = setTimeout(() => fetchPastConsultations(), 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const filteredConsultations = consultations.filter(c => 
    filterStatus === 'all' || c.status === filterStatus
  );

  return (
    <div className="min-h-screen bg-background text-foreground p-6 sm:p-10 star">
      <div className="max-w-[1600px] mx-auto">
        
        {/* Header Section */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-12">
          <div className="animate-in fade-in slide-in-from-left duration-500">
            <div className="flex items-center gap-3 mb-2">
               <div className="w-10 h-10 bg-primary/20 rounded-xl flex items-center justify-center">
                 <CalendarDays className="text-primary" size={24} />
               </div>
               <h1 className="text-3xl font-bold text-white tracking-tight">
                 {interpolate(t.dashboard.consultations.past.title)}
               </h1>
            </div>
            <p className="text-gray-400 text-sm max-w-lg">
              {interpolate(t.dashboard.consultations.past.history)} Review your meeting outcomes, notes, and strategic recommendations.
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row items-center gap-4 animate-in fade-in slide-in-from-right duration-500">
            <div className="relative w-full sm:w-80 group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-primary transition-colors" size={18} />
              <input
                type="text"
                placeholder={interpolate(t.dashboard.consultations.past.searchPlace)}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-full text-sm text-white focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-all"
              />
            </div>
            <a 
              href={`/consultations/meeting/instant-session`}
              className="w-full sm:w-auto px-6 py-2.5 bg-white/5 border border-white/10 text-white rounded-full text-sm font-bold hover:bg-white/10 transition-all flex items-center justify-center gap-2"
            >
              <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
              Quick Meeting
            </a>
            <Link
              href="/meeting-request"
              className="w-full sm:w-auto px-6 py-2.5 bg-primary text-black rounded-full text-sm font-bold hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 flex items-center justify-center gap-2"
            >
              <PlusIcon size={18} />
              {interpolate(t.dashboard.consultations.past.bookNew)}
            </Link>
          </div>
        </div>

        {/* Toolbar / Filters */}
        <div className="flex flex-col md:flex-row items-center gap-4 mb-8 p-3 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 animate-in fade-in zoom-in duration-500 delay-100">
          <div className="flex items-center gap-2 px-3 border-r border-white/10 mr-2 py-1 text-primary">
            <Filter size={18} />
            <span className="text-xs font-bold uppercase tracking-wider">Filters</span>
          </div>
          
          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm text-gray-300 focus:outline-none hover:bg-white/10 transition-colors"
            >
              <option value="all">All Statuses</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
              <option value="no-show">No Show</option>
            </select>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm text-gray-300 focus:outline-none hover:bg-white/10 transition-colors"
            >
              <option value="-formatted_date">Newest First</option>
              <option value="formatted_date">Oldest First</option>
              <option value="-rating">Highest Rated</option>
              <option value="client_name">Client (A-Z)</option>
            </select>
          </div>

          <div className="md:ml-auto flex items-center gap-3 px-4 py-2 bg-primary/10 rounded-xl border border-primary/20">
            <CheckCircle2 size={16} className="text-primary" />
            <span className="text-xs font-bold text-primary">
              {filteredConsultations.length} {interpolate(t.dashboard.consultations.past.resultsCount, { count: consultations.length })}
            </span>
          </div>
        </div>

        {/* Main Content Area */}
        {isLoading ? (
          <SkeletonCardGrid count={6} />
        ) : error ? (
          <div className="text-center py-20 bg-red-500/5 rounded-3xl border border-red-500/10 max-w-xl mx-auto">
            <AlertCircle size={48} className="text-red-400 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">Something went wrong</h3>
            <p className="text-gray-400 text-sm mb-6">{error}</p>
            <button
              onClick={fetchPastConsultations}
              className="px-8 py-2.5 bg-red-500/20 text-red-400 rounded-full text-sm font-bold border border-red-500/20 hover:bg-red-500/30 transition-all"
            >
              {interpolate(t.dashboard.common.retry)}
            </button>
          </div>
        ) : filteredConsultations.length === 0 ? (
          <div className="text-center py-32 bg-white/5 rounded-3xl border border-dashed border-white/10 max-w-3xl mx-auto">
            <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6">
               <Calendar className="w-10 h-10 text-gray-600" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-2">{interpolate(t.dashboard.consultations.past.noResults)}</h3>
            <p className="text-gray-400 text-sm max-w-sm mx-auto mb-8">
              {searchTerm || filterStatus !== 'all' 
                ? "No consultations match your current search or filter criteria."
                : "You haven't completed any consultations yet. Your journey starts here."
              }
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <a 
                href={`/consultations/meeting/instant-session`}
                className="px-5 py-2.5 bg-white/5 border border-white/10 text-white rounded-full text-sm font-bold hover:bg-white/10 transition-all whitespace-nowrap flex items-center gap-2"
              >
                <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
                Quick Meeting
              </a>
              <Link
                href="/meeting-request"
                className="px-5 py-2.5 bg-primary text-black rounded-full text-sm font-bold hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 whitespace-nowrap flex items-center gap-2"
              >
                <PlusIcon size={18} />
                {interpolate(t.dashboard.consultations.past.bookNew)}
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredConsultations.map((consultation, idx) => (
              <div 
                key={consultation.id} 
                className="group bg-card border border-white/5 rounded-2xl overflow-hidden hover:border-primary/40 transition-all duration-300 flex flex-col hover:shadow-2xl hover:shadow-primary/5 animate-in fade-in slide-in-from-bottom-4"
                style={{ animationDelay: `${idx * 50}ms` }}
              >
                {/* Card Top Branding Bar */}
                <div 
                  className="h-1.5 w-full bg-primary/20" 
                  style={consultation.color ? { backgroundColor: consultation.color } : {}} 
                />
                
                <div className="p-6 flex flex-col flex-1">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-6">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                         <StatusBadge status={consultation.status_display || consultation.status} />
                         <RatingStars rating={consultation.rating} />
                      </div>
                      <h3 className="text-xl font-bold text-white group-hover:text-primary transition-colors line-clamp-1">{consultation.title}</h3>
                      <p className="text-xs text-gray-500 uppercase font-bold tracking-tighter mt-1">{consultation.type_display || "Consultation"}</p>
                    </div>
                    <button className="p-2 hover:bg-white/5 rounded-lg text-gray-500 hover:text-white transition-all">
                       <MoreVertical size={18} />
                    </button>
                  </div>

                  {/* Info Grid */}
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="space-y-1">
                      <p className="text-[10px] text-gray-500 uppercase font-bold tracking-widest">Date & Time</p>
                      <div className="flex items-center gap-2 text-sm text-gray-300">
                        <Calendar size={14} className="text-primary" />
                        <span>{consultation.formatted_date}</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-gray-500 pl-5">
                         <span>{consultation.formatted_time || "Morning"}</span>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[10px] text-gray-500 uppercase font-bold tracking-widest">Consultant</p>
                      <div className="flex items-center gap-2 text-sm text-gray-300">
                        <User size={14} className="text-primary" />
                        <span className="truncate">{consultation.client_name}</span>
                      </div>
                    </div>
                  </div>

                  {/* Content Sections */}
                  <div className="space-y-4 flex-1">
                    {consultation.meeting_notes && (
                      <div className="bg-white/5 p-4 rounded-xl border border-white/5">
                        <div className="flex items-center gap-2 mb-2">
                          <FileText size={14} className="text-primary" />
                          <span className="text-[10px] font-bold text-white uppercase tracking-wider">Key Notes</span>
                        </div>
                        <p className="text-sm text-gray-400 line-clamp-3 leading-relaxed">
                          {consultation.meeting_notes}
                        </p>
                      </div>
                    )}

                    {consultation.outcome && (
                      <div className="border-l-2 border-primary/30 pl-4 py-1">
                        <p className="text-[10px] font-bold text-primary uppercase tracking-wider mb-1">Strategic Outcome</p>
                        <p className="text-sm text-gray-400 italic">"{consultation.outcome}"</p>
                      </div>
                    )}
                  </div>

                  {/* Actions Area */}
                  <div className="mt-8 flex items-center gap-3">
                    {consultation.meeting_link && (
                      consultation.meeting_link === 'pending-google-workspace' ? (
                        <span className="flex-1 py-3 px-4 bg-yellow-500/20 text-yellow-400 rounded-xl text-xs font-bold italic text-center flex items-center justify-center gap-2">
                          Preparing Google Meet Link...
                        </span>
                      ) : (
                        <a
                          href={consultation.meeting_link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex-1 py-3 px-4 bg-primary text-black rounded-xl text-xs font-bold hover:bg-primary/90 transition-all text-center flex items-center justify-center gap-2"
                        >
                          <LinkIcon size={14} />
                          View Record
                        </a>
                      )
                    )}
                    <button className="flex-1 py-3 px-4 bg-white/5 border border-white/10 text-white rounded-xl text-xs font-bold hover:bg-white/10 transition-all flex items-center justify-center gap-2 group-hover:border-white/20">
                      Summary
                      <Download size={14} className="text-gray-500" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function PlusIcon({ size = 20 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="5" x2="12" y2="19"></line>
      <line x1="5" y1="12" x2="19" y2="12"></line>
    </svg>
  );
}