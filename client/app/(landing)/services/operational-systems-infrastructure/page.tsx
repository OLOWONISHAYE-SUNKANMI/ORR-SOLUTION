"use client";
import { useEffect, useRef } from "react";
import { useOperationalSystemsContent } from "@/hooks/useServicePillarContent";
import HeroSection from "@/components/operational_systems/HeroSection";
import WhatWeOfferSection from "@/components/shared/WhatWeOfferSection";
import HowWeWorkSection from "@/components/shared/HowWeWorkSection";
import NetworkAdvantageSection from "@/components/shared/NetworkAdvantageSection";
import DigitalSolutionsSection from "@/components/shared/DigitalSolutionsSection";
import CaseExampleSection from "@/components/shared/CaseExampleSection";
import FinalCTASection from "@/components/operational_systems/FinalCTASection";
import { getRichTextContent } from "@/lib/rich-text-utils";
import { useLanguage } from "@/app/components/LanguageProvider";
import Skeleton from "@/components/ui/Skeleton";
import { SkeletonCardGrid } from "@/components/ui/SkeletonPresets";

export default function OperationalSystemsPage() {
  const { t, language, interpolate } = useLanguage();
  const { content, loading, error } = useOperationalSystemsContent();
  const sectionsRef = useRef<(HTMLDivElement | null)[]>([]);

  // Add logging to see what content is received
  useEffect(() => {
    console.log('📊 Operational Systems Page - Content State:', { content, loading, error });
    if (content) {
      console.log('📊 Operational Systems Page - Hero Title:', content.hero_title);
      console.log('📊 Operational Systems Page - Hero Subtitle:', content.hero_subtitle);
      console.log("hello there");

      console.log('📊 Operational Systems Page - Services Title:', content.services_title);
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
          title={getRichTextContent(content?.hero_title, language) || interpolate(t.services.operationalHeroTitle)}
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
              icon: "M12 2L2 7L12 12L22 7L12 2M2 17L12 22L22 17M2 12L12 17L22 12"
            },
            {
              title: getRichTextContent(content?.service_2_title, language) || "",
              description: getRichTextContent(content?.service_2_description, language) || "",
              icon: "M12 2C13.1 2 14 2.9 14 4C14 5.1 13.1 6 12 6C10.9 6 10 5.1 10 4C10 2.9 10.9 2 12 2ZM21 9V7L15 4V6C15 7.1 14.1 8 13 8H11C9.9 8 9 7.1 9 6V4L3 7V9H21ZM3 10V19C3 20.1 3.9 21 5 21H19C20.1 21 21 20.1 21 19V10H3Z"
            },
            {
              title: getRichTextContent(content?.service_3_title, language) || "",
              description: getRichTextContent(content?.service_3_description, language) || "",
              icon: "M12 1L3 5V11C3 16.55 6.84 21.74 12 23C17.16 21.74 21 16.55 21 11V5L12 1M12 7C13.4 7 14.8 8.6 14.8 10V11.5C15.4 11.5 16 12.1 16 12.7V16.2C16 16.8 15.4 17.3 14.8 17.3H9.2C8.6 17.3 8 16.8 8 16.2V12.7C8 12.1 8.6 11.5 9.2 11.5V10C9.2 8.6 10.6 7 12 7M12 8.2C11.2 8.2 10.5 8.7 10.5 10V11.5H13.5V10C13.5 8.7 12.8 8.2 12 8.2Z"
            }
          ]}
        />
      </div>
      <div ref={el => { sectionsRef.current[2] = el; }} className="section-animate">
        <HowWeWorkSection
          title={getRichTextContent(content?.process_title, language) || interpolate(t.services.howWeWork)}
          subtitle={interpolate(t.services.listenSolveOptimize)}
          description={getRichTextContent(content?.process_description, language) || interpolate(t.services.opDescription)}
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
          title={interpolate(t.services.networkAdvantage)}
          description={interpolate(t.services.networkOpDescription)}
          networkCards={[
            {
              title: interpolate(t.services.buildersContractors || "Builders & Contractors"),
              description: interpolate(t.services.buildersDescription || "For physical office setup and renovations"),
              icon: "M12 2L2 7L12 12L22 7L12 2M2 17L12 22L22 17M2 12L12 17L22 12"
            },
            {
              title: interpolate(t.services.itTechSpecialists || "IT & Tech Specialists"),
              description: interpolate(t.services.itDescription || "For advanced infrastructure, cybersecurity, and systems integration"),
              icon: "M12 3L1 9L12 15L21 12.35V17H23V9M5 13.18V17.18L12 21L19 17.18V13.18L12 17L5 13.18Z"
            },
            {
              title: interpolate(t.services.workspaceDesigners || "Furniture & Workspace Designers"),
              description: interpolate(t.services.workspaceDescription || "For ergonomic, functional office environments"),
              icon: "M12 1L3 5V11C3 16.55 6.84 21.74 12 23C17.16 21.74 21 16.55 21 11V5L12 1M12 7C13.4 7 14.8 8.6 14.8 10V11.5C15.4 11.5 16 12.1 16 12.7V16.2C16 16.8 15.4 17.3 14.8 17.3H9.2C8.6 17.3 8 16.8 8 16.2V12.7C8 12.1 8.6 11.5 9.2 11.5V10C9.2 8.6 10.6 7 12 7M12 8.2C11.2 8.2 10.5 8.7 10.5 10V11.5H13.5V10C13.5 8.7 12.8 8.2 12 8.2Z"
            }
          ]}
          layout="grid"
        />
      </div>
      <div ref={el => { sectionsRef.current[4] = el; }} className="section-animate">
        <DigitalSolutionsSection
          title={interpolate(t.services.digitalSolutions)}
          subtitle={interpolate(t.services.digitalSubtitle)}
          description={interpolate(t.services.digitalOpDescription)}
          imageAlt={interpolate(getRichTextContent(t.services.digitalOpImageAlt, language) || "Operational systems dashboard showing process flows and metrics")}
          whoIsThisFor={[
            interpolate(t.services.whoOp1 || "Self-employed professionals and freelancers ready to scale their operations"),
            interpolate(t.services.whoOp2 || "Solo practitioners who want to digitalize and systematize their business processes"),
            interpolate(t.services.whoOp3 || "Independent consultants seeking to professionalize their operations"),
            interpolate(t.services.whoOp4 || "Service providers who prefer to focus on their core work"),
            interpolate(t.services.whoOp5 || "Entrepreneurs growing beyond one-person operations")
          ]}
          features={[
            interpolate(t.services.featOp1 || "Bespoke CRM systems with custom admin and client panels"),
            interpolate(t.services.featOp2 || "Tailored document management and knowledge base platforms"),
            interpolate(t.services.featOp3 || "Custom communication dashboards and notification systems"),
            interpolate(t.services.featOp4 || "Client portals with role-based access and branded interfaces"),
            interpolate(t.services.featOp5 || "Integrated automation workflows connecting multiple systems"),
            interpolate(t.services.featOp6 || "AI-powered solutions for process automation and data analysis"),
            interpolate(t.services.featOp7 || "Custom reporting and analytics dashboards")
          ]}
        />
      </div>
      <div ref={el => { sectionsRef.current[5] = el; }} className="section-animate">
        <CaseExampleSection
          caseExample={{
            challenge: getRichTextContent(content?.case_challenge, language) || interpolate(t.services.caseOpChallenge || "A mid-sized manufacturing company was experiencing significant operational inefficiencies, with production delays, quality issues, and rising costs. Manual processes dominated their workflow, leading to errors and inconsistent output."),
            solution: getRichTextContent(content?.case_solution, language) || interpolate(t.services.caseOpSolution || "ORR conducted a comprehensive operational assessment, mapping all processes and identifying critical bottlenecks. We delivered a detailed optimization report with workflow redesign, quality control improvements, and automation opportunities."),
            result: getRichTextContent(content?.case_result, language) || interpolate(t.services.caseOpResult || "Following ORR's recommendations, the company implemented standardized processes and automated key workflows, resulting in a 35% reduction in production time and 50% fewer quality defects. Overall operational costs decreased by 25% while customer satisfaction improved significantly.")
          }}
          imageAlt={getRichTextContent(content?.case_image_alt, language) || interpolate(t.services.caseOpImageAlt || "Manufacturing floor with optimized processes and digital monitoring")}
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