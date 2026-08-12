"use client";
import { useEffect, useRef } from "react";
import { useLivingSystemsContent } from "@/hooks/useServicePillarContent";
import HeroSection from "@/components/living_systems/HeroSection";
import WhatWeOfferSection from "@/components/shared/WhatWeOfferSection";
import HowWeWorkSection from "@/components/shared/HowWeWorkSection";
import NetworkAdvantageSection from "@/components/shared/NetworkAdvantageSection";
import DigitalSolutionsSection from "@/components/shared/DigitalSolutionsSection";
import CaseExampleSection from "@/components/shared/CaseExampleSection";
import FinalCTASection from "@/components/living_systems/FinalCTASection";
import { getRichTextContent } from "@/lib/rich-text-utils";
import { useLanguage } from "@/app/components/LanguageProvider";
import Skeleton from "@/components/ui/Skeleton";
import { SkeletonCardGrid } from "@/components/ui/SkeletonPresets";

export default function LivingSystemsPage() {
  const { t, language, interpolate } = useLanguage();
  const { content, loading, error } = useLivingSystemsContent();
  const sectionsRef = useRef<(HTMLDivElement | null)[]>([]);

  // Add logging to see what content is received
  useEffect(() => {
    console.log('📊 Living Systems Page - Content State:', { content, loading, error });
    if (content) {
      console.log('📊 Living Systems Page - Hero Title:', content.hero_title);
      console.log('📊 Living Systems Page - Hero Subtitle:', content.hero_subtitle);
      console.log('📊 Living Systems Page - Services Title:', content.services_title);
    }
  }, [content, loading, error]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('animate-slide-in');
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -30px 0px' }
    );

    sectionsRef.current.forEach((section) => {
      if (section) observer.observe(section);
    });

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (content) {
      document.title = interpolate(getRichTextContent(content.meta_title, language) || getRichTextContent(content.hero_title, language));
      const metaDescription = document.querySelector('meta[name="description"]');
      if (metaDescription && content.meta_description) {
        metaDescription.setAttribute('content', interpolate(getRichTextContent(content.meta_description, language)));
      }
    }
  }, [content, language, interpolate]);

  if (loading) {
    return (
      <div className="min-h-screen py-12 px-6 max-w-6xl mx-auto">
        <div className="flex flex-col items-center gap-4 mb-16">
          <Skeleton className="h-12 w-2/3 max-w-xl" />
          <Skeleton className="h-5 w-1/2 max-w-md" />
          <Skeleton className="h-5 w-1/3 max-w-sm" />
        </div>
        <Skeleton className="h-64 w-full rounded-2xl mb-16" />
        <SkeletonCardGrid count={3} />
        <Skeleton className="h-48 w-full rounded-2xl mt-16" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">{t.services.errorLoading}</h1>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12 relative overflow-hidden z-20">
      <style jsx>{`
        .animate-slide-in {
          animation: slideIn 0.6s ease-out forwards;
        }
        
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .section-animate {
          opacity: 1;
          transform: translateY(0);
        }
      `}</style>
      <div ref={el => { sectionsRef.current[0] = el; }} className="section-animate">
        <HeroSection
          title={getRichTextContent(content?.hero_title, language) || interpolate(t.services.livingHeroTitle)}
          subtitle={getRichTextContent(content?.hero_subtitle, language) || interpolate(t.services.heroSubtitle)}
          description={getRichTextContent(content?.hero_description, language) || ""}
          image={content?.hero_image}
        />
      </div>
      <div ref={el => { sectionsRef.current[1] = el; }} className="section-animate">
        <WhatWeOfferSection
          title={getRichTextContent(content?.services_title, language) || interpolate(t.services.whatWeOffer)}
          offers={[
            {
              title: getRichTextContent(content?.service_1_title, language) || "",
              description: getRichTextContent(content?.service_1_description, language) || "",
              icon: "M17 8C8 10 5.9 16.17 3.82 21.34L5.71 22L6.66 19.7C7.14 19.87 7.64 20 8 20C19 20 22 3 22 3C21 5 14 5.25 9 6.25C4 7.25 2 11.5 2 13.5C2 15.5 3.75 17.25 3.75 17.25C7.5 13.5 12.5 13.5 15.5 13.5C15.5 13.5 16 13.75 16 14.25C16 14.75 15.5 15 15.5 15C12.5 15 7.5 15 3.75 18.75C3.75 18.75 5.25 20.5 8 20.5C11.5 20.5 17 16 17 8Z"
            },
            {
              title: getRichTextContent(content?.service_2_title, language) || "",
              description: getRichTextContent(content?.service_2_description, language) || "",
              icon: "M12 2L13.09 8.26L22 9L13.09 9.74L12 16L10.91 9.74L2 9L10.91 8.26L12 2Z"
            },
            {
              title: getRichTextContent(content?.service_3_title, language) || "",
              description: getRichTextContent(content?.service_3_description, language) || "",
              icon: "M6.05 8.05C6.05 6.05 7.86 4.05 10.92 4.05S15.8 6.05 15.95 8.05C16.05 8.05 16.05 8.05 16.05 8.05C18.05 8.05 19.95 9.76 19.95 12.05S18.05 16.05 16.05 16.05H6.05C3.76 16.05 2.05 14.05 2.05 12.05S3.76 8.05 6.05 8.05M14.95 11.05L11.95 8.05L8.95 11.05H11.05V14.05H12.95V11.05H14.95Z"
            }
          ]}
        />
      </div>
      <div ref={el => { sectionsRef.current[2] = el; }} className="section-animate">
        <HowWeWorkSection
          title={getRichTextContent(content?.process_title, language) || interpolate(t.services.howWeWork)}
          subtitle={interpolate(t.services.observeDesignRegenerate)}
          description={getRichTextContent(content?.process_description, language) || interpolate(t.services.livingDescription)}
          sections={[
            {
              title: interpolate(t.services.livingStep1),
              content: [
                interpolate(t.services.livingStep1_c1 || "We begin with comprehensive site assessment and system analysis to understand current ecological conditions, resource flows, and regenerative potential."),
                interpolate(t.services.livingStep1_c2 || "Our team conducts detailed ecological surveys, soil health assessments, biodiversity inventories, and water system evaluations."),
                interpolate(t.services.livingStep1_c3 || "We analyze existing land use patterns, identify degraded areas, and assess opportunities for restoration and regeneration."),
                interpolate(t.services.livingStep1_c4 || "Following assessment, we develop a detailed regeneration report mapping current conditions and restoration opportunities."),
                interpolate(t.services.livingStep1_c5 || "We engage specialists from our network - ecologists, soil scientists, hydrologists - to validate findings and recommendations."),
                interpolate(t.services.livingStep1_c6 || "A review meeting presents findings, addresses questions, and refines recommendations based on your feedback and priorities."),
                interpolate(t.services.livingStep1_c7 || "The final report provides actionable insights and proposes a clear regeneration roadmap with immediate and long-term strategies.")
              ]
            },
            {
              title: interpolate(t.services.livingStep2),
              content: [
                interpolate(t.services.livingStep2_c1 || "Once you receive the regeneration report, you choose your path forward:"),
                interpolate(t.services.livingStep2_c2 || "• Use the report independently to guide internal regeneration efforts"),
                interpolate(t.services.livingStep2_c3 || "• Engage ORR for ongoing implementation support through tailored partnership")
              ]
            },
            {
              title: interpolate(t.services.livingStep3),
              content: [
                interpolate(t.services.livingStep3_c1 || "For ongoing partnerships, we move into implementation and stewardship phases."),
                interpolate(t.services.livingStep3_c2 || "We execute regenerative solutions, build ecological infrastructure, and establish monitoring systems."),
                interpolate(t.services.livingStep3_c3 || "Continuous monitoring ensures regenerative systems create lasting positive impact and adapt to changing conditions."),
                interpolate(t.services.livingStep3_c4 || "We provide ongoing support for system evolution, helping you scale successful interventions and refine approaches based on results.")
              ]
            }
          ]}
          layout="grid"
        />
      </div>
      <div ref={el => { sectionsRef.current[3] = el; }} className="section-animate">
        <NetworkAdvantageSection
          title={interpolate(t.services.networkAdvantage)}
          description={interpolate(t.services.networkLivingDescription)}
          networkCards={[
            {
              title: interpolate(t.services.ecolScientists || "Ecological Scientists"),
              description: interpolate(t.services.ecolDescription || "Ecosystem ecologists and biodiversity conservation specialists working to restore natural systems."),
              icon: "M6.05 8.05C6.05 6.05 7.86 4.05 10.92 4.05S15.8 6.05 15.95 8.05C16.05 8.05 16.05 8.05 16.05 8.05C18.05 8.05 19.95 9.76 19.95 12.05S18.05 16.05 16.05 16.05H6.05C3.76 16.05 2.05 14.05 2.05 12.05S3.76 8.05 6.05 8.05M14.95 11.05L11.95 8.05L8.95 11.05H11.05V14.05H12.95V11.05H14.95Z"
            },
            {
              title: interpolate(t.services.regenAgriExperts || "Regenerative Agriculture Experts"),
              description: interpolate(t.services.regenAgriDescription || "Soil scientists and sustainable farming practitioners implementing regenerative practices."),
              icon: "M17 8C8 10 5.9 16.17 3.82 21.34L5.71 22L6.66 19.7C7.14 19.87 7.64 20 8 20C19 20 22 3 22 3C21 5 14 5.25 9 6.25C4 7.25 2 11.5 2 13.5C2 15.5 3.75 17.25 3.75 17.25C7.5 13.5 12.5 13.5 15.5 13.5C15.5 13.5 16 13.75 16 14.25C16 14.75 15.5 15 15.5 15C12.5 15 7.5 15 3.75 18.75C3.75 18.75 5.25 20.5 8 20.5C11.5 20.5 17 16 17 8Z"
            },
            {
              title: interpolate(t.services.circularEconomyDesigners || "Circular Economy Designers"),
              description: interpolate(t.services.circularDescription || "Systems thinkers and waste-to-resource specialists creating circular solutions."),
              icon: "M12 2L13.09 8.26L22 9L13.09 9.74L12 16L10.91 9.74L2 9L10.91 8.26L12 2Z"
            },
            {
              title: interpolate(t.services.consBiologists || "Conservation Biologists"),
              description: interpolate(t.services.consDescription || "Wildlife conservation and habitat restoration experts protecting biodiversity."),
              icon: "M9.5 3A6.5 6.5 0 0 1 16 9.5C16 11.11 15.41 12.59 14.44 13.73L14.71 14H16L21 19L19 21L14 16V14.71L13.73 14.44C12.59 15.41 11.11 16 9.5 16A6.5 6.5 0 0 1 3 9.5A6.5 6.5 0 0 1 9.5 3M9.5 5C7 5 5 7 5 9.5S7 14 9.5 14 14 12 14 9.5 12 5 9.5 5Z"
            },
            {
              title: interpolate(t.services.blueEconomySpecialists || "Blue Economy Specialists"),
              description: interpolate(t.services.blueDescription || "Marine and coastal ecosystem experts developing sustainable ocean-based solutions."),
              icon: "M12 2C13.1 2 14 2.9 14 4C14 5.1 13.1 6 12 6C10.9 6 10 5.1 10 4C10 2.9 10.9 2 12 2M21 9V7L15 1L13.5 2.5L16.17 5.23L10.23 11.17C9.64 11.76 9 12 8 12S7.36 11.76 6.77 11.17L2 6.4L0.6 7.8L5.37 12.57C6.36 13.56 7.64 14 9 14S11.64 13.56 12.63 12.57L18.77 6.43L21.5 9.17L23 7.67L21 9Z"
            }
          ]}
        />
      </div>
      <div ref={el => { sectionsRef.current[4] = el; }} className="section-animate">
        <DigitalSolutionsSection
          title={interpolate(t.services.digitalSolutions)}
          subtitle={interpolate(t.services.digitalSubtitle2)}
          description={interpolate(t.services.digitalLivingDescription)}
          imageAlt={interpolate(t.services.digitalLivingImageAlt || "Tools and structures for regenerative systems")}
          whoIsThisFor={[
            interpolate(t.services.whoLiving1 || "Agricultural businesses transitioning to regenerative and sustainable farming practices"),
            interpolate(t.services.whoLiving2 || "Companies seeking to implement circular economy principles and eliminate waste"),
            interpolate(t.services.whoLiving3 || "Organizations committed to biodiversity conservation and ecosystem restoration"),
            interpolate(t.services.whoLiving4 || "Businesses looking to achieve carbon neutrality through natural climate solutions"),
            interpolate(t.services.whoLiving5 || "Companies wanting to build resilient supply chains based on regenerative practices"),
            interpolate(t.services.whoLiving6 || "Organizations seeking to create positive environmental impact while building economic value")
          ]}
          features={[
            interpolate(t.services.featLiving1 || "Ecosystem monitoring platforms with biodiversity tracking and health indicators"),
            interpolate(t.services.featLiving2 || "Carbon sequestration measurement and verification systems with MRV protocols"),
            interpolate(t.services.featLiving3 || "Regenerative agriculture management platforms with soil health monitoring"),
            interpolate(t.services.featLiving4 || "Circular economy tracking systems with material flow analysis"),
            interpolate(t.services.featLiving5 || "Biodiversity impact assessment tools with species monitoring"),
            interpolate(t.services.featLiving6 || "Sustainable supply chain traceability platforms"),
            interpolate(t.services.featLiving7 || "Natural capital accounting and valuation systems"),
            interpolate(t.services.featLiving8 || "Regenerative impact reporting and certification workflows")
          ]}
        />
      </div>
      <div ref={el => { sectionsRef.current[5] = el; }} className="section-animate">
        <CaseExampleSection
          caseExample={{
            challenge: getRichTextContent(content?.case_challenge, language) || interpolate(t.services.caseLivingChallenge || "A large agricultural cooperative was facing declining soil health, reduced biodiversity, and increasing input costs from conventional farming practices. Climate change was creating additional stress on their operations, with unpredictable weather patterns affecting yields."),
            solution: getRichTextContent(content?.case_solution, language) || interpolate(t.services.caseLivingSolution || "ORR conducted a comprehensive ecological assessment of the cooperative's land and operations. We delivered a detailed regeneration report that outlined soil restoration strategies, biodiversity enhancement plans, and carbon sequestration opportunities."),
            result: getRichTextContent(content?.case_result, language) || interpolate(t.services.caseLivingResult || "Following ORR's regenerative agriculture plan, the cooperative implemented soil-building practices that increased organic matter by 40% within two years. Input costs decreased by 30% as soil health improved and natural pest management systems developed.")
          }}
          imageAlt={getRichTextContent(content?.case_image_alt, language) || interpolate(t.services.caseLivingImageAlt || "Regenerative farm with diverse crops and healthy soil")}
        />
      </div>
      <div ref={el => { sectionsRef.current[6] = el; }} className="section-animate">
        <FinalCTASection
          title={getRichTextContent(content?.cta_title, language) || ""}
          description={getRichTextContent(content?.cta_description, language) || ""}
          buttonText={getRichTextContent(content?.cta_button_text, language) || ""}
        />
      </div>
    </div>
  )
}