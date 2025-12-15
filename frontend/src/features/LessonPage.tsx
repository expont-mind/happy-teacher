"use client";

import { useMemo, useState, useRef, useCallback, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import ColoringCanvas, {
  ColoringCanvasRef,
} from "@/src/components/coloring/ColoringCanvas";
import ColorPalette from "@/src/components/coloring/ColorPalette";
import HelpPanel from "@/src/components/coloring/HelpPanel";
import { fractionLessons } from "@/src/data/lessons/fractions";
import Image from "next/image";
import { useAuth } from "@/src/components/auth/AuthProvider";
import {
  MessageTooltip,
  RelaxModal,
  useTutorial,
  lessonPageTutorial,
} from "@/src/components/tutorial";
import { RewardModal } from "../components/gamification/RewardModal";
import { createClient } from "@/src/utils/supabase/client";

export default function LessonPage() {
  const params = useParams<{ lessonId: string }>();
  const router = useRouter();
  const { markLessonCompleted, addXP, activeProfile, user } = useAuth();
  const { startTutorial, isActive } = useTutorial();

  const lesson = useMemo(
    () => fractionLessons.find((l) => l.id === params.lessonId),
    [params.lessonId]
  );

  const [selectedColor, setSelectedColor] = useState(
    lesson?.palette[0] || "#6b3ab5"
  );
  const [helpOpen, setHelpOpen] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [characterMessage, setCharacterMessage] = useState<string | null>(null);
  const [showRelaxModal, setShowRelaxModal] = useState(false);
  const canvasRef = useRef<ColoringCanvasRef>(null);
  const [showReward, setShowReward] = useState(false);
  const [xpEarned, setXpEarned] = useState(0);

  // Convert string array to object array without labels for ColorPalette
  const paletteForDisplay = useMemo(
    () => lesson?.palette.map((color) => ({ color })) || [],
    [lesson]
  );

  const showCharacterMessage = useCallback((message: string) => {
    setCharacterMessage(message);
  }, []);

  // Start tutorial when image is loaded (first time only)
  useEffect(() => {
    if (imageLoaded && !isActive) {
      const hasCompletedTutorial = localStorage.getItem(
        lessonPageTutorial.completionKey
      );
      if (!hasCompletedTutorial) {
        startTutorial(lessonPageTutorial);
      }
    }
  }, [imageLoaded, isActive, startTutorial]);

  if (!lesson) {
    return <div className="text-center p-8">Энэ хичээл олдсонгүй.</div>;
  }

  const markCompleted = async () => {
    if (!canvasRef.current || !lesson) return;

    const { isComplete, missingColors } = canvasRef.current.checkCompletion();

    if (!isComplete) {
      const colorNames: Record<string, string> = {
        "#6b3ab5": "Нил ягаан",
        "#1066b4": "Хөх",
        "#3396c7": "Цэнхэр",
        "#1a9742": "Ногоон",
        "#fdf3dc": "Цагаан шар",
        "#ffd200": "Шар",
        "#ff7900": "Улбар шар",
        "#ee3030": "Улаан",
        "#603130": "Хүрэн",
        "#95928d": "Саарал",
      };

      const missingColorNames = missingColors
        .map((color) => colorNames[color.toLowerCase()] || color)
        .join(", ");

      showCharacterMessage(
        `Дуусаагүй хэсэг байна!\n\nДараах өнгөтэй хэсгүүдийг будна уу: ${missingColorNames}`
      );
      return;
    }

    // Save to Supabase (with localStorage fallback)
    await markLessonCompleted("fractions", lesson.id);

    // Check for notification trigger (Every 3 lessons)
    try {
      if (activeProfile?.id && user?.id) {
        const supabase = createClient();
        const { count, error } = await supabase
          .from("child_progress")
          .select("*", { count: "exact", head: true })
          .eq("child_id", activeProfile.id);

        if (error) {
          console.error("Count fetch error:", error);
        }

        // Trigger if count is valid and multiple of 3
        if (count !== null && count > 0 && count % 3 === 0) {
          console.log("Triggering notification for count:", count);

          await fetch("/api/send-notification", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              userId: user.id,
              type: "lesson_report",
              title: "Явцын тайлан",
              message: `${activeProfile.name} ${count} хичээл амжилттай дуусгалаа!`,
            }),
          });
        }
      } else {
        console.warn(
          "User or ActiveProfile missing, cannot send notification."
        );
      }
    } catch (err) {
      console.error("Failed to trigger notification:", err);
    }

    // Calculate XP based on mistakes
    const mistakes = canvasRef.current?.getMistakeCount() || 0;
    const baseXP = 10;
    const bonusXP = mistakes === 0 ? 5 : 0;
    const totalXP = baseXP + bonusXP;

    // Award XP
    const result = await addXP(totalXP);
    if (result) {
      setXpEarned(totalXP);
      setShowReward(true);
    } else {
      router.push("/topic/fractions");
    }
  };

  const handleRewardClose = () => {
    setShowReward(false);
    router.push("/topic/fractions");
  };

  return (
    <div className="w-full flex flex-col items-center py-12 relative">
      <Image
        src={"/background.png"}
        alt="background"
        fill
        className="absolute top-0 left-0 w-full h-full object-cover"
      />

      <div className="max-w-[70vw] w-full border-4 border-slate-700 rounded-3xl z-10 relative overflow-hidden">
        <ColoringCanvas
          ref={canvasRef}
          mainImage={lesson.mainImage}
          maskImage={lesson.maskImage}
          backgroundImage={lesson.backgroundImage}
          selectedColor={selectedColor}
          setImageLoaded={setImageLoaded}
          palette={lesson.palette}
          helpOpen={helpOpen}
          setHelpOpen={setHelpOpen}
          onMarkCompleted={markCompleted}
          imageLoaded={imageLoaded}
          onShowMessage={showCharacterMessage}
          onShowRelax={() => setShowRelaxModal(true)}
          characterMessage={characterMessage}
          onCloseMessage={() => setCharacterMessage(null)}
          showRelaxModal={showRelaxModal}
          onCloseRelax={() => setShowRelaxModal(false)}
          renderColorPalette={
            <ColorPalette
              colors={paletteForDisplay}
              selectedColor={selectedColor}
              setSelectedColor={setSelectedColor}
            />
          }
        />
      </div>

      <HelpPanel
        helpOpen={helpOpen}
        setHelpOpen={setHelpOpen}
        helpImage={lesson.helpImage}
        helpVideoId={lesson.helpVideoId}
      />

      <MessageTooltip
        message={characterMessage || ""}
        character="yellow"
        characterPosition="left"
        isVisible={!!characterMessage}
        onClose={() => setCharacterMessage(null)}
        autoCloseDelay={8000}
      />

      <RelaxModal
        isVisible={showRelaxModal}
        onClose={() => setShowRelaxModal(false)}
        character="yellow"
      />

      <RewardModal
        isOpen={showReward}
        onClose={handleRewardClose}
        xpEarned={xpEarned}
        bonus={xpEarned === 15 ? "Perfect Lesson Bonus!" : undefined}
        type="lesson"
      />
    </div>
  );
}
