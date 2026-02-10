"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/src/components/auth";
import { createClient } from "@/src/utils/supabase/client";
import { useRouter } from "next/navigation";
import { ChildCard } from "@/src/components/settings/ChildCard";
import DashboardTopicCard from "@/src/components/dashboard/DashboardTopicCard";
import TopicPurchaseModal from "@/src/components/shop/TopicPurchaseModal";
import Loader from "@/src/components/ui/Loader";
import { TOPICS_DATA } from "@/src/data/topics";
import { ShoppingBag, Settings, Users } from "lucide-react";
import Link from "next/link";

type ChildData = {
  id: string;
  name: string;
  pin_code: string;
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

export default function DashboardPage() {
  const { user, loading, activeProfile } = useAuth();
  const router = useRouter();
  const [childrenData, setChildrenData] = useState<ChildData[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [purchasesByTopic, setPurchasesByTopic] = useState<
    Record<string, Set<string>>
  >({});
  const [purchaseModalTopic, setPurchaseModalTopic] = useState<string | null>(
    null
  );
  const supabase = createClient();

  useEffect(() => {
    if (!loading && (!user || activeProfile?.type !== "adult")) {
      router.push(activeProfile?.type === "child" ? "/topic" : "/");
      return;
    }

    const fetchData = async () => {
      if (!user) return;

      try {
        // Fetch children
        const { data: children, error: childrenError } = await supabase
          .from("children")
          .select("id, name, pin_code, streak_count, last_active_at, xp, level, avatar")
          .eq("parent_id", user.id);

        if (childrenError) throw childrenError;

        const childrenWithProgress = await Promise.all(
          children.map(async (child) => {
            const { count } = await supabase
              .from("child_progress")
              .select("*", { count: "exact", head: true })
              .eq("child_id", child.id);

            const { data: activity } = await supabase
              .from("child_progress")
              .select("topic_key, lesson_id, completed_at")
              .eq("child_id", child.id)
              .order("completed_at", { ascending: false })
              .limit(5);

            return {
              id: child.id,
              name: child.name,
              pin_code: child.pin_code || "",
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

        // Fetch purchases per topic
        const { data: purchases } = await supabase
          .from("purchases")
          .select("topic_key, child_id")
          .eq("user_id", user.id)
          .not("child_id", "is", null);

        const byTopic: Record<string, Set<string>> = {};
        for (const p of purchases || []) {
          if (!byTopic[p.topic_key]) byTopic[p.topic_key] = new Set();
          byTopic[p.topic_key].add(p.child_id);
        }
        setPurchasesByTopic(byTopic);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setIsLoadingData(false);
      }
    };

    fetchData();
  }, [user, activeProfile, loading, router, supabase]);

  const refreshPurchases = async () => {
    if (!user) return;
    const { data: purchases } = await supabase
      .from("purchases")
      .select("topic_key, child_id")
      .eq("user_id", user.id)
      .not("child_id", "is", null);

    const byTopic: Record<string, Set<string>> = {};
    for (const p of purchases || []) {
      if (!byTopic[p.topic_key]) byTopic[p.topic_key] = new Set();
      byTopic[p.topic_key].add(p.child_id);
    }
    setPurchasesByTopic(byTopic);
  };

  if (loading || isLoadingData) {
    return (
      <div className="w-full h-[calc(100vh-75px)] flex justify-center items-center bg-[#FFFAF7]">
        <Loader />
      </div>
    );
  }

  const childrenForCards = childrenData.map((c) => ({
    id: c.id,
    name: c.name,
    avatar: c.avatar,
  }));

  return (
    <div className="w-full min-h-[calc(100vh-77px)] flex justify-center bg-[#FFFAF7] py-7 px-4">
      <div className="max-w-[1280px] w-full flex flex-col gap-8">
        {/* Quick actions */}
        <div className="flex flex-wrap gap-3">
          <Link
            href="/shop"
            className="duo-button duo-button-green px-5 py-2.5 text-sm flex items-center gap-2"
          >
            <ShoppingBag size={16} />
            Дэлгүүр
          </Link>
          <Link
            href="/profiles"
            className="duo-button duo-button-gray px-5 py-2.5 text-sm flex items-center gap-2"
          >
            <Users size={16} />
            Хэрэглэгчид
          </Link>
          <Link
            href="/settings"
            className="duo-button duo-button-gray px-5 py-2.5 text-sm flex items-center gap-2"
          >
            <Settings size={16} />
            Тохиргоо
          </Link>
        </div>

        {/* Courses section */}
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <h2 className="text-2xl font-bold text-[#333333] font-nunito">
              Хичээлүүд
            </h2>
            <p className="text-sm font-medium text-gray-500 font-nunito">
              Хүүхэд тус бүрд хичээл худалдаж авах
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {TOPICS_DATA.map((topic) => (
              <DashboardTopicCard
                key={topic.key}
                title={topic.title}
                icon={topic.icon}
                lessonCount={topic.lessonCount}
                price={topic.price}
                children={childrenForCards}
                purchasedChildIds={purchasesByTopic[topic.key] || new Set()}
                onBuy={() => setPurchaseModalTopic(topic.key)}
              />
            ))}
          </div>
        </div>

        {/* Children progress */}
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <h2 className="text-2xl font-bold text-[#333333] font-nunito">
              Хүүхдүүдийн явц
            </h2>
            <p className="text-sm font-medium text-gray-500 font-nunito">
              Хүүхдүүдийнхээ сурлагын амжилт, идэвхийг хянах
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {childrenData.map((child) => (
              <ChildCard key={child.id} child={child} />
            ))}
          </div>

          {childrenData.length === 0 && (
            <div className="text-center py-16 bg-white rounded-3xl border border-gray-100 shadow-sm">
              <div className="text-5xl mb-4">👋</div>
              <h2 className="text-xl font-bold text-gray-800 mb-2 font-nunito">
                Хүүхэд нэмээгүй байна
              </h2>
              <p className="text-gray-500 mb-6 font-nunito text-sm">
                Хэрэглэгчид цэс рүү орж хүүхэд нэмнэ үү.
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

      {/* Topic Purchase Modal */}
      {purchaseModalTopic && (
        <TopicPurchaseModal
          isOpen={true}
          onClose={() => setPurchaseModalTopic(null)}
          topicKey={purchaseModalTopic}
          onSuccess={() => {
            setPurchaseModalTopic(null);
            refreshPurchases();
          }}
        />
      )}
    </div>
  );
}
