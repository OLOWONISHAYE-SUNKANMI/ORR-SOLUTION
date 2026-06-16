"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "../../components/ThemeProvider";
import { useLanguage } from "../../components/LanguageProvider";
import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { AuthSelectionToast } from "../../components/AuthSelectionToast";

export function HeroSection() {
  const { theme } = useTheme();
  const { t, interpolate } = useLanguage();

  const [isVideoEnded, setIsVideoEnded] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [isFooterVisible, setIsFooterVisible] = useState(false);
  const [authModalState, setAuthModalState] = useState<{isOpen: boolean, type: 'login' | 'register'}>({isOpen: false, type: 'register'});

  const sectionRef = useRef<HTMLElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        const isOut = !entry.isIntersecting;
        setIsMinimized(isOut);
        if (!isOut) setIsVisible(true);
      },
      { threshold: 0 }
    );

    if (sectionRef.current) observer.observe(sectionRef.current);

    const footer = document.querySelector('footer');
    let footerObserver: IntersectionObserver | null = null;

    if (footer) {
      footerObserver = new IntersectionObserver(
        ([entry]) => setIsFooterVisible(entry.isIntersecting),
        { threshold: 0.1 }
      );
      footerObserver.observe(footer);
    }

    return () => {
      if (sectionRef.current) observer.unobserve(sectionRef.current);
      if (footerObserver) footerObserver.disconnect();
    };
  }, []);

  const getOptimizedVideoUrl = (url: string, width?: number) => {
    if (!width) return url;
    return url.replace("/upload/", `/upload/c_scale${width ? `,w_${width}` : ""}/`);
  };

  const currentRawVideo = theme === "dark"
    ? "https://res.cloudinary.com/depeqzb6z/video/upload/v1773386068/Final_Comp_1_iyegf6.mp4"
    : "https://res.cloudinary.com/depeqzb6z/video/upload/v1773386094/Final_Comp_1_1_efvzc0.mp4";

  const posterUrl = currentRawVideo
    .replace("/video/upload/", "/video/upload/f_auto,q_auto,so_0/")
    .replace(".mp4", ".jpg");

  return (
    <section ref={sectionRef} className="w-full h-[60vh] md:h-auto md:aspect-video relative mt-[80px] lg:mt-0">
      <motion.div
        layout
        initial={false}
        animate={{
          position: isMinimized ? "fixed" : "absolute",
          bottom: isMinimized ? 32 : 0,
          right: isMinimized ? 32 : 0,
          width: isMinimized ? "min(400px, 90vw)" : "100%",
          height: isMinimized ? "auto" : "100%",
          borderRadius: isMinimized ? 24 : 0,
          zIndex: isMinimized ? 50 : 0,
          opacity: (!isVisible || (isMinimized && isFooterVisible)) ? 0 : 1,
          scale: (!isVisible || (isMinimized && isFooterVisible)) ? 0.8 : 1,
          x: (!isVisible || (isMinimized && isFooterVisible)) ? 100 : 0,
          y: (!isVisible || (isMinimized && isFooterVisible)) ? 100 : 0,
        }}
        transition={{
          type: "tween",
          duration: 0.8,
          ease: [0.16, 1, 0.3, 1],
        }}
        className="overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.3)] bg-card h-full md:h-auto md:aspect-video will-change-transform"
        style={{ transform: "translateZ(0)" }}
      >
        <video
          ref={videoRef}
          key={theme}
          className="absolute inset-0 w-full h-full object-cover"
          autoPlay
          muted
          playsInline
          preload="auto"
          poster={posterUrl}
          onEnded={() => setIsVideoEnded(true)}
        >
          <source src={getOptimizedVideoUrl(currentRawVideo)} media="(min-width: 1024px)" />
          <source src={getOptimizedVideoUrl(currentRawVideo, 1080)} media="(min-width: 640px)" />
          <source src={getOptimizedVideoUrl(currentRawVideo, 640)} />
        </video>

        <AnimatePresence>
          {isVideoEnded && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="absolute inset-0 bg-black/40 backdrop-blur-md flex flex-col items-center justify-center p-4 z-10 border border-white/10"
            >
              <h3 className={`text-white font-bold mb-3 text-center drop-shadow-lg tracking-tight ${isMinimized ? 'text-sm' : 'text-2xl md:text-5xl'}`}>
                {interpolate(t.hero.joinNow)}
              </h3>
              <button
                onClick={() => setAuthModalState({ isOpen: true, type: 'register' })}
                className={`bg-emerald-500 text-white font-bold rounded-full hover:bg-emerald-400 transition-all shadow-[0_0_20px_rgba(16,185,129,0.4)] active:scale-95 ${isMinimized ? 'px-4 py-1.5 text-xs' : 'px-10 py-4 text-xl'}`}
              >
                {interpolate(t.hero.signUp)}
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {isMinimized && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsVisible(false);
            }}
            className="absolute top-3 right-3 z-20 bg-black/40 hover:bg-black/80 text-white rounded-full p-2 transition-all hover:rotate-90"
            aria-label="Close video"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        )}
      </motion.div>
      <AuthSelectionToast 
        isOpen={authModalState.isOpen} 
        type={authModalState.type} 
        onClose={() => setAuthModalState({ ...authModalState, isOpen: false })} 
      />
      <style jsx>{`
        .animate-in {
          animation-duration: 500ms;
          animation-fill-mode: both;
        }
        .fade-in {
          animation-name: fadeIn;
        }
        .zoom-in {
          animation-name: zoomIn;
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes zoomIn {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </section>
  );
}
