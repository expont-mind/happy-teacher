"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/src/components/auth";
import { createClient } from "@/src/utils/supabase/client";
import { useRouter } from "next/navigation";
import { ChildCard } from "@/src/components/dashboard/ChildCard";

type ChildData = {
  id: string;
  name: string;
  streak_count: number;
  total_lessons: number;
  last_active_at: string | null;
  recent_activity: {
    topic_key: string;
    lesson_id: string;
    completed_at: string;
  }[];
};

export default function ParentDashboard() {
  const { user, activeProfile, loading } = useAuth();
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
        // Fetch children with their stats
        const { data: children, error: childrenError } = await supabase
          .from("children")
          .select("id, name, streak_count, last_active_at")
          .eq("parent_id", user.id);

        if (childrenError) throw childrenError;

        const childrenWithProgress = await Promise.all(
          children.map(async (child) => {
            // Fetch progress count
            const { count, error: countError } = await supabase
              .from("child_progress")
              .select("*", { count: "exact", head: true })
              .eq("child_id", child.id);

            // Fetch recent activity
            const { data: activity, error: activityError } = await supabase
              .from("child_progress")
              .select("topic_key, lesson_id, completed_at")
              .eq("child_id", child.id)
              .order("completed_at", { ascending: false })
              .limit(5);

            if (activityError) {
              console.error(
                `Error fetching activity for child ${child.id}:`,
                activityError
              );
            }

            return {
              id: child.id,
              name: child.name,
              streak_count: child.streak_count || 0,
              total_lessons: count || 0,
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
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-bounce">
          <span className="text-4xl">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-black text-gray-800 mb-2">
            Эцэг эхийн хяналтын самбар
          </h1>
          <p className="text-gray-600">
            Хүүхдүүдийнхээ сурлагын амжилт, идэвхийг хянах
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {childrenData.map((child) => (
            <ChildCard key={child.id} child={child} />
          ))}
        </div>

        {childrenData.length === 0 && (
          <div className="text-center py-20 bg-white rounded-3xl border border-gray-100 shadow-sm mt-8">
            <div className="text-6xl mb-4">👋</div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              Хүүхэд нэмээгүй байна
            </h2>
            <p className="text-gray-500 mb-6">
              Та "Users" цэс рүү орж хүүхэд нэмнэ үү.
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
  );
}
