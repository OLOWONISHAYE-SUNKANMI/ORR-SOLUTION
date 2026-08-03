import React from 'react';
import DocumentViewerClient from './DocumentViewerClient';



interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function Page({ params }: PageProps) {
  const { id } = await params;
  
  return <DocumentViewerClient id={id} />;
}
