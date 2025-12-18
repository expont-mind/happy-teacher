"use client";

import { useMemo, useState, useRef, useCallback, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import ColoringCanvas, {
  ColoringCanvasRef,
} from "@/src/components/coloring/ColoringCanvas";
import ColorPalette from "@/src/components/coloring/ColorPalette";
import LessonHeader from "@/src/components/coloring/LessonHeader";
import ActionToolbar from "@/src/components/coloring/ActionToolbar";
import HelpPanel from "@/src/components/coloring/HelpPanel";
import { fractionLessons } from "@/src/data/lessons/fractions";
import { useAuth } from "@/src/components/auth/AuthProvider";
import {
  IntroToast,
  RelaxModal,
  useTutorial,
  lessonPageTutorialDesktop,
  lessonPageTutorialMobile,
} from "@/src/components/tutorial";
import { RewardModal } from "../components/gamification/RewardModal";
import { createClient } from "@/src/utils/supabase/client";
import {
  RotateDevicePrompt,
  useIsPortraitMobile,
} from "@/src/components/ui/RotateDevicePrompt";
import Loader from "@/src/components/ui/Loader";
import {
  showCharacterToast,
  showErrorToastTopRight,
} from "@/src/components/ui/CharacterToast";

export default function LessonPage() {
  const params = useParams<{ lessonId: string }>();
  const router = useRouter();
  const {
    markLessonCompleted,
    addXP,
    checkPurchase,
    user,
    activeProfile,
    loading: authLoading,
  } = useAuth();
  const { startTutorial } = useTutorial();
  const [isPaid, setIsPaid] = useState<boolean | null>(null);

  const lesson = useMemo(
    () => fractionLessons.find((l) => l.id === params.lessonId),
    [params.lessonId]
  );

  // Find the next lesson
  const nextLesson = useMemo(() => {
    const currentIndex = fractionLessons.findIndex(
      (l) => l.id === params.lessonId
    );
    if (currentIndex === -1 || currentIndex === fractionLessons.length - 1) {
      return null;
    }
    return fractionLessons[currentIndex + 1];
  }, [params.lessonId]);

  // Check if user has purchased this topic
  useEffect(() => {
    // Auth ачаалал дуусахыг хүлээх
    if (authLoading) return;

    const checkPayment = async () => {
      console.log("LessonPage: Checking purchase for fractions...");
      console.log(
        "LessonPage: user =",
        user?.id,
        "activeProfile =",
        activeProfile?.id
      );

      const purchased = await checkPurchase("fractions");
      console.log("LessonPage: purchased =", purchased);

      setIsPaid(purchased);

      if (!purchased) {
        showCharacterToast("Та эхлээд хичээлийг худалдаж авах ёстой.");
        router.replace("/topic/fractions");
      }
    };

    checkPayment();
  }, [authLoading, checkPurchase, router, user, activeProfile]);

  // Show intro message when lesson starts
  const [introMessage, setIntroMessage] = useState<string | null>(null);
  useEffect(() => {
    if (isPaid && lesson?.introMessage) {
      // Small delay to let the page render first
      const timer = setTimeout(() => {
        setIntroMessage(lesson.introMessage!);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [isPaid, lesson]);

  const [selectedColor, setSelectedColor] = useState(
    lesson?.palette[0]?.color || "#6b3ab5"
  );
  const [helpOpen, setHelpOpen] = useState(false);
  const [, setImageLoaded] = useState(false);
  const [showRelaxModal, setShowRelaxModal] = useState(false);
  const canvasRef = useRef<ColoringCanvasRef>(null);
  const [showReward, setShowReward] = useState(false);
  const [xpEarned, setXpEarned] = useState(0);
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);

  // Mobile state
  const isPortraitMobile = useIsPortraitMobile();

  // Palette is already in the correct format for ColorPalette
  const paletteForDisplay = useMemo(() => {
    if (!lesson) return [];
    return lesson.palette;
  }, [lesson]);

  // Get raw palette colors for ColoringCanvas
  const rawPalette = useMemo(() => {
    if (!lesson) return [];
    return lesson.palette.map((p) => p.color);
  }, [lesson]);

  // Update canUndo/canRedo from canvas ref
  useEffect(() => {
    const interval = setInterval(() => {
      if (canvasRef.current) {
        setCanUndo(canvasRef.current.canUndo);
        setCanRedo(canvasRef.current.canRedo);
      }
    }, 100);
    return () => clearInterval(interval);
  }, []);

  const showCharacterMessage = useCallback((message: string) => {
    showErrorToastTopRight(message);
  }, []);

  // Show loading while checking payment
  if (isPaid === null) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <Loader />
      </div>
    );
  }

  // If not paid, show loader while redirecting
  if (!isPaid) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <Loader />
      </div>
    );
  }

  if (!lesson) {
    return <div className="text-center p-8">Энэ хичээл олдсонгүй.</div>;
  }

  const handleBack = () => {
    router.push("/topic/fractions");
  };

  const handleUndo = () => {
    canvasRef.current?.undo();
  };

  const handleRedo = () => {
    canvasRef.current?.redo();
  };

  const handleHelp = () => {
    setHelpOpen(true);
  };

  const handleDownload = () => {
    canvasRef.current?.downloadCanvas();
  };

  const handleShowIntro = () => {
    setIntroMessage(lesson?.introMessage || null);
  };

  const markCompleted = async () => {
    if (!canvasRef.current || !lesson) return;

    const { isComplete, missingColors } = canvasRef.current.checkCompletion();

    if (!isComplete) {
      const colorNames: Record<string, string> = {
        // Basic colors from page-12, 16, 21-23, 28, 30, 31, 33
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
        // Additional colors from page-13, 14
        "#ff914d": "Улбар шар",
        "#ff66c4": "Ягаан",
        "#7ed957": "Цайвар ногоон",
        "#00bf63": "Ногоон",
        "#ffde59": "Шар",
        "#ff3131": "Улаан",
        "#004aad": "Хар хөх",
        "#38b6ff": "Тэнгэрийн хөх",
        "#a85e31": "Хүрэн",
        "#fee8c0": "Цайвар шар",
        "#000000": "Хар",
        "#a6a6a6": "Саарал",
        "#8c52ff": "Ягаан",
        // Colors from page-19
        "#ff0000": "Улаан",
        "#fd7e00": "Улбар шар",
        "#ffef00": "Шар",
        "#00c90e": "Ногоон",
        "#0051ff": "Хөх",
        "#54008a": "Нил ягаан",
        "#684530": "Хүрэн",
        // Colors from page-20
        "#fadb5e": "Шар",
        "#ef5d06": "Улбар шар",
        "#fffbd7": "Цайвар шар",
        // Colors from page-22
        "#c1ff72": "Цайвар ногоон",
        "#323232": "Хар саарал",
        // Colors from page-28
        "#6fbe03": "Ногоон",
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
    const { isFirstCompletion } = await markLessonCompleted(
      "fractions",
      lesson.id
    );

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

    // Only award XP on first completion
    if (isFirstCompletion) {
      // Calculate XP based on mistakes
      const mistakes = canvasRef.current?.getMistakeCount() || 0;
      const baseXP = 10;
      const bonusXP = mistakes === 0 ? 5 : 0;
      const totalXP = baseXP + bonusXP;

      // Award XP and show reward modal
      try {
        await addXP(totalXP);
      } catch (err) {
        console.error("Failed to add XP:", err);
      }
      setXpEarned(totalXP);
    } else {
      // No XP for re-completing
      setXpEarned(0);
    }

    setShowReward(true);
  };

  const handleRewardClose = () => {
    setShowReward(false);
    router.push("/topic/fractions");
  };

  const handleNextLesson = () => {
    setShowReward(false);
    if (nextLesson) {
      router.push(`/topic/fractions/${nextLesson.id}`);
    } else {
      router.push("/topic/fractions");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-2 lg:p-6">
      {/* Main Box Container */}
      <div className="bg-white rounded-2xl lg:rounded-3xl shadow-xl flex flex-col max-w-7xl w-full h-full lg:h-auto ">
        {/* Header inside box */}
        <LessonHeader
          title={lesson.title}
          onBack={handleBack}
          selectedColor={selectedColor}
          colors={paletteForDisplay}
          onSelectColor={setSelectedColor}
          onUndo={handleUndo}
          onRedo={handleRedo}
          onHelp={handleHelp}
          onDownload={handleDownload}
          onEnd={markCompleted}
          onShowIntro={handleShowIntro}
          canUndo={canUndo}
          canRedo={canRedo}
        />

        {/* Show Rotate Prompt in Portrait Mode */}
        {isPortraitMobile ? (
          <RotateDevicePrompt />
        ) : (
          /* Main Content - 3 column layout on desktop, single column on mobile */
          <div className="flex-1 flex items-stretch justify-center p-2 lg:p-6 gap-2 lg:gap-6">
            {/* Left - Color Palette (Desktop only) */}
            <div className="hidden lg:flex">
              <ColorPalette
                colors={paletteForDisplay}
                selectedColor={selectedColor}
                setSelectedColor={setSelectedColor}
              />
            </div>

            {/* Center - Canvas */}
            <div className="flex-1 max-w-5xl">
              <ColoringCanvas
                ref={canvasRef}
                mainImage={lesson.mainImage}
                maskImage={lesson.maskImage}
                backgroundImage={lesson.backgroundImage}
                selectedColor={selectedColor}
                setImageLoaded={setImageLoaded}
                palette={rawPalette}
                onShowMessage={showCharacterMessage}
                onShowRelax={() => setShowRelaxModal(true)}
              />
            </div>

            {/* Right - Action Toolbar (Desktop only) */}
            <div className="hidden lg:flex">
              <ActionToolbar
                onUndo={handleUndo}
                onRedo={handleRedo}
                onHelp={handleHelp}
                onDownload={handleDownload}
                onEnd={markCompleted}
                onShowIntro={handleShowIntro}
                canUndo={canUndo}
                canRedo={canRedo}
              />
            </div>
          </div>
        )}

        {/* Footer (Desktop only) */}
        <div className="hidden lg:flex p-6 justify-end border-t border-gray-100"></div>
      </div>

      {/* Help Panel */}
      <HelpPanel
        helpOpen={helpOpen}
        setHelpOpen={setHelpOpen}
        helpImage={lesson.helpImage}
        helpVideoId={lesson.helpVideoId}
      />

      {/* Intro Toast (centered with blur) */}
      <IntroToast
        message={introMessage || ""}
        isVisible={!!introMessage}
        onClose={() => {
          setIntroMessage(null);
          // Start tutorial after intro closes
          const isMobile = window.innerWidth < 1024;
          startTutorial(
            isMobile ? lessonPageTutorialMobile : lessonPageTutorialDesktop
          );
        }}
      />

      {/* Relax Modal */}
      <RelaxModal
        isVisible={showRelaxModal}
        onClose={() => setShowRelaxModal(false)}
        character="yellow"
      />

      {/* Reward Modal */}
      <RewardModal
        isOpen={showReward}
        onClose={handleRewardClose}
        onNextLesson={handleNextLesson}
        xpEarned={xpEarned}
      />
    </div>
  );
}
