"use client";

import React, { useState } from "react";
import { Mic, MicOff, Video, VideoOff, Settings, MoreVertical, ShieldCheck, Users } from "lucide-react";

const JoinScreen: React.FC<{ onJoin: () => void; meetingTitle: string }> = ({ onJoin, meetingTitle }) => {
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);

  return (
    <div className="min-h-screen bg-[#121212] text-white flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        
        {/* Left Side: Camera Preview */}
        <div className="flex flex-col gap-6">
          <div className="relative aspect-video bg-[#202124] rounded-2xl overflow-hidden border border-white/10 flex items-center justify-center">
            {isVideoOff ? (
              <div className="w-32 h-32 rounded-full bg-primary/10 flex items-center justify-center text-primary text-4xl font-bold">
                J
              </div>
            ) : (
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end justify-center pb-8">
                <span className="text-sm font-medium">Camera is on</span>
              </div>
            )}
            
            {/* Overlay Controls */}
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-4">
              <button 
                onClick={() => setIsMuted(!isMuted)}
                className={`p-4 rounded-full transition-all border ${isMuted ? "bg-red-500 border-red-500" : "bg-transparent border-white/20 hover:bg-white/5"}`}
              >
                {isMuted ? <MicOff size={20} /> : <Mic size={20} />}
              </button>
              <button 
                onClick={() => setIsVideoOff(!isVideoOff)}
                className={`p-4 rounded-full transition-all border ${isVideoOff ? "bg-red-500 border-red-500" : "bg-transparent border-white/20 hover:bg-white/5"}`}
              >
                {isVideoOff ? <VideoOff size={20} /> : <Video size={20} />}
              </button>
            </div>

            <div className="absolute top-4 right-4 flex gap-2">
              <button className="p-2 bg-black/40 hover:bg-black/60 rounded-full">
                <Settings size={18} />
              </button>
            </div>
          </div>
          
          <div className="flex items-center justify-center gap-4 text-gray-400">
             <div className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-white/10 text-xs">
               <ShieldCheck size={14} className="text-primary" />
               Check your audio and video
             </div>
          </div>
        </div>

        {/* Right Side: Join Info */}
        <div className="flex flex-col items-center lg:items-start text-center lg:text-left gap-8">
          <div>
            <h1 className="text-4xl font-normal mb-2">{meetingTitle || "Strategic Planning Session"}</h1>
            <p className="text-xl text-gray-400">Ready to join?</p>
          </div>

          <div className="flex flex-col gap-4 w-full max-w-sm">
            <button 
              onClick={onJoin}
              className="bg-primary hover:bg-primary/90 text-white font-medium py-3 px-8 rounded-full text-lg transition-all shadow-lg shadow-primary/20"
            >
              Join now
            </button>
            
            <button className="text-primary hover:bg-primary/10 font-medium py-3 px-8 rounded-full text-lg transition-all">
              Present
            </button>
          </div>

          <div className="flex flex-col gap-4 items-center lg:items-start mt-4">
             <div className="flex items-center gap-2 text-gray-400">
               <Users size={20} />
               <span className="text-sm">The expert and other participants will join shortly</span>
             </div>
             <div className="flex -space-x-2">
               {[1,2,3].map(i => (
                 <div key={i} className="w-8 h-8 rounded-full border-2 border-[#121212] bg-white/10 flex items-center justify-center text-[10px]">
                   U{i}
                 </div>
               ))}
             </div>
          </div>
        </div>
      </div>

      {/* Footer Branding */}
      <div className="absolute bottom-8 left-8 flex items-center gap-2">
         <div className="w-6 h-6 bg-primary rounded flex items-center justify-center text-[10px] font-bold">ORR</div>
         <span className="text-gray-500 font-medium tracking-tight">ORR-SOLUTIONS MEET</span>
      </div>
    </div>
  );
};

export default JoinScreen;
