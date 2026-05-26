import { Metadata } from "next";
import { client } from "@/sanity/lib/client";
import { dynamicPageQuery, dynamicPagesSlugQuery } from "@/sanity/lib/queries";
import DynamicPageClient from "./DynamicPageClient";
import { notFound } from "next/navigation";
import { urlForImage } from "@/sanity/lib/image";

export const revalidate = 60; // Enable incremental static regeneration (ISR)

interface PageProps {
  params: Promise<{ slug: string }>;
}

// ----------------------------------------------------
// Generate Static Params for SSG
// ----------------------------------------------------
export async function generateStaticParams() {
  try {
    const pages = await client.fetch(dynamicPagesSlugQuery);
    const staticPaths = Array.isArray(pages)
      ? pages.filter((page: any) => page && page.slug).map((page: any) => ({ slug: page.slug }))
      : [];

    if (staticPaths.length === 0) {
      return [{ slug: 'services' }]; // Placeholder fallback
    }
    return staticPaths;
  } catch (error) {
    console.error("Error in generateStaticParams for Dynamic Pages:", error);
    return [{ slug: 'services' }];
  }
}

// ----------------------------------------------------
// Generate Metadata Dynamically (SEO Integration)
// ----------------------------------------------------
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const page = await client.fetch(dynamicPageQuery, { slug });

  if (!page || !page.seo) {
    const fallbackTitle = page ? (page.title?.en || "ORR Solutions") : "ORR Solutions";
    return {
      title: `${fallbackTitle} | ORR Solutions`,
      description: "ORR Solutions dynamic content page.",
    };
  }

  const { metaTitle, metaDescription, canonicalUrl, ogImage, keywords, robots } = page.seo;
  const ogImageUrl = ogImage ? urlForImage(ogImage)?.url() : undefined;

  return {
    title: metaTitle || `${page.title?.en || "ORR Solutions"} | ORR Solutions`,
    description: metaDescription || "ORR Solutions - Tailored Operational & Strategic Systems",
    alternates: canonicalUrl ? { canonical: canonicalUrl } : undefined,
    keywords: keywords || [],
    robots: robots || "index, follow",
    openGraph: ogImageUrl
      ? {
          title: metaTitle || page.title?.en,
          description: metaDescription,
          images: [{ url: ogImageUrl }],
        }
      : undefined,
    twitter: ogImageUrl
      ? {
          card: "summary_large_image",
          title: metaTitle || page.title?.en,
          description: metaDescription,
          images: [ogImageUrl],
        }
      : undefined,
  };
}

// ----------------------------------------------------
// Dynamic Page Server Component Entry
// ----------------------------------------------------
export default async function DynamicPage({ params }: PageProps) {
  const { slug } = await params;
  const page = await client.fetch(dynamicPageQuery, { slug });

  if (!page) {
    notFound();
  }

  return <DynamicPageClient page={page} />;
}
