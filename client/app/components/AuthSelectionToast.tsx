'use client';
import { GoogleButton } from './ui/GoogleButton';
import { useGoogleAuth } from '@/hooks/useGoogleAuth';
import { useRouter } from 'next/navigation';
import { useLanguage } from './LanguageProvider';
import { AnimatePresence, motion } from 'framer-motion';

interface AuthSelectionToastProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'login' | 'register';
}

export function AuthSelectionToast({ isOpen, onClose, type }: AuthSelectionToastProps) {
  const { signInWithGoogle, isLoading: isGoogleLoading, renderGoogleButton } = useGoogleAuth();
  const router = useRouter();
  const { t, interpolate } = useLanguage();

  const handleEmailAuth = () => {
    onClose();
    router.push(type === 'login' ? '/login' : '/register');
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ x: '120%', opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: '120%', opacity: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          className="fixed top-24 right-4 z-[100] w-full max-w-sm"
        >
          <div className="bg-[#1A1A1A] border border-white/10 rounded-2xl p-6 shadow-2xl relative overflow-hidden">
            {/* Background effects */}
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#13BE77] to-transparent"></div>
            
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-white">
                {type === 'login' ? interpolate((t.login as any)?.welcome || 'Welcome Back') : interpolate((t.login as any)?.register || 'Create an Account')}
              </h2>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-white transition-colors p-1"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-4">
              <div onClick={() => {
                // When clicking Google Button wrapper, we might also want to close, but the Google script handles the actual click.
              }}>
                <GoogleButton 
                  onClick={() => {
                    signInWithGoogle();
                    onClose();
                  }} 
                  isLoading={isGoogleLoading}
                  renderGoogleButton={renderGoogleButton}
                />
              </div>
              
              <div className="flex items-center my-4">
                <div className="flex-1 border-t border-white/10"></div>
                <span className="px-4 text-gray-400 text-xs">OR</span>
                <div className="flex-1 border-t border-white/10"></div>
              </div>

              <button
                onClick={handleEmailAuth}
                className="w-full flex items-center justify-center gap-3 bg-transparent text-white border border-white/20 hover:bg-white/5 py-3 px-4 rounded-xl transition-all duration-200"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                  <polyline points="22,6 12,13 2,6"></polyline>
                </svg>
                <span className="font-poppins text-sm">
                  Continue with Email
                </span>
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
