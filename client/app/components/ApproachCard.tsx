'use client';

import React, { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { getRichTextContent } from "../../lib/rich-text-utils";
import SafeHTMLRenderer from "@/components/SafeHTMLRenderer";
import { useLanguage } from './LanguageProvider';


gsap.registerPlugin(ScrollTrigger);

interface ApproachSectionProps {
  content?: any;
  onUpdate?: (data: any) => Promise<void>;
}

export default function ApproachSection({ content, onUpdate }: ApproachSectionProps) {
  const approachData = content;
  const { t, language, interpolate } = useLanguage();
  
  const sectionRef = useRef(null);
  const titleRef = useRef(null);
  const cardRef = useRef(null);
  const nodesRef = useRef<(HTMLDivElement | null)[]>([]);
  const paragraphsRef = useRef<(HTMLParagraphElement | null)[]>([]);
  const linesRef = useRef<(HTMLDivElement | null)[]>([]);

  const title = getRichTextContent(approachData?.title, language) || interpolate(t.mainHero.title);
  const paragraph1 = getRichTextContent(approachData?.paragraph_1, language) || interpolate(t.approach.paragraph1);
  const paragraph2 = getRichTextContent(approachData?.paragraph_2, language) || interpolate(t.approach.paragraph2);
  const paragraph3 = getRichTextContent(approachData?.paragraph_3, language) || interpolate(t.approach.paragraph3);

  useEffect(() => {
    gsap.fromTo(titleRef.current,
      { opacity: 0, y: -50, scale: 0.8 },
      {
        opacity: 1, y: 0, scale: 1, duration: 1, ease: "back.out(1.7)",
        scrollTrigger: { trigger: titleRef.current, start: "top 80%", toggleActions: "play none none none" }
      }
    );

    gsap.fromTo(cardRef.current,
      { opacity: 0, x: -150, rotateY: -30 },
      {
        opacity: 1, x: 0, rotateY: 0, duration: 1.2, ease: "power4.out",
        scrollTrigger: { trigger: cardRef.current, start: "top 75%", toggleActions: "play none none none" }
      }
    );

    nodesRef.current.forEach((node, i) => {
      if (node) {
        gsap.fromTo(node,
          { scale: 0, opacity: 0, rotate: -180 },
          {
            scale: 1, opacity: 1, rotate: 0, duration: 0.8, delay: 0.5 + i * 0.2, ease: "elastic.out(1, 0.6)",
            scrollTrigger: { trigger: cardRef.current, start: "top 70%", toggleActions: "play none none none" }
          }
        );
      }
    });

    paragraphsRef.current.forEach((p, i) => {
      if (p) {
        gsap.fromTo(p,
          { opacity: 0, y: 20 },
          {
            opacity: 1, y: 0, duration: 0.8, delay: 0.5 + i * 0.2, ease: "power3.out",
            scrollTrigger: { trigger: p, start: "top 85%", toggleActions: "play none none none" }
          }
        );
      }
    });

    linesRef.current.forEach((line, i) => {
      if (line) {
        gsap.fromTo(line,
          { scaleX: 0 },
          {
            scaleX: 1, duration: 1, delay: 0.5 + i * 0.3, ease: "power3.inOut",
            scrollTrigger: { trigger: line, start: "top 85%", toggleActions: "play none none none" }
          }
        );
      }
    });


  }, []);

  return (
    <section ref={sectionRef} className="relative w-full flex flex-col items-start pr-4 py-12 md:py-20 bg-cover bg-center">
      <h2 ref={titleRef} className="text-white text-3xl md:text-5xl font-semibold text-center mb-10 font-poppins w-full flex justify-center py-7">
        <SafeHTMLRenderer data={approachData?.title} fallback="Supporting Copy" />
      </h2>

      <div className="relative w-full">
       

        <div ref={cardRef} className="w-full max-w-7xl ml-0 bg border-t-[2px] md:border-t-[0.5rem] border-r-[2px] md:border-r-[0.5rem] border-b-[2px] md:border-b-[0.5rem] border-l-0 border-white/20 backdrop-blur-md bg-card z-1 rounded-tr-[40px] md:rounded-tr-[91.25px] rounded-br-[40px] md:rounded-br-[91.25px] p-6 sm:p-10 md:p-14 shadow-lg space-y-7 overflow-hidden">
          <div ref={el => { nodesRef.current[0] = el; }} className="hidden md:flex absolute right-[-28px] top-[20%] w-14 h-14 bg-[#0B2E4E] rounded-full items-center justify-center shadow-[0_0_25px_#3DFF7C]">
            <div className="w-9 h-9 bg-[#3DFF7C] rounded-full" />
          </div>
          <div ref={el => { nodesRef.current[1] = el; }} className="hidden md:flex absolute right-[-28px] bottom-[20%] w-14 h-14 bg-[#0B2E4E] rounded-full items-center justify-center shadow-[0_0_25px_#3DFF7C]">
            <div className="w-9 h-9 bg-[#3DFF7C] rounded-full" />
          </div>

          <p ref={el => { paragraphsRef.current[0] = el; }} className="text-white/90 leading-relaxed text-lg md:text-[25px] font-poppins mb-10 break-words">
            <SafeHTMLRenderer data={approachData?.paragraph_1} fallback="Just like a skilled general practitioner, we start from your story not our framework. We take time to understand how your business really works before prescribing anything." />
          </p>

          <div ref={el => { linesRef.current[0] = el; }} className="w-full h-[2px] bg-[#3DFF7C] mb-10" />

          <p ref={el => { paragraphsRef.current[1] = el; }} className="text-white/90 leading-relaxed text-lg md:text-[25px] font-poppins mb-10 break-words">
            <SafeHTMLRenderer data={approachData?.paragraph_2} fallback="We're not a lone consultant — we're a central coordination layer with a distributed network behind it. When needed, we draw on specialists across continents, but you always deal with one point of contact: ORR, focused on what's best for you." />
          </p>

          <div ref={el => { linesRef.current[1] = el; }} className="w-full h-[2px] bg-[#3DFF7C] mb-10" />

          <p ref={el => { paragraphsRef.current[2] = el; }} className="text-white/90 leading-relaxed text-lg md:text-[25px] font-poppins break-words">
            <SafeHTMLRenderer data={approachData?.paragraph_3} fallback="We fix what's slowing you down, strengthen systems around how your people actually work, and when deeper input is needed, we bring it in at the right moment — always in service of your goals." />
          </p>
        </div>
      </div>
    </section>
  );
}
