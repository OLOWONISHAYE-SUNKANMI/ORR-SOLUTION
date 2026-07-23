"use client"
import { useEffect, useRef, useState } from "react";
import axios from "axios";
import Spinner from "../../../components/ui/Spinner";
import { getRichTextContent, getRichTextHTML } from "../../../lib/rich-text-utils";
import Link from "next/link";
import { useLanguage } from "../../components/LanguageProvider";
import { useCachedData } from "../../../hooks/useCachedData";

interface ProcessStep {
  id: number;
  step_number: string;
  title: any;
  subtitle?: any;
  description?: any;
  bullet1?: any;
  bullet2?: any;
  bullet3?: any;
  bullet4?: any;
  bullet5?: any;
  bullet6?: any;
  bullet7?: any;
  bullet8?: any;
  bullet9?: any;
  wordbreak?: any;
  description1?: any;
  description2?: any;
  description3?: any;
  description4?: any;
  image_url: string;
  button_text?: any;
  button_text2?: any;
  button_text3?: any;
  order: number;
  is_active: boolean;
}

interface PageData {
  id: number;
  hero_title: any;
  meta_title?: any;
  meta_description?: any;
  is_active: boolean;
}

interface HowWeOperateData {
  page: PageData;
  steps: ProcessStep[];
}



const processData = (data: any) => data;

