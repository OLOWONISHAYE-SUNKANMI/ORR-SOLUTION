"use client";

import Image from "next/image";
import React, { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import SafeHTMLRenderer from "@/components/SafeHTMLRenderer";
import { useTheme } from '../components/ThemeProvider';
import { useLanguage } from './LanguageProvider';

gsap.registerPlugin(ScrollTrigger);

interface BusinessSystemSectionProps {
  content?: any;
  onUpdate?: (data: any) => Promise<void>;
}

export default function BusinessSystemSection({ content, onUpdate }: BusinessSystemSectionProps) {
  const [businessSystemData, setBusinessSystemData] = useState<any>(null);
  const [businessSystemCards, setBusinessSystemCards] = useState<any[]>([]);
  const { t } = useLanguage();
  
  const sectionRef = useRef<HTMLElement>(null);

  const { effectiveTheme } = useTheme();

  useEffect(() => {
    if (content) {
      setBusinessSystemData(content);
      // If content has cards, set them
      if (content.cards) {
        setBusinessSystemCards(content.cards);
      }
    }
  }, [content]);

  const getStringValue = (value: any): string => {
    if (typeof value === 'string') return value;
    if (value && typeof value === 'object' && value.content) return value.content;
    return '';
  };

  // Default localized data
  const defaultCards = [
    {
      id: 'default-1',
      title: t.businessSystem.organs.title,
      description: t.businessSystem.organs.description,
      image: null,
      order: 1
    },
    {
      id: 'default-2',
      title: t.businessSystem.nervousSystem.title,
      description: t.businessSystem.nervousSystem.description,
      image: null,
      order: 2
    },
    {
      id: 'default-3', 
      title: t.businessSystem.circulatorySystem.title,
      description: t.businessSystem.circulatorySystem.description,
      image: null,
      order: 3
    },
    {
      id: 'default-4',
      title: t.businessSystem.immuneSystem.title, 
      description: t.businessSystem.immuneSystem.description,
      image: null,
      order: 4
    },
    {
      id: 'default-5',
      title: t.businessSystem.dna.title,
      description: t.businessSystem.dna.description,
      image: null,
      order: 5
    },
    {
      id: 'default-6',
      title: t.businessSystem.metabolism.title,
      description: t.businessSystem.metabolism.description,
      image: null,
      order: 6
    },
    {
      id: 'default-7',
      title: t.businessSystem.senses.title,
      description: t.businessSystem.senses.description,
      image: null,
      order: 7
    }
  ];

  // Use backend cards if available, otherwise use default dummy data
  const cardsToDisplay = businessSystemCards.length > 0 ? businessSystemCards : defaultCards;

  return (
    <section ref={sectionRef} className="relative w-full px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20 overflow-hidden">
      {/* Background Image */}
          <div className="absolute inset-0">     
           <Image
              key={effectiveTheme}
              src={
                effectiveTheme === "dark"
                  ? "https://res.cloudinary.com/depeqzb6z/image/upload/v1771326436/ChatGPT_Image_Feb_17_2026_03_02_41_AM_ozzzwl.png?dark"
                  : "https://res.cloudinary.com/depeqzb6z/image/upload/v1766108164/Body_gfyom3.jpg?light"
              }
              alt="Background"
              fill
              className="object-cover opacity-30"
            />
        {/* <div className="absolute inset-0 bg-slate-900/80" /> */}
      </div>
  


      {/* Animated background */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-emerald-400 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-400 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      <div className="relative z-10 text-center mb-5 sm:mb-12 lg:mb-10">
        <h2 className="text-white text-4xl font-poppins sm:text-4xl md:text-5xl lg:text-6xl font-extrabold leading-snug mb-6">
          <SafeHTMLRenderer data={businessSystemData?.title} fallback={t.businessSystem.title} />
        </h2>
        <p className="text-white font-poppins font-light text-base sm:text-lg md:text-xl lg:text-2xl mt-4 mb-8">
          <SafeHTMLRenderer data={businessSystemData?.subtitle} fallback={t.businessSystem.subtitle} />
        </p>
      </div>

      {/* Business System Cards Grid */}
      <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto items-start">
        {cardsToDisplay.map((card: any, index: number) => (
          <div key={card.id} className="group relative bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-sm rounded-3xl p-8 border border-slate-700/50 hover:border-emerald-400/50 hover:scale-105 hover:rotate-1 transition-all duration-500 cursor-pointer">
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-400/20 to-blue-400/20 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl" />
            <div className="relative z-10">
              <div className="flex items-center mb-6">
                <div className="w-3 h-3 bg-emerald-400 rounded-full mr-3 animate-pulse" />
                <h3 className="text-emerald-400 text-xl font-bold font-poppins">
                  <SafeHTMLRenderer data={card.title} fallback={`System ${index + 1}`} />
                </h3>
              </div>
              <p className="text-white/90 font-poppins font-light text-base leading-relaxed">
                <SafeHTMLRenderer data={card.description} fallback="Business system description" />
              </p>
              <div className="absolute top-4 right-4 w-8 h-8 border border-emerald-400/30 rounded-full flex items-center justify-center group-hover:rotate-180 transition-transform duration-700">
                <div className="w-2 h-2 bg-emerald-400 rounded-full" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}