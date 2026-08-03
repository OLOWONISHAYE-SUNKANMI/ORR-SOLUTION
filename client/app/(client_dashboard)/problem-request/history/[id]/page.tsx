import React from 'react';
import RequestDetailsClient from './RequestDetailsClient';


interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function Page({ params }: PageProps) {
  const { id } = await params;
  
  return <RequestDetailsClient id={id} />;
}
