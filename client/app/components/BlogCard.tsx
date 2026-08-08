"use client";

import React from "react";
import Link from "next/link";
import { PortableText } from "@portabletext/react";
import SanityImage from "@/components/SanityImage";
import { useLanguage } from "@/lib/i18n/LanguageContext";

interface Post {
  _id: string;
  title: any;
  slug: string;
  badge: any;
  mainImage: any;
  publishDate: string;
  body: any;
}

interface BlogCardProps {
  post: Post;
  className?: string;
}

export default function BlogCard({ post, className = "" }: BlogCardProps) {
  const { language } = useLanguage();
  
  const title = post.title?.[language] || post.title?.en || "";
  const badge = post.badge?.[language] || post.badge?.en || "";
  const body = post.body?.[language] || post.body?.en || [];

  return (
    <Link
      href={`/resources-blogs/${post.slug}`}
      className={`group relative bg-[#131E2A]/80 backdrop-blur-md rounded-[2rem] p-6 md:p-8 border border-white/5 cursor-pointer transition-all duration-500 hover:bg-[#1A2938] hover:border-white/20 hover:shadow-2xl hover:-translate-y-1 h-full block ${className}`}
    >
      <div className="flex flex-col h-full">
        <div className="mb-6 relative overflow-hidden rounded-2xl shrink-0">
          <SanityImage
            asset={post.mainImage}
            alt={title}
            className="w-full object-cover transform group-hover:scale-110 transition-transform duration-700 ease-out h-56"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </div>

        <div className="flex flex-col flex-grow">
          <div className="mb-4 flex justify-between items-center">
            {badge && (
              <span className="inline-block bg-white/10 text-white/90 text-xs font-semibold px-3 py-1.5 rounded-full backdrop-blur-sm border border-white/10 group-hover:bg-green-400 group-hover:text-black group-hover:border-green-400 transition-colors duration-300">
                {badge}
              </span>
            )}
            {post.publishDate && (
              <span className="text-gray-400 text-xs font-medium">
                {new Date(post.publishDate).toLocaleDateString(language === 'it' ? 'it-IT' : 'en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              </span>
            )}
          </div>

          <h3 className="font-bold mb-4 text-white group-hover:text-green-300 transition-colors duration-300 text-xl md:text-2xl leading-tight">
            {title}
          </h3>

          <div className="text-gray-400 text-base leading-relaxed font-light mt-auto">
            <div className="relative line-clamp-3">
              <PortableText value={body} />
              <div className="absolute bottom-0 right-0 w-1/3 h-6 bg-gradient-to-l from-[#131E2A]/80 to-transparent group-hover:from-[#1A2938] transition-colors" />
            </div>
          </div>
        </div>
      </div>
      <div className="absolute top-6 right-6 w-2 h-2 rounded-full bg-white/20 group-hover:bg-green-400 group-hover:shadow-[0_0_10px_#4ade80] transition-all duration-300" />
    </Link>
  );
}
