"use client";

import Link from "next/link";
import { ChevronRight, User, Settings } from "lucide-react";
import Image from "next/image";
import { useAuth } from "@/src/components/auth";
import { CHILD_ICONS } from "@/src/app/register/page";
import { TOPICS_DATA } from "@/src/data/topics";

export default function TopicsPage() {
  const { activeProfile, user } = useAuth();
  const isChild = activeProfile?.type === "child";

  let displayAvatar = activeProfile?.avatar;
  if (isChild && !displayAvatar) {
    displayAvatar = CHILD_ICONS[0];
  }

  const displayName = isChild
    ? activeProfile?.name
    : user?.user_metadata?.full_name || "Эцэг эх";

  return (
    <div className="w-full h-full min-h-[calc(100vh-77px)] flex justify-center bg-[#FFFAF7] px-4 pb-10">
      <div className="max-w-[1280px] w-full flex flex-col gap-8 md:gap-14">
        {user && (
          <div className="mt-8 md:mt-[50px] relative w-full bg-linear-to-r from-[#6FDC6F] to-[#32CD32] p-6 md:py-7 md:px-14 flex flex-col md:flex-row items-center gap-6 md:gap-7 rounded-[20px]">
            <div className="absolute top-3 right-4 rotate-10">
              <Image
                src="/svg/Sparkle.svg"
                alt="Sparkle"
                width={32}
                height={32}
              />
            </div>
            <div className="shrink-0 w-[90px] h-[90px] rounded-full bg-white border-[3px] border-[#58CC02] overflow-hidden relative flex items-center justify-center text-3xl">
              {displayAvatar ? (
                <Image
                  src={displayAvatar}
                  alt="Avatar"
                  width={32}
                  height={32}
                  className="object-cover w-8 h-8"
                />
              ) : (
                <User size={32} color="black" />
              )}
            </div>
            <div className="flex flex-col gap-6 w-full items-center md:items-start text-center md:text-left">
              <div className="flex flex-col gap-1.5">
                <p className="text-white font-extrabold text-2xl md:text-[24px] font-nunito">
                  Сайна уу, {displayName}!
                </p>
                <p className="text-white font-medium text-sm font-nunito">
                  {isChild
                    ? "Өнөөдөр юу сурах вэ?"
                    : "Хүүхдүүдийнхээ явцыг хянаарай"}
                </p>
              </div>

              {isChild ? (
                <div className="flex flex-wrap justify-center md:justify-start gap-3 md:gap-5">
                  <div className="bg-[#FFFFFF40] rounded-[20px] px-[10px] py-1.5 flex items-center gap-[10px]">
                    <Image
                      src="/svg/Fire.svg"
                      alt="Fire"
                      width={32}
                      height={32}
                    />
                    <div className="flex flex-col w-[64px] items-start">
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
                    <div className="flex flex-col w-[64px] items-start">
                      <p className="text-white font-semibold text-sm font-nunito">
                        XP
                      </p>
                      <p className="text-white font-extrabold text-sm font-nunito">
                        {activeProfile?.xp || 0}
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-[#FFFFFF40] rounded-[20px] px-6 py-3 flex items-center gap-4 border border-white/20">
                  <div className="p-2 bg-white/20 rounded-xl">
                    <Settings size={24} className="text-white" />
                  </div>
                  <div className="flex flex-col items-start">
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
        )}

        <div className="flex flex-col gap-7 py-6">
          <p className="text-black font-bold text-[32px] font-nunito">
            Хичээлүүд
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            {TOPICS_DATA.map((topic, index) => {
              return (
                <Link key={index} href={topic.link} className="group relative">
                  <div
                    className="h-full min-h-[360px] border-2 border-[#E5E5E5] rounded-[30px] p-6 md:p-8 hover:border-[#58CC02] transition-all duration-300 flex flex-col justify-between gap-6"
                    style={{
                      backgroundImage: `url(/Fraction.png)`,
                      backgroundPosition: "bottom",
                      backgroundSize: "cover",
                      backgroundRepeat: "no-repeat",
                    }}
                  >
                    <div className="flex items-center gap-4">
                      <div className="p-4 border-[1.5px] rounded-[16px] border-[#58CC02] bg-white ">
                        <Image
                          src={topic.icon}
                          alt={topic.title}
                          width={36}
                          height={36}
                        />
                      </div>

                      <div className="flex flex-col gap-2">
                        <p className="text-white font-extrabold font-nunito text-xl md:text-2xl tracking-tight drop-">
                          {topic.title}
                        </p>
                        <div className="flex gap-1 items-center bg-[#F3F4F6] backdrop-blur-sm rounded-xl px-3 py-1.5 w-fit ">
                          <Image
                            src="/svg/Notepad.svg"
                            width={16}
                            height={16}
                            alt="Notepad"
                          />
                          <p className="text-[#1F2937] font-bold text-xs font-nunito">
                            {topic.lessonCount} хичээл
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="pt-6 border-t border-white/80 flex items-center justify-between">
                      <p className="text-white font-bold font-nunito text-lg md:text-xl leading-6 drop- max-w-[90%]">
                        {topic.description}
                      </p>

                      <div className="w-16 h-12 rounded-md bg-[#58CC02] flex items-center justify-center text-white shadow-[0_4px_0_#46A302] active:shadow-none active:translate-y-[4px] transition-all">
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
