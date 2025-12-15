"use client";

import { useEffect, useState, useMemo } from "react";
import { multiplicationLessons } from "@/src/data/lessons/multiplication";
import Paywall from "@/src/components/topic/paywall/Paywall";
import TopicInfoCard from "@/src/components/topic/TopicInfoCard";
import VerticalRoadmap from "@/src/components/topic/VerticalRoadmap";
import { useAuth } from "@/src/components/auth";
import Skeleton from "@/src/components/ui/Skeleton";
import { toast } from "sonner";

export default function MultiplicationPage() {
  const [paid, setPaid] = useState(false);
  const [loading, setLoading] = useState(true);
  const [completedIds, setCompletedIds] = useState<string[]>([]);
  const { user, activeProfile, checkPurchase, getCompletedLessons } = useAuth();

  useEffect(() => {
    const checkPaid = async () => {
      if (user || activeProfile) {
        const isPurchased = await checkPurchase("multiplication");
        setPaid(isPurchased);

        // Load completed lessons
        const completed = await getCompletedLessons("multiplication");
        setCompletedIds(completed);
      } else {
        setPaid(false);
      }
      setLoading(false);
    };

    checkPaid();
  }, [user, activeProfile, checkPurchase, getCompletedLessons]);

  const progressPercent = useMemo(() => {
    if (multiplicationLessons.length === 0) return 0;
    return Math.round((completedIds.length / multiplicationLessons.length) * 100);
  }, [completedIds]);

  const items = useMemo(
    () => multiplicationLessons.map((l) => ({ id: l.id, title: l.title })),
    []
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4">
        <div className="max-w-7xl mx-auto">
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
            topicKey="multiplication"
            onUnlocked={() => {
              setPaid(true);
            }}
          />
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
            {/* Left Column - Topic Info Card */}
            <TopicInfoCard
              title="Үржих"
              description="Үржих үйлдлийг эзэмшиж, дасгал хийцгээе! ✨"
              lessonCount={multiplicationLessons.length}
              taskCount={multiplicationLessons.length}
              progressPercent={progressPercent}
              iconType="multiplication"
            />

            {/* Right Column - Vertical Roadmap */}
            <VerticalRoadmap
              items={items}
              topicKey="multiplication"
              completedIds={completedIds}
              headerTitle="Үржүүлэх дасгал"
            />
          </div>
        )}
      </div>
    </div>
  );
}
