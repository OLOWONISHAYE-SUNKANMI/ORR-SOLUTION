'use client';

import { useEffect, useCallback, useRef } from 'react';
import { useAuthStore } from '@/store/authStore';
import { useRouter } from 'next/navigation';
import { useOnboardingStore } from '@/store/onboardingStore';

export function useGoogleAuth() {
  const { googleLogin, isLoading } = useAuthStore();
  const router = useRouter();
  const googleButtonRef = useRef<HTMLDivElement | null>(null);

  const handleCredentialResponse = useCallback(async (response: any) => {
    try {
      const success = await googleLogin(response.credential);
      if (success) {
        const onboardingStatus = useOnboardingStore.getState().onboardingStatus;
        if (onboardingStatus && onboardingStatus.is_completed) {
          router.push('/dashboard');
        } else {
          router.push('/onboarding');
        }
      }
    } catch (error) {
      console.error('Google Auth Error:', error);
    }
  }, [googleLogin, router]);

  useEffect(() => {
    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
    
    if (!clientId) {
      console.warn('Google Client ID not found in environment variables');
      return;
    }

    const initializeGoogle = () => {
      if (typeof window !== 'undefined' && (window as any).google) {
        // Cancel any pending UI to prevent FedCM AbortError in React StrictMode
        (window as any).google.accounts.id.cancel();
        
        (window as any).google.accounts.id.initialize({
          client_id: clientId,
          callback: handleCredentialResponse,
          ux_mode: 'popup',
          // @ts-ignore - disable FedCM which causes AbortError in newer Chrome
          use_fedcm_for_prompt: false,
          auto_select: false,
        });
      }
    };

    // If script already loaded
    if (typeof window !== 'undefined' && (window as any).google) {
      initializeGoogle();
    } else {
      // Wait for script to load (added in layout.tsx)
      const interval = setInterval(() => {
        if (typeof window !== 'undefined' && (window as any).google) {
          initializeGoogle();
          clearInterval(interval);
        }
      }, 100);
      return () => clearInterval(interval);
    }
  }, [handleCredentialResponse]);

  // Render Google's native hidden button as a reliable fallback
  const renderGoogleButton = useCallback((container: HTMLDivElement | null) => {
    googleButtonRef.current = container;
    if (container && typeof window !== 'undefined' && (window as any).google) {
      (window as any).google.accounts.id.renderButton(container, {
        type: 'standard',
        theme: 'outline',
        size: 'large',
        text: 'continue_with',
        shape: 'rectangular',
        width: '400',
      });
    }
  }, []);

  const signInWithGoogle = () => {
    if (typeof window !== 'undefined' && (window as any).google) {
      // Try to click Google's rendered button (most reliable approach)
      if (googleButtonRef.current) {
        const iframe = googleButtonRef.current.querySelector('iframe');
        const btn = googleButtonRef.current.querySelector('div[role="button"]') as HTMLElement;
        if (btn) {
          btn.click();
          return;
        }
      }
      // Fallback to prompt()
      (window as any).google.accounts.id.prompt((notification: any) => {
        if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
          console.log('Google One Tap not available, reason:', notification.getNotDisplayedReason?.() || notification.getSkippedReason?.());
          // If prompt fails, try opening Google's OAuth consent screen directly
          const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
          if (clientId) {
            const redirectUri = window.location.origin;
            const scope = 'openid email profile';
            const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=token&scope=${scope}&prompt=select_account`;
            // Open in popup window
            const popup = window.open(authUrl, 'google-auth', 'width=500,height=600,menubar=no,toolbar=no');
            if (!popup) {
              console.error('Popup blocked. Please allow popups for this site.');
            }
          }
        }
      });
    }
  };

  return { signInWithGoogle, isLoading, renderGoogleButton };
}
