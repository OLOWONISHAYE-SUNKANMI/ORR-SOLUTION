import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "./components/ThemeProvider";
import { LanguageProvider } from "@/lib/i18n/LanguageContext";
import { ToastContainer } from "./components/Toast";
import TrailingSlashRedirect from "../components/TrailingSlashRedirect";

const geistSans = {
  variable: "",
};

const geistMono = {
  variable: "",
};

const siteURL = process.env.NEXT_PUBLIC_SITE_URL || 'https://orr.solutions/';

export const metadata: Metadata = {
  title: {
    default: "ORR Solutions | Operational & Resilience Consulting",
    template: "%s | ORR Solutions",
  },
  description: "Transform your business with expert operational and resilience consulting. We help organizations optimize processes and build sustainable growth.",
    keywords: ['ORR Solutions', 
        'business as a living system', 
        'systems thinking for organisations', 
        'business systems advisory', 
        'organisational diagnostics', 
        'operational clarity for complex organisations', 
        'multidisciplinary advisory services', 
        'internal process diagnostics', 
        'operational bottleneck analysis', 
        'scalable operational structures', 
        'digital transformation advisory', 
        'advisory-led digital systems', 
        'intelligent process automation', 
        'document-heavy workflow optimisation', 
        'environmental systems analysis', 
        'ecological and agro-ecosystem diagnostics', 
        'soil systems analysis and interpretation', 
        'biodiversity and ecosystem assessment', 
        'natural systems monitoring and evaluation', 
        'environmental data collection and analysis', 
        'scientific diagnostics for land management', 
        'integration of natural and organisational systems', 
        'systems thinking across ecological and human domains', 
        'programme-aligned advisory services',
         'professional services advisory', 
        'business advisory for self-employed professionals', 
        'advisory services for regulated professions', 
        'AI implementation advisory', 
        'applied AI for regulated environments', 
        'decision-support systems', 
        'data-driven organisational intelligence', 
        'advisory-led web development', 'systems-first web architecture', 
        'digital infrastructure for complex organisations', 
        'applied natural systems advisory',
        'operational advisory for professional practices', 
        'administrative systems design', 'compliance and operations advisory', 
        'governance-ready business processes', 
        'risk-aware operational design', 
        'regulatory-aligned systems', 
        'business process optimisation',  
        'workflow design and optimization', 
        'client portal design and implementation', 
        'internal dashboards and decision systems', 
        'secure digital workspaces', 
        'administrative automation advisory', 
        'workflow automation for professional services',
        'funded project systems design',
            'regulatory and funding-driven project coordination',
            'sustainability and environmental compliance frameworks',
            'cross-disciplinary programme implementation',
            'policy-aligned operational systems',
            'residency and mobility programme operations',
            'nomad and relocation programme systems',
            'programme-based client lifecycle management',
            'business advisory for immigration lawyers',
            'immigration and mobility practice operations',
            'compliance workflows for residency programmes',
            'business advisory for medical professionals',
            'healthcare administrative systems',
            'business advisory for architects and engineers',
             'project-based professional workflows',
            'business advisory for accountants',
            'compliance-aligned financial practice systems',
            'organisational health diagnostics',
            'systems-based decision making',
            'bridging science, policy, and operations',
            'complexity-aware advisory services',
            'long-term systems resilience'
    ],
  authors: [{ name: "ORR Solutions" }],
  creator: "ORR Solutions",
  publisher: "ORR Solutions",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: siteURL,
    siteName: "ORR Solutions",
    title: "ORR Solutions | Operational & Resilience Consulting",
    description: "Transform your business with expert operational and resilience consulting.",
    images: [
      {
        url: `${siteURL}/images/og-default.jpg`,
        width: 1200,
        height: 630,
        alt: "ORR Solutions",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "ORR Solutions",
    description: "Expert operational and resilience consulting",
    images: [`${siteURL}/images/og-default.jpg`],
  },
  icons: {
    icon: "/images/logo.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" data-scroll-behavior="smooth" suppressHydrationWarning>
      <head>
        <script src="https://accounts.google.com/gsi/client" async defer></script>
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        suppressHydrationWarning
      >
        <TrailingSlashRedirect />
        <ThemeProvider>
          <LanguageProvider>
            {children}
            <ToastContainer />
          </LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
