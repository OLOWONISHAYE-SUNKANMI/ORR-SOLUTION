"use client";

import { useRef, useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Link from "next/link";
import { useLanguage } from "../../components/LanguageProvider";
import { useScrollSplit } from "@/hooks/useScrollSplit";
import SanityImage from "@/components/SanityImage";
import { PortableText } from "@portabletext/react";
import { getRichTextContent } from "@/lib/rich-text-utils";

gsap.registerPlugin(ScrollTrigger);

import BlogCard from "../../components/BlogCard";
import LatestBlogsSection from "../../components/LatestBlogsSection";

interface Post {
  _id: string;
  title: any;
  slug: string;
  badge: any;
  mainImage: any;
  featured: boolean;
  publishDate: string;
  body: any;
  button1Text?: any;
  button2Text?: any;
}

interface PageData {
  heroTitle: string;
  heroDescription1: string;
  heroDescription2: string;
  heroDescription3: string;
  heroButton1Text: string;
  heroButton2Text: string;
}

export default function ResourcesBlogsClient({ 
  posts, 
  pageData 
}: { 
  posts: Post[], 
  pageData: PageData 
}) {
  const { language } = useLanguage();
  useScrollSplit();

  return (
    <div className="min-h-screen text-white ">
      <HeroSection data={pageData} />
      <div className="scroll-section">
        <LatestBlogsSection initialPosts={posts.slice(0, 3)} />
      </div>
      <div className="scroll-section">
        <ContentSection posts={posts} />
      </div>
    </div>
  );
}

function HeroSection({ data }: { data: PageData }) {
  const { t, language } = useLanguage();
  const titleRef = useRef<HTMLHeadingElement>(null);
  const p1Ref = useRef<HTMLParagraphElement>(null);
  const p2Ref = useRef<HTMLParagraphElement>(null);
  const p3Ref = useRef<HTMLParagraphElement>(null);
  const buttonsRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    gsap.to(containerRef.current, {
      backgroundPosition: "50% 100%",
      ease: "none",
      scrollTrigger: {
        trigger: containerRef.current,
        start: "top top",
        end: "bottom top",
        scrub: true
      }
    });

    const tl = gsap.timeline();
    tl.fromTo(titleRef.current,
      { opacity: 0, y: 40, filter: "blur(10px)" },
      { opacity: 1, y: 0, filter: "blur(0px)", duration: 1.2, ease: "power4.out" }
    )
      .fromTo([p1Ref.current, p2Ref.current, p3Ref.current],
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.8, stagger: 0.15, ease: "power3.out" },
        "-=0.6"
      )
      .fromTo(buttonsRef.current,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.8, ease: "power3.out" },
        "-=0.4"
      );
  }, []);

  return (
    <section
      ref={containerRef}
      className="relative px-6 my-20 md:px-16 pt-32 pb-24 min-h-[80vh] flex items-center justify-center overflow-hidden"
    >
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-green-500/10 rounded-full blur-[120px] pointer-events-none mix-blend-screen" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-[120px] pointer-events-none mix-blend-screen" />

      <div className="relative z-10 max-w-5xl mx-auto text-center flex flex-col items-center">
        <h1 ref={titleRef} className="text-5xl md:text-7xl lg:text-8xl font-black mb-8 tracking-tighter text-transparent bg-clip-text bg-gradient-to-br from-white via-white to-white/60">
          {language === 'it' ? t.resources.heroTitle : (getRichTextContent(data?.heroTitle, language) || t.resources.heroTitle)}
        </h1>

        <div className="space-y-6 max-w-3xl mb-12">
          <p ref={p1Ref} className="text-gray-300 text-lg md:text-xl leading-relaxed font-light">
            {language === 'it' ? t.resources.description1 : (getRichTextContent(data?.heroDescription1, language) || t.resources.description1)}
          </p>
          <p ref={p2Ref} className="text-gray-400 text-base md:text-lg leading-relaxed font-light">
            {language === 'it' ? t.resources.description2 : (getRichTextContent(data?.heroDescription2, language) || t.resources.description2)}
          </p>
          <p ref={p3Ref} className="text-gray-400 text-base md:text-lg leading-relaxed font-light">
            {language === 'it' ? t.resources.description3 : (getRichTextContent(data?.heroDescription3, language) || t.resources.description3)}
          </p>
        </div>

        <div ref={buttonsRef} className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
          <Link href='/register' className="group relative inline-flex items-center justify-center bg-white text-black px-8 py-4 rounded-full font-bold text-sm tracking-wide uppercase overflow-hidden hover:scale-105 transition-transform duration-300">
            <span className="relative z-10">{language === 'it' ? t.resources.requestAccess : (data?.heroButton1Text || t.resources.requestAccess)}</span>
            <div className="absolute inset-0 bg-green-400 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-in-out z-0" />
          </Link>
          <Link href='/services' className="inline-flex items-center justify-center border hover:border-white border-white/20 bg-white/5 backdrop-blur-md text-white px-8 py-4 rounded-full font-bold text-sm tracking-wide uppercase hover:bg-white/10 transition-all duration-300">
            <span>{language === 'it' ? t.resources.learnMore : (data?.heroButton2Text || t.resources.learnMore)}</span>
          </Link>
        </div>
      </div>
    </section>
  );
}

