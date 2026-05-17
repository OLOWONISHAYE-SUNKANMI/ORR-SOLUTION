import { LandingHeader } from "../components/LandingHeader"; 
import { LandingFooter } from "../components/LandingFooter";
import AnimatedBackground from "../../components/AnimatedBackground";
import { CookieConsent } from "../components/CookieConsent";
import { ScrollToTop } from "../components/ScrollToTop";


export default function LandingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden">
      <ScrollToTop />
      <LandingHeader />

      <AnimatedBackground />
      
      <main className="flex-1 star relative z-20">
        {children}
      </main>
      <LandingFooter />
      <CookieConsent />
    </div>
  );
}