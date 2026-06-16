'use client';

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { FileText, CheckCircle2, ArrowRight } from "lucide-react";

import { useLanguage } from "./LanguageProvider";

gsap.registerPlugin(ScrollTrigger);

interface ORRReportSectionProps {
  content?: any;
}

export default function ORRReportSection({ content }: ORRReportSectionProps) {
  const { t } = useLanguage();
  const sectionRef = useRef(null);
  const titleRef = useRef(null);
  const subtitleRef = useRef(null);
  const listItemsRef = useRef<(HTMLLIElement | null)[]>([]);
  const cardRef = useRef(null);

  const reportOutcomes = t.reportSection.outcomes;
  const whatItDoes = t.reportSection.itDoes;
  const whatYouCanDo = t.reportSection.youCanDo;

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Main title animation
      gsap.fromTo(titleRef.current,
        { opacity: 0, y: 30, filter: "blur(10px)" },
        {
          opacity: 1, y: 0, filter: "blur(0px)", duration: 1, ease: "power3.out",
          scrollTrigger: { trigger: sectionRef.current, start: "top 80%" }
        }
      );

      gsap.fromTo(subtitleRef.current,
        { opacity: 0, y: 20 },
        {
          opacity: 1, y: 0, duration: 1, delay: 0.2, ease: "power3.out",
          scrollTrigger: { trigger: sectionRef.current, start: "top 80%" }
        }
      );

      // Stagger list items
      const validListItems = listItemsRef.current.filter(Boolean);
      if (validListItems.length > 0) {
        gsap.fromTo(validListItems,
          { opacity: 0, x: -20 },
          {
            opacity: 1, x: 0, duration: 0.8, stagger: 0.1, ease: "power2.out",
            scrollTrigger: { trigger: sectionRef.current, start: "top 60%" }
          }
        );
      }

      // Glass card animation
      gsap.fromTo(cardRef.current,
        { opacity: 0, y: 40, scale: 0.95 },
        {
          opacity: 1, y: 0, scale: 1, duration: 1, delay: 0.3, ease: "back.out(1.2)",
          scrollTrigger: { trigger: cardRef.current, start: "top 85%" }
        }
      );
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} className="relative w-full bg-background text-foreground py-16 md:py-32 overflow-hidden font-poppins">
      {/* Premium Ambient Background Effects */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-10%] right-[-5%] w-[40rem] h-[40rem] bg-primary/10 dark:bg-primary/10 rounded-full blur-[120px] opacity-70"></div>
        <div className="absolute bottom-[-10%] left-[-10%] w-[30rem] h-[30rem] bg-blue-500/5 dark:bg-blue-500/10 rounded-full blur-[100px] opacity-50"></div>
      </div>

      <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-24 relative z-10">
        
        {/* Main Title Area */}
        <div className="mb-12 md:mb-20 max-w-4xl">
          <div className="flex items-center gap-4 mb-6" ref={titleRef}>
            <div className="p-3 rounded-2xl bg-primary/10 dark:bg-primary/20 text-primary shadow-sm border border-primary/10">
              <FileText size={32} className="stroke-[1.5]" />
            </div>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-semibold tracking-tight">
              {t.reportSection.title} <span className="text-primary font-bold">{t.reportSection.titleAccent}</span>
            </h2>
          </div>
          <p ref={subtitleRef} className="text-xl md:text-2xl text-foreground/70 leading-relaxed max-w-3xl ml-1 lg:ml-4">
            {t.reportSection.subtitle}
          </p>
        </div>

        <div className="grid lg:grid-cols-12 gap-16 lg:gap-24 items-start">
          
          {/* Left Column: Refined List */}
          <div className="lg:col-span-7 space-y-20">
            
            {/* The "It does" section */}
            <div className="space-y-8">
              <h3 className="text-2xl font-semibold flex items-center gap-4 text-foreground/90">
                <span className="w-10 h-px bg-primary/40 block"></span>
                {t.reportSection.theReport}
              </h3>
              <ul className="space-y-6 lg:ml-6">
                {whatItDoes.map((bullet: any, idx: number) => (
                  <li 
                    key={`does-${idx}`} 
                    ref={el => { listItemsRef.current[idx] = el; }}
                    className="flex items-start gap-5 pr-8 group"
                  >
                    <div className="mt-1 w-6 h-6 rounded-full bg-primary/10 dark:bg-primary/20 flex items-center justify-center flex-shrink-0 group-hover:bg-primary/30 group-hover:scale-110 transition-all duration-300 border border-primary/20">
                      <div className="w-2 h-2 rounded-full bg-primary"></div>
                    </div>
                    <span className="text-lg text-foreground/80 leading-relaxed font-medium group-hover:text-foreground transition-colors duration-300">
                      {bullet}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            {/* The "You can" section */}
            <div className="space-y-8">
              <h3 className="text-2xl font-semibold flex items-center gap-4 text-foreground/90">
                <span className="w-10 h-px bg-primary/40 block"></span>
                {t.reportSection.youCan}
              </h3>
              <ul className="space-y-6 lg:ml-6">
                {whatYouCanDo.map((bullet: any, idx: number) => (
                  <li 
                    key={`can-${idx}`} 
                    ref={el => { listItemsRef.current[whatItDoes.length + idx] = el; }}
                    className="flex items-start gap-5 pr-8 group"
                  >
                    <div className="mt-1 text-primary/70 group-hover:text-primary group-hover:translate-x-1 transition-all duration-300">
                      <ArrowRight size={24} className="stroke-[1.5]" />
                    </div>
                    <span className="text-lg text-foreground/80 leading-relaxed font-medium group-hover:text-foreground transition-colors duration-300">
                      {bullet}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

          </div>

          {/* Right Column: Premium Glass Card */}
          <div className="lg:col-span-5 relative mt-8 lg:mt-0">
            {/* Decorative background element behind card */}
            <div className="absolute inset-0 bg-gradient-to-tr from-primary/30 to-transparent blur-3xl rounded-[3rem] -z-10 translate-y-8 translate-x-4 opacity-60"></div>
            
            <div 
              ref={cardRef} 
              className="bg-white/70 dark:bg-gray-900/40 backdrop-blur-2xl border border-gray-200/50 dark:border-white/10 p-6 md:p-14 w-full rounded-[2rem] shadow-[0_8px_40px_rgba(0,0,0,0.06)] dark:shadow-[0_8px_40px_rgba(0,0,0,0.3)] relative overflow-hidden"
            >
              {/* Subtle inner highlight */}
              <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-white/50 dark:via-white/20 to-transparent"></div>
              
              <div className="mb-12">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-semibold tracking-wide uppercase mb-6 border border-primary/10">
                  {t.reportSection.outcomesTitle}
                </div>
                <h4 className="text-3xl font-semibold text-foreground tracking-tight">
                  {t.reportSection.outcomesSubtitle}
                </h4>
              </div>

              <div className="space-y-10">
                {reportOutcomes.map((item: any, idx: number) => (
                  <div key={idx} className="flex gap-5 group">
                    <div className="flex-shrink-0 mt-1">
                      <div className="w-12 h-12 rounded-xl bg-primary/5 dark:bg-primary/10 flex items-center justify-center group-hover:bg-primary/10 dark:group-hover:bg-primary/20 group-hover:scale-105 transition-all duration-300 border border-primary/10">
                        <CheckCircle2 size={24} className="text-primary/80 group-hover:text-primary transition-colors duration-300" />
                      </div>
                    </div>
                    <div>
                      <h5 className="text-xl font-semibold text-foreground/90 mb-2">{item.label}</h5>
                      <p className="text-base text-foreground/60 leading-relaxed">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="mt-14 pt-8 border-t border-gray-200/50 dark:border-white/10">
                <p className="text-sm text-foreground/50 font-medium flex items-center gap-3">
                  <span className="relative flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                  </span>
                  {t.reportSection.secureDelivery}
                </p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}