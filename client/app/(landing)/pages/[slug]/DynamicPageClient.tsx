"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import * as Icons from "lucide-react";
import SanityImage from "@/components/SanityImage";
import PortableTextRenderer from "@/components/PortableTextRenderer";
import { useLanguage } from "@/lib/i18n/LanguageContext";

gsap.registerPlugin(ScrollTrigger);

interface Section {
  _type: string;
  heading?: any;
  title?: any;
  subheading?: any;
  subtitle?: any;
  text?: any;
  body?: any;
  buttonText?: any;
  buttonLink?: string;
  link?: string;
  image?: any;
  reversed?: boolean;
  blockHeading?: any;
  blockSubheading?: any;
  cards?: Array<{
    title?: any;
    description?: any;
    icon?: string;
    link?: string;
  }>;
  mediaUrl?: string;
  caption?: any;
}

interface PageData {
  _id: string;
  title: any;
  slug: string;
  templateType: string;
  hero?: {
    heading?: any;
    subheading?: any;
    image?: any;
    buttonText?: any;
    buttonLink?: string;
    button2Text?: any;
    button2Link?: string;
  };
  sections?: Section[];
}

export default function DynamicPageClient({ page }: { page: PageData }) {
  const { language } = useLanguage();
  const pageTitle = page.title?.[language] || page.title?.en || "";

  return (
    <div className="min-h-screen text-white bg-[#0A1016] selection:bg-green-400 selection:text-black">
      {/* Dynamic Page Header / Hero wrapper based on Template Selection */}
      <PageHero templateType={page.templateType} hero={page.hero} pageTitle={pageTitle} />

      {/* Render Dynamic Content Blocks */}
      <div className="relative z-10 pb-24">
        {page.sections?.map((section, index) => {
          switch (section._type) {
            case "heroBlock":
              return <HeroBlock key={index} section={section} />;
            case "imageText":
              return <ImageTextSection key={index} section={section} />;
            case "cta":
              return <CTASection key={index} section={section} />;
            case "features":
              return <FeaturesSection key={index} section={section} />;
            case "textBlock":
              return <RichTextBlock key={index} section={section} />;
            case "embeddedMedia":
              return <EmbeddedMediaSection key={index} section={section} />;
            default:
              return null;
          }
        })}
      </div>
    </div>
  );
}

