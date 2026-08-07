"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import gsap from "gsap";
import SanityImage from "@/components/SanityImage";
import PortableTextRenderer from "@/components/PortableTextRenderer";

import { useLanguage } from "@/lib/i18n/LanguageContext";

interface Post {
  _id: string;
  title: any;
  slug: string;
  badge: any;
  mainImage: any;
  publishDate: string;
  body: any;
  button1Text?: any;
  button2Text?: any;
}

export default function BlogDetailClient({ post }: { post: Post }) {
  const { language } = useLanguage();
  const contentRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLDivElement>(null);

  const title = post.title?.[language] || post.title?.en || "";
  const badge = post.badge?.[language] || post.badge?.en || "";
  const body = post.body?.[language] || post.body?.en || [];
  const button1Text = post.button1Text?.[language] || post.button1Text?.en || "";
  const button2Text = post.button2Text?.[language] || post.button2Text?.en || "";

  useEffect(() => {
    if (post) {
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
  }, [post]);

  if (!post) return (
    <div className="min-h-screen flex flex-col items-center justify-center text-white p-6">
      <h1 className="text-4xl font-bold mb-4">Content Not Found</h1>
      <Link href="/resources-blogs" className="text-green-400 hover:underline">Back to Resources & Blogs</Link>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#0A1016] text-white selection:bg-green-400 selection:text-black">
      <nav className="fixed top-0 left-0 w-full z-50 bg-[#0A1016]/80 backdrop-blur-lg border-b border-white/5 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center">
          <Link href="/resources-blogs" className="group flex items-center text-sm font-bold tracking-widest uppercase text-gray-400 hover:text-white transition-colors">
            <svg className="w-5 h-5 mr-2 transform group-hover:-translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16l-4-4m0 0l4-4m-4 4h18" />
            </svg>
            Back to Blogs
          </Link>
        </div>
      </nav>

      <main className="pt-32 pb-24 px-6">
        <article className="max-w-4xl mx-auto">
          <header ref={headerRef} className="text-center mb-16">
            {badge && (
              <span className="inline-block bg-green-400/10 text-green-400 text-xs font-black px-4 py-2 rounded-full uppercase tracking-[0.2em] mb-4 border border-green-400/20">
                {badge}
              </span>
            )}
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-black mb-8 leading-[1.1] tracking-tighter">
              {title}
            </h1>
            {post.publishDate && (
              <p className="text-sm text-gray-400 font-medium tracking-widest uppercase mb-12">
                Published on {new Date(post.publishDate).toLocaleDateString(language === 'it' ? 'it-IT' : 'en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
              </p>
            )}
          </header>

          <div ref={imageRef} className="relative aspect-[21/9] rounded-[2.5rem] overflow-hidden mb-20 border border-white/10 shadow-2xl">
            <SanityImage 
              asset={post.mainImage} 
              alt={title} 
              className="w-full h-full object-cover"
            />
          </div>

          <div ref={contentRef} className="space-y-8">
            <PortableTextRenderer value={body} />

            {(button1Text || button2Text) && (
              <div className="mt-20 pt-12 border-t border-white/10 flex flex-wrap gap-6 justify-center">
                {button1Text && (
                  <button className="bg-white text-black px-10 py-5 rounded-full font-black uppercase text-sm tracking-widest hover:scale-105 transition-transform">
                    {button1Text}
                  </button>
                )}
                {button2Text && (
                  <button className="border border-white/20 hover:border-white bg-white/5 px-10 py-5 rounded-full font-black uppercase text-sm tracking-widest hover:bg-white/10 transition-all">
                    {button2Text}
                  </button>
                )}
              </div>
            )}
          </div>
        </article>
      </main>

      <div className="max-w-4xl mx-auto px-6 pb-24 text-center">
        <div className="h-[1px] w-full bg-gradient-to-r from-transparent via-white/10 to-transparent mb-12" />
        <Link href="/resources-blogs" className="text-gray-500 hover:text-green-400 transition-colors font-bold uppercase tracking-widest text-xs">
          Explore all resources
        </Link>
      </div>
    </div>
  );
}