function ContentSection({ posts }: { posts: Post[] }) {
  const { t } = useLanguage();
  if (!posts || posts.length === 0) return null;

  const featuredPost = posts.find(p => p.featured) || posts[0];
  const otherPosts = posts.filter(p => p._id !== featuredPost._id);

  return (
    <section className="px-6 md:px-16 pb-32 relative z-10">
      <div className="max-w-7xl mx-auto space-y-24">
        {featuredPost && <FeaturedCardComponent post={featuredPost} />}

        {otherPosts.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-12">
              <h2 className="text-3xl font-bold tracking-tight text-white">{t.resources.latestArticles}</h2>
              <div className="h-[1px] flex-grow ml-8 bg-gradient-to-r from-white/20 to-transparent" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-max">
              {otherPosts.map((post, index) => (
                <BlogCard
                  key={post._id}
                  post={post}
                  className={index % 5 === 0 ? 'lg:col-span-2' : ''}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

function FeaturedCardComponent({ post }: { post: Post }) {
  const { t, language } = useLanguage();
  const cardRef = useRef<HTMLAnchorElement>(null);

  const title = post.title?.[language] || post.title?.en || "";
  const badge = post.badge?.[language] || post.badge?.en || "";
  const body = post.body?.[language] || post.body?.en || [];

  useEffect(() => {
    if (!cardRef.current) return;
    gsap.fromTo(cardRef.current,
      { opacity: 0, y: 50 },
      {
        opacity: 1,
        y: 0,
        duration: 1.2,
        ease: "power3.out",
        scrollTrigger: {
          trigger: cardRef.current,
          start: "top 80%",
        }
      }
    );
  }, []);

  return (
    <Link
      href={`/resources-blogs/${post.slug}`}
      ref={cardRef}
      className="relative group block rounded-[2.5rem] overflow-hidden border border-white/10 bg-[#0C141D] transition-all duration-700 cursor-pointer hover:border-green-400/50"
    >
      <div className="flex flex-col lg:flex-row lg:h-[500px]">
        <div className="relative w-full lg:w-1/2 h-80 lg:h-full overflow-hidden">
          <div className="absolute inset-0 bg-[#0A1016]/40 z-10 mix-blend-multiply group-hover:bg-transparent transition-all duration-500" />
          <SanityImage
            asset={post.mainImage}
            alt={title}
            className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700 ease-out"
          />
          <div className="absolute top-6 left-6 z-20 flex flex-col gap-2">
            <span className="w-fit bg-white/10 backdrop-blur-md border border-white/20 text-white text-xs font-bold px-4 py-2 rounded-full uppercase tracking-wider shadow-xl">
              {badge || t.resources.featured}
            </span>
            {post.publishDate && (
              <span className="w-fit bg-black/50 backdrop-blur-md text-white/90 text-xs font-medium px-3 py-1 rounded-full shadow-md">
                {new Date(post.publishDate).toLocaleDateString(language === 'it' ? 'it-IT' : 'en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              </span>
            )}
          </div>
        </div>

        <div className="relative z-20 w-full lg:w-1/2 p-8 md:p-14 flex flex-col justify-center">
          <h3 className="text-3xl md:text-5xl font-bold mb-6 tracking-tight leading-tight group-hover:text-green-400 transition-colors duration-300">
            {title}
          </h3>

          <div className="text-gray-300 text-lg leading-relaxed font-light">
            <div className="line-clamp-4 overflow-hidden">
              <PortableText value={body} />
            </div>
            <div className="mt-8 flex items-center text-green-400 font-semibold group/btn w-fit">
              {t.resources.readArticle}
              <svg className="w-5 h-5 ml-2 transform group-hover/btn:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
