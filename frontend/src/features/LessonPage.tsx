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
import { MessageTooltip, RelaxModal } from "@/src/components/tutorial";
import { RewardModal } from "../components/gamification/RewardModal";
import {
  RotateDevicePrompt,
  useIsPortraitMobile,
} from "@/src/components/ui/RotateDevicePrompt";
import { MobileColorPalette } from "@/src/components/coloring/MobileColorPalette";
import { MobileActionToolbar } from "@/src/components/coloring/MobileActionToolbar";

export default function LessonPage() {
  const params = useParams<{ lessonId: string }>();
  const router = useRouter();
  const { markLessonCompleted } = useAuth();

  const lesson = useMemo(
    () => fractionLessons.find((l) => l.id === params.lessonId),
    [params.lessonId]
  );

  const [selectedColor, setSelectedColor] = useState(
    lesson?.palette[0] || "#6b3ab5"
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

  // Mobile state
  const [colorPaletteOpen, setColorPaletteOpen] = useState(false);
  const [actionToolbarOpen, setActionToolbarOpen] = useState(false);
  const isPortraitMobile = useIsPortraitMobile();

  // Convert palette to the format needed by ColorPalette
  const paletteForDisplay = useMemo(() => {
    if (!lesson) return [];
    // Convert string array to object format for ColorPalette
    return lesson.palette.map((color) => ({ color }));
  }, [lesson]);

  // Get raw palette colors for ColoringCanvas
  const rawPalette = useMemo(() => {
    if (!lesson) return [];
    return lesson.palette;
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
    await markLessonCompleted("fractions", lesson.id);

    // Mock XP for now
    const mockXP = 50;
    setXpEarned(mockXP);
    setShowReward(true);
  };

  const handleRewardClose = () => {
    setShowReward(false);
    router.push("/topic/fractions");
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-2 lg:p-6">
      {/* Main Box Container */}
      <div className="bg-white rounded-2xl lg:rounded-3xl shadow-xl overflow-hidden flex flex-col max-w-7xl w-full h-full lg:h-auto">
        {/* Header inside box */}
        <LessonHeader
          title={lesson.title}
          onBack={handleBack}
          selectedColor={selectedColor}
          onOpenColorPalette={() => setColorPaletteOpen(true)}
          onOpenActions={() => setActionToolbarOpen(true)}
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
                canUndo={canUndo}
                canRedo={canRedo}
              />
            </div>
          </div>
        )}

        {/* Footer (Desktop only) */}
        <div className="hidden lg:flex p-6 justify-end border-t border-gray-100"></div>
      </div>

      {/* Mobile Color Palette */}
      <MobileColorPalette
        isOpen={colorPaletteOpen}
        onClose={() => setColorPaletteOpen(false)}
        colors={paletteForDisplay}
        selectedColor={selectedColor}
        onSelectColor={setSelectedColor}
      />

      {/* Mobile Action Toolbar */}
      <MobileActionToolbar
        isOpen={actionToolbarOpen}
        onClose={() => setActionToolbarOpen(false)}
        onUndo={handleUndo}
        onRedo={handleRedo}
        onHelp={handleHelp}
        onDownload={handleDownload}
        onEnd={markCompleted}
        canUndo={canUndo}
        canRedo={canRedo}
      />

      {/* Help Panel */}
      <HelpPanel
        helpOpen={helpOpen}
        setHelpOpen={setHelpOpen}
        helpImage={lesson.helpImage}
        helpVideoId={lesson.helpVideoId}
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
      />
    </div>
  );
}
