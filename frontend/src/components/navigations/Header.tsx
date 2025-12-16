"use client";

import { Suspense, useState } from "react";
import {
  Menu,
  X,
  LogIn,
  LogOut,
  User,
  GraduationCap,
  Flame,
  Zap,
  Users,
  LayoutDashboard,
  Trophy,
} from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/src/components/auth";
import Skeleton from "@/src/components/ui/Skeleton";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import Image from "next/image";
import { ArrowLeft } from "lucide-react";

function HeaderContent() {
  const [isOpen, setIsOpen] = useState(false);
  const { user, loading, signOut, activeProfile } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const step = parseInt(searchParams.get("step") ?? "1");

  const isAuthPage =
    pathname === "/login" || (pathname === "/register" && step === 1);
  const isRegisterStep2 = pathname === "/register" && step === 2;

  return (
    <header className="sticky top-0 z-5 w-full flex justify-center bg-white border-b border-[#0C0A0126]">
      <div className="max-w-[1280px] w-full py-4 flex items-center justify-between ">
        <Link href="/" className="flex gap-[10px] items-center py-1.5">
          <Image
            src="/svg/GraduationCap.svg"
            alt="Logo"
            width={30}
            height={30}
          />

          <p className="text-base font-extrabold text-[#333333] font-nunito uppercase">
            HAPPY TEACHER
          </p>
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
              {/* User Stats */}
              <div
                className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-xl border border-gray-200"
                data-tutorial="streak-stat"
              >
                <Flame
                  size={18}
                  className="text-(--duo-red)"
                  strokeWidth={2.5}
                />
                <span className="text-sm font-bold text-gray-700">
                  {activeProfile?.streak || 0}
                </span>
              </div>

              <div
                className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-xl border border-gray-200"
                data-tutorial="xp-stat"
              >
                <Zap
                  size={18}
                  className="text-(--duo-yellow-dark)"
                  strokeWidth={2.5}
                />
                <span className="text-sm font-bold text-gray-700">
                  {activeProfile?.type === "child" ? activeProfile.xp || 0 : 0}
                </span>
              </div>

              {activeProfile?.type === "child" && (
                <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-xl border border-gray-200">
                  <Trophy
                    size={16}
                    className="text-yellow-600"
                    strokeWidth={2.5}
                  />
                  <span className="text-sm font-bold text-gray-700">
                    Lvl {activeProfile.level || 1}
                  </span>
                </div>
              )}

              {/* User Menu */}
              <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-xl border border-gray-200">
                <User size={16} className="text-gray-600" />
                <span className="text-sm font-semibold text-gray-700 hidden lg:inline">
                  {activeProfile?.name || user?.email?.split("@")[0]}
                </span>
              </div>

              {activeProfile?.type === "adult" && (
                <>
                  <button
                    onClick={() => router.push("/dashboard")}
                    className="duo-button duo-button-blue px-4 py-2 text-sm cursor-pointer flex items-center gap-2"
                    data-tutorial="dashboard-btn"
                  >
                    <LayoutDashboard size={16} />
                    <span>Dashboard</span>
                  </button>
                  <button
                    onClick={() => router.push("/profiles")}
                    className="duo-button duo-button-green px-4 py-2 text-sm cursor-pointer flex items-center gap-2"
                    data-tutorial="users-btn"
                  >
                    <Users size={16} />
                    <span>Users</span>
                  </button>
                </>
              )}

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
            <>
              {isRegisterStep2 ? (
                <button
                  onClick={() => router.push("/register?step=1")}
                  className="flex items-center gap-1.5 text-black font-extrabold font-nunito px-4 py-2 cursor-pointer"
                >
                  <ArrowLeft size={20} />
                  Буцах
                </button>
              ) : !isAuthPage ? (
                <div className="flex items-center gap-6">
                  <p className="text-xs font-extrabold text-[#333333] font-nunito cursor-pointer">
                    Тусламж
                  </p>
                  <button
                    onClick={() => router.push("/login")}
                    className="px-6 py-[10px] rounded-[10px] border-2 border-[#FFA239] text-sm font-extrabold text-[#FFA239] cursor-pointer uppercase font-nunito"
                  >
                    Нэвтрэх
                  </button>
                </div>
              ) : null}
            </>
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
                <>
                  <button
                    onClick={() => {
                      router.push("/dashboard");
                      setIsOpen(false);
                    }}
                    className="duo-button duo-button-blue w-full px-4 py-3 text-sm cursor-pointer flex items-center justify-center gap-2"
                    data-tutorial="dashboard-btn"
                  >
                    <LayoutDashboard size={16} />
                    <span>Dashboard</span>
                  </button>
                  <button
                    onClick={() => {
                      router.push("/profiles");
                      setIsOpen(false);
                    }}
                    className="duo-button duo-button-green w-full px-4 py-3 text-sm cursor-pointer flex items-center justify-center gap-2"
                    data-tutorial="users-btn"
                  >
                    <Users size={16} />
                    <span>Users</span>
                  </button>
                </>
              )}

              {/* User Stats Mobile */}
              <div className="flex gap-2 mb-2">
                <div
                  className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-gray-50 rounded-xl border border-gray-200"
                  data-tutorial="streak-stat"
                >
                  <Flame
                    size={18}
                    className="text-(--duo-red)"
                    strokeWidth={2.5}
                  />
                  <span className="text-sm font-bold text-gray-700">
                    {activeProfile?.streak || 0}
                  </span>
                </div>

                <div
                  className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-gray-50 rounded-xl border border-gray-200"
                  data-tutorial="xp-stat"
                >
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
            <>
              {isRegisterStep2 ? (
                <button
                  onClick={() => router.push("/register?step=1")}
                  className="flex items-center gap-2 text-[#333333] font-extrabold font-nunito w-full justify-center py-2"
                >
                  <ArrowLeft size={20} strokeWidth={3} />
                  БУЦАХ
                </button>
              ) : !isAuthPage ? (
                <div className="flex items-center gap-6">
                  <p className="text-xs font-normal text-[#333333] font-nunito">
                    Тусламж
                  </p>
                  <button
                    onClick={() => {
                      router.push("/login");
                      setIsOpen(false);
                    }}
                    className="px-6 py-[10px] border-2 border-[#FFA239] text-sm cursor-pointer uppercase font-nunito"
                  >
                    Нэвтрэх
                  </button>
                </div>
              ) : null}
            </>
          )}
        </div>
      )}
    </header>
  );
}

export const Header = () => {
  return (
    <Suspense fallback={
      <header className="sticky top-0 z-5 w-full flex justify-center bg-white border-b border-[#0C0A0126]">
        <div className="max-w-[1280px] w-full py-4 flex items-center justify-between">
          <div className="flex gap-[10px] items-center py-1.5">
            <Skeleton className="w-[30px] h-[30px]" />
            <Skeleton className="w-32 h-5" />
          </div>
          <div className="hidden md:flex items-center gap-3">
            <Skeleton className="w-16 h-10" />
            <Skeleton className="w-24 h-10" />
          </div>
        </div>
      </header>
    }>
      <HeaderContent />
    </Suspense>
  );
};
