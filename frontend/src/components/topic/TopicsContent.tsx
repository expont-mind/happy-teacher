"use client";

import { useEffect, useState } from "react";
import { User, Zap } from "lucide-react";
import Image from "next/image";
import { useAuth } from "@/src/components/auth";
import { useRouter } from "next/navigation";
import { CHILD_ICONS } from "@/src/app/register/page";
import { TOPICS_DATA } from "@/src/data/topics";
import ChildTopicCard from "@/src/components/topic/ChildTopicCard";

export default function TopicsContent() {
  const { activeProfile, user, checkPurchase, getCompletedLessons } = useAuth();
  const router = useRouter();
  const isChild = activeProfile?.type === "child";
  const [topicStates, setTopicStates] = useState<
    Record<
      string,
      { paid: boolean; completedCount: number; progressPercent: number }
    >
  >({});
  const [loadingTopics, setLoadingTopics] = useState(true);

  // Redirect adults to dashboard, guests to home
  useEffect(() => {
    if (activeProfile?.type === "adult") {
      router.replace("/dashboard");
    }
    if (!user && !activeProfile) {
      router.replace("/");
    }
  }, [activeProfile, router, user]);

  // Load purchase and progress state for each topic
  useEffect(() => {
    const loadTopicStates = async () => {
      if (!isChild && !user) {
        setLoadingTopics(false);
        return;
      }

      const states: Record<
        string,
        { paid: boolean; completedCount: number; progressPercent: number }
      > = {};

      for (const topic of TOPICS_DATA) {
        const paid = await checkPurchase(topic.key);
        let completedCount = 0;
        let progressPercent = 0;

        if (paid) {
          const completedIds = await getCompletedLessons(topic.key);
          completedCount = completedIds.length;
          progressPercent =
            topic.lessonCount > 0
              ? Math.round((completedCount / topic.lessonCount) * 100)
              : 0;
        }

        states[topic.key] = { paid, completedCount, progressPercent };
      }

      setTopicStates(states);
      setLoadingTopics(false);
    };

    loadTopicStates();
  }, [user, activeProfile, checkPurchase, getCompletedLessons, isChild]);

  // If adult or guest, don't render (redirect will happen)
  if (activeProfile?.type === "adult") return null;
  if (!user && !activeProfile) return null;

  let displayAvatar = activeProfile?.avatar;
  if (isChild && !displayAvatar) {
    displayAvatar = CHILD_ICONS[0];
  }

  const displayName = isChild
    ? activeProfile?.name
    : user?.user_metadata?.full_name || "Хэрэглэгч";

  return (
    <div className="w-full h-full min-h-[calc(100vh-77px)] flex justify-center bg-[#FFFAF7] px-4 pb-10">
      <div className="max-w-[1280px] w-full flex flex-col gap-6 md:gap-8">
        {(user || activeProfile) && (
          <div className="mt-6 md:mt-[40px] relative w-full bg-linear-to-r from-[#6FDC6F] to-[#32CD32] p-5 md:py-6 md:px-10 flex items-center gap-5 rounded-[20px] shadow-[2px_4px_5px_#58CC02]">
            <div className="absolute top-3 right-4 rotate-10">
              <Image
                src="/svg/Sparkle.svg"
                alt="Чимэглэл"
                width={28}
                height={28}
              />
            </div>
            <div className="shrink-0 w-16 h-16 rounded-full bg-white border-[3px] border-[#58CC02] overflow-hidden flex items-center justify-center">
              {displayAvatar ? (
                <Image
                  src={displayAvatar}
                  alt="Хэрэглэгчийн зураг"
                  width={28}
                  height={28}
                  className="object-cover w-7 h-7"
                />
              ) : (
                <User size={28} color="black" />
              )}
            </div>
            <div className="flex flex-col gap-1 flex-1">
              <p className="text-white font-extrabold text-xl font-nunito">
                Сайн уу, {displayName}!
              </p>
              <p className="text-white/90 font-medium text-sm font-nunito">
                Өнөөдөр юу сурах вэ?
              </p>
            </div>

            {isChild && (
              <div className="hidden md:flex items-center gap-3">
                <div className="bg-white/25 rounded-2xl px-3 py-1.5 flex items-center gap-2">
                  <Image
                    src="/svg/Fire.svg"
                    alt="Streak"
                    width={24}
                    height={24}
                  />
                  <span className="text-white font-extrabold text-sm font-nunito">
                    {activeProfile?.streak || 0}
                  </span>
                </div>
                <div className="bg-white/25 rounded-2xl px-3 py-1.5 flex items-center gap-2">
                  <Zap size={20} className="text-[#FBBF24]" />
                  <span className="text-white font-extrabold text-sm font-nunito">
                    {activeProfile?.xp || 0}
                  </span>
                </div>
              </div>
            )}
          </div>
        )}

        <div className="flex flex-col gap-5">
          <h1 className="text-black font-bold text-2xl font-nunito">
            Хичээлүүд
          </h1>

          {loadingTopics ? (
            <div className="flex justify-center py-10">
              <video src="/bouncing-loader.webm" autoPlay loop muted playsInline className="w-40 h-40" />
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {TOPICS_DATA.map((topic) => {
                const state = topicStates[topic.key] || {
                  paid: false,
                  completedCount: 0,
                  progressPercent: 0,
                };
                return (
                  <ChildTopicCard
                    key={topic.key}
                    title={topic.title}
                    description={topic.description}
                    icon={topic.icon}
                    link={topic.link}
                    lessonCount={topic.lessonCount}
                    image={topic.image}
                    isLocked={!state.paid}
                    progressPercent={state.progressPercent}
                    completedCount={state.completedCount}
                  />
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
