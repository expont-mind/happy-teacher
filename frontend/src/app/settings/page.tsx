"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/src/components/auth";
import { createClient } from "@/src/utils/supabase/client";
import { useRouter } from "next/navigation";
import SettingsForm from "@/src/components/settings/SettingsForm";
import { ChildCard } from "@/src/components/settings/ChildCard";
import Loader from "@/src/components/ui/Loader";

type ChildData = {
  id: string;
  name: string;
  streak_count: number;
  total_lessons: number;
  xp: number;
  level: number;
  avatar: string;
  last_active_at: string | null;
  recent_activity: {
    topic_key: string;
    lesson_id: string;
    completed_at: string;
  }[];
};

export default function Settings() {
  const { user, loading, activeProfile } = useAuth();
  const router = useRouter();
  const [childrenData, setChildrenData] = useState<ChildData[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    if (!loading && (!user || activeProfile?.type !== "adult")) {
      router.push("/");
      return;
    }

    const fetchData = async () => {
      if (!user) return;

      try {
        const { data: children, error: childrenError } = await supabase
          .from("children")
          .select("id, name, streak_count, last_active_at, xp, level, avatar")
          .eq("parent_id", user.id);

        if (childrenError) throw childrenError;

        const childrenWithProgress = await Promise.all(
          children.map(async (child) => {
            const { count, error: countError } = await supabase
              .from("child_progress")
              .select("*", { count: "exact", head: true })
              .eq("child_id", child.id);

            const { data: activity, error: activityError } = await supabase
              .from("child_progress")
              .select("topic_key, lesson_id, completed_at")
              .eq("child_id", child.id)
              .order("completed_at", { ascending: false })
              .limit(5);

            return {
              id: child.id,
              name: child.name,
              streak_count: child.streak_count || 0,
              total_lessons: count || 0,
              xp: child.xp || 0,
              level: child.level || 1,
              avatar: child.avatar || "/svg/BirdBlack.svg",
              last_active_at: child.last_active_at,
              recent_activity: activity || [],
            };
          })
        );

        setChildrenData(childrenWithProgress);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setIsLoadingData(false);
      }
    };

    fetchData();
  }, [user, activeProfile, loading, router, supabase]);

  if (loading || isLoadingData) {
    return (
      <div className="w-full h-[calc(100vh-75px)] flex justify-center items-center bg-[#FFFAF7]">
        <Loader />
      </div>
    );
  }

  return (
    <div className="w-full min-h-[calc(100vh-77px)] flex justify-center bg-[#FFFAF7] py-7 px-4">
      <div className="max-w-[1280px] w-full grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Settings Form */}
        <div className="lg:col-span-4">
          <SettingsForm />
        </div>

        {/* Right Column: Children's Progress */}
        <div className="lg:col-span-8 flex flex-col gap-8">
          <div className="flex flex-col gap-[10px]">
            <p className="text-black font-bold text-[32px] font-nunito leading-[42px]">
              Хүүхдүүдийн явц
            </p>
            <p className="text-[#858480] font-semibold text-base font-nunito leading-5">
              Хүүхдүүдийнхээ сурлагын амжилт, идэвхийг хянах
            </p>
          </div>

          <div className="grid grid-cols-1 gap-8">
            {childrenData.map((child) => (
              <ChildCard key={child.id} child={child} />
            ))}
          </div>

          {childrenData.length === 0 && (
            <div className="text-center py-20 bg-white rounded-3xl border border-gray-100 shadow-sm">
              <div className="text-6xl mb-4">👋</div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2 font-nunito">
                Хүүхэд нэмээгүй байна
              </h2>
              <p className="text-gray-500 mb-6 font-nunito">
                Та "Хэрэглэгчид" цэс рүү орж хүүхэд нэмнэ үү.
              </p>
              <button
                onClick={() => router.push("/profiles")}
                className="duo-button duo-button-green px-6 py-3"
              >
                Хүүхэд нэмэх
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
