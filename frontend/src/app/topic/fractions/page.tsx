"use client";
import { useEffect, useState, useMemo } from "react";
import { fractionLessons } from "@/src/data/lessons/fractions";
import Paywall from "@/src/components/topic/paywall/Paywall";
import TopicInfoCard from "@/src/components/topic/TopicInfoCard";
import VerticalRoadmap from "@/src/components/topic/VerticalRoadmap";
import { useAuth } from "@/src/components/auth";
import Skeleton from "@/src/components/ui/Skeleton";

export default function FractionsRoadmapPage() {
  const [paid, setPaid] = useState(false);
  const [loading, setLoading] = useState(true);
  const [completedIds, setCompletedIds] = useState<string[]>([]);
  const { user, activeProfile, checkPurchase, getCompletedLessons } = useAuth();

  useEffect(() => {
    const checkPaid = async () => {
      if (user || activeProfile) {
        const isPurchased = await checkPurchase("fractions");
        setPaid(isPurchased);

        // Load completed lessons
        const completed = await getCompletedLessons("fractions");
        setCompletedIds(completed);
      } else {
        setPaid(false);
      }
      setLoading(false);
    };
    checkPaid();
  }, [user, activeProfile, checkPurchase, getCompletedLessons]);

  const progressPercent = useMemo(() => {
    if (fractionLessons.length === 0) return 0;
    return Math.round((completedIds.length / fractionLessons.length) * 100);
  }, [completedIds]);

  const items = useMemo(
    () => fractionLessons.map((l) => ({ id: l.id, title: l.title })),
    []
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <Skeleton className="h-80 w-full rounded-3xl" />
            <Skeleton className="h-96 w-full rounded-3xl" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        {!paid ? (
          <Paywall
            topicKey="fractions"
            onUnlocked={() => {
              setPaid(true);
            }}
          />
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start ">
            {/* Left Column - Topic Info Card */}
            <TopicInfoCard
              title="Бутархай"
              description="Бутархай тооны ухагдах, дасгал хийцгээе! 😊"
              lessonCount={fractionLessons.length}
              taskCount={fractionLessons.length}
              progressPercent={progressPercent}
            />

            {/* Right Column - Vertical Roadmap */}
            <VerticalRoadmap
              items={items}
              topicKey="fractions"
              completedIds={completedIds}
              headerTitle="Энгийн бутархайг будацгаая"
            />
          </div>
        )}
      </div>
    </div>
  );
}
