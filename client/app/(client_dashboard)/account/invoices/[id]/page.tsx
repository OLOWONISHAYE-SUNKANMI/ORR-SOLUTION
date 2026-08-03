import React from 'react';
import InvoiceDetailClient from './InvoiceDetailClient';


interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function Page({ params }: PageProps) {
  const { id } = await params;
  
  return <InvoiceDetailClient id={id} />;
}
