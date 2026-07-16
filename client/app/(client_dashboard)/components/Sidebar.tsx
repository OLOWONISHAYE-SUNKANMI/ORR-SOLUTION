'use client';

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import {
  ChevronDown,
  ChevronRight,
  LayoutGrid,
  Menu,
  X,
  LogOut,
  Loader2,
  Lock,
  ChevronLeft,
  Home,
  Wallet,
  User,
  Calendar,
  FileText,
  HelpCircle,
  Bell,
  Sparkles,
  Settings,
  PieChart,
  ChevronLast,
  ChevronFirst,
  SquareArrowLeft,
  LogOut as LogoutIcon
} from "lucide-react";
import Link from "next/link";
import { useAuthStore } from "@/store/authStore";
import { useProfileStore } from "@/store/profileStore";
import { useLanguage } from "../../components/LanguageProvider";
import { LanguageToggle } from "../../components/LanguageToggle";
import { ThemeToggle } from "../../components/ThemeToggle";

type OpenState = {
  home: boolean;
  pages: boolean;
  applications: boolean;
  ecommerce: boolean;
  auth: boolean;
};

export default function Sidebar() {
  const { t, interpolate } = useLanguage();
  const pathname = usePathname();
  const { user, logout } = useAuthStore();
  const { profile, fetchProfile } = useProfileStore();
  const [open, setOpen] = useState<OpenState>({
    home: true,
    pages: true,
    applications: false,
    ecommerce: false,
    auth: false,
  });
  const [subOpen, setSubOpen] = useState<{ [key: string]: boolean }>({});
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const toggle = (key: keyof OpenState) => setOpen({ ...open, [key]: !open[key] });
  const toggleSub = (key: string) => setSubOpen({ ...subOpen, [key]: !subOpen[key] });

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-card rounded-lg shadow-lg"
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
      >
        {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`h-screen bg-card text-white flex flex-col justify-between p-6 flex-shrink-0 overflow-y-auto overflow-x-hidden transition-all duration-300 ease-in-out ${isMinimized ? 'w-20' : 'w-[300px]'
        } ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0 fixed lg:relative z-50 lg:z-auto print:hidden`}>

        <div>
          {/* Header: Logo & Toggle */}
          <div className={`flex items-center mb-12 transition-all ${isMinimized ? 'justify-center' : 'justify-between'}`}>
            <div className="flex items-center gap-2 overflow-hidden">
              <img
                src="/images/logo.svg"
                alt="Logo"
                className={`${isMinimized ? 'w-20 h-20' : 'h-24 w-auto'} transition-all brightness-0 invert`}
              />
            </div>

            <button
              onClick={() => setIsMinimized(!isMinimized)}
              className="hidden lg:flex w-9 h-9 bg-white/5 hover:bg-white/10 rounded-xl items-center justify-center transition-colors border border-white/10"
            >
              {isMinimized ? <ChevronLast size={20} /> : <SquareArrowLeft size={20} />}
            </button>
          </div>

          <nav className="space-y-10">
            {/* Group 1: Home */}
            <SidebarGroup
              label={interpolate(t.dashboard.sidebar.groups.home)}
              icon={<LayoutGrid size={24} />}
              open={open.home}
              isMinimized={isMinimized}
              onClick={() => toggle("home")}
              items={[
                { label: interpolate(t.dashboard.sidebar.items.dashboard), href: "/dashboard" },
                { label: "AI Assistant", href: "/ai-assistant" },
                { 
                  label: "Expert Requests", 
                  href: "/problem-request",
                  hasSub: true,
                  subItems: [
                    { label: "New Request", href: "/problem-request" },
                    { label: "My Requests", href: "/problem-request/history" }
                  ]
                },
                { label: interpolate(t.dashboard.sidebar.items.analytics), href: "/analytics" }
              ]}
              pathname={pathname}
              subOpen={subOpen}
              toggleSub={toggleSub}
            />

            {/* Group 2: My Finances */}
            <SidebarGroup
              label={interpolate(t.dashboard.sidebar.groups.myFinances)}
              icon={<PieChart size={24} />}
              open={open.applications} // Reusing applications state
              isMinimized={isMinimized}
              onClick={() => toggle("applications")}
              items={[
                { label: interpolate(t.dashboard.sidebar.items.myWallet), href: "/account/wallet" },
                { label: interpolate(t.dashboard.sidebar.items.myInvoices), href: "/account/invoices" }
              ]}
              pathname={pathname}
              subOpen={subOpen}
              toggleSub={toggleSub}
            />

            {/* Group 3: Pages */}
            <SidebarGroup
              label={interpolate(t.dashboard.sidebar.groups.pages)}
              icon={<FileText size={24} />}
              open={open.pages}
              isMinimized={isMinimized}
              onClick={() => toggle("pages")}
              items={[
                {
                  label: interpolate(t.dashboard.sidebar.items.myProfile),
                  href: "/account",
                  hasSub: true,
                  subItems: [
                    { label: interpolate(t.dashboard.sidebar.items.personalInfo), href: "/account/settings" },
                    { label: interpolate(t.dashboard.sidebar.items.personalization), href: "/account/personalization" },
                    { label: interpolate(t.dashboard.sidebar.items.businessInfo), href: "/account/business-info" },
                  ]
                },
                {
                  label: interpolate(t.dashboard.sidebar.groups.consultations),
                  href: "/consultations",
                  hasSub: true,
                  subItems: [
                    { label: interpolate(t.dashboard.sidebar.items.bookMeeting), href: "/consultations/book" },
                    { label: interpolate(t.dashboard.sidebar.items.upcomingConsultations), href: "/consultations/upcoming-consultations" },
                    { label: interpolate(t.dashboard.sidebar.items.pastConsultations), href: "/consultations/past-consultations" },
                  ]
                },
                {
                  label: interpolate(t.dashboard.sidebar.groups.documentVault),
                  href: "/document",
                  hasSub: true,
                  subItems: [
                    { label: "My Workspace", href: "/document" },
                    // { label: interpolate(t.dashboard.sidebar.items.reports), href: "/document/reports" },
                    // { label: interpolate(t.dashboard.sidebar.items.uploads), href: '/document/uploads' },
                    { label: "Activity Log", href: "/document/activity" },
                    { label: interpolate(t.dashboard.sidebar.items.catalogue), href: "/document/catalogue" }
                  ]
                },
                { label: interpolate(t.dashboard.sidebar.items.messages), href: '/messages' },
                { label: interpolate(t.dashboard.sidebar.items.updates), href: "/updates" },
                {
                  label: interpolate(t.dashboard.sidebar.groups.support),
                  href: "/support",
                  hasSub: true,
                  subItems: [
                    { label: interpolate(t.dashboard.sidebar.items.faqs), href: "/faq" },
                    { label: interpolate(t.dashboard.sidebar.items.requestSupport), href: "/support" },
                    { label: interpolate(t.dashboard.sidebar.items.supportHistory), href: "/support-history" }
                  ]
                }
              ]}
              pathname={pathname}
              subOpen={subOpen}
              toggleSub={toggleSub}
            />
          </nav>
        </div>

        <div className="mt-12 space-y-6">
          {/* Settings Card: DISPLAY & LANGUAGE */}
          {!isMinimized && (
            <div className="px-1 transition-opacity duration-300">
              <div className="bg-transparent border border-white/20 rounded-[2.5rem] p-8 space-y-6">
                <span className="text-xs font-black text-white/30 uppercase tracking-[0.3em] block px-1">
                  Display & Language
                </span>
                <div className="flex items-center justify-between gap-4">
                  <LanguageToggle />
                  <div className="bg-white/5 p-3 rounded-2xl border border-white/5">
                    <ThemeToggle />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* User Card: Solid Green */}
          <div className={`bg-[#22C55E] text-white rounded-[2.5rem] p-4 flex items-center shadow-2xl transition-all ${isMinimized ? 'justify-center mx-1 h-16' : 'justify-between h-24 px-6'}`}>
            <div className="flex items-center gap-4 overflow-hidden">
              <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white font-black overflow-hidden border border-white/20 flex-shrink-0">
                {profile?.profile_pic ? (
                  <img
                    src={profile.profile_pic}
                    alt="Profile"
                    className="w-full h-full object-cover rounded-full"
                  />
                ) : (
                  <span className="text-xl">{(profile?.first_name?.[0] || 'O')}{(profile?.last_name?.[0] || 'S')}</span>
                )}
              </div>
              {!isMinimized && (
                <div className="leading-tight overflow-hidden animate-in fade-in duration-500">
                  <div className="font-black truncate max-w-[140px] text-[15px]">{profile?.first_name} {profile?.last_name}</div>
                  <div className="text-[11px] opacity-80 truncate max-w-[140px] font-medium">{user?.email}</div>
                </div>
              )}
            </div>
            {!isMinimized && (
              <button
                onClick={logout}
                className="p-2 hover:bg-white/20 rounded-xl transition-colors flex-shrink-0"
              >
                <LogoutIcon size={28} />
              </button>
            )}
          </div>
        </div>
      </aside>
    </>
  );
}

