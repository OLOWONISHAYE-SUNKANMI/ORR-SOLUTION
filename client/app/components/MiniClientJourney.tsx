"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import EditableText from "../../components/EditableText";
import { getRichTextContent } from "../../lib/rich-text-utils";
import SafeHTMLRenderer from "@/components/SafeHTMLRenderer";
import { motion, AnimatePresence } from "framer-motion";
import { useLanguage } from "./LanguageProvider";

gsap.registerPlugin(ScrollTrigger);

interface RichTextData {
  content: string;
  fontSize?: number;
  fontWeight?: 'normal' | 'bold';
  fontStyle?: 'normal' | 'italic';
}

interface MiniClientJourneyProps {
  content?: any;
  onUpdate?: (data: any) => Promise<void>;
}

export default function MiniClientJourney({ content, onUpdate }: MiniClientJourneyProps) {
  const messageStrip = content;
  const { t, language, interpolate } = useLanguage();

  const titleRef = useRef(null);
  const cardRef = useRef(null);
  const imagesRef = useRef<(HTMLImageElement | null)[]>([]);

  const [currentIndex, setCurrentIndex] = useState(0);

  let message1 = language === 'it' ? t.journey.messages[0] : (getRichTextContent(messageStrip?.message, language) || t.journey.messages[0]);
  if (typeof message1 === 'string') {
    // Automatically convert *text* or **text** into <b>text</b>
    message1 = message1.replace(/\*\*([^*]+)\*\*/g, '<b>$1</b>').replace(/\*([^*]+)\*/g, '<b>$1</b>');
    message1 = interpolate(message1);
  }

  const activeMessages = [message1, interpolate(t.journey.messages[1]), interpolate(t.journey.messages[2])];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % activeMessages.length);
    }, 8000);
    return () => clearInterval(timer);
  }, [activeMessages.length, currentIndex]);

  const handleMessageSave = async (newContent: string | RichTextData) => {
    const contentString = typeof newContent === 'string' ? newContent : newContent.content;
    await onUpdate?.({ message: contentString });
  };

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(titleRef.current,
        { opacity: 0, y: -30 },
        {
          opacity: 1, y: 0, duration: 0.8, ease: "power3.out",
          scrollTrigger: { trigger: titleRef.current, start: "top 80%" }
        }
      );

      gsap.fromTo(cardRef.current,
        { opacity: 0, scale: 0.9 },
        {
          opacity: 1, scale: 1, duration: 1, ease: "power3.out",
          scrollTrigger: { trigger: cardRef.current, start: "top 80%" }
        }
      );

      imagesRef.current.forEach((img, i) => {
        if (img) {
          gsap.fromTo(img,
            { opacity: 0, scale: 0 },
            {
              opacity: 1, scale: 1, duration: 0.6, delay: 0.5 + i * 0.1, ease: "back.out(1.7)",
              scrollTrigger: { trigger: cardRef.current, start: "top 70%" }
            }
          );
        }
      });
    });

    return () => ctx.revert();
  }, []);

  return (
    <section className="w-full px-4 sm:px-6 md:px-8 lg:px-12 xl:px-24 py-12 sm:py-16 md:py-20 lg:py-24 relative overflow-hidden font-poppins bg-background text-foreground transition-colors duration-300">


      <div className="relative z-10 flex flex-col items-center text-center">
        <h2 ref={titleRef} className="text-2xl sm:text-3xl md:text-4xl font-bold mb-8 sm:mb-10">
          <SafeHTMLRenderer data={language === 'it' ? t.journey.title : (messageStrip?.title || t.journey.title)} fallback={t.journey.title || "Message Strip"} />
        </h2>

        <div className="absolute top-16 sm:top-20 w-60 h-60 sm:w-80 sm:h-80 md:w-[400px] md:h-[400px] lg:w-[500px] lg:h-[500px] bg-primary/20 rounded-full blur-[100px] sm:blur-[150px] pointer-events-none -z-10"></div>

        <div ref={cardRef} className="relative bg-card max-w-3xl w-full py-6 sm:py-8 md:py-10 px-6 sm:px-8 md:px-12 rounded-[20px] sm:rounded-[30px] shadow-2xl border border-gray-200 dark:border-white/20 overflow-hidden min-h-[220px] sm:min-h-[260px] md:min-h-[300px] flex flex-col justify-center">

          <div className="relative w-full h-full">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentIndex}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.6, ease: "easeInOut" }}
                className="w-full px-2 sm:px-4 md:px-9"
              >
                <EditableText
                  content={activeMessages[currentIndex]}
                  onSave={handleMessageSave}
                  tag="p"
                  className="leading-relaxed text-base md:text-[18px] font-medium"
                  placeholder="Enter message..."
                  multiline
                />
              </motion.div>
            </AnimatePresence>
          </div>

        </div>

        <div className="flex flex-wrap justify-center gap-3 sm:gap-4 mt-8 sm:mt-10">
          {activeMessages.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentIndex(idx)}
              className={`px-4 py-2 sm:px-6 sm:py-2.5 cursor-pointer rounded-full text-sm sm:text-[18px] font-semibold transition-all duration-300 border ${currentIndex === idx
                ? "bg-primary text-primary-foreground border-primary shadow-[0_0_15px_rgba(14,194,119,0.4)] scale-105"
                : "bg-primary/5 text-foreground/70 hover:bg-primary/10 hover:text-foreground border-primary/20"
                }`}
              aria-label={`Show message ${idx + 1}`}
            >
              {t.journey.messageLabel} {idx + 1}
            </button>
          ))}
        </div>
      </div>

      <div className="hidden lg:block absolute inset-0 pointer-events-none">
        <img
          ref={el => { imagesRef.current[0] = el; }}
          src="https://res.cloudinary.com/depeqzb6z/image/upload/v1764395185/user-1_ey1yc5.jpg"
          alt="Client 1"
          className="absolute left-4 xl:left-10 top-16 xl:top-20 w-20 xl:w-26 h-20 xl:h-26 rounded-full border-2 xl:border-4 border-[#33FF99] shadow-[0_0_20px_#33FF99] xl:shadow-[0_0_25px_#33FF99] object-cover"
        />
        <img
          ref={el => { imagesRef.current[1] = el; }}
          src="https://res.cloudinary.com/depeqzb6z/image/upload/v1764395182/user-2_ha7lqr.jpg"
          alt="Client 2"
          className="absolute left-2 xl:left-4 top-1/2 w-16 xl:w-20 h-16 xl:h-20 rounded-full border-2 border-[#33FF99] shadow-[0_0_20px_#33FF99] object-cover"
        />
        <img
          ref={el => { imagesRef.current[2] = el; }}
          src="https://res.cloudinary.com/depeqzb6z/image/upload/v1764395180/user-3_uccvr9.jpg"
          alt="Client 3"
          className="absolute left-24 xl:left-30 bottom-20 xl:bottom-24 w-24 xl:w-30 h-24 xl:h-30 rounded-full border-2 xl:border-4 border-[#33FF99] shadow-[0_0_20px_#33FF99] xl:shadow-[0_0_25px_#33FF99] object-cover"
        />
        <img
          ref={el => { imagesRef.current[3] = el; }}
          src="https://res.cloudinary.com/depeqzb6z/image/upload/v1764395178/user-4_eysdru.jpg"
          alt="Client 4"
          className="absolute right-4 xl:right-10 top-20 xl:top-24 w-16 xl:w-20 h-16 xl:h-20 rounded-full border-2 xl:border-4 border-[#33FF99] shadow-[0_0_20px_#33FF99] xl:shadow-[0_0_25px_#33FF99] object-cover"
        />
        <img
          ref={el => { imagesRef.current[4] = el; }}
          src="https://res.cloudinary.com/depeqzb6z/image/upload/v1766108876/15527_mlemnz.jpg"
          alt="Client 5"
          className="absolute right-20 xl:right-28 top-1/3 w-10 xl:w-12 h-10 xl:h-12 rounded-full border-2 border-[#33FF99] shadow-[0_0_20px_#33FF99] object-cover"
        />
        <img
          ref={el => { imagesRef.current[5] = el; }}
          src="https://res.cloudinary.com/depeqzb6z/image/upload/v1766108876/28382_ctckph.jpg"
          alt="Client 6"
          className="absolute right-2 xl:right-4 bottom-20 xl:bottom-24 w-20 xl:w-24 h-20 xl:h-24 rounded-full border-2 xl:border-4 border-[#33FF99] shadow-[0_0_20px_#33FF99] xl:shadow-[0_0_25px_#33FF99] object-cover"
        />
      </div>
    </section>
  );
}
