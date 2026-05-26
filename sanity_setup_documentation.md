# Sanity CMS Setup & Dynamic Template Integration Guide
## ORR Solutions Platform

This document outlines the architecture, schemas, and integration strategy implemented for the Sanity CMS schema-driven headless integration inside the **ORR Solutions** platform. The system is designed to support fully dynamic page creation, reusable template layouts, rich text block rendering, complete blog post administration, and professional SEO management without requiring frontend redeployments.

---

## 1. Directory & Integration Architecture

The Sanity CMS architecture is separated into a clean schema layout and a frontend data extraction layer. Below is the directory structure recommended and implemented in the `client` directory:

```
client/
├── app/
│   └── (landing)/
│       ├── [slug]/                  # Dynamic landing pages
│       ├── blog/[slug]/             # Expected dynamic blog post route (New!)
│       │   └── page.tsx             
│       ├── pages/[slug]/            # Dynamic template-driven pages (New!)
│       │   ├── page.tsx             
│       │   └── DynamicPageClient.tsx
│       └── resources-blogs/         # Pre-existing blog index & detail routes
│           └── [slug]/              
│               └── BlogDetailClient.tsx
├── components/
│   ├── SanityImage.tsx              # Optimized image rendering using Sanity CDN
│   └── PortableTextRenderer.tsx     # Rich block content parser & renderer
└── sanity/
    ├── env.ts                       # Environment variable management
    ├── sanity.config.ts             # Workspace setup & studio base routing
    ├── lib/
    │   ├── client.ts                # Client initialization
    │   ├── image.ts                 # Image URL builder utilizing hotspot & format
    │   └── queries.ts               # Optimised GROQ query layer
    └── schemaTypes/
        ├── index.ts                 # Schema registration index
        ├── seo.ts                   # Reusable SEO schema definitions (New!)
        ├── dynamicPage.ts           # Page-builder schema with blocks (New!)
        ├── post.ts                  # Enhanced blog post schemas (Enhanced!)
        ├── localizedFields.ts       # Multilingual translations (en, it)
        └── engagementPage.ts        # Pre-existing landing models
```

---

## 2. Complete Sanity Schema Implementations

### A. Reusable SEO Schema (`sanity/schemaTypes/seo.ts`)
A dedicated object-type schema designed to provide robust, reusable metadata configurations across any page or post.

```typescript
import { defineType, defineField } from 'sanity'

export const seo = defineType({
  name: 'seo',
  title: 'SEO Metadata',
  type: 'object',
  fields: [
    defineField({
      name: 'metaTitle',
      title: 'Meta Title',
      type: 'string',
      description: 'Title for search engines (50-60 characters recommended)',
      validation: (rule) => rule.max(70),
    }),
    defineField({
      name: 'metaDescription',
      title: 'Meta Description',
      type: 'text',
      description: 'Description for search engines (150-160 characters recommended)',
      validation: (rule) => rule.max(160),
    }),
    defineField({
      name: 'canonicalUrl',
      title: 'Canonical URL',
      type: 'url',
      description: 'The preferred URL of this page to avoid duplicate content',
    }),
    defineField({
      name: 'ogImage',
      title: 'Open Graph Image',
      type: 'image',
      description: 'Image shown when shared on social media',
      options: { hotspot: true },
    }),
    defineField({
      name: 'keywords',
      title: 'Keywords',
      type: 'array',
      of: [{ type: 'string' }],
      description: 'Keywords for search engines',
    }),
    defineField({
      name: 'robots',
      title: 'Robots Indexing Options',
      type: 'string',
      description: 'Search engine indexing behavior',
      options: {
        list: [
          { title: 'Index, Follow (Default)', value: 'index, follow' },
          { title: 'Noindex, Nofollow', value: 'noindex, nofollow' },
          { title: 'Index, Nofollow', value: 'index, nofollow' },
          { title: 'Noindex, Follow', value: 'noindex, follow' },
        ],
      },
      initialValue: 'index, follow',
    }),
  ],
})
```