export default function StickyScrollSplit() {
  const { t, language, interpolate } = useLanguage();
  const [activeIndex, setActiveIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const { data, loading } = useCachedData<HowWeOperateData>(
    `orr_how_we_operate_content_${language}`,
    `${process.env.NEXT_PUBLIC_API_URL || 'https://orr-backend-105825824472.asia-southeast2.run.app'}/admin-portal/v1/cms/how-we-operate/?lang=${language}`,
    (data) => data
  );

  useEffect(() => {
    const handleScroll = () => {
      if (!containerRef.current) return;

      const sections = containerRef.current.querySelectorAll('.card-section');
      const scrollPosition = window.scrollY + window.innerHeight / 2;

      sections.forEach((section, index: number) => {
        const htmlSection = section as HTMLElement;
        const sectionTop = htmlSection.offsetTop;
        const sectionBottom = sectionTop + htmlSection.offsetHeight;

        if (scrollPosition >= sectionTop && scrollPosition < sectionBottom) {
          setActiveIndex(index);
        }
      });
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll();

    return () => window.removeEventListener('scroll', handleScroll);
  }, [data]);

  if (loading) {
    return <Spinner />;
  }

  if (!data) {
    return <Spinner />;
  }

  return (
    <div className="min-h-screen bg-background transition-colors duration-300">
      {/* Hero Section */}
      <div className="relative w-full py-20 pt-32 text-foreground">
        <div className="max-w-6xl mx-auto px-6 md:px-12 lg:px-24">
          <h1 className="text-center text-primary text-5xl md:text-6xl font-bold mb-12">
            <span dangerouslySetInnerHTML={{ __html: getRichTextContent(data.page.hero_title, language) || interpolate(t.howWeOperate.heroTitle) }} />
          </h1>
        </div>
      </div>

      {/* Split Layout Section */}
      <div ref={containerRef} className="relative mt-90 lg:mt-0 max-w-7xl mx-auto px-6 md:px-12 lg:px-24 pb-20 overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-12">
          {/* Left Side - Stacking Cards */}
          <div>
            {data.steps.map((card, index) => (
              <div
                key={card.id}
                className="card-section"
                style={{
                  height: '100vh',
                  position: 'sticky',
                  top: `${24 + index * 2}px`,
                  zIndex: index + 1
                }}
              >
                <div
                  className="bg-card backdrop-blur-xl rounded-2xl lg:rounded-3xl p-4 sm:p-6 md:p-8 lg:p-10 w-full transition-all duration-700 ease-out"
                  style={{
                    transform: activeIndex === index
                      ? 'scale(1) rotateY(0deg)'
                      : activeIndex > index
                        ? `scale(${0.95 - (activeIndex - index) * 0.03}) rotateY(-2deg)`
                        : 'scale(0.98) rotateY(2deg)',
                    opacity: 1,
                    boxShadow: activeIndex === index
                      ? '0 25px 50px rgba(16, 185, 129, 0.4), 0 0 0 1px rgba(16, 185, 129, 0.1)'
                      : '0 10px 30px rgba(0, 0, 0, 0.3)'
                  }}
                >
                  <div className="flex items-center justify-between mb-6">
                    <div className="w-16 h-16 bg-slate-600 rounded-full flex items-center justify-center text-white font-bold text-xl">
                      <span dangerouslySetInnerHTML={{ __html: getRichTextContent(card.step_number, language) }} />
                    </div>
                    <div className="w-12 h-12 bg-emerald-500 rounded-full flex items-center justify-center">
                      <span className="text-white font-bold text-2xl">+</span>
                    </div>
                  </div>

                  <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground mb-3">
                    <span dangerouslySetInnerHTML={{ __html: getRichTextContent(card.title, language) }} />
                  </h2>

                  {card.subtitle && (
                    <h3 className="text-base sm:text-lg font-semibold text-primary mb-4">
                      <span dangerouslySetInnerHTML={{ __html: getRichTextContent(card.subtitle, language) }} />
                    </h3>
                  )}

                  {card.description && (
                    <p className="text-sm sm:text-base text-foreground mb-4">
                      <span dangerouslySetInnerHTML={{ __html: getRichTextContent(card.description, language) }} />
                    </p>
                  )}

                  <div className="space-y-2">
                    {card.bullet1 && <p className="opacity-80 text-sm sm:text-base"><span dangerouslySetInnerHTML={{ __html: getRichTextContent(card.bullet1, language) }} /></p>}
                    {card.bullet2 && <p className="opacity-80 text-sm sm:text-base"><span dangerouslySetInnerHTML={{ __html: getRichTextContent(card.bullet2, language) }} /></p>}
                    {card.wordbreak && <p className="text-foreground text-base sm:text-lg font-bold text-center my-4"><span dangerouslySetInnerHTML={{ __html: getRichTextContent(card.wordbreak, language) }} /></p>}
                    {card.bullet3 && <p className="opacity-80 text-sm sm:text-base"><span dangerouslySetInnerHTML={{ __html: getRichTextContent(card.bullet3, language) }} /></p>}
                    {card.bullet4 && <p className="opacity-80 text-sm sm:text-base"><span dangerouslySetInnerHTML={{ __html: getRichTextContent(card.bullet4, language) }} /></p>}
                    {card.bullet5 && <p className="opacity-80 text-sm sm:text-base"><span dangerouslySetInnerHTML={{ __html: getRichTextContent(card.bullet5, language) }} /></p>}
                    {card.bullet6 && <p className="opacity-80 text-sm sm:text-base"><span dangerouslySetInnerHTML={{ __html: getRichTextContent(card.bullet6, language) }} /></p>}
                    {card.bullet7 && <p className="opacity-80 text-sm sm:text-base"><span dangerouslySetInnerHTML={{ __html: getRichTextContent(card.bullet7, language) }} /></p>}
                    {card.bullet8 && <p className="opacity-80 text-sm sm:text-base"><span dangerouslySetInnerHTML={{ __html: getRichTextContent(card.bullet8, language) }} /></p>}
                    {card.bullet9 && <p className="opacity-80 text-sm sm:text-base"><span dangerouslySetInnerHTML={{ __html: getRichTextContent(card.bullet9, language) }} /></p>}
                  </div>

                  {card.description1 && <p className="opacity-80 text-sm sm:text-base mt-4"><span dangerouslySetInnerHTML={{ __html: getRichTextContent(card.description1, language) }} /></p>}
                  {card.description2 && <p className="opacity-80 text-sm sm:text-base mt-2"><span dangerouslySetInnerHTML={{ __html: getRichTextContent(card.description2, language) }} /></p>}
                  {card.description3 && <p className="opacity-80 text-sm sm:text-base mt-2"><span dangerouslySetInnerHTML={{ __html: getRichTextContent(card.description3, language) }} /></p>}
                  {card.description4 && <p className="opacity-80 text-sm sm:text-base mt-2"><span dangerouslySetInnerHTML={{ __html: getRichTextContent(card.description4, language) }} /></p>}

                  {index === 9 && card.button_text && (
                    <div className="flex flex-col gap-3 mt-6">
                      <Link href='/contact' className="bg-emerald-400 text-black px-6 text-center sm:px-8 py-2 sm:py-3 rounded-full font-semibold  cursor-pointer hover:bg-emerald-300 transition-all hover:scale-105 text-sm sm:text-base">
                        <span dangerouslySetInnerHTML={{ __html: getRichTextContent(card.button_text, language) }} />
                      </Link>
                      {card.button_text2 && (
                        <Link href='/services' className="border border-emerald-400  text-center text-primary px-6 sm:px-8 py-2 sm:py-3 rounded-full cursor-pointer font-semibold hover:bg-emerald-400 hover:text-black transition-all hover:scale-105 text-sm sm:text-base">
                          <span dangerouslySetInnerHTML={{ __html: getRichTextContent(card.button_text2, language) }} />
                        </Link>
                      )}
                      {card.button_text3 && (
                        <Link href='/login' className="border border-emerald-400 text-center text-primary px-6 sm:px-8 py-2 sm:py-3 rounded-full cursor-pointer font-semibold hover:bg-emerald-400 hover:text-black transition-all hover:scale-105 text-sm sm:text-base">
                          <span dangerouslySetInnerHTML={{ __html: getRichTextContent(card.button_text3, language) }} />
                        </Link>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Right Side - Fixed Image */}
          <div className="block static">
            <div className="fixed top-52 left-1/2 transform -translate-x-1/2 lg:top-58 lg:left-1/2 lg:transform lg:-translate-x-1/2 w-[85%] sm:w-[80%] lg:w-[75%] max-w-[500px] sm:max-w-[600px] lg:max-w-[900px] h-[45vh] sm:h-[45vh] lg:h-[calc(75vh-3rem)] z-0">
              <div className="w-full h-full flex items-center">
                <div className="relative w-full h-full rounded-xl lg:rounded-3xl overflow-hidden shadow-2xl">
                  <img
                    key={activeIndex}
                    src={data.steps[activeIndex]?.image_url}
                    alt={getRichTextContent(data.steps[activeIndex]?.title)}
                    className="w-full h-full object-cover transition-all duration-1000 ease-out"
                    style={{
                      transform: 'scale(1.05)',
                      animation: `imageAnim${activeIndex % 5} 1s ease-out`
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/70 to-transparent" />
                  <div className="absolute bottom-2 lg:bottom-8 left-2 lg:left-8 right-2 lg:right-8">
                    <div className="text-primary text-sm lg:text-xl font-bold mb-1 lg:mb-2">
                      <span dangerouslySetInnerHTML={{ __html: getRichTextContent(data.steps[activeIndex]?.step_number, language) }} />
                    </div>
                    <div className="text-foreground text-sm lg:text-2xl xl:text-3xl font-bold">
                      <span dangerouslySetInnerHTML={{ __html: getRichTextContent(data.steps[activeIndex]?.title, language) }} />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes imageAnim0 {
          0% { opacity: 0; transform: scale(1.2) translateX(30px); filter: blur(6px); }
          100% { opacity: 1; transform: scale(1.05) translateX(0px); filter: blur(0px); }
        }
        @keyframes imageAnim1 {
          0% { opacity: 0; transform: scale(0.8) translateY(-30px) rotate(5deg); filter: brightness(0.5); }
          100% { opacity: 1; transform: scale(1.05) translateY(0px) rotate(0deg); filter: brightness(1); }
        }
        @keyframes imageAnim2 {
          0% { opacity: 0; transform: scale(1.1) translateX(-40px) skewX(10deg); filter: saturate(0); }
          100% { opacity: 1; transform: scale(1.05) translateX(0px) skewX(0deg); filter: saturate(1); }
        }
        @keyframes imageAnim3 {
          0% { opacity: 0; transform: scale(0.9) translateY(40px) rotateX(20deg); filter: contrast(0.3); }
          100% { opacity: 1; transform: scale(1.05) translateY(0px) rotateX(0deg); filter: contrast(1); }
        }
        @keyframes imageAnim4 {
          0% { opacity: 0; transform: scale(1.3) translate(-20px, 20px) rotateZ(-3deg); filter: hue-rotate(180deg); }
          100% { opacity: 1; transform: scale(1.05) translate(0px, 0px) rotateZ(0deg); filter: hue-rotate(0deg); }
        }
      `}</style>
    </div>
  );
}