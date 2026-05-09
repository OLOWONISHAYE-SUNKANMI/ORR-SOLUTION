"use client";

import React, { useState, useEffect } from "react";
import { 
  Mic, MicOff, Video, VideoOff, Monitor, Hand, 
  MoreVertical, PhoneOff, Users, MessageSquare, 
  Info, ShieldCheck, Grid, Maximize, Smile
} from "lucide-react";
import { format } from "date-fns";

interface Participant {
  id: string;
  name: string;
  avatar?: string;
  isMe?: boolean;
  isMuted?: boolean;
  isVideoOff?: boolean;
}

const MeetingRoom: React.FC<{ meetingId: string }> = ({ meetingId }) => {
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  const [activeTab, setActiveTab] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const participants: Participant[] = [
    { id: "1", name: "You (Waiting for others...)", isMe: true },
  ];

  return (
    <div className="fixed inset-0 bg-[#121212] text-white flex flex-col font-sans">
      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden relative p-4 gap-4">
        {/* Video Grid */}
        <div className={`flex-1 grid gap-4 ${
          participants.length <= 1 ? "grid-cols-1" : 
          participants.length <= 2 ? "grid-cols-2" : 
          "grid-cols-2 lg:grid-cols-3"
        } content-center`}>
          {participants.map((p) => (
            <div 
              key={p.id} 
              className="relative aspect-video bg-[#202124] rounded-2xl overflow-hidden border border-white/5 flex items-center justify-center group"
            >
              {p.isVideoOff || (p.isMe && isVideoOff) ? (
                <div className="w-24 h-24 rounded-full bg-primary/20 flex items-center justify-center text-primary text-3xl font-bold">
                  {p.name.charAt(0)}
                </div>
              ) : (
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent flex items-end p-4">
                  <div className="flex items-center gap-2">
                    {p.isMe && isMuted && <MicOff size={16} className="text-red-500" />}
                    <span className="text-sm font-medium">{p.name}</span>
                  </div>
                </div>
              )}
              
              {/* Individual Participant Controls (Hover) */}
              <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                <button className="p-2 bg-black/50 hover:bg-black/70 rounded-full">
                  <Grid size={16} />
                </button>
                <button className="p-2 bg-black/50 hover:bg-black/70 rounded-full">
                  <Maximize size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Sidebar Panel */}
        {activeTab && (
          <div className="w-80 bg-card rounded-2xl border border-white/10 flex flex-col overflow-hidden animate-in slide-in-from-right duration-300">
            <div className="p-4 border-b border-white/5 flex items-center justify-between">
              <h3 className="font-medium text-lg">
                {activeTab === "people" ? "People" : activeTab === "chat" ? "Chat" : "Meeting Info"}
              </h3>
              <button onClick={() => setActiveTab(null)} className="p-1 hover:bg-white/10 rounded-full">
                <Info size={20} />
              </button>
            </div>
            <div className="flex-1 p-4 overflow-y-auto">
              {activeTab === "people" ? (
                <div className="space-y-4">
                  {participants.map(p => (
                    <div key={p.id} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
                          {p.name.charAt(0)}
                        </div>
                        <span className="text-sm font-medium">{p.name}</span>
                      </div>
                      <div className="flex gap-2">
                        <Mic size={16} className="text-gray-400" />
                        <MoreVertical size={16} className="text-gray-400" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : activeTab === "chat" ? (
                <div className="h-full flex flex-col justify-end gap-4">
                  <div className="text-center text-xs text-gray-500 mb-4">
                    Messages can only be seen by people in the call
                  </div>
                  <div className="relative">
                    <input 
                      type="text" 
                      placeholder="Send a message"
                      className="w-full bg-white/5 border border-white/10 rounded-full px-4 py-3 text-sm focus:outline-none focus:border-primary"
                    />
                    <Smile className="absolute right-4 top-3 text-gray-400 cursor-pointer" size={20} />
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  <div>
                    <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Joining info</h4>
                    <p className="text-sm text-gray-300 break-all">Google Meet link will appear here shortly</p>
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Description</h4>
                    <p className="text-sm text-gray-400">Loading meeting details...</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Control Bar */}
      <div className="h-24 px-6 flex items-center justify-between">
        <div className="flex items-center gap-4 min-w-[200px]">
          <span className="text-lg font-medium">{format(currentTime, "HH:mm")}</span>
          <div className="w-px h-6 bg-white/10" />
          <span className="text-sm text-gray-400 hidden sm:block truncate max-w-[150px]">
            {meetingId || "meeting-id-xyz"}
          </span>
        </div>

        <div className="flex items-center gap-3">
          <button 
            onClick={() => setIsMuted(!isMuted)}
            className={`p-4 rounded-full transition-all ${isMuted ? "bg-red-500 hover:bg-red-600" : "bg-white/10 hover:bg-white/20"}`}
          >
            {isMuted ? <MicOff size={24} /> : <Mic size={24} />}
          </button>
          <button 
            onClick={() => setIsVideoOff(!isVideoOff)}
            className={`p-4 rounded-full transition-all ${isVideoOff ? "bg-red-500 hover:bg-red-600" : "bg-white/10 hover:bg-white/20"}`}
          >
            {isVideoOff ? <VideoOff size={24} /> : <Video size={24} />}
          </button>
          <button className="p-4 rounded-full bg-white/10 hover:bg-white/20 transition-all hidden sm:flex">
            <Smile size={24} />
          </button>
          <button 
            onClick={() => setIsSharing(!isSharing)}
            className={`p-4 rounded-full transition-all ${isSharing ? "bg-primary/20 text-primary" : "bg-white/10 hover:bg-white/20"}`}
          >
            <Monitor size={24} />
          </button>
          <button className="p-4 rounded-full bg-white/10 hover:bg-white/20 transition-all">
            <Hand size={24} />
          </button>
          <button className="p-4 rounded-full bg-white/10 hover:bg-white/20 transition-all">
            <MoreVertical size={24} />
          </button>
          <button className="p-4 bg-red-600 hover:bg-red-700 rounded-full transition-all px-8 ml-4">
            <PhoneOff size={24} />
          </button>
        </div>

        <div className="flex items-center gap-2 min-w-[200px] justify-end">
          <button 
            onClick={() => setActiveTab(activeTab === "info" ? null : "info")}
            className={`p-3 rounded-full hover:bg-white/10 text-gray-400 ${activeTab === 'info' ? 'text-primary' : ''}`}
          >
            <Info size={20} />
          </button>
          <button 
            onClick={() => setActiveTab(activeTab === "people" ? null : "people")}
            className={`p-3 rounded-full hover:bg-white/10 text-gray-400 ${activeTab === 'people' ? 'text-primary' : ''}`}
          >
            <Users size={20} />
          </button>
          <button 
            onClick={() => setActiveTab(activeTab === "chat" ? null : "chat")}
            className={`p-3 rounded-full hover:bg-white/10 text-gray-400 ${activeTab === 'chat' ? 'text-primary' : ''}`}
          >
            <MessageSquare size={20} />
          </button>
          <button className="p-3 rounded-full hover:bg-white/10 text-gray-400">
            <ShieldCheck size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default MeetingRoom;
