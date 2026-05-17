"use client";

import { useState, useEffect } from "react";
import { ChevronUp } from "lucide-react";

export function ScrollToTop({ targetSelector, position = "left" }: { targetSelector?: string, position?: "left" | "right" }) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const getTarget = () => targetSelector ? document.querySelector(targetSelector) : window;
    
    const toggleVisibility = () => {
      const target = getTarget();
      let scrollTop = 0;
      
      if (!target || target === window) {
        scrollTop = window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || window.scrollY;
      } else {
        scrollTop = (target as HTMLElement).scrollTop;
      }
      
      setIsVisible(scrollTop > 300);
    };

    const target = getTarget();
    const scrollTarget = target || window;
    
    scrollTarget.addEventListener("scroll", toggleVisibility, { passive: true });
    window.addEventListener("scroll", toggleVisibility, { passive: true });
    
    // Initial check with a small delay to ensure DOM is ready
    const timer = setTimeout(toggleVisibility, 100);
    
    return () => {
      scrollTarget.removeEventListener("scroll", toggleVisibility);
      window.removeEventListener("scroll", toggleVisibility);
      clearTimeout(timer);
    };
  }, [targetSelector]);

  const scrollToTop = () => {
    const target = targetSelector ? document.querySelector(targetSelector) : window;
    const scrollTarget = target || window;
    scrollTarget.scrollTo({
      top: 0,
      behavior: "smooth",
    });
    
    // Fallback for window if target failed
    if (target !== window) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const positionClass = position === "right" ? "right-10" : "left-10";

  return (
    <div className={`fixed bottom-10 ${positionClass} z-[999] transition-all duration-500 ${isVisible ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-10 scale-50 pointer-events-none'}`}>
      <button
        onClick={scrollToTop}
        className="w-16 h-16 bg-emerald-500 hover:bg-emerald-400 text-white rounded-full flex items-center justify-center shadow-[0_15px_35px_rgba(16,185,129,0.4)] transition-all hover:scale-110 active:scale-90 group border-2 border-white/30 backdrop-blur-sm"
        aria-label="Scroll to top"
      >
        <ChevronUp size={32} className="transition-transform group-hover:-translate-y-1.5 duration-300" />
      </button>
    </div>
  );
}