### B. Dynamic Page Schema (`sanity/schemaTypes/dynamicPage.ts`)
Implements the multi-template layout selector (Landing, Service, About) and wraps reusable layout blocks.

```typescript
import { defineType, defineField } from 'sanity'

export const dynamicPage = defineType({
  name: 'dynamicPage',
  title: 'Dynamic Page',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Page Title',
      type: 'localizedString',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: { source: 'title.en' },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'templateType',
      title: 'Page Template Type',
      type: 'string',
      options: {
        list: [
          { title: 'Landing Page Template', value: 'landing' },
          { title: 'Service Page Template', value: 'service' },
          { title: 'About Page Template', value: 'about' },
          { title: 'Default/Custom Template', value: 'default' },
        ],
      },
      initialValue: 'default',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'published',
      title: 'Published Status',
      type: 'boolean',
      initialValue: true,
    }),
    defineField({
      name: 'hero',
      title: 'Hero Section',
      type: 'object',
      fields: [
        { name: 'heading', type: 'localizedString', title: 'Hero Heading' },
        { name: 'subheading', type: 'localizedText', title: 'Hero Subheading' },
        { name: 'image', type: 'image', title: 'Hero Image', options: { hotspot: true } },
        { name: 'buttonText', type: 'localizedString', title: 'Primary Button Text' },
        { name: 'buttonLink', type: 'string', title: 'Primary Button Link' },
        { name: 'button2Text', type: 'localizedString', title: 'Secondary Button Text' },
        { name: 'button2Link', type: 'string', title: 'Secondary Button Link' },
      ],
    }),
    defineField({
      name: 'sections',
      title: 'Content Blocks / Sections',
      type: 'array',
      of: [
        {
          type: 'object',
          name: 'heroBlock',
          title: 'Hero Block',
          fields: [
            { name: 'heading', type: 'localizedString', title: 'Heading' },
            { name: 'subheading', type: 'localizedText', title: 'Subheading' },
            { name: 'image', type: 'image', title: 'Image', options: { hotspot: true } },
            { name: 'buttonText', type: 'localizedString', title: 'Button Text' },
            { name: 'buttonLink', type: 'string', title: 'Button Link' },
          ],
        },
        {
          type: 'object',
          name: 'imageText',
          title: 'Image & Text Block',
          fields: [
            { name: 'heading', type: 'localizedString', title: 'Heading' },
            { name: 'text', type: 'localizedBlock', title: 'Rich Text Content' },
            { name: 'image', type: 'image', title: 'Image', options: { hotspot: true } },
            { name: 'reversed', type: 'boolean', title: 'Reverse Layout (Image on Right)', initialValue: false },
          ],
        },
        {
          type: 'object',
          name: 'cta',
          title: 'Call to Action (CTA)',
          fields: [
            { name: 'title', type: 'localizedString', title: 'Title' },
            { name: 'subtitle', type: 'localizedText', title: 'Subtitle' },
            { name: 'buttonText', type: 'localizedString', title: 'Button Text' },
            { name: 'link', type: 'string', title: 'Link' },
          ],
        },
        {
          type: 'object',
          name: 'features',
          title: 'Feature Cards Block',
          fields: [
            { name: 'blockHeading', type: 'localizedString', title: 'Block Heading' },
            { name: 'blockSubheading', type: 'localizedText', title: 'Block Subheading' },
            {
              name: 'cards',
              type: 'array',
              title: 'Feature Cards',
              of: [
                {
                  type: 'object',
                  name: 'card',
                  title: 'Card',
                  fields: [
                    { name: 'title', type: 'localizedString', title: 'Card Title' },
                    { name: 'description', type: 'localizedText', title: 'Card Description' },
                    { name: 'icon', type: 'string', title: 'Lucide Icon Name (e.g. Shield, Award, Zap)' },
                    { name: 'link', type: 'string', title: 'Card Link (Optional)' },
                  ],
                },
              ],
            },
          ],
        },
        {
          type: 'object',
          name: 'textBlock',
          title: 'Rich Content Block',
          fields: [
            { name: 'heading', type: 'localizedString', title: 'Block Heading' },
            { name: 'body', type: 'localizedBlock', title: 'Rich Text Body' },
          ],
        },
        {
          type: 'object',
          name: 'embeddedMedia',
          title: 'Embedded Media Block',
          fields: [
            { name: 'title', type: 'localizedString', title: 'Media Title' },
            { name: 'mediaUrl', type: 'url', title: 'Media URL' },
            { name: 'caption', type: 'localizedText', title: 'Caption' },
          ],
        },
      ],
    }),
    defineField({
      name: 'seo',
      title: 'SEO Metadata',
      type: 'seo',
    }),
  ],
})
```

