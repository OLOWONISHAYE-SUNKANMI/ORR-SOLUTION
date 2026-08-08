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
    if (meetingId === 'instant-session') {
      setMeeting({
        id: 0,
        title: "Instant Consultation Session",
        meeting_link: "pending-google-workspace"
      });
      return;
    }

    const fetchMeeting = async () => {
      try {
        const response = await axios.get(`/meetings/${meetingId}/`);
        // Handle wrapped data structure from the API response
        const meetingData = response.data?.data || response.data;
        setMeeting(meetingData);
      } catch (error) {
        console.error("Failed to fetch meeting:", error);
      }
    };
    fetchMeeting();
  }, [meetingId]);

  const handleJoin = () => {
    if (meeting?.meeting_link && meeting.meeting_link !== 'pending-google-workspace') {
      window.location.href = meeting.meeting_link;
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
