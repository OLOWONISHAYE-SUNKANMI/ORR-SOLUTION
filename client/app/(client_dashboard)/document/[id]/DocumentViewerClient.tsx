'use client';

import React, { useState, useEffect } from 'react';
import {
  ChevronLeft,
  Clock,
  MessageSquare,
  Sparkles,
  History,
  Download,
  Share2,
  Maximize2,
  Send,
  Loader2,
  FileText,
  FileSpreadsheet,
  Presentation,
  PanelRightClose,
  PanelRight,
  Edit3,
  Lock,
  ShieldCheck,
  Plus,
  PlusCircle,
  Bold,
  Italic,
  Underline,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Image as ImageIcon,
  Table as TableIcon,
  Grid3X3,
  Save
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { clsx } from 'clsx';
import Link from 'next/link';

import { VaultDocument } from '@/lib/vault-api';

const WordLogo = ({ className, size = 20 }: { className?: string, size?: number }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <path d="M14.5 1H4.75A2.25 2.25 0 0 0 2.5 3.25v17.5A2.25 2.25 0 0 0 4.75 23h14.5A2.25 2.25 0 0 0 21.5 20.75V8L14.5 1Z" fill="#0F4C81" />
    <path d="M14.5 1V8H21.5L14.5 1Z" fill="#3B82F6" />
    <path d="M7.5 11.5L9.2 17L10.8 11.5H12.2L13.8 17L15.5 11.5H17.2L14.7 18.5H13L11.5 13.5L10 18.5H8.3L5.8 11.5H7.5Z" fill="white" />
  </svg>
);

const ExcelLogo = ({ className, size = 20 }: { className?: string, size?: number }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <path d="M14.5 1H4.75A2.25 2.25 0 0 0 2.5 3.25v17.5A2.25 2.25 0 0 0 4.75 23h14.5A2.25 2.25 0 0 0 21.5 20.75V8L14.5 1Z" fill="#107C41" />
    <path d="M14.5 1V8H21.5L14.5 1Z" fill="#33C481" />
    <path d="M7 11.5L9.25 15L7 18.5H8.75L10.1 16.25L11.45 18.5H13.2L10.95 15L13.2 11.5H11.45L10.1 13.75L8.75 11.5H7Z" fill="white" />
  </svg>
);

const PowerPointLogo = ({ className, size = 20 }: { className?: string, size?: number }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <path d="M14.5 1H4.75A2.25 2.25 0 0 0 2.5 3.25v17.5A2.25 2.25 0 0 0 4.75 23h14.5A2.25 2.25 0 0 0 21.5 20.75V8L14.5 1Z" fill="#C43E1C" />
    <path d="M14.5 1V8H21.5L14.5 1Z" fill="#F97316" />
    <path d="M9 11.5H11.5C12.3 11.5 13 12.2 13 13C13 13.8 12.3 14.5 11.5 14.5H10.2V16.5H9V11.5ZM10.2 13.3H11.5C11.7 13.3 11.8 13.2 11.8 13C11.8 12.8 11.7 12.7 11.5 12.7H10.2V13.3Z" fill="white" />
  </svg>
);

const PdfLogo = ({ className, size = 20 }: { className?: string, size?: number }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <path d="M14.5 1H4.75A2.25 2.25 0 0 0 2.5 3.25v17.5A2.25 2.25 0 0 0 4.75 23h14.5A2.25 2.25 0 0 0 21.5 20.75V8L14.5 1Z" fill="#B91C1C" />
    <path d="M14.5 1V8H21.5L14.5 1Z" fill="#EF4444" />
    <path d="M9 11.5H10.5C11.3 11.5 12 12.2 12 13C12 13.8 11.3 14.5 10.5 14.5H10.2V16.5H9V11.5ZM10.2 13.3H10.5C10.7 13.3 10.8 13.2 10.8 13C10.8 12.8 10.7 12.7 10.5 12.7H10.2V13.3Z" fill="white" />
  </svg>
);

export default function DocumentViewerClient({ id }: { id: string }) {
  const [document, setDocument] = useState<VaultDocument | null>(null);
  const [loading, setLoading] = useState(true);
  const doc = document as any;
  const isMock = doc.google_drive_id?.startsWith('mock_') || doc.link?.includes('mock_');
  const [activeDocument, setActiveDocument] = useState<any>({
    title: doc.name || doc.title || 'Untitled Document',
    content: doc.description || doc.content || ''
  });
  const [isSaving, setIsSaving] = useState(false);
  const [font, setFont] = useState('Inter');
  const [fontSize, setFontSize] = useState('14');
  const [isBold, setIsBold] = useState(false);
  const [isItalic, setIsItalic] = useState(false);
  const [pages, setPages] = useState([1]);

  useEffect(() => {
    if (isMock) {
      console.warn("Sandbox Mode: The service account credentials for Google Workspace are misconfigured (403 Permission Denied). Using a local interactive workspace instead. All changes are saved locally.");
    }
  }, [isMock]);

  const handleSaveSandbox = async () => {
    setIsSaving(true);
    try {
      const apiBase = process.env.NEXT_PUBLIC_API_URL || 'https://orr-backend-105825824472.asia-southeast2.run.app';
      const token = localStorage.getItem('access_token') || localStorage.getItem('token');
      const headers: HeadersInit = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      await fetch(`${apiBase}/admin-portal/v1/vault/documents/${id}/`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify({
          title: activeDocument.title,
          description: activeDocument.content || ''
        })
      });
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  // Toolbar Component
  const Toolbar = () => (
    <div className="h-12 border-b border-white/10 bg-white/5 backdrop-blur-md flex items-center px-4 gap-1 z-30 sticky top-0">
      <div className="flex items-center gap-2 border-r border-white/10 pr-4 mr-2">
        <select
          value={font}
          onChange={(e) => setFont(e.target.value)}
          className="bg-transparent text-[10px] font-black uppercase focus:outline-none text-white cursor-pointer hover:bg-white/5 px-2 py-1 rounded"
        >
          <option className="bg-slate-900">Inter</option>
          <option className="bg-slate-900">Roboto</option>
          <option className="bg-slate-900">Outfit</option>
          <option className="bg-slate-900">Mono</option>
        </select>
        <div className="h-4 w-px bg-white/10" />
        <select
          value={fontSize}
          onChange={(e) => setFontSize(e.target.value)}
          className="bg-transparent text-[10px] font-black uppercase focus:outline-none text-white cursor-pointer hover:bg-white/5 px-2 py-1 rounded w-12"
        >
          <option className="bg-slate-900">10</option>
          <option className="bg-slate-900">12</option>
          <option className="bg-slate-900">14</option>
          <option className="bg-slate-900">16</option>
          <option className="bg-slate-900">20</option>
        </select>
      </div>

      <div className="flex items-center gap-0.5 border-r border-white/10 pr-4 mr-2">
        <button
          onClick={() => setIsBold(!isBold)}
          className={`p-1.5 rounded-lg transition-all ${isBold ? 'bg-primary text-slate-900' : 'text-slate-400 hover:bg-white/5'}`}
        >
          <Bold size={16} />
        </button>
        <button
          onClick={() => setIsItalic(!isItalic)}
          className={`p-1.5 rounded-lg transition-all ${isItalic ? 'bg-primary text-slate-900' : 'text-slate-400 hover:bg-white/5'}`}
        >
          <Italic size={16} />
        </button>
        <button className="p-1.5 rounded-lg text-slate-400 hover:bg-white/5 transition-all">
          <Underline size={16} />
        </button>
      </div>

      <div className="flex items-center gap-0.5 border-r border-white/10 pr-4 mr-2">
        <button className="p-1.5 rounded-lg text-slate-400 hover:bg-white/5 transition-all"><AlignLeft size={16} /></button>
        <button className="p-1.5 rounded-lg text-slate-400 hover:bg-white/5 transition-all"><AlignCenter size={16} /></button>
        <button className="p-1.5 rounded-lg text-slate-400 hover:bg-white/5 transition-all"><AlignRight size={16} /></button>
      </div>

      <div className="flex items-center gap-0.5">
        <button className="p-1.5 rounded-lg text-slate-400 hover:bg-white/5 transition-all flex items-center gap-2 pr-3">
          <ImageIcon size={16} />
          <span className="text-[10px] font-black uppercase tracking-widest">Image</span>
        </button>
        <button className="p-1.5 rounded-lg text-slate-400 hover:bg-white/5 transition-all flex items-center gap-2 pr-3">
          <TableIcon size={16} />
          <span className="text-[10px] font-black uppercase tracking-widest">Table</span>
        </button>
      </div>

      <div className="flex-1" />

      <button
        onClick={handleSaveSandbox}
        className="flex items-center gap-2 px-4 py-1.5 bg-primary/10 border border-primary/20 text-primary rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-primary/20 transition-all"
      >
        <Save size={14} /> {isSaving ? 'Saving...' : 'Save Changes'}
      </button>
    </div>
  );

  const DocEditor = () => (
    <div className="flex-1 bg-[#010409] p-12 overflow-y-auto scrollbar-hide flex flex-col items-center gap-12 text-white">
      {pages.map((pageNumber) => (
        <div
          key={pageNumber}
          className="w-full max-w-[850px] bg-white/[0.03] border border-white/5 shadow-2xl min-h-[1100px] p-24 relative flex-shrink-0 transition-all hover:bg-white/[0.04]"
          style={{ fontFamily: font }}
        >
          {pageNumber === 1 && (
            <div className="space-y-8">
              <input
                type="text"
                value={activeDocument?.title}
                onChange={(e) => setActiveDocument((prev: any) => prev ? { ...prev, title: e.target.value } : null)}
                className={`w-full bg-transparent border-none focus:outline-none text-4xl uppercase italic tracking-tighter text-white ${isBold ? 'font-black' : 'font-normal'} ${isItalic ? 'italic' : ''}`}
                style={{ fontSize: `${parseInt(fontSize) * 2.5}px` }}
                placeholder="Document Title"
              />
              <div className="h-px bg-white/10 w-full" />
            </div>
          )}
          <div className="relative mt-8">
            <textarea
              value={pageNumber === 1 ? (activeDocument?.content || '') : ''}
              onChange={(e) => {
                if (pageNumber === 1) {
                  const content = e.target.value;
                  setActiveDocument((prev: any) => prev ? { ...prev, content } : null);
                }
              }}
              className="w-full bg-transparent border-none focus:outline-none resize-none min-h-[500px] leading-relaxed text-slate-400 placeholder:text-slate-600 overflow-hidden"
              style={{
                fontSize: `${fontSize}px`,
                fontFamily: font,
                height: 'auto'
              }}
              placeholder={pageNumber === 1 ? "Start typing your document repository layer..." : "Continue typing on page " + pageNumber + "..."}
              spellCheck={false}
            />
          </div>

          {pageNumber === pages.length && (
            <div className="grid grid-cols-2 gap-8 my-12 pointer-events-none border-t border-white/5 pt-12 relative z-0">
              <div className="aspect-video bg-white/5 rounded-3xl border border-white/10 flex items-center justify-center text-slate-600 italic text-[10px] font-black uppercase tracking-widest">
                Document Image Overlay Placeholder
              </div>
              <div className="aspect-video bg-white/5 rounded-3xl border border-white/10 flex items-center justify-center text-slate-600 italic text-[10px] font-black uppercase tracking-widest">
                Asset Reference View
              </div>
            </div>
          )}
          <div className="absolute bottom-8 right-8 text-[9px] font-black text-slate-600 uppercase tracking-widest">
            Page {pageNumber} of {pages.length}
          </div>
        </div>
      ))}

      <button
        onClick={() => setPages(prev => [...prev, prev.length + 1])}
        className="group flex flex-col items-center gap-4 py-12"
      >
        <div className="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-slate-500 group-hover:text-primary group-hover:border-primary/50 group-hover:bg-primary/10 transition-all">
          <Plus size={24} />
        </div>
        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-600 group-hover:text-primary transition-colors">Append Next Architecture Page</span>
      </button>
    </div>
  );

  const SheetEditor = () => (
    <div className="flex-1 bg-[#010409] overflow-hidden flex flex-col text-white">
      <div className="p-4 border-b border-white/5 bg-white/5">
        <input
          type="text"
          value={activeDocument?.title}
          onChange={(e) => setActiveDocument((prev: any) => prev ? { ...prev, title: e.target.value } : null)}
          className="bg-transparent border-none focus:outline-none text-xl font-black uppercase italic tracking-tighter text-white w-full"
          placeholder="Sheet Title"
        />
      </div>
      <div className="h-8 bg-white/5 border-b border-white/10 flex items-center px-4 gap-2">
        <div className="w-10 h-6 bg-primary/10 border border-primary/20 rounded flex items-center justify-center text-[10px] font-black text-primary uppercase">fx</div>
        <input type="text" className="bg-transparent flex-1 text-[11px] font-bold text-white focus:outline-none" defaultValue="=SUM(A1:B20) / AI_ADJUSTMENT" />
      </div>
      <div className="flex-1 overflow-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr>
              <th className="w-10 bg-white/5 border border-white/10 text-[9px] font-black text-slate-600"></th>
              {['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'].map(col => (
                <th key={col} className="bg-white/5 border border-white/10 p-2 text-[10px] font-black text-slate-500 uppercase tracking-widest w-32">{col}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20].map(row => (
              <tr key={row}>
                <td className="bg-white/5 border border-white/10 text-center text-[9px] font-black text-slate-600">{row}</td>
                {['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'].map(col => (
                  <td key={col} className="border border-white/5 p-3 min-w-[120px] hover:bg-primary/5 transition-colors cursor-cell group">
                    <input
                      type="text"
                      className="bg-transparent w-full text-xs font-medium text-slate-400 group-hover:text-white focus:outline-none"
                      defaultValue={row === 1 ? `Header ${col}` : ''}
                    />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const SlideEditor = () => (
    <div className="flex-1 flex overflow-hidden bg-[#010409] text-white">
      <div className="w-48 border-r border-white/5 bg-white/[0.02] overflow-y-auto p-4 space-y-4">
        {[1, 2, 3, 4, 5].map(i => (
          <div key={i} className={`aspect-video rounded-xl border-2 transition-all cursor-pointer hover:border-primary/50 group relative ${i === 1 ? 'border-primary' : 'border-white/10'}`}>
            <div className="absolute top-1 left-1 text-[8px] font-black text-slate-500">{i}</div>
            <div className="w-full h-full bg-white/5 rounded-lg flex flex-col items-center justify-center p-2">
              <div className="w-full h-1 bg-white/10 rounded-full mb-1" />
              <div className="w-2/3 h-1 bg-white/10 rounded-full mb-2" />
              <div className="grid grid-cols-2 gap-1 w-full">
                <div className="h-4 bg-white/5 rounded" />
                <div className="h-4 bg-white/5 rounded" />
              </div>
            </div>
          </div>
        ))}
        <button className="w-full aspect-video rounded-xl border-2 border-dashed border-white/10 flex flex-col items-center justify-center gap-2 text-slate-600 hover:text-primary hover:border-primary/50 transition-all">
          <PlusCircle size={20} />
          <span className="text-[8px] font-black uppercase tracking-widest">Add Slide</span>
        </button>
      </div>
      <div className="flex-1 p-12 overflow-y-auto flex items-center justify-center">
        <div className="w-full max-w-4xl aspect-video bg-white/[0.03] border border-white/5 rounded-[40px] shadow-2xl p-16 flex flex-col justify-center gap-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 blur-[80px] rounded-full" />
          <div className="space-y-4 relative z-10">
            <input
              type="text"
              value={activeDocument?.title}
              onChange={(e) => setActiveDocument((prev: any) => prev ? { ...prev, title: e.target.value } : null)}
              className={`w-full bg-transparent border-none focus:outline-none text-6xl font-black italic uppercase tracking-tighter text-white ${isBold ? 'font-black' : 'font-bold'}`}
              style={{ fontFamily: font }}
              placeholder="Presentation Title"
            />
            <div className="h-1 w-32 bg-primary rounded-full" />
          </div>
          <div className="space-y-4 relative z-10">
            <input
              type="text"
              value={activeDocument?.content || 'Infrastructure Architecture Phase 01'}
              onChange={(e) => setActiveDocument((prev: any) => prev ? { ...prev, content: e.target.value } : null)}
              className="w-full bg-transparent border-none focus:outline-none text-2xl text-slate-400 font-medium tracking-tight"
              placeholder="Slide Description"
            />
            <p className="text-sm text-slate-600 font-black uppercase tracking-[0.3em]">ORR Solutions Portfolio • 2024</p>
          </div>
        </div>
      </div>
    </div>
  );

  const [showAiPanel, setShowAiPanel] = useState(true);
  const [activeTab, setActiveTab] = useState<'ai' | 'history' | 'comments'>('ai');
  const [aiLoading, setAiLoading] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'ai', content: 'Hello! I am Gemini. I can help you summarize this document or answer specific questions about its content. What would you like to do?' }
  ]);
  const [input, setInput] = useState('');
  const [accessStatus, setAccessStatus] = useState<'idle' | 'requesting' | 'pending' | 'granted'>('idle');

  // Fetch document client-side
  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  const handleSendMessage = () => {
    if (!input.trim() || !document) return;
    const newMessages = [...messages, { role: 'user', content: input }];
    setMessages(newMessages);
    setInput('');
    setAiLoading(true);

    // Simulate AI response
    setTimeout(() => {
      setMessages([...newMessages, { role: 'ai', content: `Based on the document "${document.name}", I can see it was last modified on ${new Date(document.lastModified).toLocaleString()}. Should I provide a detailed executive summary?` }]);
      setAiLoading(false);
    }, 2000);
  };

  const handleRequestAccess = () => {
    setAccessStatus('requesting');
    // Simulate API request
    setTimeout(() => {
      setAccessStatus('pending');
    }, 2000);
  };

  const getDocConfig = () => {
    let rawType = document.document_type || document.type;

    // If type is missing, try to detect from title or link
    if (!rawType || rawType === 'file') {
      const nameSource = document.name || document.title || document.link || '';
      const match = nameSource.match(/\.([a-z0-9]+)(\?.*)?$/i);
      if (match) rawType = match[1];
    }

    const type = (rawType || 'pdf').toLowerCase().replace(/^\./, '');
    const normalizedType = document.document_source === 'google_doc' ? 'docx' :
      document.document_source === 'google_sheet' ? 'xlsx' :
        document.document_source === 'google_slide' ? 'pptx' :
          type;

    let link = document.link;

    // Ensure absolute URL for local files
    const apiBase = process.env.NEXT_PUBLIC_API_URL || 'https://orr-backend-105825824472.asia-southeast2.run.app';
    if (link && !link.startsWith('http')) {
      link = `${apiBase}${link}`;
    }

    // Use Google Docs Viewer for Office files if it's a direct file link (not a Google Native Doc)
    const isOffice = ['docx', 'doc', 'xlsx', 'xls', 'pptx', 'ppt'].includes(normalizedType);
    const isGoogleNative = document.document_source?.startsWith('google_') || (link && link.includes('docs.google.com'));

    let finalUrl = link;
    if (isOffice && !isGoogleNative && link) {
      finalUrl = `https://docs.google.com/viewer?url=${encodeURIComponent(link)}&embedded=true`;
    }

    switch (normalizedType) {
      case 'sheet':
      case 'xlsx':
      case 'xls':
        return {
          icon: ExcelLogo as any,
          color: 'text-green-400',
          bgColor: 'bg-green-500/10',
          url: finalUrl,
          label: 'Spreadsheet'
        };
      case 'slide':
      case 'pptx':
      case 'ppt':
        return {
          icon: PowerPointLogo as any,
          color: 'text-orange-400',
          bgColor: 'bg-orange-500/10',
          url: finalUrl,
          label: 'Presentation'
        };
      case 'pdf':
        return {
          icon: PdfLogo as any,
          color: 'text-red-400',
          bgColor: 'bg-red-500/10',
          url: finalUrl,
          label: 'PDF'
        };
      default:
        return {
          icon: WordLogo as any,
          color: 'text-blue-400',
          bgColor: 'bg-blue-500/10',
          url: finalUrl,
          label: 'Document'
        };
    }
  };

  const config = getDocConfig();
  const name = document.name;

  const rawType = document.document_type || document.type;
  let detectedType = 'pdf';
  if (rawType && rawType !== 'file') {
    detectedType = rawType;
  } else {
    const nameSource = document.name || document.title || document.link || '';
    const match = nameSource.match(/\.([a-z0-9]+)(\?.*)?$/i);
    if (match) detectedType = match[1];
  }
  const normalizedType = (document.document_source === 'google_doc' ? 'docx' :
    document.document_source === 'google_sheet' ? 'xlsx' :
      document.document_source === 'google_slide' ? 'pptx' :
        detectedType).toLowerCase().replace(/^\./, '');

  if (loading) {
    return <DocumentSkeleton />;
  }

  if (error || !document) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-10 text-center">
        <h1 className="text-2xl font-black text-white mb-4">Document Not Found</h1>
        <p className="text-white/60 mb-8">{error || 'The document you are looking for might have been moved or deleted.'}</p>
        <Link href="/document" className="bg-primary text-black px-6 py-2 rounded-xl font-bold">Back to Vault</Link>
      </div>
    );
  }

  const config = getDocConfig(document);
  const name = document.name;

  return (
    <div className="h-screen bg-background flex flex-col overflow-hidden">
      {/* Top Bar */}
      <header className="h-16 bg-card/50 backdrop-blur-xl border-b border-white/10 flex items-center justify-between px-6 flex-shrink-0">
        <div className="flex items-center gap-4">
          <Link href="/document" className="p-2 text-white/40 hover:text-white hover:bg-white/5 rounded-xl transition-all">
            <ChevronLeft size={20} />
          </Link>
          <div className="flex items-center gap-3">
            <div className={clsx("w-10 h-10 rounded-xl flex items-center justify-center", config.bgColor, config.color)}>
              <config.icon size={20} />
            </div>
            <div>
              <h1 className="text-white font-bold text-sm">{name}</h1>
              <div className="flex items-center gap-2 text-[10px] text-white/30 font-black uppercase tracking-wider">
                <span>{config.label} ({normalizedType}) • ORR-{id.padStart(3, '0')}</span>
                <span className="w-1 h-1 rounded-full bg-white/20" />
                <span>Size: {doc.size || doc.file_size || '0 KB'}</span>
                <span className="w-1 h-1 rounded-full bg-white/20" />
                <span>Last saved 2m ago</span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 bg-white/5 p-1 rounded-xl border border-white/10 mr-4">
            <button className="p-2 text-white/40 hover:text-white transition-all"><Download size={18} /></button>
            <button className="p-2 text-white/40 hover:text-white transition-all"><Share2 size={18} /></button>
            <button className="p-2 text-white/40 hover:text-white transition-all"><Maximize2 size={18} /></button>
          </div>

          <button
            onClick={accessStatus === 'idle' ? handleRequestAccess : undefined}
            disabled={accessStatus !== 'idle'}
            className={clsx(
              "flex items-center gap-2 px-4 py-2 rounded-xl font-bold transition-all border",
              accessStatus === 'idle' && "bg-white/5 text-white hover:bg-white/10 border-white/10",
              accessStatus === 'requesting' && "bg-white/5 text-white/40 border-white/5 cursor-wait",
              accessStatus === 'pending' && "bg-orange-500/10 text-orange-400 border-orange-500/20",
              accessStatus === 'granted' && "bg-green-500/10 text-green-400 border-green-500/20"
            )}
          >
            {accessStatus === 'idle' && (
              <>
                <Edit3 size={16} />
                <span className="text-sm">Request Edit</span>
              </>
            )}
            {accessStatus === 'requesting' && (
              <>
                <Loader2 size={16} className="animate-spin" />
                <span className="text-sm">Requesting...</span>
              </>
            )}
            {accessStatus === 'pending' && (
              <>
                <Clock size={16} />
                <span className="text-sm">Access Pending</span>
              </>
            )}
            {accessStatus === 'granted' && (
              <>
                <ShieldCheck size={16} />
                <span className="text-sm">Editing Enabled</span>
              </>
            )}
          </button>

          <div className="w-px h-8 bg-white/10 mx-2" />
          <button
            onClick={() => setShowAiPanel(!showAiPanel)}
            className={clsx(
              "flex items-center gap-2 px-4 py-2 rounded-xl font-bold transition-all",
              showAiPanel ? "bg-primary text-black" : "bg-white/5 text-white/60 hover:text-white"
            )}
          >
            <Sparkles size={18} />
            {showAiPanel ? <PanelRightClose size={18} /> : <PanelRight size={18} />}
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Document Editor Area */}
        <div className="flex-1 bg-[#f8f9fa] relative flex flex-col">
          {/* Read-only Banner */}
          <AnimatePresence>
            {accessStatus !== 'granted' && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="bg-orange-500/10 border-b border-orange-500/20 px-6 py-2 flex items-center justify-between overflow-hidden"
              >
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-orange-500/20 flex items-center justify-center text-orange-400">
                    <Lock size={12} />
                  </div>
                  <span className="text-[11px] font-black uppercase tracking-wider text-orange-400/80">
                    {accessStatus === 'pending' ? 'Your edit request is being reviewed by the owner' : 'You are currently in view-only mode'}
                  </span>
                </div>
                {accessStatus === 'idle' && (
                  <button
                    onClick={handleRequestAccess}
                    className="text-[10px] font-black uppercase tracking-widest text-orange-400 hover:text-orange-300 transition-colors"
                  >
                    Request Access
                  </button>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          <div className="flex-1 relative flex flex-col overflow-hidden">
            {isMock ? (
              <div className="flex-1 flex flex-col overflow-hidden">
                <Toolbar />
                {['doc', 'docx'].includes(normalizedType) ? (
                  <DocEditor />
                ) : ['sheet', 'xlsx'].includes(normalizedType) ? (
                  <SheetEditor />
                ) : ['slide', 'pptx'].includes(normalizedType) ? (
                  <SlideEditor />
                ) : (
                  <DocEditor />
                )}
              </div>
            ) : (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-black/20 p-20 text-center">
                <iframe
                  src={config.url}
                  className="w-full h-full border-none"
                  title={`${config.label} Editor`}
                />
              </div>
            )}
          </div>
        </div>

        {/* Side Panels */}
        <AnimatePresence>
          {showAiPanel && (
            <motion.aside
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 400, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              className="bg-card border-l border-white/10 flex flex-col overflow-hidden"
            >
              {/* Panel Tabs */}
              <div className="flex border-b border-white/10 p-2 gap-1">
                {[
                  { id: 'ai', icon: Sparkles, label: 'Gemini AI' },
                  { id: 'history', icon: History, label: 'Versions' },
                  { id: 'comments', icon: MessageSquare, label: 'Comments' },
                ].map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={clsx(
                      "flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-xs font-black uppercase tracking-wider transition-all",
                      activeTab === tab.id ? "bg-white/10 text-primary" : "text-white/40 hover:text-white hover:bg-white/5"
                    )}
                  >
                    <tab.icon size={14} />
                    <span className="hidden sm:inline">{tab.label}</span>
                  </button>
                ))}
              </div>

              {/* Panel Content */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {activeTab === 'ai' && (
                  <>
                    <div className="space-y-4">
                      {messages.map((msg, i) => (
                        <div key={i} className={clsx(
                          "p-4 rounded-2xl text-sm leading-relaxed",
                          msg.role === 'ai' ? "bg-primary/5 text-white/80 border border-primary/10" : "bg-white/5 text-white/60 ml-8"
                        )}>
                          {msg.role === 'ai' && <Sparkles size={14} className="text-primary mb-2" />}
                          {msg.content}
                        </div>
                      ))}
                      {aiLoading && (
                        <div className="flex items-center gap-2 text-primary text-xs font-bold animate-pulse">
                          <Loader2 size={14} className="animate-spin" />
                          Gemini is thinking...
                        </div>
                      )}
                    </div>
                  </>
                )}

                {activeTab === 'history' && (
                  <div className="space-y-4">
                    {[
                      { user: 'Sarah Chen', date: 'Today, 11:45 AM', action: 'Modified roadmap targets', version: 'v1.4' },
                      { user: 'Marcus Wright', date: 'Yesterday, 4:20 PM', action: 'Added Q3 projections', version: 'v1.3' },
                      { user: 'Sarah Chen', date: 'Apr 25, 10:10 AM', action: 'Initial draft completion', version: 'v1.2' },
                    ].map((item, i) => (
                      <div key={i} className="group p-4 rounded-2xl bg-white/5 border border-white/5 hover:border-primary/30 transition-all cursor-pointer">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-primary font-black text-[10px] uppercase tracking-widest">{item.version}</span>
                          <span className="text-white/30 text-[10px]">{item.date}</span>
                        </div>
                        <div className="text-white font-bold text-sm mb-1">{item.user}</div>
                        <div className="text-white/40 text-xs">{item.action}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Chat Input */}
              {activeTab === 'ai' && (
                <div className="p-6 bg-white/5 border-t border-white/10">
                  <div className="relative">
                    <input
                      type="text"
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                      placeholder="Ask Gemini about this doc..."
                      className="w-full bg-background border border-white/10 rounded-xl py-3 pl-4 pr-12 text-white text-sm focus:border-primary/50 outline-none transition-all"
                    />
                    <button
                      onClick={handleSendMessage}
                      className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-primary hover:bg-primary/10 rounded-lg transition-all"
                    >
                      <Send size={18} />
                    </button>
                  </div>
                </div>
              )}
            </motion.aside>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

function DocumentSkeleton() {
  return (
    <div className="h-screen bg-background flex flex-col animate-pulse">
      <div className="h-16 bg-card/50 border-b border-white/10 px-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-8 h-8 rounded-lg bg-white/5" />
          <div className="space-y-2">
            <div className="w-48 h-4 bg-white/10 rounded" />
            <div className="w-24 h-2 bg-white/5 rounded" />
          </div>
        </div>
      </div>
      <div className="flex-1 flex">
        <div className="flex-1 bg-white/5 m-10 rounded-3xl" />
        <div className="w-[400px] bg-card border-l border-white/10" />
      </div>
    </div>
  );
}
