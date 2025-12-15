"use client";

import Link from "next/link";
import {
  BookOpen,
  BookMarked,
  X,
  ChevronRight,
  User,
  Settings,
} from "lucide-react";
import Image from "next/image";
import { fractionLessons } from "@/src/data/lessons/fractions";
import { multiplicationLessons } from "@/src/data/lessons/multiplication";
import { useAuth } from "@/src/components/auth";
import { CHILD_ICONS } from "@/src/app/register/page";

export default function TopicsPage() {
  const { activeProfile, user } = useAuth();
  const isChild = activeProfile?.type === "child";

  const topics = [
    {
      key: "fractions",
      title: "Бутархай",
      icon: BookOpen,
      totalLessons: fractionLessons.length,
    },
    {
      key: "multiplication",
      title: "Үржих",
      icon: X,
      totalLessons: multiplicationLessons.length,
    },
  ];

  let displayAvatar = activeProfile?.avatar;
  if (isChild && !displayAvatar) {
    displayAvatar = CHILD_ICONS[0];
  }

  const displayName = isChild
    ? activeProfile?.name
    : user?.user_metadata?.full_name || "Эцэг эх";

  return (
    <div className="w-full h-[calc(100vh-77px)] flex justify-center bg-[#FFFAF7]">
      <div className="max-w-[1280px] w-full flex flex-col gap-14">
        <div className="mt-[50px] relative w-full bg-linear-to-r from-[#6FDC6F] to-[#32CD32] py-7 px-14 flex items-center gap-7 rounded-[20px]">
          <div className="absolute top-3 right-4 rotate-10">
            <Image
              src="/svg/Sparkle.svg"
              alt="Sparkle"
              width={32}
              height={32}
            />
          </div>
          <div className="w-[90px] h-[90px] rounded-full bg-white border-[3px] border-[#58CC02] overflow-hidden relative flex items-center justify-center text-3xl">
            {displayAvatar ? (
              <Image
                src={displayAvatar}
                alt="Avatar"
                width={32}
                height={32}
                className="object-cover"
              />
            ) : (
              <User size={32} color="black" />
            )}
          </div>
          <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-1.5">
              <p className="text-white font-extrabold text-[24px] font-nunito">
                Сайна уу, {displayName}!
              </p>
              <p className="text-white font-medium text-sm font-nunito">
                {isChild
                  ? "Өнөөдөр юу сурах вэ?"
                  : "Хүүхдүүдийнхээ явцыг хянаарай"}
              </p>
            </div>

            {isChild ? (
              <div className="flex gap-5">
                <div className="bg-[#FFFFFF40] rounded-[20px] px-[10px] py-1.5 flex items-center gap-[10px]">
                  <Image
                    src="/svg/Fire.svg"
                    alt="Fire"
                    width={32}
                    height={32}
                  />
                  <div className="flex flex-col w-[64px]">
                    <p className="text-white font-semibold text-sm font-nunito">
                      Streak
                    </p>
                    <p className="text-white font-extrabold text-sm font-nunito">
                      {activeProfile?.streak || 0} өдөр
                    </p>
                  </div>
                </div>
                <div className="bg-[#FFFFFF40] rounded-[20px] px-[10px] py-1.5 flex items-center gap-[10px]">
                  <Image
                    src="/svg/Lightning.svg"
                    alt="Lightning"
                    width={32}
                    height={32}
                  />
                  <div className="flex flex-col w-[64px]">
                    <p className="text-white font-semibold text-sm font-nunito">
                      XP
                    </p>
                    <p className="text-white font-extrabold text-sm font-nunito">
                      {activeProfile?.xp || 0}
                    </p>
                  </div>
                </div>
                <div className="bg-[#FFFFFF40] rounded-[20px] px-[10px] py-1.5 flex items-center gap-[10px]">
                  <Image
                    src="/svg/Medal.svg"
                    alt="Medal"
                    width={32}
                    height={32}
                  />
                  <div className="flex flex-col w-[64px]">
                    <p className="text-white font-semibold text-sm font-nunito">
                      Level
                    </p>
                    <p className="text-white font-extrabold text-sm font-nunito">
                      {activeProfile?.level || 1}
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-[#FFFFFF40] rounded-[20px] px-6 py-3 flex items-center gap-4 border border-white/20">
                <div className="p-2 bg-white/20 rounded-xl">
                  <Settings size={24} className="text-white" />
                </div>
                <div className="flex flex-col">
                  <p className="text-white font-bold text-lg font-nunito leading-tight">
                    Эцэг эхийн хэсэг
                  </p>
                  <Link
                    href="/settings"
                    className="text-white/90 text-sm font-bold font-nunito hover:text-white hover:underline transition-colors"
                  >
                    Тохиргоо руу очих →
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-7 py-6">
          <p className="text-black font-bold text-[32px] font-nunito">
            Хичээлүүд
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {topics.map((topic) => {
              const IconComponent = topic.icon;
              return (
                <Link
                  key={topic.key}
                  href={`/topic/${topic.key}`}
                  className="group relative"
                >
                  <div className="h-full bg-white border-2 border-[#E5E5E5] rounded-[20px] p-6 hover:border-[#58CC02]  transition-all duration-300 shadow-sm hover:shadow-md flex flex-col justify-between gap-6">
                    <div className="flex items-start justify-between">
                      <div className="p-[10px] transition-transform duration-300 group-hover:scale-110 border rounded-[16px] border-[#58CC02]">
                        <IconComponent
                          size={32}
                          color="#58CC02"
                          strokeWidth={2.5}
                        />
                      </div>
                      <div className="bg-[#58CC02] text-white text-xs font-bold px-3 py-1.5 rounded-full font-nunito uppercase tracking-wide">
                        Шинэ
                      </div>
                    </div>

                    <div>
                      <h3 className="text-2xl font-extrabold text-[#333333] font-nunito mb-2 group-hover:text-[#58CC02] transition-colors">
                        {topic.title}
                      </h3>
                      <p className="text-[#777] font-semibold font-nunito text-sm leading-relaxed">
                        Хичээлүүд, сонирхолтой дасгалууд болон тоглоомууд
                        багтсан.
                      </p>
                    </div>

                    <div className="pt-6 border-t border-gray-100 flex items-center justify-between">
                      <div className="flex items-center gap-2 text-[#777]">
                        <BookMarked size={18} />
                        <span className="font-bold text-sm font-nunito">
                          0/{topic.totalLessons} хичээл
                        </span>
                      </div>

                      <div className="w-10 h-10 rounded-xl bg-[#58CC02] flex items-center justify-center text-white shadow-[0_4px_0_#46A302] active:shadow-none active:translate-y-[4px] transition-all">
                        <ChevronRight size={24} strokeWidth={3} />
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
