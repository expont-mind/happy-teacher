"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookOpen, ShoppingBag, Users, Settings, LayoutDashboard } from "lucide-react";
import { useAuth } from "@/src/components/auth";
import { useNotifications } from "@/src/hooks/useNotifications";

interface NavItem {
  href: string;
  label: string;
  icon: React.ReactNode;
  activeIcon?: React.ReactNode;
  showDot?: boolean;
}

export function BottomNavbar() {
  const pathname = usePathname();
  const { activeProfile } = useAuth();
  const { unreadCount } = useNotifications();

  const isChild = activeProfile?.type === "child";

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname === href || pathname.startsWith(href + "/");
  };

  const childTabs: NavItem[] = [
    { href: "/topic", label: "Хичээл", icon: <BookOpen size={22} /> },
    { href: "/shop", label: "Дэлгүүр", icon: <ShoppingBag size={22} /> },
    { href: "/profiles", label: "Профайл", icon: <Users size={22} /> },
  ];

  const parentTabs: NavItem[] = [
    { href: "/dashboard", label: "Самбар", icon: <LayoutDashboard size={22} /> },
    { href: "/shop", label: "Дэлгүүр", icon: <ShoppingBag size={22} /> },
    { href: "/profiles", label: "Профайл", icon: <Users size={22} /> },
    {
      href: "/settings",
      label: "Тохиргоо",
      icon: <Settings size={22} />,
      showDot: unreadCount > 0,
    },
  ];

  const tabs = isChild ? childTabs : parentTabs;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 md:hidden bg-white border-t border-gray-200 pb-[env(safe-area-inset-bottom)]">
      <div className="flex items-center justify-around h-16">
        {tabs.map((tab) => {
          const active = isActive(tab.href);
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`flex flex-col items-center justify-center gap-0.5 flex-1 h-full transition-colors ${
                active ? "text-[#58CC02]" : "text-gray-400"
              }`}
            >
              <div className="relative">
                {tab.icon}
                {tab.showDot && (
                  <span className="absolute -top-0.5 -right-1 w-2 h-2 bg-[#FF4B4B] rounded-full" />
                )}
              </div>
              <span
                className={`text-[10px] font-nunito ${
                  active ? "font-bold" : "font-semibold"
                }`}
              >
                {tab.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