type NavItem = {
  label: string;
  href: string;
  subItems?: NavItem[];
  locked?: boolean;
  lockTitle?: string;
  lockMessage?: string;
  icon?: React.ReactNode;
  hasSub?: boolean;
};

function SidebarGroup({
  label,
  open,
  onClick,
  items,
  pathname,
  subOpen,
  toggleSub,
  isMinimized,
  icon
}: {
  label: string;
  open: boolean;
  onClick: () => void;
  items: NavItem[];
  pathname: string;
  subOpen: { [key: string]: boolean };
  toggleSub: (key: string) => void;
  isMinimized?: boolean;
  icon?: React.ReactNode;
}) {
  const { t, interpolate } = useLanguage();
  const isActive = items.some(item => pathname === item.href || item.subItems?.some(sub => pathname === sub.href));

  return (
    <div className="space-y-4">
      <div
        className={`flex items-center gap-4 cursor-pointer transition-all duration-300 ${isMinimized ? 'justify-center' : 'justify-between'
          } ${isActive ? "text-white" : "text-white/60 hover:text-white"
          }`}
        onClick={() => !isMinimized && onClick()}
      >
        <div className="flex items-center gap-4">
          <div className="flex-shrink-0">
            {icon || <LayoutGrid size={22} />}
          </div>
          {!isMinimized && (
            <span className="text-lg font-black tracking-tight animate-in fade-in slide-in-from-left-2 duration-300">
              {label}
            </span>
          )}
        </div>

        {!isMinimized && (
          <ChevronDown
            size={18}
            className={`transition-transform duration-500 opacity-40 ${open ? "rotate-180" : ""}`}
          />
        )}
      </div>

      {!isMinimized && open && items.length > 0 && (
        <div className="pl-10 space-y-4 animate-in fade-in slide-in-from-top-1 duration-300">
          {items.map((item) => (
            <div key={item.href} className="relative">
              {item.subItems ? (
                <div>
                  <div
                    onClick={() => toggleSub(item.href)}
                    className={`flex items-center justify-between text-[15px] font-bold cursor-pointer transition-colors ${pathname === item.href || item.subItems.some(sub => pathname === sub.href) ? "text-white" : "text-white/60 hover:text-white"
                      }`}
                  >
                    <span>{item.label}</span>
                    <ChevronRight size={16} className={`transition-transform duration-300 opacity-40 ${subOpen[item.href] ? 'rotate-90' : ''}`} />
                  </div>
                  {subOpen[item.href] && (
                    <div className="mt-3 ml-4 space-y-3 animate-in slide-in-from-left-1 duration-200">
                      {item.subItems.map((subItem) => (
                        <Link
                          key={subItem.href}
                          href={subItem.href}
                          className={`block text-[14px] font-medium transition-all ${pathname === subItem.href
                            ? "text-white"
                            : "text-white/40 hover:text-white"
                            }`}
                        >
                          {subItem.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <Link
                  href={item.href}
                  className={`block text-[15px] font-bold transition-all ${pathname === item.href
                    ? "text-white"
                    : "text-white/60 hover:text-white"
                    }`}
                >
                  {item.label}
                </Link>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
