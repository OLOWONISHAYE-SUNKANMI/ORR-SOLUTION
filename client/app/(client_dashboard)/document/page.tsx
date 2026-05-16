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
  ChevronDown as ChevronDownIcon
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { clsx } from 'clsx';
import { vaultApi, VaultDocument, VaultFolder } from '@/lib/vault-api';
import { AuthService } from '@/lib/auth';

export default function DocumentWorkspace() {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentFolderId, setCurrentFolderId] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<any>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showSummary, setShowSummary] = useState(false);
  const [summaryFile, setSummaryFile] = useState<any>(null);
  const [isCreateDropdownOpen, setIsCreateDropdownOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [shareFile, setShareFile] = useState<any>(null);
  
  const [files, setFiles] = useState<VaultDocument[]>([]);
  const [folders, setFolders] = useState<VaultFolder[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const authService = AuthService.getInstance();
  const user = authService.getUser();

  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    try {
      setIsLoading(true);
      const [docsData, foldersData] = await Promise.all([
        vaultApi.getDocuments(),
        vaultApi.getFolders()
      ]);
      setFiles(docsData);
      setFolders(foldersData);
    } catch (error) {
      console.error('Failed to fetch documents:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const currentFolder = useMemo(() => {
     if (!currentFolderId) return { id: null, name: 'Root' };
     return folders.find(f => f.id.toString() === currentFolderId.toString()) || { id: null, name: 'Root' };
  }, [currentFolderId, folders]);

  // Breadcrumbs logic
  const breadcrumbs = useMemo(() => {
    const crumbs = [{ id: null, name: 'Root' }];
    if (currentFolderId) {
      // For now we assume shallow structure, but we can expand if needed
      crumbs.push({ id: currentFolderId as any, name: currentFolder.name });
    }
    return crumbs;
  }, [currentFolderId, currentFolder]);

  const filteredFolders = folders.filter(f => {
     const isChild = !currentFolderId ? !f.parent : f.parent?.toString() === currentFolderId.toString();
     return isChild && f.name.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const filteredFiles = Array.isArray(files) ? files.filter(f => {
     const matchesSearch = f.name.toLowerCase().includes(searchQuery.toLowerCase());
     const matchesFolder = !currentFolderId ? !f.folder_id && !f.folder : (f.folder_id?.toString() === currentFolderId.toString() || f.folder?.toString() === currentFolderId.toString());
     return matchesSearch && matchesFolder;
  }) : [];

  const handleFileClick = (file: any) => {
    setSummaryFile(file);
    setShowSummary(true);
  };

  const router = useRouter();

  const handleOpenDocument = (file: any) => {
    router.push(`/document/${file.id}`);
  };

  const handleCreateNew = () => {
    setIsCreateDropdownOpen(!isCreateDropdownOpen);
  };

  const handleCreateGoogleDoc = async (title: string) => {
    if (!user?.client_id && !user?.admin_id) {
      alert("User profile not found. Please log in again.");
      return;
    }
    
    try {
      setIsUploading(true);
      const clientId = user.client_id || 1; // Fallback for testing
      const newDoc = await vaultApi.createGoogleDoc(title, clientId, 'google_doc', currentFolderId);
      await fetchDocuments();
      setShowCreateModal(false);
      alert(`Created Google Doc: ${newDoc.title}`);
    } catch (error) {
      console.error('Failed to create Google Doc:', error);
      alert("Error creating document.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleUploadClick = () => {
    document.getElementById('file-upload-input')?.click();
    setIsCreateDropdownOpen(false);
  };

  const handleShare = (file: any) => {
    setShareFile(file);
    setShowShareModal(true);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      setIsUploading(true);
      // Mock upload process for now
      setTimeout(() => {
        setIsUploading(false);
        alert(`Successfully uploaded ${files.length} file(s)`);
      }, 2000);
    }
  };

  return (
    <div className="min-h-screen bg-background p-6 lg:p-10">
      {/* Header Section */}
      <header className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-black text-white mb-2 flex items-center gap-3">
            <ShieldCheck className="text-primary w-8 h-8" />
            Document Vault
          </h1>
          <p className="text-white/60 text-sm">Access and manage your workspace documents securely.</p>
        </div>

        <div className="flex items-center gap-3 relative">
          <input 
            type="file" 
            id="file-upload-input" 
            className="hidden" 
            multiple 
            onChange={handleFileUpload}
          />
          <button 
            onClick={handleCreateNew}
            className="bg-primary hover:bg-primary/90 text-black px-5 py-2.5 rounded-2xl font-bold flex items-center gap-2 transition-all shadow-lg shadow-primary/20"
          >
            <Plus size={20} />
            Create New
            <ChevronDownIcon size={16} className={clsx("transition-transform", isCreateDropdownOpen && "rotate-180")} />
          </button>

          {/* Create Dropdown */}
          <AnimatePresence>
            {isCreateDropdownOpen && (
              <>
                <div 
                  className="fixed inset-0 z-40" 
                  onClick={() => setIsCreateDropdownOpen(false)} 
                />
                <motion.div 
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  className="absolute right-0 top-full mt-4 w-64 bg-card border border-white/10 rounded-2xl shadow-2xl p-2 z-50 backdrop-blur-xl"
                >
                  <div className="space-y-1">
                    <button 
                      onClick={() => { setShowCreateModal(true); setIsCreateDropdownOpen(false); }}
                      className="w-full flex items-center gap-3 p-3 hover:bg-white/5 rounded-xl text-left transition-all group"
                    >
                      <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-400">
                        <FileText size={18} />
                      </div>
                      <div>
                        <div className="text-white font-bold text-sm">New Document</div>
                        <div className="text-white/40 text-[10px]">Create strategy or reports</div>
                      </div>
                    </button>

                    <button 
                      onClick={() => { setShowCreateModal(true); setIsCreateDropdownOpen(false); }}
                      className="w-full flex items-center gap-3 p-3 hover:bg-white/5 rounded-xl text-left transition-all group"
                    >
                      <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                        <Folder size={18} />
                      </div>
                      <div>
                        <div className="text-white font-bold text-sm">New Folder</div>
                        <div className="text-white/40 text-[10px]">Organize your workspace</div>
                      </div>
                    </button>

                    <div className="h-px bg-white/5 my-2 mx-2" />

                    <button 
                      onClick={handleUploadClick}
                      className="w-full flex items-center gap-3 p-3 hover:bg-white/5 rounded-xl text-left transition-all group"
                    >
                      <div className="w-8 h-8 rounded-lg bg-purple-500/10 flex items-center justify-center text-purple-400">
                        <Upload size={18} />
                      </div>
                      <div>
                        <div className="text-white font-bold text-sm">Upload File</div>
                        <div className="text-white/40 text-[10px]">Select from your computer</div>
                      </div>
                    </button>

                    <button 
                      onClick={handleUploadClick}
                      className="w-full flex items-center gap-3 p-3 hover:bg-white/5 rounded-xl text-left transition-all group"
                    >
                      <div className="w-8 h-8 rounded-lg bg-orange-500/10 flex items-center justify-center text-orange-400">
                        <Upload size={18} />
                      </div>
                      <div>
                        <div className="text-white font-bold text-sm">Upload Folder</div>
                        <div className="text-white/40 text-[10px]">Upload entire directories</div>
                      </div>
                    </button>
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>
      </header>

      {/* Uploading Progress Toast */}
      <AnimatePresence>
        {isUploading && (
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[200] bg-card border border-white/10 rounded-2xl p-4 shadow-2xl flex items-center gap-4 min-w-[300px]"
          >
            <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary relative">
              <Loader2 className="animate-spin" size={20} />
            </div>
            <div className="flex-1">
              <div className="text-white font-bold text-sm">Uploading documents...</div>
              <div className="w-full h-1.5 bg-white/5 rounded-full mt-2 overflow-hidden">
                <motion.div 
                  initial={{ width: "0%" }}
                  animate={{ width: "100%" }}
                  transition={{ duration: 2, ease: "easeInOut" }}
                  className="h-full bg-primary"
                />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Control Bar */}
      <div className="bg-card/50 backdrop-blur-xl border border-white/10 rounded-[2rem] p-4 mb-8 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4 flex-1 min-w-[200px]">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" size={18} />
            <input 
              type="text" 
              placeholder="Search documents, projects, categories..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 pl-12 pr-4 text-white text-sm focus:border-primary/50 outline-none transition-all"
            />
          </div>
          <button className="p-2.5 bg-white/5 border border-white/10 rounded-xl text-white/60 hover:text-white transition-colors">
            <Filter size={18} />
          </button>
        </div>

        <div className="flex items-center gap-2 bg-white/5 p-1.5 rounded-xl border border-white/10">
          <button 
            onClick={() => setViewMode('grid')}
            className={clsx(
              "p-2 rounded-lg transition-all",
              viewMode === 'grid' ? "bg-primary text-black shadow-lg shadow-primary/20" : "text-white/40 hover:text-white"
            )}
          >
            <Grid size={18} />
          </button>
          <button 
            onClick={() => setViewMode('list')}
            className={clsx(
              "p-2 rounded-lg transition-all",
              viewMode === 'list' ? "bg-primary text-black shadow-lg shadow-primary/20" : "text-white/40 hover:text-white"
            )}
          >
            <List size={18} />
          </button>
        </div>
      </div>

      {/* Breadcrumbs */}
      <nav className="flex items-center gap-2 mb-6 overflow-x-auto pb-2 no-scrollbar">
        {breadcrumbs.map((crumb, idx) => (
          <React.Fragment key={crumb.id || 'root'}>
            <button 
              onClick={() => setCurrentFolderId(crumb.id)}
              className={clsx(
                "text-sm font-medium transition-colors whitespace-nowrap",
                idx === breadcrumbs.length - 1 ? "text-primary" : "text-white/60 hover:text-white"
              )}
            >
              {crumb.name}
            </button>
            {idx < breadcrumbs.length - 1 && <ChevronRight size={14} className="text-white/20" />}
          </React.Fragment>
        ))}
      </nav>

      {/* Explorer Content */}
      <div className="flex flex-col lg:flex-row gap-8">
        <div className={clsx("flex-1 space-y-8 transition-all duration-500", showSummary ? "lg:max-w-[calc(100%-400px)]" : "w-full")}>
          {/* Folders Section */}
          {filteredFolders.length > 0 && (
            <section>
              <h2 className="text-white/40 text-xs font-black uppercase tracking-[0.2em] mb-4 px-1">Folders</h2>
              <div className={clsx(
                "grid gap-4",
                showSummary ? "grid-cols-1 sm:grid-cols-2 xl:grid-cols-3" : "grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4"
              )}>
                {filteredFolders.map(folder => (
                  <button 
                    key={folder.id}
                    onClick={() => setCurrentFolderId(folder.id)}
                    className="group bg-card/30 hover:bg-card/60 border border-white/10 rounded-2xl p-5 flex items-center gap-4 transition-all text-left"
                  >
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary transition-transform group-hover:scale-110">
                      <Folder fill="currentColor" fillOpacity={0.2} size={24} />
                    </div>
                    <div>
                      <div className="text-white font-bold text-sm truncate max-w-[120px]">{folder.name}</div>
                      <div className="text-white/40 text-[10px] uppercase font-black tracking-wider">{folder.doc_count || 0} Items</div>
                    </div>
                  </button>
                ))}
              </div>
            </section>
          )}

          {/* Files Section */}
          <section>
            <h2 className="text-white/40 text-xs font-black uppercase tracking-[0.2em] mb-4 px-1">Recent Documents</h2>
            {viewMode === 'grid' ? (
              <div className={clsx(
                "grid gap-6",
                showSummary ? "grid-cols-1 sm:grid-cols-2 xl:grid-cols-2 2xl:grid-cols-3" : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
              )}>
                {filteredFiles.map(file => (
                  <FileCard 
                    key={file.id} 
                    file={file} 
                    isActive={summaryFile?.id === file.id && showSummary}
                    onClick={() => handleFileClick(file)} 
                    onShare={(e) => { e.stopPropagation(); handleShare(file); }}
                  />
                ))}
              </div>
            ) : (
              <div className="bg-card/30 border border-white/10 rounded-[2rem] overflow-hidden">
                <table className="w-full text-left border-collapse">
                  <thead className="bg-white/5">
                    <tr>
                      <th className="py-4 px-6 text-xs font-black text-white/40 uppercase tracking-wider">Name</th>
                      {!showSummary && <th className="py-4 px-6 text-xs font-black text-white/40 uppercase tracking-wider">Project</th>}
                      {!showSummary && <th className="py-4 px-6 text-xs font-black text-white/40 uppercase tracking-wider">Category</th>}
                      <th className="py-4 px-6 text-xs font-black text-white/40 uppercase tracking-wider">Modified</th>
                      <th className="py-4 px-6 text-xs font-black text-white/40 uppercase tracking-wider text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {filteredFiles.map(file => (
                      <FileRow 
                        key={file.id} 
                        file={file} 
                        isActive={summaryFile?.id === file.id && showSummary}
                        showFull={!showSummary}
                        onClick={() => handleFileClick(file)} 
                        onShare={(e) => { e.stopPropagation(); handleShare(file); }}
                      />
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </div>

        {/* Gemini Summary Panel */}
        <AnimatePresence>
          {showSummary && (
            <GeminiSummaryPanel 
              file={summaryFile} 
              onClose={() => setShowSummary(false)} 
              onOpen={() => handleOpenDocument(summaryFile)}
              onShare={() => handleShare(summaryFile)}
            />
          )}
        </AnimatePresence>
      </div>

      {/* Modals */}
      <AnimatePresence>
        {showShareModal && (
          <ShareModal 
            file={shareFile} 
            onClose={() => setShowShareModal(false)} 
          />
        )}
        {showPaymentModal && (
          <PaymentModal 
            file={selectedFile} 
            onClose={() => setShowPaymentModal(false)} 
          />
        )}
        {showCreateModal && (
          <CreateModal 
            onClose={() => setShowCreateModal(false)} 
            onCreate={handleCreateGoogleDoc}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

// --- SUBCOMPONENTS ---

function FileCard({ file, onClick, isActive, onShare }: { file: any, onClick: () => void, isActive?: boolean, onShare: (e: React.MouseEvent) => void }) {
  const Icon = file.type === 'sheet' ? FileSpreadsheet : file.type === 'slide' ? Presentation : FileText;
  const colorClass = file.type === 'sheet' ? 'text-green-400' : file.type === 'slide' ? 'text-orange-400' : 'text-blue-400';

  return (
    <motion.div 
      whileHover={{ y: -5 }}
      onClick={onClick}
      className={clsx(
        "group bg-card/30 hover:bg-card/60 border rounded-3xl p-6 transition-all cursor-pointer relative overflow-hidden",
        isActive ? "border-primary shadow-lg shadow-primary/10" : "border-white/10"
      )}
    >
      {file.locked && (
        <div className="absolute top-4 right-4 z-10 w-8 h-8 rounded-full bg-orange-500/20 text-orange-400 flex items-center justify-center border border-orange-500/30">
          <Lock size={14} />
        </div>
      )}

      <div className={clsx("w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center mb-6", colorClass)}>
        <Icon size={32} />
      </div>

      <div className="space-y-4">
        <div>
          <h3 className="text-white font-bold text-lg truncate mb-1">{file.name}</h3>
          <div className="flex items-center gap-2 text-[10px] text-white/30 font-black uppercase tracking-wider">
            <span>{file.project || 'WORKSPACE'}</span>
            <span className="w-1 h-1 rounded-full bg-white/20" />
            <span>{file.category || 'GENERAL'}</span>
          </div>
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-white/5">
          <div className="flex items-center gap-2 text-white/40 text-xs">
            <Clock size={12} />
            {file.lastModified}
          </div>
          <div className="text-white/40 text-xs font-medium">{file.size}</div>
        </div>
      </div>

      {/* Hover Overlay */}
      <div className="absolute inset-0 bg-primary/10 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
      
      {/* Quick Actions */}
      <div className="absolute bottom-4 right-4 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all translate-y-2 group-hover:translate-y-0 z-20">
        <button 
          onClick={onShare}
          className="p-2 bg-white/10 hover:bg-white/20 rounded-lg text-white transition-colors"
        >
          <Share2 size={14} />
        </button>
      </div>
    </motion.div>
  );
}

function FileRow({ file, onClick, isActive, showFull = true, onShare }: { file: any, onClick: () => void, isActive?: boolean, showFull?: boolean, onShare: (e: React.MouseEvent) => void }) {
  const Icon = file.type === 'sheet' ? FileSpreadsheet : file.type === 'slide' ? Presentation : FileText;
  const colorClass = file.type === 'sheet' ? 'text-green-400' : file.type === 'slide' ? 'text-orange-400' : 'text-blue-400';

  return (
    <tr 
      onClick={onClick}
      className={clsx(
        "group transition-colors cursor-pointer",
        isActive ? "bg-primary/10" : "hover:bg-white/5"
      )}
    >
      <td className="py-4 px-6">
        <div className="flex items-center gap-4">
          <div className={clsx("w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center", colorClass)}>
            <Icon size={20} />
          </div>
          <div>
            <div className="text-white font-bold flex items-center gap-2">
              {file.name}
              {file.locked && <Lock size={12} className="text-orange-400" />}
            </div>
            <div className="text-white/40 text-xs uppercase tracking-wider font-black">{file.size}</div>
          </div>
        </div>
      </td>
      {showFull && <td className="py-4 px-6 text-white/60 font-medium">{file.project || 'WORKSPACE'}</td>}
      {showFull && (
        <td className="py-4 px-6">
          <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-white/60 text-[10px] font-black uppercase tracking-wider">
            {file.category || 'GENERAL'}
          </span>
        </td>
      )}
      <td className="py-4 px-6 text-white/40 text-sm">{file.lastModified}</td>
      <td className="py-4 px-6 text-right">
        <div className="flex items-center justify-end gap-2">
          <button 
            onClick={onShare}
            className="p-2 text-white/20 hover:text-white hover:bg-white/5 rounded-lg transition-all"
          >
            <Share2 size={16} />
          </button>
          <button className="p-2 text-white/20 hover:text-white hover:bg-white/5 rounded-lg transition-all">
            <MoreVertical size={18} />
          </button>
        </div>
      </td>
    </tr>
  );
}

function CreateModal({ onClose, onCreate }: { onClose: () => void, onCreate: (title: string) => void }) {
  const options = [
    { label: 'Document', icon: FileText, color: 'text-blue-400', desc: 'Write strategy, reports, or plans', type: 'doc' },
    { label: 'Spreadsheet', icon: FileSpreadsheet, color: 'text-green-400', desc: 'Analyze data, projections, and budgets', type: 'sheet' },
    { label: 'Presentation', icon: Presentation, color: 'text-orange-400', desc: 'Create pitches, reviews, and slides', type: 'slide' },
    { label: 'Folder', icon: Folder, color: 'text-primary', desc: 'Organize your workspace hierarchy', type: 'folder' },
  ];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/80 backdrop-blur-xl"
      />
      <motion.div 
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        className="relative bg-[#0d223c] border border-white/10 rounded-[3rem] p-10 max-w-2xl w-full shadow-2xl overflow-hidden"
      >
        <div className="relative">
          <h2 className="text-3xl font-black text-white mb-2">Create New</h2>
          <p className="text-white/40 text-sm mb-10">Select the type of document you'd like to initialize in this folder.</p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10">
            {options.map((opt, i) => (
              <button 
                key={i}
                onClick={() => {
                  if (opt.type === 'doc') {
                    const title = prompt("Enter document title:", "New Strategy Document");
                    if (title) onCreate(title);
                  } else {
                    alert("Only 'Document' (Google Docs) is currently integrated. More coming soon!");
                  }
                }}
                className="group bg-white/5 border border-white/10 hover:border-primary/50 rounded-2xl p-6 text-left transition-all hover:bg-white/10"
              >
                <div className={clsx("w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center mb-4 transition-transform group-hover:scale-110", opt.color)}>
                  <opt.icon size={24} />
                </div>
                <div className="text-white font-bold text-lg mb-1">{opt.label}</div>
                <p className="text-white/30 text-xs leading-relaxed">{opt.desc}</p>
              </button>
            ))}
          </div>

          <div className="flex justify-end gap-4">
            <button 
              onClick={onClose}
              className="px-6 py-3 text-white/40 hover:text-white transition-colors text-sm font-bold"
            >
              Cancel
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

function PaymentModal({ file, onClose }: { file: any, onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/80 backdrop-blur-xl"
      />
      <motion.div 
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        className="relative bg-[#0d223c] border border-white/10 rounded-[3rem] p-10 max-w-lg w-full shadow-2xl overflow-hidden"
      >
        {/* Background Glow */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-orange-500/10 blur-[100px] -mr-32 -mt-32" />
        
        <div className="relative text-center">
          <div className="w-24 h-24 rounded-full bg-orange-500/10 text-orange-400 flex items-center justify-center mx-auto mb-8 border border-orange-500/20 shadow-2xl shadow-orange-500/20">
            <Lock size={40} />
          </div>

          <h2 className="text-3xl font-black text-white mb-4">Document Locked</h2>
          <p className="text-white/60 mb-8 leading-relaxed">
            Access to <span className="text-white font-bold">"{file.name}"</span> is restricted. This document requires a professional license or a one-time unlock payment of <span className="text-primary font-black">$49.00</span>.
          </p>

          <div className="bg-white/5 rounded-3xl p-6 mb-10 border border-white/10 text-left">
            <div className="flex items-center gap-3 mb-4">
              <AlertCircle className="text-orange-400" size={18} />
              <span className="text-white font-bold text-sm">Why is this locked?</span>
            </div>
            <p className="text-white/40 text-xs leading-relaxed">
              Premium documents include proprietary research, templates, and strategic frameworks that require verification of professional standing or project-specific billing.
            </p>
          </div>

          <div className="flex flex-col gap-4">
            <button className="bg-primary hover:bg-primary/90 text-black py-4 rounded-2xl font-black transition-all shadow-xl shadow-primary/20 flex items-center justify-center gap-2">
              <ShieldCheck size={20} />
              Unlock with Professional Access
            </button>
            <button 
              onClick={onClose}
              className="text-white/40 hover:text-white transition-colors py-2 text-sm font-bold"
            >
              Cancel and go back
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

function GeminiSummaryPanel({ file, onClose, onOpen, onShare }: { file: any, onClose: () => void, onOpen: () => void, onShare: () => void }) {
  if (!file) return null;

  return (
    <motion.aside 
      initial={{ x: 400, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: 400, opacity: 0 }}
      className="w-full lg:w-[400px] bg-card/50 backdrop-blur-2xl border border-white/10 rounded-[3rem] p-8 flex flex-col h-[calc(100vh-12rem)] sticky top-32"
    >
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center text-primary shadow-lg shadow-primary/20">
            <Sparkles size={20} />
          </div>
          <h2 className="text-xl font-black text-white">Gemini AI</h2>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={onShare}
            className="p-2 text-white/40 hover:text-white transition-colors"
          >
            <Share2 size={20} />
          </button>
          <button 
            onClick={onClose}
            className="p-2 text-white/40 hover:text-white transition-colors"
          >
            <X size={20} />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar space-y-8">
        {/* Document Context */}
        <section>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-white/40">
              <Info size={16} />
            </div>
            <h3 className="text-white/60 text-[10px] font-black uppercase tracking-[0.2em]">Document Details</h3>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
            <div className="text-white font-bold text-sm mb-1">{file.name}</div>
            <div className="flex items-center gap-2 text-[10px] text-white/30 font-black uppercase tracking-wider">
              <span>{file.type}</span>
              <span className="w-1 h-1 rounded-full bg-white/20" />
              <span>{file.size}</span>
            </div>
          </div>
        </section>

        {/* AI Summary Content */}
        <section className="space-y-6">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                  <Zap size={16} />
                </div>
                <h3 className="text-white/60 text-[10px] font-black uppercase tracking-[0.2em]">Executive Summary</h3>
              </div>
              <button className="text-primary text-[10px] font-black uppercase tracking-wider hover:underline flex items-center gap-1">
                <RotateCcw size={12} />
                Regenerate
              </button>
            </div>
            <p className="text-white/80 text-sm leading-relaxed">
              This document outlines the strategic initiatives for the upcoming fiscal year. It focuses on market expansion in the EMEA region, operational efficiency through AI integration, and a renewed commitment to sustainable growth patterns.
            </p>
          </div>

          <div>
            <h4 className="text-white/40 text-[10px] font-black uppercase tracking-[0.2em] mb-3">Key Takeaways</h4>
            <ul className="space-y-3">
              {[
                "Targeting 25% growth in EMEA market by Q4 2026.",
                "Reduction in operational overhead by 15% using automated workflows.",
                "Implementation of a new client success framework across all departments."
              ].map((item, i) => (
                <li key={i} className="flex gap-3 text-sm text-white/60 leading-relaxed">
                  <span className="text-primary mt-1.5 w-1.5 h-1.5 rounded-full flex-shrink-0 bg-primary shadow-[0_0_8px_rgba(var(--primary-rgb),0.5)]" />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-white/40 text-[10px] font-black uppercase tracking-[0.2em] mb-3">Suggested Actions</h4>
            <div className="space-y-2">
              {[
                "Review EMEA expansion draft",
                "Schedule AI integration workshop",
                "Update stakeholder reports"
              ].map((action, i) => (
                <button key={i} className="w-full bg-white/5 hover:bg-white/10 border border-white/5 rounded-xl p-3 text-left text-xs text-white/60 transition-all flex items-center justify-between group">
                  {action}
                  <ChevronRight size={14} className="opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0" />
                </button>
              ))}
            </div>
          </div>
        </section>
      </div>

      <div className="mt-8 pt-8 border-t border-white/10 space-y-3">
        <button 
          onClick={onOpen}
          className="w-full bg-primary hover:bg-primary/90 text-black py-4 rounded-2xl font-black transition-all shadow-xl shadow-primary/20 flex items-center justify-center gap-2"
        >
          <Eye size={18} />
          Open Document
        </button>
        <button className="w-full bg-white/5 hover:bg-white/10 border border-white/10 text-white py-3 rounded-2xl font-bold text-sm transition-all flex items-center justify-center gap-2">
          <Copy size={16} />
          Copy Summary
        </button>
      </div>
    </motion.aside>
  );
}
function ShareModal({ file, onClose }: { file: any, onClose: () => void }) {
  const [permission, setPermission] = useState('viewer');
  const [isCopied, setIsCopied] = useState(false);

  const handleCopyLink = () => {
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const users = [
    { name: 'Sarah Chen', email: 'sarah@orr-solution.com', role: 'Owner', avatar: null },
    { name: 'Marcus Wright', email: 'marcus@orr-solution.com', role: 'Editor', avatar: null },
    { name: 'Gemini AI', email: 'ai@gemini.google', role: 'Analyst', avatar: null },
  ];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/80 backdrop-blur-xl"
      />
      <motion.div 
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        className="relative bg-[#0d223c] border border-white/10 rounded-[3rem] p-10 max-w-xl w-full shadow-2xl overflow-hidden"
      >
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-primary/20 flex items-center justify-center text-primary shadow-lg shadow-primary/20">
              <Share2 size={24} />
            </div>
            <div>
              <h2 className="text-2xl font-black text-white">Share "{file?.name}"</h2>
              <p className="text-white/40 text-sm">Manage permissions and collaboration</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-white/20 hover:text-white transition-colors">
            <X size={24} />
          </button>
        </div>

        <div className="space-y-8">
          {/* Add People */}
          <div>
            <div className="relative">
              <UserPlus className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" size={20} />
              <input 
                type="text" 
                placeholder="Add people by name or email..."
                className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-32 text-white outline-none focus:border-primary/50 transition-all"
              />
              <select 
                value={permission}
                onChange={(e) => setPermission(e.target.value)}
                className="absolute right-2 top-2 bottom-2 bg-white/10 border-none rounded-xl px-4 text-xs font-bold text-white outline-none cursor-pointer hover:bg-white/20 transition-all"
              >
                <option value="viewer">Viewer</option>
                <option value="editor">Editor</option>
                <option value="commenter">Commenter</option>
              </select>
            </div>
          </div>

          {/* People with Access */}
          <div>
            <h3 className="text-white/40 text-[10px] font-black uppercase tracking-[0.2em] mb-4">People with access</h3>
            <div className="space-y-4">
              {users.map((user, i) => (
                <div key={i} className="flex items-center justify-between group">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white font-bold border border-white/10">
                      {user.name[0]}
                    </div>
                    <div>
                      <div className="text-white font-bold text-sm">{user.name}</div>
                      <div className="text-white/40 text-xs">{user.email}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-white/40 text-xs font-bold px-3 py-1 bg-white/5 rounded-lg">
                      {user.role}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* General Access */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                  <Users size={20} />
                </div>
                <div>
                  <div className="text-white font-bold text-sm">General Access</div>
                  <div className="text-white/40 text-xs">Anyone with the link can view</div>
                </div>
              </div>
              <button className="text-primary text-xs font-bold hover:underline">Change</button>
            </div>
            
            <div className="flex items-center gap-3 pt-4 border-t border-white/5">
              <button 
                onClick={handleCopyLink}
                className="flex-1 bg-white/5 hover:bg-white/10 border border-white/10 text-white py-3 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2"
              >
                {isCopied ? <Check size={16} className="text-green-400" /> : <LinkIcon size={16} />}
                {isCopied ? 'Link Copied!' : 'Copy Link'}
              </button>
            </div>
          </div>
        </div>

        <div className="mt-10 flex justify-end">
          <button 
            onClick={onClose}
            className="bg-primary hover:bg-primary/90 text-black px-10 py-3 rounded-2xl font-black transition-all shadow-xl shadow-primary/20"
          >
            Done
          </button>
        </div>
      </motion.div>
    </div>
  );
}
