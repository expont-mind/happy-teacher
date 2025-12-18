"use client";

import { Suspense, useState, useRef, useEffect } from "react";
import {
  Menu,
  X,
  Flame,
  Zap,
  Users,
  Trophy,
  Settings,
  Bell,
  HelpCircle,
  LogOut,
} from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/src/components/auth";
import { useNotifications } from "@/src/hooks/useNotifications";
import NotificationPanel from "@/src/components/notifications/NotificationPanel";
import Skeleton from "@/src/components/ui/Skeleton";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import Image from "next/image";
import { ArrowLeft } from "lucide-react";
import LogoutModal from "@/src/components/auth/LogoutModal";

function HeaderContent() {
  const [isOpen, setIsOpen] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const notificationRef = useRef<HTMLDivElement>(null);
  const { user, loading, signOut, activeProfile } = useAuth();
  const { notifications, unreadCount, markAsRead, markAllAsRead } =
    useNotifications();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const step = parseInt(searchParams.get("step") ?? "1");

  const isAuthPage =
    pathname === "/login" || (pathname === "/register" && step === 1);
  const isRegisterStep2 = pathname === "/register" && step === 2;
  const isLessonPage = /^\/topic\/[^/]+\/[^/]+$/.test(pathname);

  const [mobileNotificationsOpen, setMobileNotificationsOpen] = useState(false);

  // Close notifications when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        notificationRef.current &&
        !notificationRef.current.contains(event.target as Node)
      ) {
        setShowNotifications(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleLogoutClick = () => {
    setIsLogoutModalOpen(true);
    setIsOpen(false); // Close mobile menu if open
  };

  const confirmSignOut = async () => {
    try {
      await signOut();
      setIsLogoutModalOpen(false);
    } catch (error) {
      // Error is handled in AuthProvider
    }
  };

  const NotificationButton = () => (
    <div
      className="relative"
      data-tutorial="notifications-btn"
      ref={notificationRef}
    >
      <button
        onClick={() => setShowNotifications(!showNotifications)}
        className={`px-3 py-[10px] border-2 border-[#0C0A0126] hover:border-[#58CC02] rounded-[10px] transition-colors cursor-pointer duration-300 ${
          showNotifications ? "border-[#58CC02] bg-gray-50" : ""
        }`}
      >
        <Bell
          size={20}
          className={unreadCount > 0 ? "text-[#FF4B4B]" : "text-[#FBBF24]"}
        />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-[#FF4B4B] text-[10px] font-bold text-white border-2 border-white">
            {unreadCount}
          </span>
        )}
      </button>

      {showNotifications && (
        <NotificationPanel
          notifications={notifications}
          onMarkAsRead={markAsRead}
          onMarkAllAsRead={markAllAsRead}
          onClose={() => setShowNotifications(false)}
        />
      )}
    </div>
  );

  return (
    <>
      <header className={`${isLessonPage ? '' : 'sticky top-0'} z-50 w-full flex justify-center bg-white border-b border-[#0C0A0126] px-4`}>
        <div className="max-w-[1280px] w-full py-4 flex items-center justify-between">
          <Link href="/" className="flex gap-[10px] items-center py-1.5 z-20">
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
                <Skeleton className="w-12 h-11 rounded-[10px]" />
                <Skeleton className="w-12 h-11 rounded-[10px]" />
                <Skeleton className="w-12 h-11 rounded-[10px]" />
                <Skeleton className="w-12 h-11 rounded-[10px]" />
              </div>
            ) : user || activeProfile ? (
              <div className="flex items-center gap-3">
                {activeProfile?.type === "child" ? (
                  <>
                    {/* Child View: Stats, Notifications, Help, Logout */}
                    <div
                      className="px-3 py-[10px] border-2 border-[#0C0A0126] rounded-[10px] flex items-center gap-1 text-[#B6B5B2] font-extrabold text-base font-nunito leading-5"
                      data-tutorial="streak-stat"
                    >
                      <Flame size={20} color="#ff4b4b" />
                      {activeProfile?.streak || 0}
                    </div>

                    <div
                      className="px-3 py-[10px] border-2 border-[#0C0A0126] rounded-[10px] flex items-center gap-1 text-[#B6B5B2] font-extrabold text-base font-nunito leading-5"
                      data-tutorial="xp-stat"
                    >
                      <Zap size={20} color="#FBBF24" />
                      {activeProfile.xp || 0}
                    </div>

                    <div
                      className="px-3 py-[10px] border-2 border-[#0C0A0126] rounded-[10px] flex items-center gap-1 text-[#B6B5B2] font-extrabold text-base font-nunito leading-5"
                      data-tutorial="level-stat"
                    >
                      <Trophy size={20} color="#FBBF24" />
                      {activeProfile.level || 1}
                    </div>

                    <Link href="/profiles" data-tutorial="profiles-btn">
                      <button className="px-3 py-[10px] border-2 border-[#0C0A0126] hover:border-[#58CC02] rounded-[10px] transition-colors cursor-pointer duration-300">
                        <Users size={20} color="#58CC02" />
                      </button>
                    </Link>

                    <NotificationButton />

                    <Link href="/help" data-tutorial="help-btn">
                      <button className="px-3 py-[10px] border-2 border-[#0C0A0126] hover:border-[#58CC02] rounded-[10px] transition-colors cursor-pointer duration-300">
                        <HelpCircle size={20} color="#CC584D" />
                      </button>
                    </Link>

                    <button
                      onClick={handleLogoutClick}
                      className="px-3 py-[10px] border-2 border-[#0C0A0126] hover:border-[#58CC02] rounded-[10px] transition-colors cursor-pointer duration-300"
                    >
                      <LogOut size={20} />
                    </button>
                  </>
                ) : (
                  <>
                    {/* Adult View: Settings, Users, Notifications, Help, Logout */}
                    <Link href="/profiles" data-tutorial="profiles-btn">
                      <button className="px-3 py-[10px] border-2 border-[#0C0A0126] hover:border-[#58CC02] rounded-[10px] transition-colors cursor-pointer duration-300">
                        <Users size={20} color="#58CC02" />
                      </button>
                    </Link>

                    <NotificationButton />

                    <Link href="/settings" data-tutorial="settings-btn">
                      <button className="px-3 py-[10px] border-2 border-[#0C0A0126] hover:border-[#58CC02] rounded-[10px] transition-colors cursor-pointer duration-300">
                        <Settings size={20} color="#70B6E5" />
                      </button>
                    </Link>

                    <Link href="/help" data-tutorial="help-btn">
                      <button className="px-3 py-[10px] border-2 border-[#0C0A0126] hover:border-[#58CC02] rounded-[10px] transition-colors cursor-pointer duration-300">
                        <HelpCircle size={20} color="#CC584D" />
                      </button>
                    </Link>

                    <button
                      onClick={handleLogoutClick}
                      className="px-3 py-[10px] border-2 border-[#0C0A0126] hover:border-[#58CC02] rounded-[10px] transition-colors cursor-pointer duration-300"
                    >
                      <LogOut size={20} color="black" />
                    </button>
                  </>
                )}
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
                    <Link href="/help" prefetch={true}>
                      <p className="text-xs font-extrabold text-[#333333] font-nunito cursor-pointer">
                        Тусламж
                      </p>
                    </Link>
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
          {!isOpen && (
            <button
              onClick={() => setIsOpen(true)}
              className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors z-20"
              data-tutorial="mobile-menu-btn"
            >
              <Menu size={24} className="text-gray-700" />
            </button>
          )}
        </div>

        {/* Mobile Menu Overlay */}
        <div
          className={`fixed inset-0 z-50 md:hidden transition-all duration-300 ${
            isOpen
              ? "visible pointer-events-auto"
              : "invisible pointer-events-none"
          }`}
        >
          {/* Backdrop */}
          <div
            className={`fixed inset-0 bg-black/50 transition-opacity duration-300 ease-in-out ${
              isOpen ? "opacity-100" : "opacity-0"
            }`}
            onClick={() => setIsOpen(false)}
          />

          {/* Drawer */}
          <div
            className={`fixed inset-y-0 right-0 w-[280px] bg-white shadow-xl z-50 transform transition-transform duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] ${
              isOpen ? "translate-x-0" : "translate-x-full"
            }`}
          >
            <div className="p-4 flex flex-col h-full overflow-y-auto">
              <div className="flex justify-end mb-4">
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <X size={24} className="text-gray-700" />
                </button>
              </div>

              {mobileNotificationsOpen ? (
                <NotificationPanel
                  notifications={notifications}
                  onMarkAsRead={markAsRead}
                  onMarkAllAsRead={markAllAsRead}
                  onClose={() => setMobileNotificationsOpen(false)}
                  className="!relative !top-0 !right-0 !w-full !mt-0 !shadow-none !border-0"
                />
              ) : (
                <div className="flex flex-col gap-3">
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
                      {activeProfile?.type === "child" ? (
                        <>
                          {/* Child View Mobile */}
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
                              <span className="text-sm font-bold text-gray-700">
                                {activeProfile.xp || 0}
                              </span>
                            </div>

                            <div
                              className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-gray-50 rounded-xl border border-gray-200"
                              data-tutorial="level-stat"
                            >
                              <Trophy
                                size={18}
                                className="text-(--duo-yellow-dark)"
                                strokeWidth={2.5}
                              />
                              <span className="text-sm font-bold text-gray-700">
                                {activeProfile.level || 1}
                              </span>
                            </div>
                          </div>

                          <button
                            onClick={() => setMobileNotificationsOpen(true)}
                            className="duo-button duo-button-gray w-full px-4 py-3 text-sm cursor-pointer flex items-center justify-center gap-2"
                          >
                            <Bell size={16} />
                            <span>Мэдэгдэл</span>
                          </button>

                          <Link
                            href="/help"
                            onClick={() => setIsOpen(false)}
                            className="w-full"
                          >
                            <button className="duo-button duo-button-gray w-full px-4 py-3 text-sm cursor-pointer flex items-center justify-center gap-2">
                              <HelpCircle size={16} />
                              <span>Тусламж</span>
                            </button>
                          </Link>

                          <Link
                            href="/profiles"
                            onClick={() => setIsOpen(false)}
                            className="w-full"
                          >
                            <button className="duo-button duo-button-green w-full px-4 py-3 text-sm cursor-pointer flex items-center justify-center gap-2">
                              <Users size={16} />
                              <span>Профайл солих</span>
                            </button>
                          </Link>

                          <button
                            onClick={handleLogoutClick}
                            className="duo-button duo-button-gray w-full px-4 py-3 text-sm cursor-pointer flex items-center justify-center gap-2"
                          >
                            <LogOut size={16} />
                            <span>Гарах</span>
                          </button>
                        </>
                      ) : (
                        <>
                          {/* Adult View Mobile */}

                          <Link
                            href="/profiles"
                            onClick={() => setIsOpen(false)}
                            className="w-full"
                          >
                            <button className="duo-button duo-button-green w-full px-4 py-3 text-sm cursor-pointer flex items-center justify-center gap-2">
                              <Users size={16} />
                              <span>Хэрэглэгчид</span>
                            </button>
                          </Link>

                          <button
                            onClick={() => setMobileNotificationsOpen(true)}
                            className="duo-button duo-button-gray w-full px-4 py-3 text-sm cursor-pointer flex items-center justify-center gap-2"
                          >
                            <Bell size={16} />
                            <span>Мэдэгдэл</span>
                          </button>

                          <Link
                            href="/settings"
                            onClick={() => setIsOpen(false)}
                            className="w-full"
                          >
                            <button className="duo-button duo-button-blue w-full px-4 py-3 text-sm cursor-pointer flex items-center justify-center gap-2">
                              <Settings size={16} />
                              <span>Тохиргоо</span>
                            </button>
                          </Link>

                          <Link
                            href="/help"
                            onClick={() => setIsOpen(false)}
                            className="w-full"
                          >
                            <button className="duo-button duo-button-gray w-full px-4 py-3 text-sm cursor-pointer flex items-center justify-center gap-2">
                              <HelpCircle size={16} />
                              <span>Тусламж</span>
                            </button>
                          </Link>

                          <button
                            onClick={handleLogoutClick}
                            className="duo-button duo-button-gray w-full px-4 py-3 text-sm cursor-pointer flex items-center justify-center gap-2"
                          >
                            <LogOut size={16} />
                            <span>Гарах</span>
                          </button>
                        </>
                      )}
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
                        <div className="flex flex-col gap-4 items-center w-full">
                          <Link href="/help" prefetch={true} className="w-full">
                            <button className="duo-button duo-button-gray w-full text-sm font-bold">
                              Тусламж
                            </button>
                          </Link>
                          <button
                            onClick={() => {
                              router.push("/login");
                              setIsOpen(false);
                            }}
                            className="w-full py-3 rounded-[16px] bg-white border-2 border-[#E5E5E5] shadow-[0_4px_0_#E5E5E5] active:shadow-none active:translate-y-[4px] transition-all text-[#58CC02] font-extrabold uppercase"
                          >
                            Нэвтрэх
                          </button>
                        </div>
                      ) : null}
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      <LogoutModal
        isOpen={isLogoutModalOpen}
        onClose={() => setIsLogoutModalOpen(false)}
        onConfirm={confirmSignOut}
      />
    </>
  );
}

export const Header = () => {
  return (
    <Suspense
      fallback={
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
      }
    >
      <HeaderContent />
    </Suspense>
  );
};
