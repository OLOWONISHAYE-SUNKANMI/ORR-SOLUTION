'use client';

import React, { useState, useEffect } from 'react';
import { use } from 'react';
import SuperAdminViewerClient from './SuperAdminViewerClient';
import { adminVaultApi } from '@/lib/admin-vault-api';
import { VaultDocument } from '@/lib/vault-api';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function Page({ params }: PageProps) {
  const { id } = use(params);
  const [document, setDocument] = useState<VaultDocument | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const fetchDoc = async () => {
      try {
        setLoading(true);
        const doc = await adminVaultApi.getDocument(id);
        setDocument(doc);
      } catch (err) {
        console.error('Failed to fetch document:', err);
        setError('Document not found or access denied.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchDoc();
  }, [id]);

  if (loading) {
    return (
      <div className="h-screen bg-background flex flex-col animate-pulse">
        <div className="h-16 bg-card/50 border-b border-white/10 px-6 flex items-center justify-between">
          <div className="w-48 h-4 bg-white/10 rounded" />
        </div>
        <div className="flex-1 bg-white/5 m-10 rounded-3xl" />
      </div>
    );
  }

  if (error || !document) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-10 text-center">
        <h1 className="text-2xl font-black text-white mb-4">Document Not Found</h1>
        <p className="text-white/60 mb-8">{error || 'The document you are looking for might have been moved or deleted.'}</p>
        <a href="/admin/vault" className="bg-primary text-black px-6 py-2 rounded-xl font-bold">Back to Vault</a>
      </div>
    );
  }

  return <SuperAdminViewerClient id={id} document={document} />;
}
