'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { VaultDocument } from '@/lib/vault-api';

import WorkspaceShell from '@/components/vault/layout/WorkspaceShell';
import DocsEditor from '@/components/vault/editors/DocsEditor';
import SheetsEditor from '@/components/vault/editors/SheetsEditor';
import SlidesEditor from '@/components/vault/editors/SlidesEditor';

export default function SuperAdminViewerClient({ id, document }: { id: string, document: VaultDocument }) {
  const router = useRouter();
  const doc = document as any;
  const isMock = doc.google_drive_id?.startsWith('mock_') || doc.link?.includes('mock_');
  
  const [activeDocument, setActiveDocument] = useState<any>({
     ...doc,
     title: doc.name || doc.title || 'Untitled Document',
     content: doc.description || doc.content || ''
  });
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
     if (isMock) {
        console.warn("Sandbox Mode: The service account credentials for Google Workspace are misconfigured (403 Permission Denied). Using a local interactive workspace instead. All changes are saved locally.");
     }
  }, [isMock]);

  const handleSaveSandbox = async (docId: string, title: string, content: string) => {
     setIsSaving(true);
     try {
        const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';
        const token = localStorage.getItem('access_token') || localStorage.getItem('token');
        const headers: HeadersInit = { 'Content-Type': 'application/json' };
        if (token) headers['Authorization'] = `Bearer ${token}`;
        
        await fetch(`${apiBase}/admin-portal/v1/vault/documents/${docId}/`, {
           method: 'PATCH',
           headers,
           body: JSON.stringify({
              title,
              description: content || ''
           })
        });
        setActiveDocument((prev: any) => ({ ...prev, title, content }));
     } catch (err) {
        console.error(err);
     } finally {
        setIsSaving(false);
     }
  };

  const renderEditor = () => {
    const handleChange = (content: string) => {
       setActiveDocument((prev: any) => ({ ...prev, content }));
    };
    
    const handleTitleChange = (title: string) => {
       setActiveDocument((prev: any) => ({ ...prev, title }));
    };

    const type = activeDocument.document_type || activeDocument.type || (activeDocument.documentSource?.includes('sheet') ? 'sheet' : 'doc');
    const normalizedType = (activeDocument.document_source === 'google_doc' ? 'docx' : 
                          activeDocument.document_source === 'google_sheet' ? 'xlsx' : 
                          activeDocument.document_source === 'google_slide' ? 'pptx' : 
                          type).toLowerCase().replace(/^\./, '');

    switch (normalizedType) {
       case 'doc':
       case 'docx':
       case 'google_doc':
          return <DocsEditor content={activeDocument.content || ''} onChange={handleChange} title={activeDocument.title || ''} onTitleChange={handleTitleChange} />;
       case 'sheet':
       case 'xlsx':
       case 'google_sheet':
          return <SheetsEditor content={activeDocument.content || ''} onChange={handleChange} title={activeDocument.title || ''} onTitleChange={handleTitleChange} />;
       case 'slide':
       case 'pptx':
       case 'google_slide':
          return <SlidesEditor content={activeDocument.content || ''} onChange={handleChange} title={activeDocument.title || ''} onTitleChange={handleTitleChange} />;
       default:
          return <DocsEditor content={activeDocument.content || ''} onChange={handleChange} title={activeDocument.title || ''} onTitleChange={handleTitleChange} />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-background flex flex-col animate-in slide-in-from-bottom-8 duration-500">
      <div className="flex-1 relative">
        <WorkspaceShell
          activeDocument={activeDocument}
          documents={[activeDocument]}
          folders={[]}
          isLoading={false}
          isSaving={isSaving}
          clients={[]}
          onCreateFolder={() => {}}
          onCreateDocument={() => {}}
          onSelectDocument={(selected) => {
            router.push('/admin/vault');
          }}
          onUpdateTitle={(title) => {
             handleSaveSandbox(id, title, activeDocument.content || '');
          }}
          onShareClick={() => {}}
          renderEditor={renderEditor}
        />
      </div>
    </div>
  );
}
