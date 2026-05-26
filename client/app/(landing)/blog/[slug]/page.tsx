import { Metadata } from "next";
import { client } from "@/sanity/lib/client";
import { postBySlugQuery, postsSlugQuery } from "@/sanity/lib/queries";
import BlogDetailClient from "../../resources-blogs/[slug]/BlogDetailClient";
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
    const posts = await client.fetch(postsSlugQuery);
    const paths = Array.isArray(posts)
      ? posts.filter((p: any) => p && p.slug).map((p: any) => ({ slug: p.slug }))
      : [];
    return paths.length > 0 ? paths : [{ slug: '__placeholder' }];
  } catch (error) {
    console.error("Error in generateStaticParams for Blog Posts:", error);
    return [{ slug: '__placeholder' }];
  }
}

// ----------------------------------------------------
// Generate Metadata Dynamically (SEO Integration)
// ----------------------------------------------------
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = await client.fetch(postBySlugQuery, { slug });

  if (!post) {
    return {
      title: "Blog Post Not Found | ORR Solutions",
    };
  }

  // Fallback values
  const defaultTitle = post.title?.en || post.title?.it || "Blog Post";
  const defaultDesc = "Read our latest article on ORR Solutions insights.";
  
  if (!post.seo) {
    const fallbackImage = post.mainImage ? urlForImage(post.mainImage)?.url() : undefined;
    return {
      title: `${defaultTitle} | ORR Solutions`,
      description: defaultDesc,
      openGraph: fallbackImage ? { images: [{ url: fallbackImage }] } : undefined,
    };
  }

  const { metaTitle, metaDescription, canonicalUrl, ogImage, keywords, robots } = post.seo;
  const ogImageUrl = ogImage ? urlForImage(ogImage)?.url() : (post.mainImage ? urlForImage(post.mainImage)?.url() : undefined);

  return {
    title: metaTitle || `${defaultTitle} | ORR Solutions`,
    description: metaDescription || defaultDesc,
    alternates: canonicalUrl ? { canonical: canonicalUrl } : undefined,
    keywords: keywords || [],
    robots: robots || "index, follow",
    openGraph: ogImageUrl
      ? {
          title: metaTitle || defaultTitle,
          description: metaDescription || defaultDesc,
          images: [{ url: ogImageUrl }],
        }
      : undefined,
    twitter: ogImageUrl
      ? {
          card: "summary_large_image",
          title: metaTitle || defaultTitle,
          description: metaDescription || defaultDesc,
          images: [ogImageUrl],
        }
      : undefined,
  };
}

// ----------------------------------------------------
// Blog Post Server Component Entry
// ----------------------------------------------------
export default async function BlogPage({ params }: PageProps) {
  const { slug } = await params;
  const post = await client.fetch(postBySlugQuery, { slug });

  if (!post) {
    notFound();
  }

  return <BlogDetailClient post={post} />;
}
