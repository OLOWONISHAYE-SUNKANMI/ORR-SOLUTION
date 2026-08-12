"use client";

import React, { useEffect, useState } from "react";
import { client } from "@/sanity/lib/client";
import { postsQuery } from "@/sanity/lib/queries";
import BlogCard from "./BlogCard";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import Skeleton from "@/components/ui/Skeleton";
import { SkeletonCardGrid } from "@/components/ui/SkeletonPresets";

export default function LatestBlogsSection({ initialPosts }: { initialPosts?: any[] }) {
  const [posts, setPosts] = useState<any[]>(initialPosts || []);
  const [loading, setLoading] = useState(!initialPosts);
  const { language, t } = useLanguage();
  const pathname = usePathname();

  const isBlogPage = pathname?.includes("/resources-blogs");

  useEffect(() => {
    if (initialPosts) return;
    
    const fetchPosts = async () => {
      try {
        const allPosts = await client.fetch(postsQuery);
        setPosts(allPosts.slice(0, 3));
      } catch (error) {
        console.error("Error fetching latest posts:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, [initialPosts]);

  if (loading) return (
    <section className="py-24 px-6 bg-[#0A1016]">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col gap-6 mb-16">
          <Skeleton className="h-8 w-32 rounded-full" />
          <Skeleton className="h-12 w-2/3 max-w-xl" />
        </div>
        <SkeletonCardGrid count={3} />
      </div>
    </section>
  );
  if (posts.length === 0) return null;

  return (
    <section className="py-24 px-6 bg-[#0A1016]">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-8">
          <div className="max-w-2xl">
            <motion.span 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="inline-block bg-green-400/10 text-green-400 text-xs font-black px-4 py-2 rounded-full uppercase tracking-[0.2em] mb-6 border border-green-400/20"
            >
              {language === 'en' ? 'INSIGHTS' : 'APPROFONDIMENTI'}
            </motion.span>
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-4xl md:text-5xl lg:text-6xl font-black text-white leading-tight tracking-tighter"
            >
              {language === 'en' ? 'Latest from our blog' : 'Ultime dal nostro blog'}
            </motion.h2>
          </div>
          
          {!isBlogPage && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
            >
              <Link 
                href="/resources-blogs" 
                className="group flex items-center text-sm font-bold tracking-widest uppercase text-gray-400 hover:text-white transition-colors"
              >
                {language === 'en' ? 'View all resources' : 'Vedi tutte le risorse'}
                <svg className="w-5 h-5 ml-2 transform group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l4-4m-4 4H3" />
                </svg>
              </Link>
            </motion.div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {posts.map((post, index) => (
            <motion.div
              key={post._id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 + 0.3 }}
            >
              <BlogCard post={post} />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
