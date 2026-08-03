'use client';

import React, { useEffect, useRef } from 'react';
import Image from 'next/image';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useLanguage } from "@/app/components/LanguageProvider";
gsap.registerPlugin(ScrollTrigger);

export default function LegacyPolicy() {
  const { t, interpolate } = useLanguage();
  const pricingParams = {
    currency: t.dashboard.pricing.currency,
    meetingPrice: t.dashboard.pricing.meetingPrice,
    reportPrice: t.dashboard.pricing.reportPrice,
    proData: t.dashboard.pricing.proData,
  };
  const titleRef = useRef<HTMLHeadingElement>(null);
  const descRef = useRef(null);
  const cardRef = useRef(null);
  const containerRef = useRef(null);
  const progressRef = useRef(null);
  const itemsRef = useRef<(HTMLDivElement | null)[]>([]);
  const bgImageRef = useRef(null);

  useEffect(() => {
    const mm = gsap.context(() => {
      // 1. Startup Timeline (Immediate Load)
      const startupTl = gsap.timeline();

      // Scroll Progress Animation
      gsap.to(progressRef.current, {
        scaleX: 1,
        ease: "none",
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top top",
          end: "bottom bottom",
          scrub: 0.1,
        },
      });

      // Title Animation (Cookie Policy Style)
      const title = titleRef.current;
      if (title) {
        const text = title.textContent;
        title.innerHTML = text!
          .split("")
          .map(
            (char) =>
              `<span style="display:inline-block;opacity:0">${char === " " ? "&nbsp;" : char}</span>`,
          )
          .join("");

        startupTl.to(title.children, {
          opacity: 1,
          y: 0,
          duration: 0.05,
          stagger: 0.03,
          ease: "power2.out",
        });
      }

      // Description Animation
      startupTl.fromTo(
        descRef.current,
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 0.8, ease: "power3.out" },
        "-=0.4",
      );

      // Card 3D Entrance (Immediate)
      if (cardRef.current) {
        startupTl.fromTo(
          cardRef.current,
          {
            opacity: 0,
            scale: 0.95,
            rotateX: 15,
            transformPerspective: 1000,
            y: 50,
          },
          {
            opacity: 1,
            scale: 1,
            rotateX: 0,
            y: 0,
            duration: 1,
            ease: "power4.out",
          },
          "-=0.6",
        );

        // Parallax background image
        gsap.to(bgImageRef.current, {
          yPercent: 15,
          rotate: 25,
          ease: "none",
          scrollTrigger: {
            trigger: cardRef.current,
            start: "top bottom",
            end: "bottom top",
            scrub: true,
          },
        });
      }

      // Section Items Animation
      itemsRef.current.forEach((item, index) => {
        if (item) {
          const number = item.querySelector(".policy-number");
          const content = item.querySelector(".policy-content");

          if (index < 2) {
            // First two items animate with startup timeline for immediate visibility
            startupTl.fromTo(
              [number, content],
              { opacity: 0, y: 20 },
              {
                opacity: 1,
                y: 0,
                duration: 0.6,
                stagger: 0.1,
                ease: "power3.out",
              },
              "-=0.5",
            );
          } else {
            // Subsequent items use ScrollTrigger with lenient bottom threshold
            const tl = gsap.timeline({
              scrollTrigger: {
                trigger: item,
                start: "top 98%",
                toggleActions: "play none none reverse",
              },
            });

            tl.fromTo(
              number,
              { opacity: 0, scale: 0, rotate: -180 },
              {
                opacity: 1,
                scale: 1,
                rotate: 0,
                duration: 0.6,
                ease: "back.out(1.7)",
              },
            ).fromTo(
              content,
              { opacity: 0, y: 20 },
              {
                opacity: 1,
                y: 0,
                duration: 0.6,
                ease: "power3.out",
              },
              "-=0.4",
            );
          }
        }
      });
    });

    // Multiple refreshes to handle font loading and layout shifts
    const timers = [
      setTimeout(() => ScrollTrigger.refresh(), 200),
      setTimeout(() => ScrollTrigger.refresh(), 1000),
    ];

    return () => {
      mm.revert();
      timers.forEach(clearTimeout);
    };
  }, []);

  return (
    <div ref={containerRef} className="min-h-screen text-foreground bg-background star selection:bg-primary/30 transition-colors duration-300">
      {/* Scroll Progress Indicator */}
      <div className="fixed top-0 left-0 w-full h-[2px] z-50">
        <div
          ref={progressRef}
          className="h-full bg-gradient-to-r from-primary via-blue-500 to-primary origin-left scale-x-0"
        />
      </div>

      <section className="pt-32 pb-16 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h1 ref={titleRef} className="text-5xl md:text-7xl font-bold mb-8 text-foreground tracking-tight">
            {t.legalPolicy.title}
          </h1>
          <p
            ref={descRef}
            className="text-lg md:text-xl opacity-70 max-w-3xl mx-auto leading-relaxed"
          >
            {t.legalPolicy.intro}
          </p>
        </div>
      </section>

      <section className="pb-16 px-6">
        <div className="max-w-4xl mx-auto">
          <div
            ref={cardRef}
            className="bg-card p-4 relative overflow-hidden rounded-3xl shadow-2xl transition-colors duration-300"
          >
            <Image
              ref={bgImageRef}
              src="/bgSvg.svg"
              alt="background"
              width={1500}
              height={1500}
              className="absolute top-1/2 left-1/2 scale-[2.5] -translate-x-1/2 -translate-y-1/2 rotate-12 opacity-5 dark:opacity-20 pointer-events-none"
            />

            <div className="bg-card/40 backdrop-blur-md rounded-2xl p-6 md:p-10 relative border border-white/5">
              {/* Section 1: Introduction */}
              <div
                ref={(el) => {
                  itemsRef.current[0] = el;
                }}
                className="flex flex-col md:flex-row gap-8 mb-20 group"
              >
                <div className="policy-number text-7xl md:text-8xl font-black text-primary/10 group-hover:text-primary transition-colors duration-500 shrink-0 leading-none">
                  01
                </div>
                <div className="flex-1 min-w-0 policy-content">
                  <h2 className="text-3xl font-bold text-foreground mb-6 tracking-tight">
                    {t.legalPolicy.s1Title}
                  </h2>
                  <p className="opacity-80 leading-relaxed mb-3">
                    {t.legalPolicy.s1p1}
                  </p>
                  <p className="opacity-80 leading-relaxed mb-3">
                    {t.legalPolicy.s1p2}
                  </p>
                  <p className="opacity-80 leading-relaxed font-bold text-primary">
                    {t.legalPolicy.s1p3}
                  </p>
                </div>
              </div>
              {/* Section 2: Definitions */}
              <div
                ref={(el) => {
                  itemsRef.current[1] = el;
                }}
                className="flex flex-col md:flex-row gap-8 mb-20 group"
              >
                <div className="policy-number text-7xl md:text-8xl font-black text-primary/10 group-hover:text-primary transition-colors duration-500 shrink-0 leading-none">
                  02
                </div>
                <div className="flex-1 min-w-0 policy-content">
                  <h2 className="text-3xl font-bold text-foreground mb-6 tracking-tight">
                    {t.legalPolicy.s2Title}
                  </h2>
                  <ul className="space-y-2 opacity-80 leading-relaxed">
                    <li>
                      {t.legalPolicy.s2li1}
                    </li>
                    <li>
                      {t.legalPolicy.s2li2}
                    </li>
                    <li>
                      {t.legalPolicy.s2li3}
                    </li>
                    <li>
                      {t.legalPolicy.s2li4}
                    </li>
                    <li>
                      {t.legalPolicy.s2li5}
                    </li>
                    <li>
                      {t.legalPolicy.s2li6}
                    </li>
                    <li>
                      {t.legalPolicy.s2li7}
                    </li>
                    <li>
                      {t.legalPolicy.s2li8}
                    </li>
                    <li>
                      {t.legalPolicy.s2li9}
                    </li>
                    <li>
                      {t.legalPolicy.s2li10}
                    </li>
                    <li>
                      {t.legalPolicy.s2li11}
                    </li>
                  </ul>
                </div>
              </div>

              {/* Section 3: Eligibility */}
              <div
                ref={(el) => {
                  itemsRef.current[2] = el;
                }}
                className="flex flex-col md:flex-row gap-8 mb-20 group"
              >
                <div className="policy-number text-7xl md:text-8xl font-black text-primary/10 group-hover:text-primary transition-colors duration-500 shrink-0 leading-none">
                  03
                </div>
                <div className="flex-1 min-w-0 policy-content">
                  <h2 className="text-3xl font-bold text-foreground mb-6 tracking-tight">
                    {t.legalPolicy.s3Title}
                  </h2>
                  <p className="opacity-80 leading-relaxed mb-3">
                    {t.legalPolicy.s3p1}
                  </p>
                  <ul className="list-disc ml-6 opacity-80 leading-relaxed space-y-1 mb-3">
                    <li>{t.legalPolicy.s3li1}</li>
                    <li>{t.legalPolicy.s3li2}</li>
                    <li>{t.legalPolicy.s3li3}</li>
                    <li>{t.legalPolicy.s3li4}</li>
                  </ul>
                  <p className="opacity-80 leading-relaxed mb-3">
                    {t.legalPolicy.s3p2}
                  </p>
                  <p className="opacity-80 leading-relaxed">
                    {t.legalPolicy.s3p3}
                  </p>
                </div>
              </div>

              {/* Section 4: Account Creation */}
              <div
                ref={(el) => {
                  itemsRef.current[3] = el;
                }}
                className="flex flex-col md:flex-row gap-8 mb-20 group"
              >
                <div className="policy-number text-7xl md:text-8xl font-black text-primary/10 group-hover:text-primary transition-colors duration-500 shrink-0 leading-none">
                  04
                </div>
                <div className="flex-1 min-w-0 policy-content">
                  <h2 className="text-3xl font-bold text-foreground mb-6 tracking-tight">
                    {t.legalPolicy.s4Title}
                  </h2>
                  <p className="opacity-80 leading-relaxed mb-3">
                    {t.legalPolicy.s4p1}
                  </p>
                  <ul className="list-disc ml-6 opacity-80 leading-relaxed space-y-1 mb-3">
                    <li>{t.legalPolicy.s4li1}</li>
                    <li>{t.legalPolicy.s4li2}</li>
                    <li>{t.legalPolicy.s4li3}</li>
                    <li>{t.legalPolicy.s4li4}</li>
                  </ul>
                  <p className="opacity-80 leading-relaxed">
                    {t.legalPolicy.s4p2}
                  </p>
                </div>
              </div>

              {/* Section 5: Description of Services */}
              <div
                ref={(el) => {
                  itemsRef.current[4] = el;
                }}
                className="flex flex-col md:flex-row gap-8 mb-20 group"
              >
                <div className="policy-number text-7xl md:text-8xl font-black text-primary/10 group-hover:text-primary transition-colors duration-500 shrink-0 leading-none">
                  05
                </div>
                <div className="flex-1 min-w-0 policy-content">
                  <h2 className="text-3xl font-bold text-foreground mb-6 tracking-tight">
                    {t.legalPolicy.s5Title}
                  </h2>

                  <h3 className="text-xl font-semibold text-foreground mb-3">
                    {t.legalPolicy.s51Title}
                  </h3>
                  <p className="opacity-80 leading-relaxed mb-4">
                    {t.legalPolicy.s51p1}
                  </p>

                  <h3 className="text-xl font-semibold text-foreground mb-3">
                    {t.legalPolicy.s52Title}
                  </h3>
                  <p className="opacity-80 leading-relaxed mb-2">
                    {t.legalPolicy.s52p1}
                  </p>
                  <ul className="list-disc ml-6 opacity-80 leading-relaxed space-y-1 mb-3">
                    <li>{t.legalPolicy.s52li1}</li>
                    <li>{t.legalPolicy.s52li2}</li>
                    <li>{t.legalPolicy.s52li3}</li>
                    <li>{t.legalPolicy.s52li4}</li>
                    <li>{t.legalPolicy.s52li5}</li>
                    <li>{t.legalPolicy.s52li6}</li>
                    <li>{t.legalPolicy.s52li7}</li>
                    <li>{t.legalPolicy.s52li8}</li>
                  </ul>
                  <p className="opacity-80 leading-relaxed mb-4">
                    {t.legalPolicy.s52p2}
                  </p>

                  <h3 className="text-xl font-semibold text-foreground mb-3">
                    {t.legalPolicy.s53Title}
                  </h3>
                  <p className="opacity-80 leading-relaxed mb-2">
                    {t.legalPolicy.s53p1}
                  </p>
                  <ul className="list-disc ml-6 opacity-80 leading-relaxed space-y-1 mb-4">
                    <li>{t.legalPolicy.s53li1}</li>
                    <li>{t.legalPolicy.s53li2}</li>
                    <li>{t.legalPolicy.s53li3}</li>
                    <li>{t.legalPolicy.s53li4}</li>
                    <li>{t.legalPolicy.s53li5}</li>
                    <li>{t.legalPolicy.s53li6}</li>
                    <li>{t.legalPolicy.s53li7}</li>
                    <li>{t.legalPolicy.s53li8}</li>
                    <li>{t.legalPolicy.s53li9}</li>
                  </ul>
                  <p className="opacity-80 leading-relaxed mb-4">
                    {t.legalPolicy.s53p2}
                  </p>

                  <h3 className="text-xl font-semibold text-foreground mb-3">
                    {t.legalPolicy.s54Title}
                  </h3>
                  <p className="opacity-80 leading-relaxed mb-2">
                    {t.legalPolicy.s54p1}
                  </p>
                  <ul className="list-disc ml-6 opacity-80 leading-relaxed space-y-1 mb-3">
                    <li>{t.legalPolicy.s54li1}</li>
                    <li>{t.legalPolicy.s54li2}</li>
                    <li>{t.legalPolicy.s54li3}</li>
                    <li>{t.legalPolicy.s54li4}</li>
                  </ul>
                  <p className="opacity-80 leading-relaxed mb-4">
                    {t.legalPolicy.s54p2}
                  </p>

                  <h3 className="text-xl font-semibold text-foreground mb-3">
                    {t.legalPolicy.s55Title}
                  </h3>
                  <p className="opacity-80 leading-relaxed mb-2">
                    {t.legalPolicy.s55p1}
                  </p>
                  <ul className="list-disc ml-6 opacity-80 leading-relaxed space-y-1 mb-3">
                    <li>{t.legalPolicy.s55li1}</li>
                    <li>{t.legalPolicy.s55li2}</li>
                    <li>{t.legalPolicy.s55li3}</li>
                  </ul>
                  <p className="opacity-80 leading-relaxed mb-4">
                    {t.legalPolicy.s55p2}
                  </p>

                  <h3 className="text-xl font-semibold text-foreground mb-3">
                    {t.legalPolicy.s56Title}
                  </h3>

                  <h4 className="text-lg font-semibold text-foreground mb-2 mt-4">
                    {t.legalPolicy.s561Title}
                  </h4>
                  <p className="opacity-80 leading-relaxed mb-4">
                    {t.legalPolicy.s561p1}
                  </p>

                  <h4 className="text-lg font-semibold text-foreground mb-2">
                    {t.legalPolicy.s562Title}
                  </h4>
                  <p className="opacity-80 leading-relaxed mb-2">
                    {t.legalPolicy.s562p1}
                  </p>
                  <ul className="list-disc ml-6 opacity-80 leading-relaxed space-y-1 mb-3">
                    <li>{t.legalPolicy.s562li1}</li>
                    <li>{t.legalPolicy.s562li2}</li>
                    <li>{t.legalPolicy.s562li3}</li>
                    <li>{t.legalPolicy.s562li4}</li>
                    <li>{t.legalPolicy.s562li5}</li>
                    <li>{t.legalPolicy.s562li6}</li>
                  </ul>
                  <p className="opacity-80 leading-relaxed mb-4">
                    {t.legalPolicy.s562p2}
                  </p>

                  <h4 className="text-lg font-semibold text-foreground mb-2">
                    {t.legalPolicy.s563Title}
                  </h4>
                  <p className="opacity-80 leading-relaxed mb-2">
                    {t.legalPolicy.s563p1}
                  </p>
                  <ul className="list-disc ml-6 opacity-80 leading-relaxed space-y-1 mb-3">
                    <li>{t.legalPolicy.s563li1}</li>
                    <li>{t.legalPolicy.s563li2}</li>
                    <li>{t.legalPolicy.s563li3}</li>
                    <li>{t.legalPolicy.s563li4}</li>
                    <li>{t.legalPolicy.s563li5}</li>
                  </ul>
                  <p className="opacity-80 leading-relaxed mb-4">
                    {t.legalPolicy.s563p2}
                  </p>

                  <h4 className="text-lg font-semibold text-foreground mb-2">
                    {t.legalPolicy.s564Title}
                  </h4>
                  <p className="opacity-80 leading-relaxed mb-2">
                    {t.legalPolicy.s564p1}
                  </p>
                  <ul className="list-disc ml-6 opacity-80 leading-relaxed space-y-1 mb-3">
                    <li>{t.legalPolicy.s564li1}</li>
                    <li>{t.legalPolicy.s564li2}</li>
                    <li>{t.legalPolicy.s564li3}</li>
                    <li>{t.legalPolicy.s564li4}</li>
                    <li>{t.legalPolicy.s564li5}</li>
                  </ul>
                  <p className="opacity-80 leading-relaxed mb-4">
                    {t.legalPolicy.s564p2}
                  </p>

                  <h4 className="text-lg font-semibold text-foreground mb-2">
                    {t.legalPolicy.s565Title}
                  </h4>
                  <p className="opacity-80 leading-relaxed mb-2">
                    {t.legalPolicy.s565p1}
                  </p>
                  <ul className="list-disc ml-6 opacity-80 leading-relaxed space-y-1 mb-3">
                    <li>{t.legalPolicy.s565li1}</li>
                    <li>{t.legalPolicy.s565li2}</li>
                    <li>{t.legalPolicy.s565li3}</li>
                    <li>{t.legalPolicy.s565li4}</li>
                    <li>{t.legalPolicy.s565li5}</li>
                    <li>{t.legalPolicy.s565li6}</li>
                  </ul>
                  <p className="opacity-80 leading-relaxed mb-4">
                    {t.legalPolicy.s565p2}
                  </p>

                  <h4 className="text-lg font-semibold text-foreground mb-2">
                    {t.legalPolicy.s566Title}
                  </h4>
                  <p className="opacity-80 leading-relaxed mb-2">
                    {t.legalPolicy.s566p1}
                  </p>
                  <ul className="list-disc ml-6 opacity-80 leading-relaxed space-y-1 mb-3">
                    <li>{t.legalPolicy.s566li1}</li>
                    <li>{t.legalPolicy.s566li2}</li>
                    <li>{t.legalPolicy.s566li3}</li>
                    <li>{t.legalPolicy.s566li4}</li>
                  </ul>
                  <p className="opacity-80 leading-relaxed mb-4">
                    {t.legalPolicy.s566p2}
                  </p>

                  <h4 className="text-lg font-semibold text-foreground mb-2">
                    {t.legalPolicy.s567Title}
                  </h4>
                  <p className="opacity-80 leading-relaxed mb-2">
                    {t.legalPolicy.s567p1}
                  </p>
                  <ul className="list-disc ml-6 opacity-80 leading-relaxed space-y-1 mb-3">
                    <li>{t.legalPolicy.s567li1}</li>
                    <li>{t.legalPolicy.s567li2}</li>
                    <li>{t.legalPolicy.s567li3}</li>
                    <li>{t.legalPolicy.s567li4}</li>
                    <li>{t.legalPolicy.s567li5}</li>
                  </ul>
                  <p className="opacity-80 leading-relaxed mb-4">
                    {t.legalPolicy.s567p2}
                  </p>

                  <h4 className="text-lg font-semibold text-foreground mb-2">
                    {t.legalPolicy.s568Title}
                  </h4>
                  <p className="opacity-80 leading-relaxed mb-2">
                    {t.legalPolicy.s568p1}
                  </p>
                  <ul className="list-disc ml-6 opacity-80 leading-relaxed space-y-1 mb-4">
                    <li>{t.legalPolicy.s568li1}</li>
                    <li>{t.legalPolicy.s568li2}</li>
                    <li>{t.legalPolicy.s568li3}</li>
                    <li>{t.legalPolicy.s568li4}</li>
                    <li>{t.legalPolicy.s568li5}</li>
                  </ul>

                  <h4 className="text-lg font-semibold text-foreground mb-2 mt-4">
                    {t.legalPolicy.s569Title}
                  </h4>
                  <p className="opacity-80 leading-relaxed mb-2">
                    {t.legalPolicy.s569p1}
                  </p>
                  <ul className="list-disc ml-6 opacity-80 leading-relaxed space-y-1 mb-3">
                    <li>{t.legalPolicy.s569li1}</li>
                    <li>{t.legalPolicy.s569li2}</li>
                    <li>{t.legalPolicy.s569li3}</li>
                    <li>{t.legalPolicy.s569li4}</li>
                    <li>{t.legalPolicy.s569li5}</li>
                  </ul>
                  <p className="opacity-80 leading-relaxed mb-4">
                    {t.legalPolicy.s569p2}
                  </p>

                  <h4 className="text-lg font-semibold text-foreground mb-2">
                    {t.legalPolicy.s5610Title}
                  </h4>
                  <p className="opacity-80 leading-relaxed mb-3">
                    {t.legalPolicy.s5610p1}
                  </p>

                  <h4 className="text-lg font-semibold text-foreground mb-2">
                    {t.legalPolicy.s5611Title}
                  </h4>
                  <p className="opacity-80 leading-relaxed mb-4">
                    {t.legalPolicy.s5611p1}
                  </p>

                  <h3 className="text-xl font-semibold text-foreground mb-3">
                    {t.legalPolicy.s57Title}
                  </h3>
                  <p className="opacity-80 leading-relaxed mb-2">
                    {t.legalPolicy.s57p1}
                  </p>
                  <ul className="list-disc ml-6 opacity-80 leading-relaxed space-y-1 mb-3">
                    <li>{t.legalPolicy.s57li1}</li>
                    <li>{t.legalPolicy.s57li2}</li>
                    <li>{t.legalPolicy.s57li3}</li>
                    <li>{t.legalPolicy.s57li4}</li>
                    <li>{t.legalPolicy.s57li5}</li>
                    <li>{t.legalPolicy.s57li6}</li>
                  </ul>
                  <p className="opacity-80 leading-relaxed">
                    {t.legalPolicy.s57p2}
                  </p>
                </div>
              </div>

              {/* Section 6: Payment Terms */}
              <div
                ref={(el) => {
                  itemsRef.current[5] = el;
                }}
                className="flex flex-col md:flex-row gap-8 mb-20 group"
              >
                <div className="policy-number text-7xl md:text-8xl font-black text-primary/10 group-hover:text-primary transition-colors duration-500 shrink-0 leading-none">
                  06
                </div>
                <div className="flex-1 min-w-0 policy-content">
                  <h2 className="text-3xl font-bold text-foreground mb-6 tracking-tight">
                    {t.legalPolicy.s6Title}
                  </h2>
                  <p className="opacity-80 leading-relaxed mb-3">
                    {t.legalPolicy.s6p1}
                  </p>
                  <p className="opacity-80 leading-relaxed mb-2">
                    {t.legalPolicy.s6p2}
                  </p>
                  <ul className="list-disc ml-6 opacity-80 leading-relaxed space-y-1 mb-4">
                    <li>{t.legalPolicy.s6li1}</li>
                    <li>{t.legalPolicy.s6li2}</li>
                  </ul>
                  <p className="opacity-80 leading-relaxed mb-4">
                    {t.legalPolicy.s6p3}
                  </p>

                  <h3 className="text-xl font-semibold text-foreground mb-3">
                    {t.legalPolicy.s61Title}
                  </h3>
                  <p className="opacity-80 leading-relaxed mb-2">
                    {t.legalPolicy.s61p1}
                  </p>
                  <ul className="list-disc ml-6 opacity-80 leading-relaxed space-y-1 mb-3">
                    <li>{t.legalPolicy.s61li1}</li>
                    <li>{t.legalPolicy.s61li2}</li>
                    <li>{t.legalPolicy.s61li3}</li>
                    <li>{t.legalPolicy.s61li4}</li>
                  </ul>
                  <p className="opacity-80 leading-relaxed mb-4">
                    {t.legalPolicy.s61p2}
                  </p>

                  <h3 className="text-xl font-semibold text-foreground mb-3">
                    {t.legalPolicy.s62Title}
                  </h3>
                  <p className="opacity-80 leading-relaxed mb-3">
                    {interpolate(t.legalPolicy.s62p1, pricingParams)}
                  </p>

                  <h3 className="text-xl font-semibold text-foreground mb-3">
                    {t.legalPolicy.s63Title}
                  </h3>
                  <p className="opacity-80 leading-relaxed mb-2">
                    {t.legalPolicy.s63p1}
                  </p>
                  <ul className="list-disc ml-6 opacity-80 leading-relaxed space-y-1 mb-4">
                    <li>{t.legalPolicy.s63li1}</li>
                    <li>{t.legalPolicy.s63li2}</li>
                    <li>{t.legalPolicy.s63li3}</li>
                  </ul>

                  <h3 className="text-xl font-semibold text-foreground mb-3">
                    {t.legalPolicy.s64Title}
                  </h3>
                  <p className="opacity-80 leading-relaxed mb-2">
                    {t.legalPolicy.s64p1}
                  </p>
                  <ul className="list-disc ml-6 opacity-80 leading-relaxed space-y-1 mb-3">
                    <li>{t.legalPolicy.s64li1}</li>
                    <li>{t.legalPolicy.s64li2}</li>
                    <li>{t.legalPolicy.s64li3}</li>
                    <li>{t.legalPolicy.s64li4}</li>
                  </ul>
                  <p className="opacity-80 leading-relaxed mb-4 font-semibold">
                    BUT it will not show subscription prices.
                  </p>

                  <h3 className="text-xl font-semibold text-foreground mb-3">
                    {t.legalPolicy.s65Title}
                  </h3>
                  <p className="opacity-80 leading-relaxed">
                    {t.legalPolicy.s65p1}
                  </p>
                </div>
              </div>

              {/* Section 7: User Responsibilities */}
              <div
                ref={(el) => {
                  itemsRef.current[6] = el;
                }}
                className="flex flex-col md:flex-row gap-8 mb-20 group"
              >
                <div className="policy-number text-7xl md:text-8xl font-black text-primary/10 group-hover:text-primary transition-colors duration-500 shrink-0 leading-none">
                  07
                </div>
                <div className="flex-1 min-w-0 policy-content">
                  <h2 className="text-3xl font-bold text-foreground mb-6 tracking-tight">
                    {t.legalPolicy.s7Title}
                  </h2>
                  <p className="opacity-80 leading-relaxed mb-3">
                    {t.legalPolicy.s7p1}
                  </p>
                  <ul className="list-disc ml-6 opacity-80 leading-relaxed space-y-1 mb-3">
                    <li>{t.legalPolicy.s7li1}</li>
                    <li>{t.legalPolicy.s7li2}</li>
                    <li>{t.legalPolicy.s7li3}</li>
                    <li>{t.legalPolicy.s7li4}</li>
                    <li>{t.legalPolicy.s7li5}</li>
                    <li>{t.legalPolicy.s7li6}</li>
                    <li>{t.legalPolicy.s7li7}</li>
                    <li>{t.legalPolicy.s7li8}</li>
                    <li>{t.legalPolicy.s7li9}</li>
                  </ul>
                  <p className="opacity-80 leading-relaxed">
                    {t.legalPolicy.s7p2}
                  </p>
                </div>
              </div>

              {/* Section 8: ORR Responsibilities */}
              <div
                ref={(el) => {
                  itemsRef.current[7] = el;
                }}
                className="flex flex-col md:flex-row gap-8 mb-20 group"
              >
                <div className="policy-number text-7xl md:text-8xl font-black text-primary/10 group-hover:text-primary transition-colors duration-500 shrink-0 leading-none">
                  08
                </div>
                <div className="flex-1 min-w-0 policy-content">
                  <h2 className="text-3xl font-bold text-foreground mb-6 tracking-tight">
                    {t.legalPolicy.s8Title}
                  </h2>
                  <p className="opacity-80 leading-relaxed mb-3">
                    {t.legalPolicy.s8p1}
                  </p>
                  <ul className="list-disc ml-6 opacity-80 leading-relaxed space-y-1">
                    <li>{t.legalPolicy.s8li1}</li>
                    <li>{t.legalPolicy.s8li2}</li>
                    <li>{t.legalPolicy.s8li3}</li>
                    <li>{t.legalPolicy.s8li4}</li>
                    <li>{t.legalPolicy.s8li5}</li>
                    <li>{t.legalPolicy.s8li6}</li>
                    <li>{t.legalPolicy.s8li7}</li>
                  </ul>
                </div>
              </div>

              {/* Section 9: Workspace & DS Module Conditions */}
              <div
                ref={(el) => {
                  itemsRef.current[8] = el;
                }}
                className="flex flex-col md:flex-row gap-8 mb-20 group"
              >
                <div className="policy-number text-7xl md:text-8xl font-black text-primary/10 group-hover:text-primary transition-colors duration-500 shrink-0 leading-none">
                  09
                </div>
                <div className="flex-1 min-w-0 policy-content">
                  <h2 className="text-3xl font-bold text-foreground mb-6 tracking-tight">
                    {t.legalPolicy.s9Title}
                  </h2>

                  <h3 className="text-xl font-semibold text-foreground mb-3">
                    {t.legalPolicy.s91Title}
                  </h3>
                  <p className="opacity-80 leading-relaxed mb-2">
                    {t.legalPolicy.s91p1}
                  </p>
                  <ul className="list-disc ml-6 opacity-80 leading-relaxed space-y-1 mb-4">
                    <li>{t.legalPolicy.s91li1}</li>
                    <li>{t.legalPolicy.s91li2}</li>
                    <li>{t.legalPolicy.s91li3}</li>
                  </ul>

                  <h3 className="text-xl font-semibold text-foreground mb-3">
                    {t.legalPolicy.s92Title}
                  </h3>
                  <p className="opacity-80 leading-relaxed mb-2">
                    {t.legalPolicy.s92p1}
                  </p>
                  <ul className="list-disc ml-6 opacity-80 leading-relaxed space-y-1 mb-4">
                    <li>{t.legalPolicy.s92li1}</li>
                    <li>{t.legalPolicy.s92li2}</li>
                    <li>{t.legalPolicy.s92li3}</li>
                  </ul>

                  <h3 className="text-xl font-semibold text-foreground mb-3">
                    {t.legalPolicy.s93Title}
                  </h3>
                  <p className="opacity-80 leading-relaxed mb-2">
                    {t.legalPolicy.s93p1}
                  </p>

                </div>
              </div>

              {/* Section 9:  CONSULTATION TERMS */}
              <div
                ref={(el) => {
                  itemsRef.current[9] = el;
                }}
                className="flex flex-col md:flex-row gap-8 mb-20 group"
              >
                <div className="policy-number text-7xl md:text-8xl font-black text-primary/10 group-hover:text-primary transition-colors duration-500 shrink-0 leading-none">
                  10
                </div>
                <div className="flex-1 min-w-0 policy-content">
                  <h2 className="text-3xl font-bold text-foreground mb-6 tracking-tight">
                    {t.legalPolicy.s10Title}
                  </h2>

                  <h3 className="text-xl font-semibold text-foreground mb-3">
                    {t.legalPolicy.s101Title}
                  </h3>
                  <p className="opacity-80 leading-relaxed mb-2">
                    {t.legalPolicy.s101p1}
                  </p>

                  <h3 className="text-xl font-semibold text-foreground mb-3">
                    {t.legalPolicy.s102Title}
                  </h3>
                  <p className="opacity-80 leading-relaxed mb-2">
                    {t.legalPolicy.s102p1}
                  </p>

                  <h3 className="text-xl font-semibold text-foreground mb-3">
                    {t.legalPolicy.s103Title}
                  </h3>
                  <p className="opacity-80 leading-relaxed mb-2">
                    {t.legalPolicy.s103p1}
                  </p>

                  <h3 className="text-xl font-semibold text-foreground mb-3">
                    {t.legalPolicy.s104Title}
                  </h3>
                  <p className="opacity-80 leading-relaxed mb-2">
                    {t.legalPolicy.s104p1}
                  </p>
                </div>

              </div>

              {/* Section 11:  INTELLECTUAL PROPERTY */}
              <div
                ref={(el) => {
                  itemsRef.current[10] = el;
                }}
                className="flex flex-col md:flex-row gap-8 mb-20 group"
              >
                <div className="policy-number text-7xl md:text-8xl font-black text-primary/10 group-hover:text-primary transition-colors duration-500 shrink-0 leading-none">
                  11
                </div>
                <div className="flex-1 min-w-0 policy-content">
                  <h2 className="text-3xl font-bold text-foreground mb-6 tracking-tight">
                    {t.legalPolicy.s11Title}
                  </h2>

                  <h3 className="text-xl font-semibold text-foreground mb-3">
                    {t.legalPolicy.s111Title}
                  </h3>
                  <p className="opacity-80 leading-relaxed mb-2">
                    {t.legalPolicy.s111p1}
                  </p>

                  <h3 className="text-xl font-semibold text-foreground mb-3">
                    {t.legalPolicy.s112Title}
                  </h3>
                  <p className="opacity-80 leading-relaxed mb-2">
                    {t.legalPolicy.s112p1}
                  </p>

                  <h3 className="text-xl font-semibold text-foreground mb-3">
                    {t.legalPolicy.s113Title}
                  </h3>
                  <p className="opacity-80 leading-relaxed mb-2">
                    {t.legalPolicy.s113p1}
                  </p>
                  <ul className="list-disc ml-6 opacity-80 leading-relaxed space-y-1 mb-4">
                    <li>{t.legalPolicy.s113li1}</li>
                    <li>{t.legalPolicy.s113li2}</li>
                    <li>{t.legalPolicy.s113li3}</li>
                    <li>{t.legalPolicy.s113li4}</li>
                  </ul>

                  <p className="opacity-80 leading-relaxed mb-2">
                    {t.legalPolicy.s113p2}
                  </p>

                </div>
              </div>


              {/* Section 12:  DOCUMENT VAULT */}
              <div
                ref={(el) => {
                  itemsRef.current[11] = el;
                }}
                className="flex flex-col md:flex-row gap-8 mb-20 group"
              >
                <div className="policy-number text-7xl md:text-8xl font-black text-primary/10 group-hover:text-primary transition-colors duration-500 shrink-0 leading-none">
                  12
                </div>
                <div className="flex-1 min-w-0 policy-content">
                  <h2 className="text-3xl font-bold text-foreground mb-6 tracking-tight">
                    {t.legalPolicy.s12Title}
                  </h2>

                  <h3 className="text-xl font-semibold text-foreground mb-3">
                    {t.legalPolicy.s121Title}
                  </h3>

                  <ul className="list-disc ml-6 opacity-80 leading-relaxed space-y-1 mb-4">
                    <li>{t.legalPolicy.s121li1}</li>
                    <li>{t.legalPolicy.s121li2}</li>
                    <li>{t.legalPolicy.s121li3}</li>
                    <li>{t.legalPolicy.s121li4}</li>
                  </ul>

                  <p className="opacity-80 leading-relaxed mb-2">
                    {t.legalPolicy.s12p1}
                  </p>

                </div>
              </div>


              {/* Section 13:  TERMINATION */}
              <div
                ref={(el) => {
                  itemsRef.current[12] = el;
                }}
                className="flex flex-col md:flex-row gap-8 mb-20 group"
              >
                <div className="policy-number text-7xl md:text-8xl font-black text-primary/10 group-hover:text-primary transition-colors duration-500 shrink-0 leading-none">
                  13
                </div>
                <div className="flex-1 min-w-0 policy-content">
                  <h2 className="text-3xl font-bold text-foreground mb-6 tracking-tight">
                    {t.legalPolicy.s13Title}
                  </h2>

                  <h3 className="text-xl font-semibold text-foreground mb-3">
                    {t.legalPolicy.s131Title}
                  </h3>

                  <ul className="list-disc ml-6 opacity-80 leading-relaxed space-y-1 mb-4">
                    <li>{t.legalPolicy.s131li1}</li>
                    <li>{t.legalPolicy.s131li2}</li>
                    <li>{t.legalPolicy.s131li3}</li>
                    <li>{t.legalPolicy.s131li4}</li>
                  </ul>

                  <p className="opacity-80 leading-relaxed mb-2">
                    {t.legalPolicy.s13p1}
                  </p>

                </div>
              </div>

              {/* Section 14:  LIMITATION OF LIABILITY */}
              <div
                ref={(el) => {
                  itemsRef.current[13] = el;
                }}
                className="flex flex-col md:flex-row gap-8 mb-20 group"
              >
                <div className="policy-number text-7xl md:text-8xl font-black text-primary/10 group-hover:text-primary transition-colors duration-500 shrink-0 leading-none">
                  14
                </div>
                <div className="flex-1 min-w-0 policy-content">
                  <h2 className="text-3xl font-bold text-foreground mb-6 tracking-tight">
                    {t.legalPolicy.s14Title}
                  </h2>

                  <h3 className="text-xl font-semibold text-foreground mb-3">
                    {t.legalPolicy.s141Title}
                  </h3>

                  <ul className="list-disc ml-6 opacity-80 leading-relaxed space-y-1 mb-4">
                    <li>{t.legalPolicy.s141li1}</li>
                    <li>{t.legalPolicy.s141li2}</li>
                    <li>{t.legalPolicy.s141li3}</li>
                  </ul>

                  <p className="opacity-80 leading-relaxed mb-2">
                    {t.legalPolicy.s14p1}
                  </p>

                </div>
              </div>

              {/* Section 15:  DATA PROTECTION */}
              <div
                ref={(el) => {
                  itemsRef.current[14] = el;
                }}
                className="flex flex-col md:flex-row gap-8 mb-20 group"
              >
                <div className="policy-number text-7xl md:text-8xl font-black text-primary/10 group-hover:text-primary transition-colors duration-500 shrink-0 leading-none">
                  15
                </div>
                <div className="flex-1 min-w-0 policy-content">
                  <h2 className="text-3xl font-bold text-foreground mb-6 tracking-tight">
                    {t.legalPolicy.s15Title}
                  </h2>

                  <p className="opacity-80 leading-relaxed mb-2">
                    {t.legalPolicy.s15p1}
                  </p>
                  <p className="opacity-80 leading-relaxed mb-2">
                    {t.legalPolicy.s15p2}
                  </p>

                </div>
              </div>

              {/* Section 16:  GOVERNING LAW & JURISDICTION */}
              <div
                ref={(el) => {
                  itemsRef.current[15] = el;
                }}
                className="flex flex-col md:flex-row gap-8 mb-20 group"
              >
                <div className="policy-number text-7xl md:text-8xl font-black text-primary/10 group-hover:text-primary transition-colors duration-500 shrink-0 leading-none">
                  16
                </div>
                <div className="flex-1 min-w-0 policy-content">
                  <h2 className="text-3xl font-bold text-foreground mb-6 tracking-tight">
                    {t.legalPolicy.s16Title}
                  </h2>

                  <p className="opacity-80 leading-relaxed mb-2">
                    {t.legalPolicy.s16p1}
                  </p>
                  <p className="opacity-80 leading-relaxed mb-2">
                    {t.legalPolicy.s16p2}
                  </p>

                </div>
              </div>

              {/* Section 17:  CHANGES TO THESE TERMS */}
              <div
                ref={(el) => {
                  itemsRef.current[16] = el;
                }}
                className="flex flex-col md:flex-row gap-8 mb-20 group"
              >
                <div className="policy-number text-7xl md:text-8xl font-black text-primary/10 group-hover:text-primary transition-colors duration-500 shrink-0 leading-none">
                  17
                </div>
                <div className="flex-1 min-w-0 policy-content">
                  <h2 className="text-3xl font-bold text-foreground mb-6 tracking-tight">
                    {t.legalPolicy.s17Title}
                  </h2>

                  <p className="opacity-80 leading-relaxed mb-2">
                    {t.legalPolicy.s17p1}
                  </p>

                  <ul className="list-disc ml-6 opacity-80 leading-relaxed space-y-1 mb-4">
                    <li>{t.legalPolicy.s17li1}</li>
                    <li>{t.legalPolicy.s17li2}</li>
                    <li>{t.legalPolicy.s17li3}</li>
                    <li>{t.legalPolicy.s17li4}</li>
                  </ul>

                  <p className="opacity-80 leading-relaxed mb-2">
                    {t.legalPolicy.s17p2}
                  </p>

                </div>
              </div>


              {/* Section 18:  CONTACT */}
              <div
                ref={(el) => {
                  itemsRef.current[17] = el;
                }}
                className="flex flex-col md:flex-row gap-8 mb-20 group"
              >
                <div className="policy-number text-7xl md:text-8xl font-black text-primary/10 group-hover:text-primary transition-colors duration-500 shrink-0 leading-none">
                  18
                </div>
                <div className="flex-1 min-w-0 policy-content">
                  <h2 className="text-3xl font-bold text-foreground mb-6 tracking-tight">
                    {t.legalPolicy.s18Title}
                  </h2>

                  <p className="opacity-80 leading-relaxed mb-2">
                    ORR Network
                  </p>
                  <p className="opacity-80 leading-relaxed mb-2">
                    {t.legalPolicy.s18Email}: info@orr.solutions
                  </p>

                  <p className="opacity-80 leading-relaxed mb-2">
                    {t.legalPolicy.s18Website}: www.orr.solution
                  </p>

                </div>
              </div>

            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
