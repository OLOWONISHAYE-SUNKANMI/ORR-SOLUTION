"use client";

import React, { useState, useEffect } from "react";
import JoinScreen from "@/app/components/meeting/JoinScreen";
import MeetingRoom from "@/app/components/meeting/MeetingRoom";
import axios from "@/lib/axios";

interface Meeting {
  id: number;
  title: string;
  meeting_link: string;
}

interface MeetingPageClientProps {
  meetingId: string;
}

export default function MeetingPageClient({ meetingId }: MeetingPageClientProps) {
  const [hasJoined, setHasJoined] = useState(false);
  const [meeting, setMeeting] = useState<Meeting | null>(null);

  useEffect(() => {
    const fetchMeeting = async () => {
      try {
        const response = await axios.get(`/meetings/${meetingId}/`);
        setMeeting(response.data);
      } catch (error) {
        console.error("Failed to fetch meeting:", error);
      }
    };
    fetchMeeting();
  }, [meetingId]);

  const handleJoin = () => {
    if (meeting?.meeting_link) {
      window.open(meeting.meeting_link, "_blank");
    } else {
      setHasJoined(true);
    }
  };

  if (!hasJoined) {
    return (
      <JoinScreen 
        meetingTitle={meeting?.title || "Consultation Session"} 
        onJoin={handleJoin} 
      />
    );
  }

  return <MeetingRoom meetingId={meetingId} />;
}