// ----------------------------------------------------
// PageHero component tailored by templateType
// ----------------------------------------------------
function PageHero({
  templateType,
  hero,
  pageTitle,
}: {
  templateType: string;
  hero?: any;
  pageTitle: string;
}) {
  const { language } = useLanguage();
  const containerRef = useRef<HTMLElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const textRef = useRef<HTMLParagraphElement>(null);
  const buttonsRef = useRef<HTMLDivElement>(null);

  const heading = hero?.heading?.[language] || hero?.heading?.en || pageTitle;
  const subheading = hero?.subheading?.[language] || hero?.subheading?.en || "";
  const btn1Text = hero?.buttonText?.[language] || hero?.buttonText?.en || "";
  const btn2Text = hero?.button2Text?.[language] || hero?.button2Text?.en || "";

  useEffect(() => {
    // Parallax background logic
    if (containerRef.current) {
      gsap.to(containerRef.current, {
        backgroundPosition: "50% 30%",
        ease: "none",
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top top",
          end: "bottom top",
          scrub: true,
        },
      });
    }

    const tl = gsap.timeline();
    tl.fromTo(
      titleRef.current,
      { opacity: 0, y: 50, filter: "blur(10px)" },
      { opacity: 1, y: 0, filter: "blur(0px)", duration: 1.2, ease: "power4.out" }
    );
    if (subheading) {
      tl.fromTo(
        textRef.current,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.8, ease: "power3.out" },
        "-=0.8"
      );
    }
    if (btn1Text || btn2Text) {
      tl.fromTo(
        buttonsRef.current,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.8, ease: "power3.out" },
        "-=0.6"
      );
    }
  }, [subheading, btn1Text, btn2Text]);

  // Render visual style according to template selection
  if (templateType === "landing") {
    return (
      <section
        ref={containerRef}
        className="relative pt-44 pb-32 px-6 md:px-16 min-h-[90vh] flex items-center justify-center overflow-hidden bg-gradient-to-b from-[#0F1A26] to-[#0A1016]"
      >
        <div className="absolute top-1/4 left-1/3 w-[500px] h-[500px] bg-green-500/10 rounded-full blur-[140px] pointer-events-none mix-blend-screen" />
        <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-blue-500/5 rounded-full blur-[140px] pointer-events-none mix-blend-screen" />
        <div className="relative z-10 max-w-5xl mx-auto text-center">
          <h1
            ref={titleRef}
            className="text-6xl md:text-8xl lg:text-9xl font-black mb-10 tracking-tighter text-white uppercase italic leading-none"
          >
            {heading}
          </h1>
          {subheading && (
            <p
              ref={textRef}
              className="text-gray-400 text-xl md:text-3xl max-w-3xl mx-auto mb-14 font-light leading-relaxed"
            >
              {subheading}
            </p>
          )}
          {(btn1Text || btn2Text) && (
            <div ref={buttonsRef} className="flex flex-col sm:flex-row gap-6 justify-center">
              {btn1Text && (
                <Link
                  href={hero.buttonLink || "/register"}
                  className="group relative inline-flex items-center justify-center bg-white text-black px-12 py-5 rounded-full font-black uppercase text-sm tracking-widest hover:scale-105 transition-transform duration-300"
                >
                  <span className="relative z-10">{btn1Text}</span>
                  <div className="absolute inset-0 bg-green-400 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-in-out z-0" />
                </Link>
              )}
              {btn2Text && (
                <Link
                  href={hero.button2Link || "/services"}
                  className="inline-flex items-center justify-center border hover:border-white border-white/20 bg-white/5 backdrop-blur-md text-white px-12 py-5 rounded-full font-black uppercase text-sm tracking-widest hover:bg-white/15 transition-all duration-300"
                >
                  {btn2Text}
                </Link>
              )}
            </div>
          )}
        </div>
      </section>
    );
  }

  if (templateType === "service") {
    return (
      <section
        ref={containerRef}
        className="relative pt-40 pb-24 px-6 md:px-16 min-h-[75vh] flex items-center bg-gradient-to-r from-[#0C1520] to-[#0A1016]"
      >
        <div className="absolute top-10 right-10 w-96 h-96 bg-green-400/5 rounded-full blur-[100px] pointer-events-none" />
        <div className="relative z-10 max-w-7xl mx-auto w-full grid grid-col-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-8 space-y-8">
            <span className="inline-block bg-green-400/10 text-green-400 text-xs font-black px-4 py-2 rounded-full uppercase tracking-[0.2em] border border-green-400/20">
              SERVICE PLATFORM
            </span>
            <h1
              ref={titleRef}
              className="text-5xl md:text-7xl font-black text-white tracking-tighter leading-tight uppercase italic"
            >
              {heading}
            </h1>
            {subheading && (
              <p ref={textRef} className="text-gray-300 text-lg md:text-xl font-light leading-relaxed max-w-3xl">
                {subheading}
              </p>
            )}
            {(btn1Text || btn2Text) && (
              <div ref={buttonsRef} className="flex flex-wrap gap-4 pt-4">
                {btn1Text && (
                  <Link
                    href={hero.buttonLink || "/contact"}
                    className="inline-flex items-center justify-center bg-green-400 text-black px-10 py-4 rounded-full font-black uppercase text-xs tracking-widest hover:bg-green-300 transition-colors"
                  >
                    {btn1Text}
                  </Link>
                )}
                {btn2Text && (
                  <Link
                    href={hero.button2Link || "#content"}
                    className="inline-flex items-center justify-center border border-white/20 hover:border-white text-white px-10 py-4 rounded-full font-black uppercase text-xs tracking-widest hover:bg-white/5 transition-all"
                  >
                    {btn2Text}
                  </Link>
                )}
              </div>
            )}
          </div>
          <div className="lg:col-span-4 relative aspect-square rounded-[3rem] overflow-hidden border border-white/10 shadow-2xl">
            {hero?.image ? (
              <SanityImage asset={hero.image} alt={heading} className="object-cover w-full h-full" />
            ) : (
              <div className="w-full h-full bg-[#131E2A] flex items-center justify-center">
                <Icons.Settings className="w-20 h-20 text-gray-500 animate-spin-slow" />
              </div>
            )}
          </div>
        </div>
      </section>
    );
  }

  if (templateType === "about") {
    return (
      <section
        ref={containerRef}
        className="relative pt-44 pb-28 px-6 md:px-16 flex items-center justify-center text-center bg-[#070D12]"
      >
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(16,185,129,0.08),rgba(255,255,255,0))]" />
        <div className="relative z-10 max-w-4xl mx-auto space-y-8">
          <span className="text-gray-400 font-bold uppercase tracking-[0.3em] text-xs">OUR IDENTITY</span>
          <h1
            ref={titleRef}
            className="text-5xl md:text-8xl font-extrabold text-white tracking-tight"
          >
            {heading}
          </h1>
          <div className="h-[2px] w-24 bg-green-400 mx-auto" />
          {subheading && (
            <p ref={textRef} className="text-gray-300 text-lg md:text-2xl font-light leading-relaxed max-w-3xl mx-auto">
              {subheading}
            </p>
          )}
        </div>
      </section>
    );
  }

  // Default clean hero template
  return (
    <section className="relative pt-40 pb-20 px-6 md:px-16 text-center border-b border-white/5">
      <div className="max-w-4xl mx-auto">
        <h1 ref={titleRef} className="text-4xl md:text-6xl font-black mb-6 tracking-tight uppercase">
          {heading}
        </h1>
        {subheading && (
          <p ref={textRef} className="text-gray-400 text-lg md:text-xl font-light leading-relaxed max-w-2xl mx-auto">
            {subheading}
          </p>
        )}
      </div>
    </section>
  );
}

