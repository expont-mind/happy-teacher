"use client";

import { useEffect } from "react";
import Link from "next/link";
import {
  GraduationCap,
  Sparkles,
  Palette,
  Gamepad2,
  Trophy,
  BookOpen,
  Flame,
  Zap,
  Award,
} from "lucide-react";
import { useTutorial, homePageTutorial } from "@/src/components/tutorial";

export const HomePage = () => {
  const { startTutorial } = useTutorial();

  useEffect(() => {
    startTutorial(homePageTutorial);
  }, [startTutorial]);

  return (
    <div className="min-h-screen w-full bg-linear-to-b from-blue-50 to-white">
      {/* Hero Section */}
      <div className="max-w-6xl mx-auto px-4 py-12 md:py-20">
        {/* Main Title with Icon */}
        <div className="text-center mb-12 animate-bounce-in">
          <div className="flex justify-center items-center gap-4 mb-6">
            {/* Owl/Teacher Icon */}
            <div className="animate-float">
              <GraduationCap
                size={80}
                className="text-(--duo-green)"
                strokeWidth={2.5}
              />
            </div>
          </div>

          <h1
            className="text-5xl md:text-7xl font-black mb-4 text-shadow-lg"
            style={{ color: "var(--duo-green)" }}
          >
            Happy Teacher
          </h1>

          <p className="text-xl md:text-2xl font-bold text-gray-700 max-w-2xl mx-auto">
            Математикийг хөгжилтэй сурцгаая!
          </p>
        </div>

        {/* Main CTA Button - Duolingo Style */}
        <div className="flex justify-center mb-16">
          <Link href="/topic" className="cursor-pointer" data-tutorial="main-cta">
            <button className="duo-button duo-button-green px-12 py-5 text-xl md:text-2xl font-black flex items-center gap-3">
              <Sparkles size={28} />
              <span>Эхлэх</span>
            </button>
          </Link>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          {/* Fractions Card */}
          <Link
            href="/topic/fractions"
            className="duo-card cursor-pointer group"
            data-tutorial="fractions-card"
            prefetch={true}
          >
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-blue-100 rounded-2xl group-hover:scale-110 transition-transform">
                <BookOpen
                  size={48}
                  className="text-(--duo-blue)"
                  strokeWidth={2.5}
                />
              </div>
              <div>
                <h3
                  className="text-2xl font-black mb-1"
                  style={{ color: "var(--duo-blue)" }}
                >
                  Бутархай
                </h3>
                <p className="text-gray-600 font-semibold">
                  Бутархай тоонуудтай танилцаарай
                </p>
              </div>
            </div>
            <div className="duo-progress">
              <div className="duo-progress-fill" style={{ width: "0%" }}></div>
            </div>
          </Link>

          {/* Multiplication Card */}
          <Link
            href="/topic/multiplication"
            className="duo-card cursor-pointer group"
            data-tutorial="multiplication-card"
            prefetch={true}
          >
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-purple-100 rounded-2xl group-hover:scale-110 transition-transform">
                <svg
                  width="48"
                  height="48"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="var(--duo-purple)"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </div>
              <div>
                <h3
                  className="text-2xl font-black mb-1"
                  style={{ color: "var(--duo-purple)" }}
                >
                  Үржих
                </h3>
                <p className="text-gray-600 font-semibold">
                  Үржих үйлдлийг эзэмшээрэй
                </p>
              </div>
            </div>
            <div className="duo-progress">
              <div className="duo-progress-fill" style={{ width: "0%" }}></div>
            </div>
          </Link>
        </div>

        {/* Benefits Section */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-6 bg-white rounded-2xl border-2 border-gray-100 hover:border-[--duo-green] transition-all">
            <div className="flex justify-center mb-3">
              <Palette
                size={40}
                className="text-[--duo-green]"
                strokeWidth={2}
              />
            </div>
            <p className="font-bold text-gray-700">Будах</p>
          </div>

          <div className="text-center p-6 bg-white rounded-2xl border-2 border-gray-100 hover:border-[--duo-blue] transition-all">
            <div className="flex justify-center mb-3">
              <Gamepad2
                size={40}
                className="text-[--duo-blue]"
                strokeWidth={2}
              />
            </div>
            <p className="font-bold text-gray-700">Тоглох</p>
          </div>

          <div className="text-center p-6 bg-white rounded-2xl border-2 border-gray-100 hover:border-[--duo-yellow] transition-all">
            <div className="flex justify-center mb-3">
              <Trophy
                size={40}
                className="text-[--duo-yellow-dark]"
                strokeWidth={2}
              />
            </div>
            <p className="font-bold text-gray-700">Ялах</p>
          </div>

          <div className="text-center p-6 bg-white rounded-2xl border-2 border-gray-100 hover:border-[--duo-purple] transition-all">
            <div className="flex justify-center mb-3">
              <GraduationCap
                size={40}
                className="text-[--duo-purple]"
                strokeWidth={2}
              />
            </div>
            <p className="font-bold text-gray-700">Сургах</p>
          </div>
        </div>

        {/* Stats Section - Gamification */}
        <div className="mt-16 grid grid-cols-3 gap-4 max-w-3xl mx-auto">
          <div className="text-center p-6 bg-linear-to-br from-orange-100 to-orange-50 rounded-2xl border-2 border-orange-200">
            <div className="flex justify-center mb-2">
              <Flame size={40} className="text-[--duo-red]" strokeWidth={2.5} />
            </div>
            <p
              className="text-3xl font-black"
              style={{ color: "var(--duo-red)" }}
            >
              0
            </p>
            <p className="text-sm font-bold text-gray-600">Дэс дараалал</p>
          </div>

          <div className="text-center p-6 bg-linear-to-br from-yellow-100 to-yellow-50 rounded-2xl border-2 border-yellow-200">
            <div className="flex justify-center mb-2">
              <Zap
                size={40}
                className="text-[--duo-yellow-dark]"
                strokeWidth={2.5}
              />
            </div>
            <p
              className="text-3xl font-black"
              style={{ color: "var(--duo-yellow-dark)" }}
            >
              0
            </p>
            <p className="text-sm font-bold text-gray-600">XP</p>
          </div>

          <div className="text-center p-6 bg-linear-to-br from-purple-100 to-purple-50 rounded-2xl border-2 border-purple-200">
            <div className="flex justify-center mb-2">
              <Award
                size={40}
                className="text-[--duo-purple]"
                strokeWidth={2.5}
              />
            </div>
            <p
              className="text-3xl font-black"
              style={{ color: "var(--duo-purple)" }}
            >
              0
            </p>
            <p className="text-sm font-bold text-gray-600">Медаль</p>
          </div>
        </div>
      </div>
    </div>
  );
};
