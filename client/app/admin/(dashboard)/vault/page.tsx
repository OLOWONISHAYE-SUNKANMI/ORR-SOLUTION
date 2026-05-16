'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { 
  Search, 
  Grid, 
  List, 
  Filter, 
  MoreVertical, 
  FileText, 
  Folder, 
  Lock, 
  ChevronRight, 
  ChevronLeft,
  Plus,
  Clock,
  Download,
  Eye,
  History,
  FileSpreadsheet,
  Presentation,
  ShieldCheck,
  AlertCircle,
  Sparkles,
  Zap,
  RotateCcw,
  Copy,
  Info,
  X,
  Upload,
  Loader2,
  Share2,
  UserPlus,
  Link as LinkIcon,
  Users,
  Check,
  ChevronDown as ChevronDownIcon,
  Briefcase
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { clsx } from 'clsx';
import { vaultApi, VaultDocument } from '@/lib/vault-api';
import { adminVaultApi, Client } from '@/lib/admin-vault-api';
import { AuthService } from '@/lib/auth';

export default function AdminDocumentVault() {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedClient, setSelectedClient] = useState<number | 'all'>('all');
  const [clients, setClients] = useState<Client[]>([]);
  const [files, setFiles] = useState<VaultDocument[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showSummary, setShowSummary] = useState(false);
  const [summaryFile, setSummaryFile] = useState<any>(null);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    fetchClients();
    fetchDocuments();
  }, [selectedClient]);

  const fetchClients = async () => {
    try {
      const data = await adminVaultApi.getClients();
      setClients(data);
    } catch (error) {
      console.error('Failed to fetch clients:', error);
    }
  };

  const fetchDocuments = async () => {
    try {
      setIsLoading(true);
      const data = await adminVaultApi.getAllDocuments(selectedClient === 'all' ? undefined : selectedClient);
      setFiles(data);
    } catch (error) {
      console.error('Failed to fetch documents:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredFiles = Array.isArray(files) ? files.filter(f => f.name.toLowerCase().includes(searchQuery.toLowerCase())) : [];

  const handleCreateGoogleDoc = async (title: string, clientId: number, type: string) => {
    try {
      setIsUploading(true);
      await vaultApi.createGoogleDoc(title, clientId, type);
      await fetchDocuments();
      setShowCreateModal(false);
    } catch (error) {
      console.error('Failed to create Google Doc:', error);
      alert("Error creating document.");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050b14] text-white p-8">
      <div className="max-w-[1600px] mx-auto space-y-8">
        {/* Header */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-4xl font-black tracking-tight mb-2">Central Vault</h1>
            <p className="text-white/40 font-medium">Manage and monitor all client deliverables across the ORR ecosystem.</p>
          </div>
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setShowCreateModal(true)}
              className="bg-primary hover:bg-primary/90 text-black px-6 py-3 rounded-2xl font-black transition-all shadow-xl shadow-primary/20 flex items-center gap-2"
            >
              <Plus size={20} />
              New Deliverable
            </button>
          </div>
        </header>

        {/* Toolbar */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-card/30 border border-white/10 rounded-[2.5rem] p-4 backdrop-blur-xl">
          <div className="flex flex-col sm:flex-row items-center gap-4 flex-1">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={18} />
              <input 
                type="text" 
                placeholder="Search files, projects, or categories..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white/5 border border-white/5 rounded-2xl py-3 pl-12 pr-4 text-white placeholder-white/20 outline-none focus:border-primary/30 transition-all"
              />
            </div>
            
            <div className="flex items-center gap-2 w-full sm:w-auto bg-white/5 rounded-2xl p-1 border border-white/5">
              <select 
                value={selectedClient}
                onChange={(e) => setSelectedClient(e.target.value === 'all' ? 'all' : Number(e.target.value))}
                className="bg-transparent text-sm font-bold px-4 py-2 outline-none cursor-pointer"
              >
                <option value="all">All Clients</option>
                {Array.isArray(clients) && clients.map(client => (
                  <option key={client.id} value={client.id}>{client.full_name} ({client.company})</option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-1 bg-white/5 rounded-xl p-1 border border-white/5">
              <button 
                onClick={() => setViewMode('grid')}
                className={clsx("p-2 rounded-lg transition-all", viewMode === 'grid' ? "bg-white/10 text-primary shadow-lg" : "text-white/40 hover:text-white")}
              >
                <Grid size={18} />
              </button>
              <button 
                onClick={() => setViewMode('list')}
                className={clsx("p-2 rounded-lg transition-all", viewMode === 'list' ? "bg-white/10 text-primary shadow-lg" : "text-white/40 hover:text-white")}
              >
                <List size={18} />
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex gap-8">
          <div className="flex-1">
            {isLoading ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="w-10 h-10 animate-spin text-primary" />
              </div>
            ) : filteredFiles.length === 0 ? (
              <div className="text-center py-20 bg-card/10 border border-dashed border-white/10 rounded-[3rem]">
                <FileText className="w-16 h-16 text-white/10 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-white/40">No documents found</h3>
              </div>
            ) : viewMode === 'grid' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredFiles.map(file => (
                  <FileCard 
                    key={file.id} 
                    file={file} 
                    onClick={() => { setSummaryFile(file); setShowSummary(true); }}
                    isActive={summaryFile?.id === file.id && showSummary}
                  />
                ))}
              </div>
            ) : (
              <div className="bg-card/30 border border-white/10 rounded-[2rem] overflow-hidden">
                <table className="w-full text-left border-collapse">
                  <thead className="bg-white/5">
                    <tr>
                      <th className="py-4 px-6 text-xs font-black text-white/40 uppercase tracking-wider">Name</th>
                      <th className="py-4 px-6 text-xs font-black text-white/40 uppercase tracking-wider">Client</th>
                      <th className="py-4 px-6 text-xs font-black text-white/40 uppercase tracking-wider text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {filteredFiles.map(file => (
                      <FileRow 
                        key={file.id} 
                        file={file} 
                        onClick={() => { setSummaryFile(file); setShowSummary(true); }}
                      />
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <AnimatePresence>
            {showSummary && (
              <SummaryPanel 
                file={summaryFile} 
                onClose={() => setShowSummary(false)} 
              />
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Modals */}
      <AnimatePresence>
        {showCreateModal && (
          <AdminCreateModal 
            clients={clients}
            onClose={() => setShowCreateModal(false)} 
            onCreate={handleCreateGoogleDoc}
            isUploading={isUploading}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function FileCard({ file, onClick, isActive }: { file: any, onClick: () => void, isActive?: boolean }) {
  return (
    <motion.div 
      whileHover={{ y: -5 }}
      onClick={onClick}
      className={clsx(
        "group bg-card/30 hover:bg-card/60 border rounded-3xl p-6 transition-all cursor-pointer",
        isActive ? "border-primary" : "border-white/10"
      )}
    >
      <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center mb-6 text-primary">
        <FileText size={24} />
      </div>
      <h3 className="text-white font-bold text-lg truncate mb-1">{file.name}</h3>
      <p className="text-white/40 text-xs mb-4">{file.lastModified}</p>
      <div className="flex items-center gap-2 pt-4 border-t border-white/5">
        <Briefcase size={12} className="text-primary" />
        <span className="text-[10px] font-black uppercase text-white/40 tracking-wider">PROJECT {file.id}</span>
      </div>
    </motion.div>
  );
}

function FileRow({ file, onClick }: { file: any, onClick: () => void }) {
  return (
    <tr onClick={onClick} className="hover:bg-white/5 cursor-pointer">
      <td className="py-4 px-6 text-white font-bold">{file.name}</td>
      <td className="py-4 px-6 text-white/40 text-sm">Client ID: {file.id}</td>
      <td className="py-4 px-6 text-right">
        <button className="p-2 text-white/20 hover:text-white"><MoreVertical size={18} /></button>
      </td>
    </tr>
  );
}

function SummaryPanel({ file, onClose }: { file: any, onClose: () => void }) {
  return (
    <motion.aside 
      initial={{ x: 400, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: 400, opacity: 0 }}
      className="w-[400px] bg-card/50 border border-white/10 rounded-[3rem] p-8 sticky top-32 h-fit"
    >
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-xl font-black text-white">Details</h2>
        <button onClick={onClose}><X size={20} className="text-white/40" /></button>
      </div>
      <div className="space-y-6">
        <div className="bg-white/5 rounded-2xl p-4">
          <div className="text-xs text-white/40 uppercase font-black mb-1">File Name</div>
          <div className="text-white font-bold">{file.name}</div>
        </div>
        <button 
          onClick={() => window.open(file.link, '_blank')}
          className="w-full bg-primary text-black py-4 rounded-2xl font-black flex items-center justify-center gap-2"
        >
          <Eye size={18} /> View Document
        </button>
      </div>
    </motion.aside>
  );
}

function AdminCreateModal({ clients, onClose, onCreate, isUploading }: { clients: Client[], onClose: () => void, onCreate: (title: string, clientId: number, type: string) => void, isUploading: boolean }) {
  const [title, setTitle] = useState('');
  const [clientId, setClientId] = useState<number | ''>('');
  const [docType, setDocType] = useState('google_doc');

  const types = [
    { id: 'google_doc', label: 'Document', icon: FileText, color: 'text-blue-400' },
    { id: 'google_sheet', label: 'Spreadsheet', icon: FileSpreadsheet, color: 'text-green-400' },
    { id: 'google_slide', label: 'Presentation', icon: Presentation, color: 'text-yellow-400' },
  ];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/80 backdrop-blur-xl">
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-[#0d223c] border border-white/10 rounded-[3rem] p-10 max-w-lg w-full"
      >
        <h2 className="text-3xl font-black text-white mb-6">Create Deliverable</h2>
        <div className="space-y-6 mb-10">
          <div>
            <label className="text-[10px] font-black uppercase text-white/40 tracking-widest mb-2 block">Deliverable Type</label>
            <div className="grid grid-cols-3 gap-3">
              {types.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setDocType(t.id)}
                  className={clsx(
                    "flex flex-col items-center gap-2 p-4 rounded-2xl border transition-all",
                    docType === t.id ? "bg-white/10 border-primary shadow-lg shadow-primary/10" : "bg-white/5 border-white/10 opacity-40 hover:opacity-100"
                  )}
                >
                  <t.icon size={24} className={t.color} />
                  <span className="text-[10px] font-bold uppercase tracking-tighter">{t.label}</span>
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="text-[10px] font-black uppercase text-white/40 tracking-widest mb-2 block">Client</label>
            <select 
              className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white outline-none focus:border-primary/50"
              value={clientId}
              onChange={(e) => setClientId(Number(e.target.value))}
            >
              <option value="" className="bg-[#0d223c]">Select a client...</option>
              {clients.map(c => <option key={c.id} value={c.id} className="bg-[#0d223c]">{c.full_name} ({c.company})</option>)}
            </select>
          </div>
          <div>
            <label className="text-[10px] font-black uppercase text-white/40 tracking-widest mb-2 block">Document Title</label>
            <input 
              className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white outline-none focus:border-primary/50"
              placeholder="e.g. Strategic Roadmap Q3"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>
        </div>
        <div className="flex gap-4">
          <button onClick={onClose} className="flex-1 py-4 text-white/40 font-bold hover:text-white transition-colors">Cancel</button>
          <button 
            disabled={!title || !clientId || isUploading}
            onClick={() => onCreate(title, clientId as number, docType)}
            className="flex-1 bg-primary text-black py-4 rounded-2xl font-black disabled:opacity-50 flex items-center justify-center gap-2 transition-transform active:scale-95 shadow-xl shadow-primary/20"
          >
            {isUploading ? <Loader2 className="animate-spin" size={20} /> : <Plus size={20} />}
            Create Now
          </button>
        </div>
      </motion.div>
    </div>
  );
}
