"use client";

import { useMemo, useState, useRef, useCallback, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import ColoringCanvas, {
  ColoringCanvasRef,
} from "@/src/components/coloring/ColoringCanvas";
import ColorPalette from "@/src/components/coloring/ColorPalette";
import LessonHeader from "@/src/components/coloring/LessonHeader";
import ActionToolbar from "@/src/components/coloring/ActionToolbar";
import { multiplicationLessons } from "@/src/data/lessons/multiplication";
import { useAuth } from "@/src/components/auth/AuthProvider";
import {
  RelaxModal,
  useTutorial,
  lessonPageTutorialDesktop,
  lessonPageTutorialMobile,
} from "@/src/components/tutorial";
import { RewardModal } from "../components/gamification/RewardModal";
import {
  RotateDevicePrompt,
  useIsPortraitMobile,
} from "@/src/components/ui/RotateDevicePrompt";
import Loader from "@/src/components/ui/Loader";
import { showCharacterToast, showCustomCharacterToast, showErrorToastTopRight } from "@/src/components/ui/CharacterToast";

export default function LessonMultPage() {
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
    () => multiplicationLessons.find((l) => l.id === params.lessonId),
    [params.lessonId]
  );

  // Find the next lesson
  const nextLesson = useMemo(() => {
    const currentIndex = multiplicationLessons.findIndex((l) => l.id === params.lessonId);
    if (currentIndex === -1 || currentIndex === multiplicationLessons.length - 1) {
      return null;
    }
    return multiplicationLessons[currentIndex + 1];
  }, [params.lessonId]);

  // Check if user has purchased this topic
  useEffect(() => {
    // Auth ачаалал дуусахыг хүлээх
    if (authLoading) return;

    const checkPayment = async () => {
      const purchased = await checkPurchase("multiplication");
      setIsPaid(purchased);

      if (!purchased) {
        showCharacterToast("Та эхлээд хичээлийг худалдаж авах ёстой.");
        router.replace("/topic/multiplication");
      }
    };

    checkPayment();
  }, [authLoading, checkPurchase, router, user, activeProfile]);

  // Start lesson tutorial when page is ready
  useEffect(() => {
    if (isPaid) {
      const isMobile = window.innerWidth < 1024; // lg breakpoint
      startTutorial(isMobile ? lessonPageTutorialMobile : lessonPageTutorialDesktop);
    }
  }, [isPaid, startTutorial]);

  const [selectedColor, setSelectedColor] = useState(
    lesson?.palette[0]?.color || "#6b3ab5"
  );
  const [, setImageLoaded] = useState(false);
  const [showRelaxModal, setShowRelaxModal] = useState(false);
  const canvasRef = useRef<ColoringCanvasRef>(null);
  const [showReward, setShowReward] = useState(false);
  const [xpEarned, setXpEarned] = useState(0);
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);

  // Track successful fills for character toast - use ref to avoid stale closure
  const successfulFillCountRef = useRef(0);

  // Mobile state
  const isPortraitMobile = useIsPortraitMobile();

  // Palette already has { color, label } format for multiplication
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

  // Handler for successful fill - show random character toast at multiple fill counts
  const handleSuccessfulFill = useCallback(() => {
    successfulFillCountRef.current += 1;
    const count = successfulFillCountRef.current;

    // Show toast at fills 2, 5, 8, 11, etc. (every 3 fills starting from 2)
    const toastTriggers = [2, 5, 8, 11, 14, 17, 20];
    if (toastTriggers.includes(count) && lesson?.introMessages && lesson.introMessages.length > 0) {
      // Pick a random message/character combo
      const randomIndex = Math.floor(Math.random() * lesson.introMessages.length);
      const { message, character } = lesson.introMessages[randomIndex];
      showCustomCharacterToast(message, character);
    }
  }, [lesson]);

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
    router.push("/topic/multiplication");
  };

  const handleUndo = () => {
    canvasRef.current?.undo();
  };

  const handleRedo = () => {
    canvasRef.current?.redo();
  };

  const handleDownload = () => {
    canvasRef.current?.downloadCanvas();
  };

  const markCompleted = async () => {
    if (!canvasRef.current || !lesson) return;

    const { isComplete, missingColors } = canvasRef.current.checkCompletion();

    if (!isComplete) {
      const colorNames: Record<string, string> = {
        // Basic colors
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
        // Multiplication colors
        "#3fbfff": "Цэнхэр",
        "#af4c0f": "Хүрэн",
        "#ff66c4": "Ягаан",
        "#00bf63": "Ногоон",
        "#ffde59": "Шар",
        "#ff6d4d": "Улбар шар",
        "#fbe2c1": "Цайвар шар",
        "#8f1eae": "Нил ягаан",
        "#4910bc": "Хар ягаан",
        "#9eff1f": "Цайвар ногоон",
        "#3fbffe": "Цэнхэр",
        "#ff3131": "Улаан",
        "#f3ce00": "Шар",
        "#ff751f": "Улбар шар",
        "#b174e7": "Ягаан",
        "#7ed957": "Цайвар ногоон",
        "#004aad": "Хар хөх",
        "#684530": "Хүрэн",
        "#fff3c2": "Цайвар шар",
        "#ff8e97": "Ягаан",
        "#ffe81a": "Шар",
        "#6cb61f": "Ногоон",
        "#9440dd": "Нил ягаан",
        "#bfbfbf": "Саарал",
        "#38b6ff": "Тэнгэрийн хөх",
        "#eb0000": "Улаан",
        "#8c52ff": "Ягаан",
        "#27b03b": "Ногоон",
        "#32b6fe": "Цэнхэр",
        "#7942ed": "Нил ягаан",
        "#ffe236": "Шар",
        "#6e442b": "Хүрэн",
        "#7940ed": "Нил ягаан",
        "#366cff": "Хөх",
        "#462c7a": "Хар ягаан",
        "#a13ed4": "Ягаан",
        "#8ebfe7": "Цайвар цэнхэр",
        "#587654": "Ногоон",
        "#3a4a9f": "Хөх",
        "#3a4a5f": "Хар хөх",
        "#38b6fe": "Цэнхэр",
        "#ff0000": "Улаан",
        "#b9b9b9": "Саарал",
        "#ffe234": "Шар",
        "#ff757f": "Ягаан",
        "#ff6135": "Улбар шар",
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
    await markLessonCompleted("multiplication", lesson.id);

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
    setShowReward(true);
  };

  const handleRewardClose = () => {
    setShowReward(false);
    router.push("/topic/multiplication");
  };

  const handleNextLesson = () => {
    setShowReward(false);
    if (nextLesson) {
      router.push(`/topic/multiplication/${nextLesson.id}`);
    } else {
      router.push("/topic/multiplication");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-2 lg:p-6">
      {/* Main Box Container */}
      <div className="bg-white rounded-2xl lg:rounded-3xl shadow-xl flex flex-col max-w-7xl w-full h-full lg:h-auto">
        {/* Header inside box */}
        <LessonHeader
          title={lesson.title}
          onBack={handleBack}
          selectedColor={selectedColor}
          colors={paletteForDisplay}
          onSelectColor={setSelectedColor}
          onUndo={handleUndo}
          onRedo={handleRedo}
          onDownload={handleDownload}
          onEnd={markCompleted}
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
                onSuccessfulFill={handleSuccessfulFill}
              />
            </div>

            {/* Right - Action Toolbar (Desktop only) */}
            <div className="hidden lg:flex">
              <ActionToolbar
                onUndo={handleUndo}
                onRedo={handleRedo}
                onDownload={handleDownload}
                onEnd={markCompleted}
                canUndo={canUndo}
                canRedo={canRedo}
              />
            </div>
          </div>
        )}

        {/* Footer (Desktop only) */}
        <div className="hidden lg:flex p-6 justify-end border-t border-gray-100"></div>
      </div>

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
