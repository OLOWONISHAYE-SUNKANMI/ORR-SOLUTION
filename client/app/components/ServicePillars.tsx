'use client';

import Link from "next/link";
import React, { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { getRichTextContent } from "../../lib/rich-text-utils";
import SafeHTMLRenderer from "@/components/SafeHTMLRenderer";

import { useLanguage } from './LanguageProvider';


gsap.registerPlugin(ScrollTrigger);

interface ServicePillarProps {
  content?: any;
  onUpdate?: (id: number, data: any) => Promise<void>;
}

export default function ServicePillar({ content, onUpdate }: ServicePillarProps) {
  const { t, language, interpolate } = useLanguage();
  const [allContent, setAllContent] = useState<any>(null);
  
  const sectionRef = useRef<HTMLElement>(null);
  const titleRef = useRef<HTMLHeadingElement | null>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const lineRef = useRef<HTMLDivElement>(null);
  const bulletsRef = useRef<(HTMLDivElement | null)[]>([]);
  const itemsRef = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    if (content) {
      const convertToString = (obj: any) => {
        if (!obj) return {};
        const converted: any = {};
        Object.keys(obj).forEach(key => {
          const value = obj[key];
          if (value === null || value === undefined) {
            converted[key] = '';
          } else {
            // Use the utility to extract content safely for current language
            const text = getRichTextContent(value, language);
            converted[key] = interpolate(text || '');
          }
        });
        return converted;
      };
      
      setAllContent({
        servicesPage: convertToString(content)
      });
    }
  }, [content, language, interpolate]);

  useEffect(() => {
    const title = titleRef.current;
    if (title) {
      const spans = title.querySelectorAll('span');
      gsap.fromTo(spans,
        { opacity: 0, y: -30, rotateX: -90 },
        {
          opacity: 1, y: 0, rotateX: 0, duration: 0.8, stagger: 0.1, ease: "back.out(1.7)",
          scrollTrigger: { trigger: title, start: "top 80%", toggleActions: "play none none none" }
        }
      );
    }

    gsap.fromTo(subtitleRef.current,
      { opacity: 0, scale: 0.5 },
      {
        opacity: 1, scale: 1, duration: 0.8, delay: 0.3, ease: "back.out(1.7)",
        scrollTrigger: { trigger: subtitleRef.current, start: "top 80%", toggleActions: "play none none none" }
      }
    );

    gsap.fromTo(cardRef.current,
      { opacity: 0, x: 150, rotateY: 30 },
      {
        opacity: 1, x: 0, rotateY: 0, duration: 1.2, ease: "power4.out",
        scrollTrigger: { trigger: cardRef.current, start: "top 75%", toggleActions: "play none none none" }
      }
    );

    if (lineRef.current) {
      gsap.fromTo(lineRef.current,
        { scaleY: 0, transformOrigin: "top" },
        {
          scaleY: 1, duration: 1.5, ease: "power2.inOut",
          scrollTrigger: { trigger: lineRef.current, start: "top 80%", toggleActions: "play none none none" }
        }
      );
    }

    bulletsRef.current.forEach((bullet, i) => {
      if (bullet) {
        gsap.fromTo(bullet,
          { scale: 0, opacity: 0, rotate: 360 },
          {
            scale: 1, opacity: 1, rotate: 0, duration: 0.6, delay: 0.7 + i * 0.2, ease: "elastic.out(1, 0.5)",
            scrollTrigger: { trigger: cardRef.current, start: "top 70%", toggleActions: "play none none none" }
          }
        );
      }
    });

    itemsRef.current.forEach((item, i) => {
      if (item) {
        gsap.fromTo(item,
          { opacity: 0, x: -50, rotateZ: -5 },
          {
            opacity: 1, x: 0, rotateZ: 0, duration: 0.9, delay: 0.8 + i * 0.25, ease: "power3.out",
            scrollTrigger: { trigger: item, start: "top 85%", toggleActions: "play none none none" }
          }
        );
      }
    });


  }, []);

  return (
    <section ref={sectionRef} className="relative w-full flex flex-col items-end py-12 sm:py-16 lg:py-20 bg-cover bg-center overflow-hidden">
      <h2 ref={titleRef} className="text-white text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-poppins font-extrabold text-center mb-4 sm:mb-10 lg:mb-14 font-poppins font-bold w-full">
        <span dangerouslySetInnerHTML={{ __html: allContent?.servicesPage?.pillars_title || t.servicePillar.title }} />
      </h2>

      <p ref={subtitleRef} className="text-center text-white font-poppins font-light mb-12 sm:mb-16 lg:mb-20 w-full px-6">
        <span dangerouslySetInnerHTML={{ __html: allContent?.servicesPage?.pillars_subtitle || t.servicePillar.subtitle }} />
      </p>

      <div className="relative w-full max-w-7xl mr-0 px-2 sm:px-0">
        <div ref={cardRef} className="relative w-full bg-card backdrop-blur-md border border-[#40B25B] lg:border-t-[0.5rem] lg:border-l-[0.5rem] lg:border-b-[0.5rem] lg:border-r-0 rounded-2xl lg:rounded-tl-[91.25px] lg:rounded-bl-[91.25px] lg:rounded-tr-none lg:rounded-br-none ml-0 p-6 sm:p-8 md:p-10 lg:p-12 xl:p-16 shadow-lg">
          <div className="grid grid-cols-1 md:grid-cols-[60px_1fr] gap-6 md:gap-8">
            <div className="hidden md:flex relative flex-col items-center">
              <div ref={lineRef} className="absolute top-[32px] bottom-[52px] w-[4px] mb-20 bg-[#05CC79]"></div>

              <div ref={el => { bulletsRef.current[0] = el; }} className="relative z-10 w-8 lg:w-10 h-8 lg:h-10 bg-[#1F6F75] rounded-full flex items-center justify-center shadow-[0_0_20px_#3DFF7C] mb-10 lg:mb-12">
                <div className="w-5 lg:w-6 h-5 lg:h-6 bg-[#05CC79] rounded-full"></div>
              </div>

              <div ref={el => { bulletsRef.current[1] = el; }} className="relative z-10 w-8 lg:w-10 h-8 lg:h-10 bg-[#1F6F75] rounded-full flex items-center justify-center shadow-[0_0_20px_#3DFF7C] mt-42 lg:mb-12">
                <div className="w-5 lg:w-6 h-5 lg:h-6 bg-[#05CC79] rounded-full"></div>
              </div>

              <div ref={el => { bulletsRef.current[2] = el; }} className="relative z-10 w-8 lg:w-10 h-8 lg:h-10 bg-[#1F6F75] rounded-full flex items-center justify-center shadow-[0_0_20px_#3DFF7C] mt-36">
                <div className="w-5 lg:w-6 h-5 lg:h-6 bg-[#05CC79] rounded-full"></div>
              </div>
            </div>

            <div className="space-y-8 sm:space-y-10 lg:space-y-14">
              <div ref={el => { itemsRef.current[0] = el; }} className="relative">
                <div className="md:hidden w-6 h-6 bg-[#3DFF7C] rounded-full mb-3"></div>
                <Link href="/services/strategy-advisory-compliant" className="text-white font-semibold text-lg sm:text-xl md:text-2xl lg:text-[26px] mb-2 sm:mb-3 font-poppins hover:text-[#3DFF7C] transition-colors">
                  <span dangerouslySetInnerHTML={{ __html: allContent?.servicesPage?.pillar_1_title || t.servicePillar.pillar1.title }} />
                </Link>
                <p className="text-white/80 text-sm sm:text-base md:text-lg lg:text-[18px] leading-relaxed font-poppins">
                  <span dangerouslySetInnerHTML={{ __html: allContent?.servicesPage?.pillar_1_description || t.servicePillar.pillar1.description }} />
                </p>
                <Link href="/services/strategy-advisory-compliant">
                  <button className="mt-10 bg-gradient-to-r from-[#28B026] to-[#03F6CA] text-[#0C294D] p-4 font-poppins font-semibold  rounded-lg cursor-pointer">
                    <span dangerouslySetInnerHTML={{ __html: allContent?.servicesPage?.pillar_1_button_text || t.servicePillar.pillar1.button }} />
                  </button>
                </Link>
              </div>

              <div ref={el => { itemsRef.current[1] = el; }} className="relative">
                <div className="md:hidden w-6 h-6 bg-[#3DFF7C] rounded-full mb-3"></div>
                <h3 className="text-white font-semibold text-lg sm:text-xl md:text-2xl lg:text-[26px] mb-2 sm:mb-3 font-poppins">
                  <span dangerouslySetInnerHTML={{ __html: allContent?.servicesPage?.pillar_2_title || t.servicePillar.pillar2.title }} />
                </h3>
                <p className="text-white/80 text-sm sm:text-base md:text-lg lg:text-[18px] leading-relaxed font-poppins">
                  <span dangerouslySetInnerHTML={{ __html: allContent?.servicesPage?.pillar_2_description || t.servicePillar.pillar2.description }} />
                </p>
                <Link href="/services/operational-systems-infrastructure">
                  <button className="mt-10 bg-gradient-to-r from-[#28B026] to-[#03F6CA] text-[#0C294D] p-4 font-poppins font-semibold rounded-lg cursor-pointer">
                    <span dangerouslySetInnerHTML={{ __html: allContent?.servicesPage?.pillar_2_button_text || t.servicePillar.pillar2.button }} />
                  </button>
                </Link>
              </div>

              <div ref={el => { itemsRef.current[2] = el; }} className="relative">
                <div className="md:hidden w-6 h-6 bg-[#3DFF7C] rounded-full mb-3"></div>
                <h3 className="text-white font-semibold text-lg sm:text-xl md:text-2xl lg:text-[26px] mb-2 sm:mb-3 font-poppins">
                  <span dangerouslySetInnerHTML={{ __html: allContent?.servicesPage?.pillar_3_title || t.servicePillar.pillar3.title }} />
                </h3>
                <p className="text-white/80 text-sm sm:text-base md:text-lg lg:text-[18px] leading-relaxed font-poppins">
                  <span dangerouslySetInnerHTML={{ __html: allContent?.servicesPage?.pillar_3_description || t.servicePillar.pillar3.description }} />
                </p>
                <Link href="/services/living-systems-regeneration">
                  <button className="mt-10 bg-gradient-to-r from-[#28B026] to-[#03F6CA] text-[#0C294D] p-4 font-poppins font-semibold rounded-lg cursor-pointer">
                    <span dangerouslySetInnerHTML={{ __html: allContent?.servicesPage?.pillar_3_button_text || t.servicePillar.pillar3.button }} />
                  </button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
