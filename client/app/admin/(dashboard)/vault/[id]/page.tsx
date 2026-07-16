import React from 'react';
import SuperAdminViewerPageClient from './SuperAdminViewerPageClient';

export const dynamic = 'force-static';

export function generateStaticParams() {
  return [
    { id: 'doc_1' },
    { id: 'doc_2' },
    { id: 'doc_3' },
  ];
}

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function Page({ params }: PageProps) {
  const { id } = await params;
  
  return <SuperAdminViewerPageClient id={id} />;
}
