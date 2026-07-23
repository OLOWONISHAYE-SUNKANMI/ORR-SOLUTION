"use client";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import axios from "axios";
import Spinner from "../../../components/ui/Spinner";
import { getRichTextContent } from "../../../lib/rich-text-utils";
import { useLanguage } from "../../../app/components/LanguageProvider";

// Map pillar index → detail page route
const PILLAR_ROUTES: Record<number, string> = {
  0: '/services/strategy-advisory-compliant',
  1: '/services/operational-systems-infrastructure',
  2: '/services/living-systems-regeneration',
};

// decodeAndFormatContent removed - use getRichTextContent instead

interface ServiceStage {
  id: number;
  stage_number: number;
  title: any;
  subtitle: any;
  description: any;
  focus_content: any;
  button_text: any;
  order: number;
  is_active: boolean;
}

interface ServicePillar {
  id: number;
  title: any;
  description: any;
  button_text: any;
  order: number;
  is_active: boolean;
}

interface ServicesPageData {
  id: number;
  hero_title: any;
  hero_subtitle: any;
  pillars_title: any;
  business_gp_title: any;
  business_gp_subtitle: any;
  business_gp_description: any;
  business_gp_button_text: any;
  business_gp_image: string;
  meta_title?: any;
  meta_description?: any;
  is_active: boolean;
}

interface ServicesData {
  page: ServicesPageData;
  stages: ServiceStage[];
  pillars: ServicePillar[];
}

import { useCachedData } from "../../../hooks/useCachedData";

const processData = (data: any) => data;

