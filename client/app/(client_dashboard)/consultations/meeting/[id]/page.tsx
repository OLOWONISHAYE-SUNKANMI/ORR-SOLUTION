import React from "react";
import MeetingPageClient from "./MeetingPageClient";

export const dynamic = 'force-static';
export const dynamicParams = false;

export function generateStaticParams() {
  return [
    { id: 'meet_1' },
    { id: 'meet_2' },
    { id: 'meet_3' },
  ];
}

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function Page({ params }: PageProps) {
  const { id } = await params;
  
  return <MeetingPageClient meetingId={id} />;
}