### C. Enhanced Blog Post Schema (`sanity/schemaTypes/post.ts`)
Incorporates `author`, `tags`, `readingTime`, and our unified `seo` schema metadata block.

```typescript
import {defineType, defineField} from 'sanity'

export const post = defineType({
  name: 'post',
  title: 'Blog Post',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'localizedString',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: {source: 'title.en'},
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'author',
      title: 'Author',
      type: 'string',
    }),
    defineField({
      name: 'badge',
      title: 'Badge',
      type: 'localizedString',
      description: 'e.g. STRATEGY, OPERATIONS, INNOVATION',
    }),
    defineField({
      name: 'mainImage',
      title: 'Main Image',
      type: 'image',
      options: {hotspot: true},
    }),
    defineField({
      name: 'tags',
      title: 'Tags / Categories',
      type: 'array',
      of: [{type: 'string'}],
      options: { layout: 'tags' }
    }),
    defineField({
      name: 'readingTime',
      title: 'Reading Time (minutes)',
      type: 'number',
    }),
    defineField({
      name: 'body',
      title: 'Body',
      type: 'localizedBlock',
    }),
    defineField({
      name: 'button1Text',
      title: 'Button 1 Text',
      type: 'localizedString',
    }),
    defineField({
      name: 'button2Text',
      title: 'Button 2 Text',
      type: 'localizedString',
    }),
    defineField({
      name: 'featured',
      title: 'Featured',
      type: 'boolean',
      initialValue: false,
    }),
    defineField({
      name: 'publishedAt',
      title: 'Published at',
      type: 'datetime',
      initialValue: () => new Date().toISOString(),
    }),
    defineField({
      name: 'seo',
      title: 'SEO Metadata',
      type: 'seo',
    }),
  ],
})
```

---

## 3. GROQ Query Architecture (`sanity/lib/queries.ts`)

Optimized query projections reduce API footprint and ensure lightning-fast static compilation.

```javascript
import { groq } from "next-sanity";

// Fetch dynamic page configuration by slug
export const dynamicPageQuery = groq`*[_type == "dynamicPage" && slug.current == $slug && published == true][0] {
  _id,
  title,
  "slug": slug.current,
  templateType,
  published,
  hero {
    heading,
    subheading,
    image,
    buttonText,
    buttonLink,
    button2Text,
    button2Link
  },
  sections[] {
    ...,
    _type == "imageText" => {
      text
    },
    _type == "textBlock" => {
      body
    }
  },
  seo {
    metaTitle,
    metaDescription,
    canonicalUrl,
    ogImage,
    keywords,
    robots
  }
}`;

// Fetch all slug listings of published dynamic pages for SSG
export const dynamicPagesSlugQuery = groq`*[_type == "dynamicPage" && published == true] { "slug": slug.current }`;

// Fetch single blog post by slug with full metadata
export const postBySlugQuery = groq`*[_type == "post" && slug.current == $slug][0] {
  _id,
  title,
  "slug": slug.current,
  author,
  badge,
  mainImage,
  tags,
  readingTime,
  featured,
  publishedAt,
  body,
  button1Text,
  button2Text,
  seo {
    metaTitle,
    metaDescription,
    canonicalUrl,
    ogImage,
    keywords,
    robots
  }
}`;
```

