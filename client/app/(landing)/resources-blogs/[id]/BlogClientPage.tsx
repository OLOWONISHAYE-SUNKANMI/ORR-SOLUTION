"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import gsap from "gsap";
import Spinner from "@/components/ui/Spinner";
import { useCachedData } from "@/hooks/useCachedData";
import { useLanguage } from "@/app/components/LanguageProvider";
import { getRichTextContent } from "@/lib/rich-text-utils";

interface ContentCard {
  id: number;
  badge: any;
  title: any;
  content: string[] | { content: string }[];
  image_url: string;
  button1_text?: any;
  button2_text?: any;
  order: number;
  is_active: boolean;
}

interface ResourcesPageData {
  id: number;
  hero_title: any;
  hero_description1: any;
}

interface ResourcesData {
  page: ResourcesPageData;
  cards: ContentCard[];
}

// decodeAndFormatContent removed - use getRichTextContent instead

export default function BlogClientPage({ id }: { id: string }) {
  const { t, language } = useLanguage();
  const contentRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLDivElement>(null);

  const { data, loading } = useCachedData<ResourcesData>(
    `orr_resources_content_${language}`,
    `${process.env.NEXT_PUBLIC_API_URL || 'https://orr-backend-105825824472.asia-southeast2.run.app'}/admin-portal/v1/cms/resources-content/?lang=${language}`,
    (data) => data
  );

  // Find the specific card
  const card = data?.cards.find(c => c.id.toString() === id);

  useEffect(() => {
    if (!loading && card) {
      const tl = gsap.timeline();
      tl.fromTo(headerRef.current, 
        { opacity: 0, y: 30 }, 
        { opacity: 1, y: 0, duration: 1, ease: "power4.out" }
      )
      .fromTo(imageRef.current,
        { opacity: 0, scale: 1.1 },
        { opacity: 1, scale: 1, duration: 1.2, ease: "power2.out" },
        "-=0.6"
      )
      .fromTo(contentRef.current,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.8, ease: "power3.out" },
        "-=0.4"
      );
    }
  }, [loading, card]);

  if (loading) return <Spinner />;
  if (!card) return (
    <div className="min-h-screen flex flex-col items-center justify-center text-white p-6">
      <h1 className="text-4xl font-bold mb-4">{t.resources.contentNotFound || "Content Not Found"}</h1>
      <Link href="/resources-blogs" className="text-green-400 hover:underline">{t.resources.backToBlogs || "Back to Resources & Blogs"}</Link>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#0A1016] text-white selection:bg-green-400 selection:text-black">
      {/* Navigation Bar */}
      <nav className="fixed top-0 left-0 w-full z-50 bg-[#0A1016]/80 backdrop-blur-lg border-b border-white/5 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center">
          <Link href="/resources-blogs" className="group flex items-center text-sm font-bold tracking-widest uppercase text-gray-400 hover:text-white transition-colors">
            <svg className="w-5 h-5 mr-2 transform group-hover:-translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16l-4-4m0 0l4-4m-4 4h18" />
            </svg>
            {t.resources.backToBlogs || "Back to Blogs"}
          </Link>
        </div>
      </nav>

      <main className="pt-32 pb-24 px-6">
        <article className="max-w-4xl mx-auto">
          {/* Header */}
          <header ref={headerRef} className="text-center mb-16">
            <span className="inline-block bg-green-400/10 text-green-400 text-xs font-black px-4 py-2 rounded-full uppercase tracking-[0.2em] mb-8 border border-green-400/20">
              <span dangerouslySetInnerHTML={{ __html: getRichTextContent(card.badge, language) || '' }} />
            </span>
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-black mb-12 leading-[1.1] tracking-tighter">
              <span dangerouslySetInnerHTML={{ __html: getRichTextContent(card.title, language) || '' }} />
            </h1>
          </header>

          {/* Featured Image */}
          <div ref={imageRef} className="relative aspect-[21/9] rounded-[2.5rem] overflow-hidden mb-20 border border-white/10 shadow-2xl">
            <img 
              src={card.image_url} 
              alt="Blog post cover" 
              className="w-full h-full object-cover"
            />
          </div>

          {/* Content Body */}
          <div ref={contentRef} className="prose prose-invert prose-lg max-w-none">
            <div className="space-y-8 text-gray-300 font-light leading-relaxed">
              {Array.isArray(card.content) ? card.content.map((item, index) => (
                <p key={index} className="text-xl md:text-2xl" dangerouslySetInnerHTML={{ __html: typeof item === 'string' ? item : (item as { content: string }).content || '' }} />
              )) : (
                <p className="text-xl md:text-2xl" dangerouslySetInnerHTML={{ __html: typeof card.content === 'string' ? card.content : '' }} />
              )}
            </div>

            {/* Action Buttons */}
            {(card.button1_text || card.button2_text) && (
              <div className="mt-20 pt-12 border-t border-white/10 flex flex-wrap gap-6 justify-center">
                {card.button1_text && (
                  <button className="bg-white text-black px-10 py-5 rounded-full font-black uppercase text-sm tracking-widest hover:scale-105 transition-transform">
                    <span dangerouslySetInnerHTML={{ __html: getRichTextContent(card.button1_text, language) || '' }} />
                  </button>
                )}
                {card.button2_text && (
                  <button className="border border-white/20 hover:border-white bg-white/5 px-10 py-5 rounded-full font-black uppercase text-sm tracking-widest hover:bg-white/10 transition-all">
                    <span dangerouslySetInnerHTML={{ __html: getRichTextContent(card.button2_text, language) || '' }} />
                  </button>
                )}
              </div>
            )}
          </div>
        </article>
      </main>

      {/* Footer / Next Up Spacer */}
      <div className="max-w-4xl mx-auto px-6 pb-24 text-center">
        <div className="h-[1px] w-full bg-gradient-to-r from-transparent via-white/10 to-transparent mb-12" />
        <Link href="/resources-blogs" className="text-gray-500 hover:text-green-400 transition-colors font-bold uppercase tracking-widest text-xs">
          {t.resources.exploreAll || "Explore all resources"}
        </Link>
      </div>
    </div>
  );
}
