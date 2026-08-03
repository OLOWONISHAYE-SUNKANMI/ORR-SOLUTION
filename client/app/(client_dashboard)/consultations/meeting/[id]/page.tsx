import React from "react";
import MeetingPageClient from "./MeetingPageClient";


interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function Page({ params }: PageProps) {
  const { id } = await params;
  
  return <MeetingPageClient meetingId={id} />;
}