---

## 4. Reusable Dynamic Rendering System

### Dynamic Routing Setup (`app/(landing)/pages/[slug]/page.tsx`)
Fully integrated with standard Next.js App Router parameters. Employs ISR cache invalidation (`revalidate = 60`) and static parameterization for high performance.

```typescript
import { Metadata } from "next";
import { client } from "@/sanity/lib/client";
import { dynamicPageQuery, dynamicPagesSlugQuery } from "@/sanity/lib/queries";
import DynamicPageClient from "./DynamicPageClient";
import { notFound } from "next/navigation";
import { urlForImage } from "@/sanity/lib/image";

export const revalidate = 60; // Incremental Static Regeneration

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const pages = await client.fetch(dynamicPagesSlugQuery);
  return pages.map((page: any) => ({ slug: page.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const page = await client.fetch(dynamicPageQuery, { slug });

  if (!page || !page.seo) {
    return { title: page?.title?.en || "ORR Solutions" };
  }

  const { metaTitle, metaDescription, canonicalUrl, ogImage, keywords, robots } = page.seo;
  const ogImageUrl = ogImage ? urlForImage(ogImage)?.url() : undefined;

  return {
    title: metaTitle || page.title?.en,
    description: metaDescription,
    alternates: canonicalUrl ? { canonical: canonicalUrl } : undefined,
    keywords: keywords || [],
    robots: robots || "index, follow",
    openGraph: ogImageUrl ? { images: [{ url: ogImageUrl }] } : undefined,
  };
}

export default async function DynamicPage({ params }: PageProps) {
  const { slug } = await params;
  const page = await client.fetch(dynamicPageQuery, { slug });

  if (!page) notFound();
  return <DynamicPageClient page={page} />;
}
```

---

## 5. Performance & Media Management

### A. Media Asset CDN Processing (`components/SanityImage.tsx`)
Sanity's CDN parses image hotspots and returns optimised formats. In `components/SanityImage.tsx`, next/image handles layouts and standardises output:

```typescript
import Image from 'next/image'
import { urlForImage } from '@/sanity/lib/image'

interface SanityImageProps {
  asset: any
  alt: string
  className?: string
  priority?: boolean
  width?: number
  height?: number
}

export default function SanityImage({ asset, alt, className, priority, width, height }: SanityImageProps) {
  if (!asset) return null;
  const imageUrl = urlForImage(asset)?.url();
  if (!imageUrl) return null;

  return (
    <Image
      src={imageUrl}
      alt={alt}
      className={className}
      priority={priority}
      width={width || 1200}
      height={height || 800}
    />
  )
}
```

### B. Caching & Static Export Alignment
To ensure compatibility with static file hosting providers (e.g. Hostinger, Netlify) where `output: "export"` is enabled:
- `generateStaticParams` compiles dynamic pages/posts into flat HTML directories.
- Caching is managed using Next.js static optimizations and pre-compilation steps.
- Media assets are distributed globally via Sanity’s cloud CDN, reducing load speeds to milliseconds.

---

## 6. How Administrators Manage Content

1. **Accessing the Studio Workspace**:
   Navigate to the local or production path `/studio` mounted inside Next.js.
2. **Page Creation & Templates**:
   Create a **Dynamic Page** document. Select a **Page Template Type** (Landing, Service, About). Add sections using the visual **Content Blocks** array (Hero blocks, CTA sections, Feature grids, Media assets, or Rich text).
3. **SEO Administration**:
   Under the **SEO Metadata** tab, input search titles, index keywords, canonical configurations, and upload social preview images.
4. **Publish Workflow**:
   Administrators can click **Publish** or **Unpublish** directly. Because caching is updated incrementally (or regenerated on static build steps), changes register globally.
