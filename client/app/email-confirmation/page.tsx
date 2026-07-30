"use client";

import Image from "next/image";
import { X } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import api from '@/lib/axios';

function EmailConfirmationContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get('email') || 'your email address';
  const token = searchParams.get('token');
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [resending, setResending] = useState(false);
  const [resendMessage, setResendMessage] = useState('');

  useEffect(() => {
    if (email && token) {
      api.post('/verify-email/', { email, token })
        .then(() => setStatus('success'))
        .catch(() => setStatus('error'));
    }
  }, [email, token]);

  const handleResend = async () => {
    setResending(true);
    setResendMessage('');
    try {
      await api.post('/api/resend-confirmation', { email });
      setResendMessage('Email sent successfully!');
    } catch {
      setResendMessage('Failed to send email. Please try again.');
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 relative overflow-hidden">

      {/* Background stars (small dots) */}
      <div className="absolute inset-0 pointer-events-none bg-[url('/stars.png')] opacity-60"></div>

      {/* Main Card */}
      <div className="relative bg-lemon w-full max-w-5xl rounded-xl p-12 text-center text-white shadow-xl">

        {/* Close Button */}
        <button
          onClick={() => router.back()}
          className="absolute right-6 top-6 text-black hover:opacity-80 transition"
        >
          <X size={32} />
        </button>

        {/* Icon */}
        <div className="flex justify-center mb-6">
          <Image
            src="/images/mail.png"
            alt="Email Icon"
            width={120}
            height={120}
          />
        </div>

        {/* Title */}
        <h1 className="text-4xl font-bold mb-6">Email Confirmation</h1>

        {/* Message */}
        <p className="max-w-2xl mx-auto leading-relaxed text-[15px]">
          We have sent an email to{" "}
          <span className="font-semibold">{email}</span> To confirm the validity of your email address, please check your inbox and Spam/Junk folder if the email is not in your Primary inbox. 
          After receiving the email, follow the link provided to complete your registration.
        </p>

        {/* Divider */}
        <div className="w-full border-b border-black/40 my-10"></div>

        {/* Footer */}
        <p className="text-sm">
          If you have not got any mail{" "}
          <button 
            onClick={handleResend}
            disabled={resending}
            className="underline underline-offset-2 hover:opacity-90 disabled:opacity-50"
          >
            {resending ? 'Sending...' : 'Resend confirmation mail'}
          </button>
        </p>
        {resendMessage && (
          <p className="text-sm mt-2">{resendMessage}</p>
        )}
      </div>
    </div>
  );
}

export default function EmailConfirmation() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-background flex items-center justify-center">Loading...</div>}>
      <EmailConfirmationContent />
    </Suspense>
  );
}
