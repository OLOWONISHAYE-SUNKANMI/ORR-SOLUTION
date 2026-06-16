'use client';

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import SafeHTMLRenderer from "@/components/SafeHTMLRenderer";

gsap.registerPlugin(ScrollTrigger);

import { useLanguage } from "./LanguageProvider";

gsap.registerPlugin(ScrollTrigger);

interface ORRJourneySectionProps {
  content?: any;
  onUpdate?: (data: any) => Promise<void>;
}

export default function ORRJourneySection() {
  const { t, interpolate } = useLanguage();
  const router = useRouter();
  const sectionRef = useRef<HTMLElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const stepsRef = useRef<(HTMLDivElement | null)[]>([]);
  const connectorsRef = useRef<(HTMLDivElement | null)[]>([]);

  const steps = t.journeySection.steps.map((step: any, index: number) => ({
    ...step,
    type: index === 2 ? "critical" : index === 3 ? "optional" : "mandatory"
  }));

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Header animation
      gsap.fromTo(headerRef.current,
        { opacity: 0, y: -30 },
        {
          opacity: 1, y: 0, duration: 1, ease: "power3.out",
          scrollTrigger: { trigger: headerRef.current, start: "top 85%" }
        }
      );

      // Steps animation
      stepsRef.current.forEach((step, i) => {
        if (step) {
          gsap.fromTo(step,
            { opacity: 0, y: 40 },
            {
              opacity: 1, y: 0, duration: 0.8, delay: i * 0.2, ease: "power3.out",
              scrollTrigger: { trigger: step, start: "top 90%" }
            }
          );
        }
      });

      // Connectors animation
      connectorsRef.current.forEach((connector, i) => {
        if (connector) {
          gsap.fromTo(connector,
            { scaleX: 0, opacity: 0 },
            {
              scaleX: 1, opacity: 0.3, duration: 1, delay: 0.5 + i * 0.2, ease: "power2.inOut",
              scrollTrigger: { trigger: connector, start: "top 90%" }
            }
          );
        }
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} className="w-full py-16 md:py-24 px-6 relative overflow-hidden font-poppins bg-background text-foreground transition-colors duration-300">
      {/* Global Background Integration */}
      <div className="relative z-10 max-w-7xl mx-auto">
        <div ref={headerRef} className="text-center mb-20 space-y-6">
          <h2 className="text-3xl md:text-5xl lg:text-6xl font-bold tracking-tight">
            {t.journeySection.title}
          </h2>
          <p className="opacity-70 text-lg md:text-xl max-w-2xl mx-auto font-light leading-relaxed">
            {t.journeySection.subtitle}
          </p>
        </div>

        {/* Steps Container */}
        <div className="relative grid grid-cols-1 md:grid-cols-4 gap-8 md:gap-4 lg:gap-8 items-start">
          {steps.map((step: any, index: number) => (
            <div key={index} className="relative group">
              {/* Connector (Desktop Only) */}
              {index < steps.length - 1 && (
                <div
                  ref={el => { connectorsRef.current[index] = el; }}
                  className="hidden md:block absolute top-12 left-[60%] right-[-40%] h-[1px] bg-gradient-to-r from-primary to-transparent origin-left z-0 opacity-30"
                />
              )}

              {/* Step Card */}
              <div
                ref={el => { stepsRef.current[index] = el; }}
                className={`relative z-10 p-6 md:p-8 rounded-[32px] transition-all duration-500 h-full flex flex-col border
                  ${step.type === 'critical'
                    ? 'bg-primary/10 border-primary shadow-[0_0_30px_rgba(14,194,119,0.1)] group-hover:border-primary/60'
                    : step.type === 'optional'
                      ? 'bg-card border-gray-200 dark:border-white/5 opacity-80 hover:opacity-100 group-hover:border-gray-300 dark:group-hover:border-white/10'
                      : 'bg-card border-gray-200 dark:border-white/10 group-hover:border-primary/30'}
                `}
              >
                <div className="space-y-6 flex-grow">
                  <div className="flex items-center gap-3">
                    <span className={`text-[10px] font-bold uppercase tracking-[0.2em] px-3 py-1 rounded-full 
                      ${step.type === 'critical' ? 'bg-primary text-white' : 'bg-gray-100 dark:bg-white/10 text-gray-500 dark:text-gray-400'}
                    `}>
                      {step.label}
                    </span>
                    {step.type === 'optional' && (
                      <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400 border border-gray-200 dark:border-gray-500/30 px-2 py-0.5 rounded">
                        {t.journeySection.optional}
                      </span>
                    )}
                  </div>

                  <div className="space-y-4">
                    <h3 className={`text-2xl font-bold leading-tight ${step.type === 'critical' ? 'text-primary' : ''}`}>
                      {step.title}
                    </h3>
                    <p className="opacity-70 text-sm md:text-base leading-relaxed font-light">
                      {step.description}
                    </p>
                  </div>
                </div>

                {(step as any).subtext && (
                  <div className="mt-8 pt-6 border-t border-gray-100 dark:border-white/5">
                    <p className="text-primary font-bold text-lg md:text-xl">
                      {interpolate(step.subtext, {
                        currency: t.dashboard.pricing.currency,
                        meetingPrice: t.dashboard.pricing.meetingPrice,
                        reportPrice: t.dashboard.pricing.reportPrice,
                        hrs: t.dashboard.pricing.hrs,
                        proData: t.dashboard.pricing.proData
                      })}
                    </p>
                  </div>
                )}

                {step.type === 'critical' && (
                  <div className="absolute -top-3 -right-3">
                    <div className="w-12 h-12 bg-primary/20 rounded-full blur-xl animate-pulse" />
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Closing CTA */}
        <div className="mt-24 text-center">
          <button
            onClick={() => router.push('/login')}
            className="inline-flex items-center cursor-pointer justify-center bg-primary text-white px-12 py-5 rounded-full font-bold text-lg hover:bg-lemon hover:scale-105 transition-all duration-300 shadow-xl"
          >
            {t.journeySection.cta}
          </button>
        </div>
      </div>
    </section>
  );
}
