import React from 'react';
import SuperAdminViewerPageClient from './SuperAdminViewerPageClient';


interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function Page({ params }: PageProps) {
  const { id } = await params;
  
  return <SuperAdminViewerPageClient id={id} />;
}
