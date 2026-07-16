import React from 'react';
import RequestDetailsClient from './RequestDetailsClient';

export const dynamic = 'force-static';

export function generateStaticParams() {
  return [
    { id: 'req_1' },
    { id: 'req_2' },
    { id: 'req_3' },
  ];
}

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function Page({ params }: PageProps) {
  const { id } = await params;
  
  return <RequestDetailsClient id={id} />;
}