// ----------------------------------------------------
// Section Blocks Rendering
// ----------------------------------------------------

function HeroBlock({ section }: { section: Section }) {
  const { language } = useLanguage();
  const heading = section.heading?.[language] || section.heading?.en || "";
  const subheading = section.subheading?.[language] || section.subheading?.en || "";
  const buttonText = section.buttonText?.[language] || section.buttonText?.en || "";

  return (
    <section className="relative py-24 px-6 md:px-16 flex items-center justify-center overflow-hidden">
      <div className="max-w-4xl mx-auto text-center">
        <h2 className="text-4xl md:text-6xl font-black mb-6 tracking-tight text-white uppercase italic">
          {heading}
        </h2>
        {subheading && <p className="text-gray-400 text-lg md:text-xl mb-8 leading-relaxed font-light">{subheading}</p>}
        {buttonText && (
          <Link
            href={section.buttonLink || "/"}
            className="inline-flex items-center justify-center bg-white text-black px-8 py-4 rounded-full font-black uppercase text-xs tracking-widest hover:scale-105 transition-transform"
          >
            {buttonText}
          </Link>
        )}
      </div>
    </section>
  );
}

function ImageTextSection({ section }: { section: Section }) {
  const { language } = useLanguage();
  const sectionRef = useRef<HTMLElement>(null);

  const heading = section.heading?.[language] || section.heading?.en || "";
  const text = section.text?.[language] || section.text?.en || [];

  useEffect(() => {
    gsap.fromTo(
      sectionRef.current,
      { opacity: 0, y: 40 },
      {
        opacity: 1,
        y: 0,
        duration: 1,
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top 80%",
        },
      }
    );
  }, []);

  return (
    <section
      ref={sectionRef}
      className={`py-24 px-6 md:px-16 border-b border-white/5 ${section.reversed ? "bg-white/2" : ""}`}
    >
      <div
        className={`max-w-7xl mx-auto flex flex-col ${
          section.reversed ? "lg:flex-row-reverse" : "lg:flex-row"
        } items-center gap-16`}
      >
        <div className="w-full lg:w-1/2">
          <div className="relative aspect-[16/10] rounded-[2.5rem] overflow-hidden border border-white/10 shadow-2xl">
            {section.image ? (
              <SanityImage asset={section.image} alt={heading} className="object-cover w-full h-full" />
            ) : (
              <div className="w-full h-full bg-[#131E2A] flex items-center justify-center">
                <Icons.Image className="w-12 h-12 text-gray-600" />
              </div>
            )}
          </div>
        </div>
        <div className="w-full lg:w-1/2 space-y-8">
          <h2 className="text-3xl md:text-5xl font-black tracking-tighter leading-tight uppercase italic text-white">
            {heading}
          </h2>
          <div className="text-gray-300 text-lg font-light leading-relaxed">
            <PortableTextRenderer value={text} />
          </div>
        </div>
      </div>
    </section>
  );
}

function CTASection({ section }: { section: Section }) {
  const { language } = useLanguage();
  const title = section.title?.[language] || section.title?.en || "";
  const subtitle = section.subtitle?.[language] || section.subtitle?.en || "";
  const buttonText = section.buttonText?.[language] || section.buttonText?.en || "";

  return (
    <section className="py-24 px-6">
      <div className="max-w-5xl mx-auto bg-gradient-to-br from-[#122332] to-[#0A1016] border border-white/10 p-12 md:p-20 rounded-[3rem] text-center relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 w-80 h-80 bg-green-500/10 rounded-full blur-[100px] pointer-events-none mix-blend-screen" />
        <h2 className="text-4xl md:text-6xl font-black mb-6 tracking-tight text-white uppercase italic">
          {title}
        </h2>
        {subtitle && (
          <p className="text-gray-400 text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed font-light">
            {subtitle}
          </p>
        )}
        {buttonText && (
          <Link
            href={section.link || "/contact"}
            className="inline-flex items-center justify-center bg-white text-black px-12 py-5 rounded-full font-black uppercase text-xs tracking-widest hover:scale-105 transition-all shadow-[0_0_20px_rgba(255,255,255,0.1)] hover:shadow-[0_0_30px_rgba(74,222,128,0.3)] duration-300"
          >
            {buttonText}
          </Link>
        )}
      </div>
    </section>
  );
}

