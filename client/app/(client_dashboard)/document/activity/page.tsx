'use client';

import React, { useState } from 'react';
import { 
  History, 
  Download, 
  Eye, 
  Edit3, 
  Lock, 
  Unlock, 
  Share2, 
  Search,
  Filter,
  Calendar,
  FileText,
  Clock,
  Loader2
} from 'lucide-react';
import { motion } from 'framer-motion';
import { clsx } from 'clsx';
import { vaultApi, ActivityLogEntry } from '@/lib/vault-api';

const ACTION_ICONS: any = {
  'Create': Edit3,
  'Update': Eye,
  'Delete': Lock,
  'Login': Unlock,
  'Share': Share2,
  'Download': Download
};

const ACTION_COLORS: any = {
  'Create': 'text-primary',
  'Update': 'text-blue-400',
  'Delete': 'text-red-400',
  'Login': 'text-green-400',
  'Share': 'text-purple-400',
  'Download': 'text-orange-400'
};

export default function ActivityLog() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activities, setActivities] = useState<ActivityLogEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  React.useEffect(() => {
    fetchActivity();
  }, []);

  const fetchActivity = async () => {
    try {
      setIsLoading(true);
      const data = await vaultApi.getActivity();
      setActivities(data);
    } catch (error) {
      console.error('Failed to fetch activity:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredActivity = Array.isArray(activities) 
    ? activities.filter(a => 
        a.item.toLowerCase().includes(searchQuery.toLowerCase()) || 
        a.description.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];

  const stats = [
    { label: 'Total Events', value: activities.length, delta: 'Live', icon: Clock },
    { label: 'Creations', value: activities.filter(a => a.action === 'Create').length, delta: 'Document', icon: Edit3 },
    { label: 'Updates', value: activities.filter(a => a.action === 'Update').length, delta: 'Sync', icon: Eye },
    { label: 'Access Logs', value: activities.filter(a => a.action === 'Login').length, delta: 'Security', icon: Lock },
  ];

  return (
    <div className="min-h-screen bg-background p-6 lg:p-10">
      {/* Header */}
      <header className="mb-10">
        <h1 className="text-3xl font-black text-white mb-2 flex items-center gap-3">
          <History className="text-primary w-8 h-8" />
          Activity Log
        </h1>
        <p className="text-white/60 text-sm">Track your interactions and document history across the workspace.</p>
      </header>

      {/* Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
        {stats.map((stat, i) => (
          <div key={i} className="bg-card/30 border border-white/10 rounded-3xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-white/5 rounded-xl border border-white/10 text-white/40">
                <stat.icon size={18} />
              </div>
              <span className="text-[10px] font-black text-primary uppercase tracking-widest">{stat.delta}</span>
            </div>
            <div className="text-2xl font-black text-white mb-1">{stat.value}</div>
            <div className="text-white/40 text-[10px] font-black uppercase tracking-[0.2em]">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Filter Bar */}
      <div className="bg-card/50 backdrop-blur-xl border border-white/10 rounded-[2rem] p-4 mb-8 flex flex-wrap items-center justify-between gap-4">
        <div className="relative flex-1 min-w-[300px]">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" size={18} />
          <input 
            type="text" 
            placeholder="Search activity history..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 pl-12 pr-4 text-white text-sm focus:border-primary/50 outline-none transition-all"
          />
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white/60 hover:text-white transition-all text-xs font-bold">
            <Calendar size={14} />
            Date Range
          </button>
          <button className="flex items-center gap-2 px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white/60 hover:text-white transition-all text-xs font-bold">
            <Filter size={14} />
            Filter Type
          </button>
        </div>
      </div>

      {/* Activity Timeline */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="w-10 h-10 animate-spin text-primary" />
          </div>
        ) : filteredActivity.length === 0 ? (
          <div className="text-center py-20 bg-card/10 border border-dashed border-white/10 rounded-[3rem]">
             <History className="w-16 h-16 text-white/10 mx-auto mb-4" />
             <h3 className="text-xl font-bold text-white/40">No activity recorded yet</h3>
          </div>
        ) : (
          filteredActivity.map((activity, i) => {
            const Icon = ACTION_ICONS[activity.action] || Clock;
            const color = ACTION_COLORS[activity.action] || 'text-white/40';
            
            return (
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                key={activity.id}
                className="group bg-card/30 hover:bg-card/60 border border-white/10 rounded-3xl p-5 flex items-center justify-between gap-6 transition-all"
              >
                <div className="flex items-center gap-5">
                  <div className={clsx("w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center border border-white/5 shadow-xl transition-transform group-hover:scale-110", color)}>
                    <Icon size={22} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-white font-bold text-sm">{activity.user}</span>
                      <span className="text-white/40 text-xs font-medium">{activity.action.toLowerCase()}</span>
                      <span className="text-white font-bold text-sm truncate max-w-[200px]">"{activity.item}"</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1.5 text-[10px] text-white/30 font-black uppercase tracking-wider">
                        <Clock size={12} />
                        {activity.time}
                      </div>
                      <div className="flex items-center gap-1.5 text-[10px] text-white/30 font-black uppercase tracking-wider">
                        <FileText size={12} />
                        {activity.model}
                      </div>
                    </div>
                  </div>
                </div>

                <button className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white/40 hover:text-white hover:bg-white/10 transition-all text-[10px] font-black uppercase tracking-widest">
                  View Context
                </button>
              </motion.div>
            );
          })
        )}
      </div>

      {/* Pagination Placeholder */}
      <div className="mt-10 flex justify-center">
        <button className="text-white/30 hover:text-primary transition-colors text-xs font-black uppercase tracking-[0.3em]">
          Load Older Activity
        </button>
      </div>
    </div>
  );
}