export default function Services() {
  const sectionsRef = useRef<(HTMLElement | null)[]>([]);
  const { t, language, interpolate } = useLanguage();

  const { data, loading } = useCachedData<ServicesData>(
    `orr_services_content_${language}`,
    `${process.env.NEXT_PUBLIC_API_URL || 'https://orr-backend-105825824472.asia-southeast2.run.app'}/admin-portal/v1/cms/services-content/?lang=${language}`,
    (data) => data
  );

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('animate-fade-in-up');
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
    );

    sectionsRef.current.forEach((section) => {
      if (section) observer.observe(section);
    });

    return () => observer.disconnect();
  }, [data]);

  if (loading) {
    return <Spinner />;
  }

  if (!data) {
    return <Spinner />;
  }

  return (
    <div className="min-h-screen text-foreground">
      <style jsx>{`
        .animate-fade-in-up {
          animation: fadeInUp 0.8s ease-out forwards;
        }
        
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        section {
          opacity: 0;
          transform: translateY(30px);
        }
      `}</style>
      {/* Hero Section */}
      <section
        ref={el => { sectionsRef.current[0] = el; }}
        className="pt-32 pb-16 px-6 relative min-h-[80vh] flex items-center bg-background transition-colors duration-300"
      >
        <div className="absolute inset-0 bg-[url('/stars.svg')] bg-cover opacity-10 dark:opacity-30 pointer-events-none" />

        <div className="max-w-4xl mx-auto text-center relative z-10">
          <h1 className="text-4xl md:text-6xl font-bold mb-8 leading-tight text-foreground">
            <span dangerouslySetInnerHTML={{ __html: getRichTextContent(data.page.hero_title, language) || interpolate(t.services.heroTitle) }} />
          </h1>
          <p className="text-lg md:text-xl opacity-70 max-w-3xl mx-auto leading-relaxed text-foreground">
            <span dangerouslySetInnerHTML={{ __html: getRichTextContent(data.page.hero_subtitle, language) || interpolate(t.services.heroSubtitle) }} />
          </p>
        </div>
      </section>

      {/* Process Stages */}
      <section
        ref={el => { sectionsRef.current[1] = el; }}
        className="py-16 px-6 bg-background transition-colors duration-300"
      >
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6 md:grid-rows-2">
            {data.stages.slice(0, 4).map((stage, index) => (
              <div key={stage.id} className="bg-card rounded-2xl p-8 text-foreground flex flex-col transition-colors duration-300">
                <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center mb-6">
                  <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h2 className="text-xl font-bold mb-4">
                  <span dangerouslySetInnerHTML={{ __html: getRichTextContent(stage.title, language) || interpolate(t.services.stageTitle) }} />
                </h2>
                <h3 className="text-lg font-semibold mb-4">
                  <span dangerouslySetInnerHTML={{ __html: getRichTextContent(stage.subtitle, language) || interpolate(t.services.stageSubtitle) }} />
                </h3>
                <p className="opacity-70 text-sm mb-6">
                  <span dangerouslySetInnerHTML={{ __html: getRichTextContent(stage.description, language) || interpolate(t.services.stageDescription) }} />
                </p>
                <div className="opacity-70 text-sm mb-8 flex-grow">
                  <span dangerouslySetInnerHTML={{ __html: getRichTextContent(stage.focus_content, language) || interpolate(t.services.focusContent) }} />
                </div>
                <Link href="/contact" className="w-full bg-primary text-white font-bold py-3 px-6 rounded-xl hover:bg-lemon transition-colors mt-auto cursor-pointer block text-center">
                  <span dangerouslySetInnerHTML={{ __html: getRichTextContent(stage.button_text, language) || interpolate(t.services.learnMore) }} />
                </Link>
              </div>
            ))}
          </div>

          {/* Stage 5 - Grow (Full Width) */}
          {data.stages[4] && (
            <div className="bg-card rounded-2xl p-8 text-foreground max-w-[600px] mx-auto transition-colors duration-300">
              <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center mb-6">
                <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h2 className="text-xl font-bold mb-4">
                <span dangerouslySetInnerHTML={{ __html: getRichTextContent(data.stages[4].title, language) || interpolate(t.services.stageTitle) }} />
              </h2>
              <h3 className="text-lg font-semibold mb-4">
                <span dangerouslySetInnerHTML={{ __html: getRichTextContent(data.stages[4].subtitle, language) || interpolate(t.services.stageSubtitle) }} />
              </h3>
              <p className="opacity-70 text-sm mb-6">
                <span dangerouslySetInnerHTML={{ __html: getRichTextContent(data.stages[4].description, language) || interpolate(t.services.stageDescription) }} />
              </p>
              <div className="opacity-70 text-sm mb-8">
                <span dangerouslySetInnerHTML={{ __html: getRichTextContent(data.stages[4].focus_content, language) || interpolate(t.services.focusContent) }} />
              </div>
              <Link href="/register" className="w-full bg-primary text-white font-bold py-3 px-6 rounded-xl hover:bg-lemon transition-colors cursor-pointer block text-center">
                <span dangerouslySetInnerHTML={{ __html: getRichTextContent(data.stages[4].button_text, language) || interpolate(t.services.learnMore) }} />
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* The Three Pillars */}
      <section
        ref={el => { sectionsRef.current[2] = el; }}
        className="py-20 px-6 bg-primary transition-colors duration-300 min-h-[80vh] flex items-center"
      >
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-white">
              <span dangerouslySetInnerHTML={{ __html: getRichTextContent(data.page.pillars_title, language) || t.services.pillarsTitle }} />
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {data.pillars.map((pillar, index) => (
              <div key={pillar.id} className="bg-card rounded-2xl px-8 py-12 text-foreground flex flex-col min-h-[300px] transition-colors duration-300">
                <h3 className="text-3xl font-bold mb-8 text-center text-foreground">
                  <span dangerouslySetInnerHTML={{ __html: getRichTextContent(pillar.title, language) || "Pillar Title" }} />
                </h3>
                <p className="opacity-70 text-xl mb-8 text-center flex-grow">
                  <span dangerouslySetInnerHTML={{ __html: getRichTextContent(pillar.description, language) || "Pillar Description" }} />
                </p>
                <Link
                  href={PILLAR_ROUTES[index] || '/services'}
                  className="w-full bg-primary text-white font-bold py-3 px-6 rounded-xl hover:bg-lemon transition-colors mt-8 cursor-pointer block text-center"
                >
                  <span dangerouslySetInnerHTML={{ __html: getRichTextContent(pillar.button_text, language) || t.services.learnMore }} />
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Business GP Section */}
      <section
        ref={el => { sectionsRef.current[3] = el; }}
        className="py-20 px-6 bg-background relative min-h-[80vh] flex items-center transition-colors duration-300"
      >
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl font-bold text-foreground mb-6">
                <span dangerouslySetInnerHTML={{ __html: getRichTextContent(data.page.business_gp_title, language) || t.services.businessGpTitle }} />
              </h2>
              <h3 className="text-4xl font-bold mb-8 text-foreground">
                <span dangerouslySetInnerHTML={{ __html: getRichTextContent(data.page.business_gp_subtitle, language) || t.services.businessGpSubtitle }} />
              </h3>
              <p className="opacity-70 text-xl mb-8 text-foreground">
                <span dangerouslySetInnerHTML={{ __html: getRichTextContent(data.page.business_gp_description, language) || t.services.businessGpDescription }} />
              </p>
              <Link href="/contact" className="inline-block bg-primary text-white px-12 py-4 rounded-lg text-lg font-bold hover:bg-lemon transition-colors">
                <span dangerouslySetInnerHTML={{ __html: getRichTextContent(data.page.business_gp_button_text, language) || t.services.contactUs }} />
              </Link>
            </div>
            <div>
              <img
                src={data.page.business_gp_image}
                alt="Business handshake"
                className="w-full h-auto rounded-lg shadow-2xl border border-border"
              />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}