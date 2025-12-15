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
import { multiplicationLessons } from "@/src/data/lessons/multiplication";
import { useAuth } from "@/src/components/auth/AuthProvider";
import {
  MessageTooltip,
  RelaxModal,
} from "@/src/components/tutorial";
import { RewardModal } from "../components/gamification/RewardModal";
import Loader from "@/src/components/ui/Loader";
import { showCharacterToast } from "@/src/components/ui/CharacterToast";

export default function LessonMultPage() {
  const params = useParams<{ lessonId: string }>();
  const router = useRouter();
  const { markLessonCompleted, addXP, checkPurchase, user, activeProfile, loading: authLoading } = useAuth();
  const [isPaid, setIsPaid] = useState<boolean | null>(null);

  const lesson = useMemo(
    () => multiplicationLessons.find((l) => l.id === params.lessonId),
    [params.lessonId]
  );

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

  const [selectedColor, setSelectedColor] = useState(
    lesson?.palette[0]?.color || "#6b3ab5"
  );
  const [helpOpen, setHelpOpen] = useState(false);
  const [, setImageLoaded] = useState(false);
  const [characterMessage, setCharacterMessage] = useState<string | null>(null);
  const [showRelaxModal, setShowRelaxModal] = useState(false);
  const canvasRef = useRef<ColoringCanvasRef>(null);
  const [showReward, setShowReward] = useState(false);
  const [xpEarned, setXpEarned] = useState(0);
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);

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
    setCharacterMessage(message);
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
    router.push("/topic/multiplication");
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

    // Award XP
    const result = await addXP(totalXP);
    if (result) {
      setXpEarned(totalXP);
      setShowReward(true);
    } else {
      router.push("/topic/multiplication");
    }
  };

  const handleRewardClose = () => {
    setShowReward(false);
    router.push("/topic/multiplication");
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-6">
      {/* Main Box Container */}
      <div className="bg-white rounded-3xl shadow-xl overflow-hidden flex flex-col max-w-7xl w-full">
        {/* Header inside box */}
        <LessonHeader title={lesson.title} onBack={handleBack} />

        {/* Main Content - 3 column layout */}
        <div className="flex-1 flex items-stretch justify-center p-6 gap-6">
          {/* Left - Color Palette */}
          <ColorPalette
            colors={paletteForDisplay}
            selectedColor={selectedColor}
            setSelectedColor={setSelectedColor}
          />

          {/* Center - Canvas */}
          <div className="flex-1 max-w-4xl">
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

          {/* Right - Action Toolbar */}
          <ActionToolbar
            onUndo={handleUndo}
            onRedo={handleRedo}
            onHelp={handleHelp}
            onDownload={handleDownload}
            onEnd={markCompleted}
            canUndo={canUndo}
            canRedo={canRedo}
          />
        </div>
      </div>

      {/* Help Panel */}
      <HelpPanel
        helpOpen={helpOpen}
        setHelpOpen={setHelpOpen}
        helpImage={lesson.helpImage}
      />

      {/* Character Message */}
      <MessageTooltip
        message={characterMessage || ""}
        character="yellow"
        characterPosition="left"
        isVisible={!!characterMessage}
        onClose={() => setCharacterMessage(null)}
        autoCloseDelay={8000}
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
        xpEarned={xpEarned}
        bonus={xpEarned === 15 ? "Perfect Lesson Bonus!" : undefined}
        type="lesson"
      />
    </div>
  );
}
