"use client";
import { useEffect, useRef } from "react";
import { useStrategicAdvisoryContent } from "@/hooks/useServicePillarContent";
import HeroSection from "@/components/strategy_advisory/HeroSection";
import WhatWeOfferSection from "@/components/shared/WhatWeOfferSection";
import HowWeWorkSection from "@/components/shared/HowWeWorkSection";
import NetworkAdvantageSection from "@/components/shared/NetworkAdvantageSection";
import DigitalSolutionsSection from "@/components/shared/DigitalSolutionsSection";
import CaseExampleSection from "@/components/shared/CaseExampleSection";
import FinalCTASection from "@/components/strategy_advisory/FinalCTASection";
import { getRichTextContent } from "@/lib/rich-text-utils";
import { useLanguage } from "@/app/components/LanguageProvider";
import Skeleton from "@/components/ui/Skeleton";
import { SkeletonCardGrid } from "@/components/ui/SkeletonPresets";

export default function StrategyAdvisoryPage() {
  const { t, language, interpolate } = useLanguage();
  const { content, loading, error } = useStrategicAdvisoryContent();
  const sectionsRef = useRef<(HTMLDivElement | null)[]>([]);

  // Add logging to see what content is received
  useEffect(() => {
    console.log('📊 Strategic Advisory Page - Content State:', { content, loading, error });
    if (content) {
      console.log('📊 Strategic Advisory Page - Hero Title:', content.hero_title);
      console.log('📊 Strategic Advisory Page - Hero Subtitle:', content.hero_subtitle);
      console.log('📊 Strategic Advisory Page - Services Title:', content.services_title);
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

  // Set page title and meta description from CMS
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
          title={getRichTextContent(content?.hero_title, language) || interpolate(t.services.strategicHeroTitle)}
          subtitle={getRichTextContent(content?.hero_subtitle, language) || interpolate(t.services.heroSubtitle)}
          description={getRichTextContent(content?.hero_description, language) || ""}
          image={content?.hero_image || ""}
        />
      </div>
      <div ref={el => { sectionsRef.current[1] = el; }} className="section-animate">
        <WhatWeOfferSection
          title={getRichTextContent(content?.services_title, language) || interpolate(t.services.whatWeOffer)}
          offers={[
            {
              title: getRichTextContent(content?.service_1_title, language) || "",
              description: getRichTextContent(content?.service_1_description, language) || "",
              icon: "M12 3L1 9L12 15L21 12.35V17H23V9M5 13.18V17.18L12 21L19 17.18V13.18L12 17L5 13.18Z"
            },
            {
              title: getRichTextContent(content?.service_2_title, language) || "",
              description: getRichTextContent(content?.service_2_description, language) || "",
              icon: "M17 8C8 10 5.9 16.17 3.82 21.34L5.71 22L6.66 19.7C7.14 19.87 7.64 20 8 20C19 20 22 3 22 3C21 5 14 5.25 9 6.25C4 7.25 2 11.5 2 13.5C2 15.5 3.75 17.25 3.75 17.25C7.5 13.5 12.5 13.5 15.5 13.5C15.5 13.5 16 13.75 16 14.25C16 14.75 15.5 15 15.5 15C12.5 15 7.5 15 3.75 18.75C3.75 18.75 5.25 20.5 8 20.5C11.5 20.5 17 16 17 8Z"
            },
            {
              title: getRichTextContent(content?.service_3_title, language) || "",
              description: getRichTextContent(content?.service_3_description, language) || "",
              icon: "M9.5 3A6.5 6.5 0 0 1 16 9.5C16 11.11 15.41 12.59 14.44 13.73L14.71 14H16L21 19L19 21L14 16V14.71L13.73 14.44C12.59 15.41 11.11 16 9.5 16A6.5 6.5 0 0 1 3 9.5A6.5 6.5 0 0 1 9.5 3M9.5 5C7 5 5 7 5 9.5S7 14 9.5 14 14 12 14 9.5 12 5 9.5 5Z"
            }
          ]}
        />
      </div>
      <div ref={el => { sectionsRef.current[2] = el; }} className="section-animate">
        <HowWeWorkSection
          title={getRichTextContent(content?.process_title, language) || interpolate(t.services.howWeWork || "Our Strategic Process")}
          subtitle={getRichTextContent(content?.process_subtitle, language) || ""}
          description={getRichTextContent(content?.process_description, language) || ""}
          sections={[
            {
              title: language === 'it' ? "Ascolta e Segnala (Scoperta del Sito e del Sistema)" : "Listen & Report (Site & System Discovery)",
              content: language === 'it' ? [
                "Iniziamo con una valutazione completa del sito e un'analisi del sistema per comprendere le attuali condizioni ecologiche, i flussi di risorse e il potenziale rigenerativo.",
                "Il nostro team conduce indagini ecologiche dettagliate, valutazioni della salute del suolo, inventari della biodiversità e valutazioni dei sistemi idrici.",
                "Analizziamo i modelli di utilizzo del suolo esistenti, identifichiamo le aree degradate e valutiamo le opportunità di ripristino e rigenerazione.",
                "A seguito della valutazione, sviluppiamo un rapporto di rigenerazione dettagliato che mappa le condizioni attuali e le opportunità di ripristino.",
                "Coinvolgiamo specialisti della nostra rete - ecologisti, scienziati del suolo, idrologi - per convalidare scoperte e raccomandazioni.",
                "Un incontro di revisione presenta i risultati, affronta le domande e perfeziona le raccomandazioni in base ai tuoi feedback e alle tue priorità.",
                "Il rapporto finale fornisce approfondimenti attuabili e propone una chiara tabella di marcia per la rigenerazione con strategie immediate e a lungo termine."
              ] : [
                "We begin with comprehensive site assessment and system analysis to understand current ecological conditions, resource flows, and regenerative potential.",
                "Our team conducts detailed ecological surveys, soil health assessments, biodiversity inventories, and water system evaluations.",
                "We analyze existing land use patterns, identify degraded areas, and assess opportunities for restoration and regeneration.",
                "Following assessment, we develop a detailed regeneration report mapping current conditions and restoration opportunities.",
                "We engage specialists from our network - ecologists, soil scientists, hydrologists - to validate findings and recommendations.",
                "A review meeting presents findings, addresses questions, and refines recommendations based on your feedback and priorities.",
                "The final report provides actionable insights and proposes a clear regeneration roadmap with immediate and long-term strategies."
              ]
            },
            {
              title: language === 'it' ? "Decidi: Documento o Partnership" : "Decide: Document or Partnership",
              content: language === 'it' ? [
                "Una volta ricevuto il rapporto di rigenerazione, scegli il tuo percorso:",
                "• Usa il rapporto in modo indipendente per guidare gli sforzi di rigenerazione interna",
                "• Coinvolgi ORR per un supporto continuo all'implementazione attraverso una partnership su misura"
              ] : [
                "Once you receive the regeneration report, you choose your path forward:",
                "• Use the report independently to guide internal regeneration efforts",
                "• Engage ORR for ongoing implementation support through tailored partnership"
              ]
            },
            {
              title: language === 'it' ? "Gestisci ed Evolvi (Per i Clienti che Continuano)" : "Steward & Evolve (For Clients Who Continue)",
              content: language === 'it' ? [
                "Per le partnership in corso, passiamo alle fasi di implementazione e gestione.",
                "Eseguiamo soluzioni rigenerative, costruiamo infrastrutture ecologiche e stabiliamo sistemi di monitoraggio.",
                "Il monitoraggio continuo assicura che i sistemi rigenerativi creino un impatto positivo duraturo e si adattino alle mutevoli condizioni.",
                "Forniamo supporto continuo per l'evoluzione del sistema, aiutandoti a scalare interventi di successo e affinare gli approcci basati sui risultati."
              ] : [
                "For ongoing partnerships, we move into implementation and stewardship phases.",
                "We execute regenerative solutions, build ecological infrastructure, and establish monitoring systems.",
                "Continuous monitoring ensures regenerative systems create lasting positive impact and adapt to changing conditions.",
                "We provide ongoing support for system evolution, helping you scale successful interventions and refine approaches based on results."
              ]
            }
          ]}
          layout="grid"
        />
      </div>
      <div ref={el => { sectionsRef.current[3] = el; }} className="section-animate">
        <NetworkAdvantageSection
          title={getRichTextContent(content?.network_title, language) || interpolate(t.services.networkAdvantage || "The ORR Network Advantage")}
          description={getRichTextContent(content?.network_description, language) || "Complex compliance challenges require diverse expertise. We activate global specialists to deliver results."}
          networkCards={[
            {
              title: interpolate(t.services.legalRegistry || "Legal & Regulatory Experts"),
              description: interpolate(t.services.legalDesc || "Specialized attorneys and compliance professionals across multiple jurisdictions"),
              icon: "M12 3c-1.1 0-2 .9-2 2v2H7c-1.1 0-2 .9-2 2v2h14v-2c0-1.1-.9-2-2-2h-3V5c0-1.1-.9-2-2-2zm0 2h-1v2h2V5h-1zm9 6H3v2h18v-2zm-9 3c-2.8 0-5 2.2-5 5v3h10v-3c0-2.8-2.2-5-5-5z",
              ctaText: interpolate(t.services.applyLegal || "Apply as Legal Expert")
            },
            {
              title: interpolate(t.services.scientificAdvisors || "Scientific Advisors"),
              description: interpolate(t.services.scientificDesc || "PhDs and researchers in biotechnology, environmental and computer science, and related fields"),
              icon: "M10 2v2h4V2h-4z M12 5c-3.9 0-7 3.1-7 7v7H3v2h18v-2h-2v-7c0-3.9-3.1-7-7-7z M12 18c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2z",
              ctaText: interpolate(t.services.applyScientific || "Join as Scientific Advisor")
            },
            {
              title: interpolate(t.services.industrySpecialists || "Industry Specialists"),
              description: interpolate(t.services.industryDesc || "Sector-specific consultants with deep regulatory knowledge"),
              icon: "M22 10v12H2V10l7-5 4 3 6-5 3 3zM12 17v5h4v-5h-4z M4 12v2h2v-2H4z M4 16v2h2v-2H4z",
              ctaText: interpolate(t.services.applyIndustry || "Become an Industry Specialist")
            },
            {
              title: interpolate(t.services.techAuditors || "Technical Auditors"),
              description: interpolate(t.services.techAuditorsDesc || "Certification professionals for ISO, GMP, and other standards"),
              icon: "M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM9 17H7v-2h2v2zm0-4H7v-2h2v2zm0-4H7V7h2v2zm8 8h-6v-2h6v2zm0-4h-6v-2h6v2zm0-4h-6V7h6v2z",
              ctaText: interpolate(t.services.applyAuditor || "Collaborate as an Auditor")
            },
            {
              title: interpolate(t.services.esgConsultants || "ESG Consultants"),
              description: interpolate(t.services.esgDesc || "Sustainability experts and carbon accounting specialists"),
              icon: "M17 8C8 10 5.9 16.17 3.82 21.34L5.71 22L6.66 19.7C7.14 19.87 7.64 20 8 20C19 20 22 3 22 3C21 5 14 5.25 9 6.25C4 7.25 2 11.5 2 13.5C2 15.5 3.75 17.25 3.75 17.25C7.5 13.5 12.5 13.5 15.5 13.5C15.5 13.5 16 13.75 16 14.25C16 14.75 15.5 15 15.5 15C12.5 15 7.5 15 3.75 18.75C3.75 18.75 5.25 20.5 8 20.5C11.5 20.5 17 16 17 8Z",
              ctaText: interpolate(t.services.applyEsg || "Partner as ESG Consultant")
            }
          ]}
        />
      </div>
      <div ref={el => { sectionsRef.current[4] = el; }} className="section-animate">
        <DigitalSolutionsSection
          title={getRichTextContent(content?.digital_title, language) || ""}
          subtitle={getRichTextContent(content?.digital_subtitle, language) || ""}
          description={getRichTextContent(content?.digital_description, language) || ""}
          imageAlt={getRichTextContent(content?.digital_image_alt, language) || ""}
          whoIsThisFor={content?.digital_who_is_this_for || []}
          features={content?.digital_features || []}
        />
      </div>
      <div ref={el => { sectionsRef.current[5] = el; }} className="section-animate">
        <CaseExampleSection
          caseExample={{
            challenge: getRichTextContent(content?.case_challenge, language) || "",
            solution: getRichTextContent(content?.case_solution, language) || "",
            result: getRichTextContent(content?.case_result, language) || ""
          }}
          imageAlt={getRichTextContent(content?.case_image_alt, language) || ""}
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
