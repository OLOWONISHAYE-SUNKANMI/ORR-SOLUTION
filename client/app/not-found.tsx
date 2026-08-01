'use client';

import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import DocumentViewerClient from './(client_dashboard)/document/[id]/DocumentViewerClient';
import SuperAdminViewerPageClient from './admin/(dashboard)/vault/[id]/SuperAdminViewerPageClient';
import Link from 'next/link';

export default function NotFound() {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Hydration safety
  if (!mounted) {
    return (
      <div className="min-h-screen bg-[#010409]" />
    );
  }

  // Intercept Next.js 404s for the document viewer on static export
  if (pathname && pathname.startsWith('/document/') && pathname.split('/').length === 3) {
    const id = pathname.split('/')[2];
    // Render the actual document viewer instead of a 404
    return <DocumentViewerClient id={id} />;
  }

  // Intercept for Vault Admin
  if (pathname && pathname.startsWith('/admin/vault/') && pathname.split('/').length === 4) {
     const id = pathname.split('/')[3];
     return <SuperAdminViewerPageClient id={id} />;
  }

  // Default 404 UI
  return (
    <div className="min-h-screen bg-[#010409] flex flex-col items-center justify-center p-10 text-center text-white">
      <h1 className="text-4xl font-black mb-4 uppercase tracking-tighter italic">Page Not Found</h1>
      <p className="text-white/60 mb-8 max-w-md mx-auto">
        This Page Does Not Exist. Sorry, the page you are looking for could not be found. It's just an accident that was not intentional.
      </p>
      <Link href="/" className="bg-primary text-[#010409] px-6 py-2 rounded-xl font-bold uppercase tracking-widest text-xs hover:bg-primary/80 transition-all">
        Return Home
      </Link>
    </div>
  );
}