function FeaturesSection({ section }: { section: Section }) {
  const { language } = useLanguage();
  const heading = section.blockHeading?.[language] || section.blockHeading?.en || "";
  const subheading = section.blockSubheading?.[language] || section.blockSubheading?.en || "";

  return (
    <section className="py-24 px-6 md:px-16 border-b border-white/5 bg-[#0C141D]/30">
      <div className="max-w-7xl mx-auto">
        {(heading || subheading) && (
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
            {heading && (
              <h2 className="text-3xl md:text-5xl font-black tracking-tight uppercase italic text-white">{heading}</h2>
            )}
            {subheading && (
              <p className="text-gray-400 text-lg md:text-xl font-light leading-relaxed">{subheading}</p>
            )}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {section.cards?.map((card, idx) => {
            const cardTitle = card.title?.[language] || card.title?.en || "";
            const cardDesc = card.description?.[language] || card.description?.en || "";
            // Resolve icon name from Lucide
            const IconComponent = card.icon && (Icons as any)[card.icon] ? (Icons as any)[card.icon] : Icons.HelpCircle;

            const CardContent = (
              <div className="group relative bg-[#131E2A]/70 border border-white/5 rounded-3xl p-8 h-full flex flex-col justify-between transition-all duration-500 hover:bg-[#192737] hover:border-white/20 hover:shadow-xl hover:-translate-y-1">
                <div className="space-y-6">
                  <div className="w-14 h-14 rounded-2xl bg-green-400/10 border border-green-400/20 flex items-center justify-center text-green-400 group-hover:bg-green-400 group-hover:text-black transition-colors duration-300">
                    <IconComponent className="w-6 h-6" />
                  </div>
                  <h3 className="text-2xl font-bold tracking-tight text-white group-hover:text-green-300 transition-colors duration-300">
                    {cardTitle}
                  </h3>
                  <p className="text-gray-400 font-light leading-relaxed text-base line-clamp-4">{cardDesc}</p>
                </div>
                {card.link && (
                  <div className="mt-8 flex items-center text-green-400 font-semibold group/btn text-sm">
                    Learn more
                    <Icons.ArrowRight className="w-4 h-4 ml-2 transform group-hover/btn:translate-x-1 transition-transform" />
                  </div>
                )}
              </div>
            );

            return card.link ? (
              <Link key={idx} href={card.link} className="block h-full">
                {CardContent}
              </Link>
            ) : (
              <div key={idx} className="h-full">
                {CardContent}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function RichTextBlock({ section }: { section: Section }) {
  const { language } = useLanguage();
  const heading = section.heading?.[language] || section.heading?.en || "";
  const body = section.body?.[language] || section.body?.en || [];

  return (
    <section className="py-20 px-6 md:px-16 max-w-4xl mx-auto">
      {heading && (
        <h2 className="text-3xl md:text-5xl font-black mb-12 tracking-tight uppercase italic text-center">
          {heading}
        </h2>
      )}
      <div className="text-gray-300 font-light leading-relaxed">
        <PortableTextRenderer value={body} />
      </div>
    </section>
  );
}

function EmbeddedMediaSection({ section }: { section: Section }) {
  const { language } = useLanguage();
  const title = section.title?.[language] || section.title?.en || "";
  const caption = section.caption?.[language] || section.caption?.en || "";

  if (!section.mediaUrl) return null;

  // Render responsive iframe wrapper for Youtube/Vimeo/etc.
  return (
    <section className="py-20 px-6 max-w-5xl mx-auto text-center space-y-8">
      {title && <h2 className="text-2xl md:text-4xl font-black uppercase italic text-white">{title}</h2>}
      <div className="relative aspect-video rounded-[2.5rem] overflow-hidden border border-white/10 shadow-2xl bg-[#0F1722]">
        <iframe
          src={getEmbedUrl(section.mediaUrl)}
          title={title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="absolute inset-0 w-full h-full border-0"
        />
      </div>
      {caption && <p className="text-gray-400 text-sm font-light italic max-w-3xl mx-auto">{caption}</p>}
    </section>
  );
}

// Simple embed helper
function getEmbedUrl(url: string) {
  if (url.includes("youtube.com/watch")) {
    const videoId = new URL(url).searchParams.get("v");
    return `https://www.youtube.com/embed/${videoId}`;
  }
  if (url.includes("youtu.be")) {
    const videoId = url.split("/").pop()?.split("?")[0];
    return `https://www.youtube.com/embed/${videoId}`;
  }
  if (url.includes("vimeo.com")) {
    const videoId = url.split("/").pop();
    return `https://player.vimeo.com/video/${videoId}`;
  }
  return url;
}
