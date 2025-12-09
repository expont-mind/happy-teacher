"use client";

import { useState } from "react";
import {
  Menu,
  X,
  LogIn,
  LogOut,
  User,
  GraduationCap,
  Flame,
  Zap,
  Baby,
  Plus,
  Users,
} from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/src/components/auth";
import AuthModal from "@/src/components/auth/AuthModal";
import Skeleton from "@/src/components/ui/Skeleton";
import { useRouter } from "next/navigation";

export const Header = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const { user, loading, signOut, activeProfile } = useAuth();
  const router = useRouter();

  return (
    <nav className="sticky top-0 z-50 bg-white border-b-2 border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 cursor-pointer group">
          <GraduationCap
            size={32}
            className="text-(--duo-green) group-hover:scale-110 transition-transform"
            strokeWidth={2.5}
          />
          <span
            className="text-xl font-black hidden sm:inline"
            style={{ color: "var(--duo-green)" }}
          >
            Happy Teacher
          </span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-3">
          {loading ? (
            <div className="flex items-center gap-3">
              <Skeleton className="w-16 h-10" />
              <Skeleton className="w-16 h-10" />
              <Skeleton className="w-40 h-10" />
              <Skeleton className="w-24 h-10" />
            </div>
          ) : user || activeProfile ? (
            <div className="flex items-center gap-3">
              {/* Manage Profiles Button - Only for Adults */}
              {activeProfile?.type === "adult" && (
                <button
                  onClick={() => router.push("/profiles")}
                  className="duo-button duo-button-green px-4 py-2 text-sm cursor-pointer flex items-center gap-2"
                >
                  <Users size={16} />
                  <span>Профайл</span>
                </button>
              )}

              {/* User Stats */}
              <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-xl border border-gray-200" data-tutorial="streak-stat">
                <Flame
                  size={18}
                  className="text-(--duo-red)"
                  strokeWidth={2.5}
                />
                <span className="text-sm font-bold text-gray-700">0</span>
              </div>

              <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-xl border border-gray-200" data-tutorial="xp-stat">
                <Zap
                  size={18}
                  className="text-(--duo-yellow-dark)"
                  strokeWidth={2.5}
                />
                <span className="text-sm font-bold text-gray-700">0</span>
              </div>

              {/* User Menu */}
              <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-xl border border-gray-200">
                <User size={16} className="text-gray-600" />
                <span className="text-sm font-semibold text-gray-700 hidden lg:inline">
                  {activeProfile?.name || user?.email?.split("@")[0]}
                </span>
              </div>

              <button
                onClick={async () => {
                  try {
                    await signOut();
                  } catch (error) {
                    // Error is handled in AuthProvider
                  }
                }}
                className="duo-button duo-button-gray px-4 py-2 text-sm cursor-pointer flex items-center gap-2"
              >
                <LogOut size={16} />
                <span>Гарах</span>
              </button>
            </div>
          ) : (
            <button
              onClick={() => setShowAuthModal(true)}
              className="duo-button duo-button-blue px-6 py-3 text-sm cursor-pointer flex items-center gap-2"
            >
              <LogIn size={16} />
              <span>Нэвтрэх</span>
            </button>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
        >
          {isOpen ? (
            <X size={24} className="text-gray-700" />
          ) : (
            <Menu size={24} className="text-gray-700" />
          )}
        </button>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden bg-white border-t border-gray-200 px-4 py-4 flex flex-col gap-3">
          {loading ? (
            <>
              <div className="flex gap-2 mb-2">
                <Skeleton className="flex-1 h-10" />
                <Skeleton className="flex-1 h-10" />
              </div>
              <Skeleton className="w-full h-10" />
              <Skeleton className="w-full h-12" />
            </>
          ) : user || activeProfile ? (
            <>
              {activeProfile?.type === "adult" && (
                <button
                  onClick={() => {
                    router.push("/profiles");
                    setIsOpen(false);
                  }}
                  className="duo-button duo-button-green w-full px-4 py-3 text-sm cursor-pointer flex items-center justify-center gap-2"
                >
                  <Users size={16} />
                  <span>Профайл</span>
                </button>
              )}

              {/* User Stats Mobile */}
              <div className="flex gap-2 mb-2">
                <div className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-gray-50 rounded-xl border border-gray-200" data-tutorial="streak-stat">
                  <Flame
                    size={18}
                    className="text-(--duo-red)"
                    strokeWidth={2.5}
                  />
                  <span className="text-sm font-bold text-gray-700">0</span>
                </div>

                <div className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-gray-50 rounded-xl border border-gray-200" data-tutorial="xp-stat">
                  <Zap
                    size={18}
                    className="text-(--duo-yellow-dark)"
                    strokeWidth={2.5}
                  />
                  <span className="text-sm font-bold text-gray-700">0</span>
                </div>
              </div>

              <div className="px-4 py-2 text-gray-700 text-sm font-semibold flex items-center gap-2 bg-gray-50 rounded-xl">
                <User size={16} />
                <span>{activeProfile?.name || user?.email}</span>
              </div>

              <button
                onClick={async () => {
                  try {
                    await signOut();
                    setIsOpen(false);
                  } catch (error) {
                    // Error is handled in AuthProvider
                  }
                }}
                className="duo-button duo-button-gray w-full px-4 py-3 text-sm cursor-pointer flex items-center justify-center gap-2"
              >
                <LogOut size={16} />
                <span>Гарах</span>
              </button>
            </>
          ) : (
            <button
              onClick={() => {
                setShowAuthModal(true);
                setIsOpen(false);
              }}
              className="duo-button duo-button-blue w-full px-4 py-3 text-sm cursor-pointer flex items-center justify-center gap-2"
            >
              <LogIn size={16} />
              <span>Нэвтрэх</span>
            </button>
          )}
        </div>
      )}

      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
      />
    </nav>
  );
};
