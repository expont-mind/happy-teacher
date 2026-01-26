"use client";
import {
  useEffect,
  useRef,
  useCallback,
  useImperativeHandle,
  forwardRef,
  useState,
} from "react";
import Image from "next/image";
import {
  RotateCcw,
  Download,
  Eraser,
  Undo,
  Redo,
  HelpCircle,
  Check,
  Maximize,
  Minimize,
} from "lucide-react";
import { MessageTooltip, RelaxModal } from "@/src/components/tutorial";
import ResetConfirmModal from "./ResetConfirmModal";
import {
  rgbToHex,
  createColorSet,
  floodFill,
  checkCompletion,
  saveToHistory,
  undo as historyUndo,
  redo as historyRedo,
  resetHistory,
  clientToCanvasCoords,
  loadMainImage,
  loadMaskImage,
} from "./core";
import type { TouchPosition, CompletionResult } from "./core";

interface ColoringCanvasProps {
  mainImage: string;
  maskImage: string;
  backgroundImage: string;
  selectedColor: string;
  setImageLoaded: (loaded: boolean) => void;
  palette: string[];
  helpOpen?: boolean;
  setHelpOpen?: (open: boolean) => void;
  onMarkCompleted?: () => void;
  imageLoaded?: boolean;
  colors?: { color: string; label?: string }[];
  setSelectedColor?: (c: string) => void;
  palettePosition?: "left" | "bottom";
  onShowMessage?: (message: string) => void;
  onShowRelax?: () => void;
  characterMessage?: string | null;
  onCloseMessage?: () => void;
  showRelaxModal?: boolean;
  onCloseRelax?: () => void;
}

export interface ColoringCanvasRef {
  checkCompletion: () => CompletionResult;
}

const ColoringCanvasMult = forwardRef<ColoringCanvasRef, ColoringCanvasProps>(
  (
    {
      mainImage,
      maskImage,
      backgroundImage,
      selectedColor,
      setImageLoaded,
      palette,
      helpOpen,
      setHelpOpen,
      onMarkCompleted,
      imageLoaded,
      colors,
      setSelectedColor,
      palettePosition = "bottom",
      onShowMessage,
      onShowRelax,
      characterMessage,
      onCloseMessage,
      showRelaxModal,
      onCloseRelax,
    },
    ref
  ) => {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const containerRef = useRef<HTMLDivElement | null>(null);
    const originalImageDataRef = useRef<ImageData | null>(null);
    const maskImageDataRef = useRef<ImageData | null>(null);
    const historyRef = useRef<ImageData[]>([]);
    const historyIndexRef = useRef<number>(-1);
    const wrongClickCountRef = useRef<number>(0);
    const touchStartRef = useRef<TouchPosition | null>(null);

    const [isEraserMode, setIsEraserMode] = useState(false);
    const [canUndo, setCanUndo] = useState(false);
    const [canRedo, setCanRedo] = useState(false);
    const [isFullScreen, setIsFullScreen] = useState(false);
    const [showResetConfirm, setShowResetConfirm] = useState(false);

    // Check completion status using core module
    const handleCheckCompletion = useCallback((): CompletionResult => {
      const canvas = canvasRef.current;
      const maskData = maskImageDataRef.current;
      if (!canvas || !maskData) {
        return { isComplete: false, missingColors: [] };
      }
      return checkCompletion({ canvas, maskData, palette });
    }, [palette]);

    // Expose checkCompletion via ref
    useImperativeHandle(ref, () => ({
      checkCompletion: handleCheckCompletion,
    }));

    // Show message via callback
    const showMessage = useCallback(
      (message: string) => {
        onShowMessage?.(message);
      },
      [onShowMessage]
    );

    // History operations using core module
    const getHistoryOptions = useCallback(() => {
      const canvas = canvasRef.current;
      if (!canvas) return null;
      return {
        canvas,
        historyRef,
        historyIndexRef,
        setCanUndo,
        setCanRedo,
      };
    }, []);

    const handleSaveToHistory = useCallback(() => {
      const options = getHistoryOptions();
      if (options) saveToHistory(options);
    }, [getHistoryOptions]);

    const handleUndo = useCallback(() => {
      const options = getHistoryOptions();
      if (options) historyUndo(options);
    }, [getHistoryOptions]);

    const handleRedo = useCallback(() => {
      const options = getHistoryOptions();
      if (options) historyRedo(options);
    }, [getHistoryOptions]);

    const handleResetCanvas = useCallback(() => {
      const ctx = canvasRef.current?.getContext("2d");
      if (!ctx || !originalImageDataRef.current) return;
      ctx.putImageData(originalImageDataRef.current, 0, 0);
      resetHistory(
        historyRef,
        historyIndexRef,
        originalImageDataRef.current,
        setCanUndo,
        setCanRedo
      );
      setIsEraserMode(false);
    }, []);

    const handleDownloadCanvas = useCallback(() => {
      const dataUrl = canvasRef.current?.toDataURL("image/png");
      if (!dataUrl) return;
      const link = document.createElement("a");
      link.href = dataUrl;
      link.download = "coloring_result.png";
      link.click();
    }, []);

    // Process click/touch at coordinates
    const processClick = useCallback(
      (clientX: number, clientY: number) => {
        const canvas = canvasRef.current;
        const maskData = maskImageDataRef.current;
        if (!canvas || !maskData) return;

        const coords = clientToCanvasCoords(clientX, clientY, canvas);
        if (!coords) return;
        const { x, y } = coords;

        const fillColor = isEraserMode ? "#ffffff" : selectedColor;

        const pos = (y * canvas.width + x) * 4;
        if (pos < 0 || pos + 2 >= maskData.data.length) return;

        const r = maskData.data[pos];
        const g = maskData.data[pos + 1];
        const b = maskData.data[pos + 2];
        const maskColor = rgbToHex(r, g, b);

        const allowedColorsSet = createColorSet(palette);

        // If mask color is not in palette, just fill without checking
        if (!allowedColorsSet.has(maskColor)) {
          if (floodFill({ canvas, maskData, startX: x, startY: y, fillColor })) {
            handleSaveToHistory();
          }
          return;
        }

        // White can be painted with any color
        if (maskColor === "#ffffff") {
          if (floodFill({ canvas, maskData, startX: x, startY: y, fillColor })) {
            handleSaveToHistory();
          }
          return;
        }

        // If eraser mode, allow erasing
        if (isEraserMode) {
          if (floodFill({ canvas, maskData, startX: x, startY: y, fillColor })) {
            handleSaveToHistory();
          }
          return;
        }

        // Check if selected color matches
        if (maskColor !== selectedColor.toLowerCase()) {
          wrongClickCountRef.current += 1;
          if (wrongClickCountRef.current >= 5) {
            onShowRelax?.();
            wrongClickCountRef.current = 0;
          } else {
            showMessage("Бодлогоо дахин бодоод !\n\nЗөв өнгөө сонгоорой");
          }
          return;
        }

        // Reset wrong click counter on successful fill
        wrongClickCountRef.current = 0;

        if (floodFill({ canvas, maskData, startX: x, startY: y, fillColor })) {
          handleSaveToHistory();
        }
      },
      [
        selectedColor,
        isEraserMode,
        palette,
        showMessage,
        onShowRelax,
        handleSaveToHistory,
      ]
    );

    // Canvas click
    const handleClick = useCallback(
      (e: React.MouseEvent<HTMLCanvasElement>) => {
        processClick(e.clientX, e.clientY);
      },
      [processClick]
    );

    // Touch event handlers for iOS Safari compatibility
    useEffect(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const handleTouchStart = (e: TouchEvent) => {
        const touch = e.touches[0];
        if (touch) {
          touchStartRef.current = {
            x: touch.clientX,
            y: touch.clientY,
            time: Date.now(),
          };
        }
      };

      const handleTouchEnd = (e: TouchEvent) => {
        if (!maskImageDataRef.current) return;
        const touch = e.changedTouches[0];
        if (!touch || !touchStartRef.current) return;

        const deltaX = Math.abs(touch.clientX - touchStartRef.current.x);
        const deltaY = Math.abs(touch.clientY - touchStartRef.current.y);
        const deltaTime = Date.now() - touchStartRef.current.time;

        if (deltaX < 10 && deltaY < 10 && deltaTime < 300) {
          if (e.cancelable) e.preventDefault();
          processClick(touch.clientX, touch.clientY);
        }
        touchStartRef.current = null;
      };

      canvas.addEventListener("touchstart", handleTouchStart, { passive: true });
      canvas.addEventListener("touchend", handleTouchEnd, { passive: false });

      return () => {
        canvas.removeEventListener("touchstart", handleTouchStart);
        canvas.removeEventListener("touchend", handleTouchEnd);
        touchStartRef.current = null;
      };
    }, [processClick]);

    // Load images using core modules
    useEffect(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      loadMainImage(canvas, mainImage)
        .then(async ({ originalImageData }) => {
          originalImageDataRef.current = originalImageData;
          historyRef.current = [originalImageData];
          historyIndexRef.current = 0;
          setCanUndo(false);
          setCanRedo(false);
          setImageLoaded(true);

          const { maskImageData } = await loadMaskImage(
            maskImage,
            canvas.width,
            canvas.height
          );
          maskImageDataRef.current = maskImageData;
        })
        .catch((error) => {
          console.error("Error loading images:", error);
        });
    }, [mainImage, maskImage, setImageLoaded]);

    const toggleFullScreen = useCallback(() => {
      const container = containerRef.current;
      if (!container) return;

      if (!isFullScreen) {
        if (container.requestFullscreen) {
          container.requestFullscreen();
        } else if ((container as any).webkitRequestFullscreen) {
          (container as any).webkitRequestFullscreen();
        }
        setIsFullScreen(true);
      } else {
        if (document.exitFullscreen) {
          document.exitFullscreen();
        } else if ((document as any).webkitExitFullscreen) {
          (document as any).webkitExitFullscreen();
        }
        setIsFullScreen(false);
      }
    }, [isFullScreen]);

    // Listen for fullscreen changes
    useEffect(() => {
      const handleFullscreenChange = () => {
        const isCurrentlyFullscreen = !!(
          document.fullscreenElement ||
          (document as any).webkitFullscreenElement
        );
        setIsFullScreen(isCurrentlyFullscreen);
      };

      document.addEventListener("fullscreenchange", handleFullscreenChange);
      document.addEventListener("webkitfullscreenchange", handleFullscreenChange);

      return () => {
        document.removeEventListener("fullscreenchange", handleFullscreenChange);
        document.removeEventListener("webkitfullscreenchange", handleFullscreenChange);
      };
    }, []);

    return (
      <div
        ref={containerRef}
        className="relative w-full aspect-[4/4.5] min-h-[95vh] overflow-hidden rounded-lg bg-white"
      >
        {/* Background Image */}
        <Image
          src={backgroundImage}
          alt="background"
          fill
          priority
          className="object-contain object-center"
        />

        {/* Canvas */}
        <canvas
          ref={canvasRef}
          onClick={handleClick}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 max-w-full max-h-full cursor-crosshair touch-action-manipulation"
          style={{
            mixBlendMode: "multiply",
            touchAction: "manipulation",
            WebkitTouchCallout: "none",
            WebkitUserSelect: "none",
            WebkitTapHighlightColor: "transparent",
          }}
        />

        {/* Color Palette */}
        {colors && setSelectedColor && (
          <div
            className={`absolute z-50 ${
              palettePosition === "bottom"
                ? "bottom-4 left-1/2 -translate-x-1/2"
                : "top-1/2 -translate-y-1/2 left-4"
            }`}
          >
            <div
              className={`flex gap-2 px-2 py-1 bg-white rounded-2xl border-2 border-slate-200 shadow-xl ${
                palettePosition === "bottom"
                  ? "flex-row max-w-[90vw] overflow-x-auto"
                  : "flex-col max-h-[80vh] overflow-y-auto"
              } hide-scrollbar`}
            >
              {colors.map(({ color, label }, index) => (
                <button
                  key={`${color}-${label || index}`}
                  onClick={() => {
                    setSelectedColor(color);
                    setIsEraserMode(false);
                  }}
                  className={`group relative flex flex-col items-center gap-0.5 p-1 rounded-xl transition-all duration-200 shrink-0 ${
                    selectedColor === color
                      ? "bg-white shadow-md ring-2 ring-green-500 scale-105"
                      : "hover:bg-white/50"
                  }`}
                >
                  <div
                    className={`w-8 h-8 rounded-lg shadow-sm border border-black/10 transition-transform ${
                      selectedColor === color ? "scale-100" : "group-hover:scale-110"
                    }`}
                    style={{ backgroundColor: color }}
                  />
                  {label && (
                    <span
                      className={`text-base font-black min-w-8 text-center leading-none ${
                        selectedColor === color ? "text-green-600" : "text-slate-700"
                      }`}
                    >
                      {label}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Toolbar Buttons */}
        <div className="absolute top-1/2 -translate-y-1/2 right-4 flex flex-col gap-2 z-20">
          <button
            onClick={toggleFullScreen}
            className="cursor-pointer p-4 rounded-xl bg-white/90 hover:bg-white shadow-lg transition-all hover:scale-110 border-2 border-gray-200"
            title={isFullScreen ? "Бүтэн дэлгэцээс гарах" : "Бүтэн дэлгэц"}
          >
            {isFullScreen ? (
              <Minimize size={20} className="text-gray-700" />
            ) : (
              <Maximize size={20} className="text-gray-700" />
            )}
          </button>

          <button
            onClick={handleUndo}
            disabled={!canUndo}
            className={`cursor-pointer p-4 rounded-xl shadow-lg transition-all hover:scale-110 border-2 ${
              canUndo
                ? "bg-white/90 hover:bg-white border-gray-200"
                : "bg-gray-200 border-gray-300 opacity-50 cursor-not-allowed"
            }`}
            title="Буцах"
          >
            <Undo size={20} className={canUndo ? "text-gray-700" : "text-gray-400"} />
          </button>

          <button
            onClick={handleRedo}
            disabled={!canRedo}
            className={`cursor-pointer p-4 rounded-xl shadow-lg transition-all hover:scale-110 border-2 ${
              canRedo
                ? "bg-white/90 hover:bg-white border-gray-200"
                : "bg-gray-200 border-gray-300 opacity-50 cursor-not-allowed"
            }`}
            title="Урагшлах"
          >
            <Redo size={20} className={canRedo ? "text-gray-700" : "text-gray-400"} />
          </button>

          <button
            onClick={() => setShowResetConfirm(true)}
            className="cursor-pointer p-4 rounded-xl bg-white/90 hover:bg-white shadow-lg transition-all hover:scale-110 border-2 border-gray-200"
            title="Дахин эхлэх"
          >
            <RotateCcw size={20} className="text-gray-700" />
          </button>

          <button
            onClick={handleDownloadCanvas}
            className="cursor-pointer p-4 rounded-xl bg-white/90 hover:bg-white shadow-lg transition-all hover:scale-110 border-2 border-gray-200"
            title="Татах"
          >
            <Download size={20} className="text-gray-700" />
          </button>

          <button
            onClick={() => setIsEraserMode(!isEraserMode)}
            className={`cursor-pointer p-4 rounded-xl shadow-lg transition-all hover:scale-110 border-2 ${
              isEraserMode
                ? "bg-red-500 hover:bg-red-600 border-red-600"
                : "bg-white/90 hover:bg-white border-gray-200"
            }`}
            title="Бүдсэн хэсгийг арилгах"
          >
            <Eraser size={20} className={isEraserMode ? "text-white" : "text-gray-700"} />
          </button>

          {setHelpOpen && (
            <button
              onClick={() => setHelpOpen(true)}
              className="cursor-pointer p-4 rounded-xl bg-purple-600 hover:bg-purple-700 text-white shadow-lg transition-all hover:scale-110 border-2 border-purple-700"
              title="Тусламж"
            >
              <HelpCircle size={20} />
            </button>
          )}

          {onMarkCompleted && (
            <button
              onClick={onMarkCompleted}
              disabled={!imageLoaded}
              className="cursor-pointer p-4 rounded-xl bg-green-600 hover:bg-green-700 text-white shadow-lg transition-all hover:scale-110 border-2 border-green-700 disabled:opacity-60 disabled:cursor-not-allowed"
              title="Дууссан"
            >
              <Check size={20} />
            </button>
          )}
        </div>

        {/* Character Message Tooltip */}
        <MessageTooltip
          message={characterMessage || ""}
          character="yellow"
          characterPosition="left"
          isVisible={!!characterMessage}
          onClose={onCloseMessage || (() => {})}
          autoCloseDelay={8000}
        />

        {/* Relax Modal */}
        <RelaxModal
          isVisible={!!showRelaxModal}
          onClose={onCloseRelax || (() => {})}
          character="yellow"
        />

        {/* Reset Confirmation Modal */}
        <ResetConfirmModal
          isVisible={showResetConfirm}
          onClose={() => setShowResetConfirm(false)}
          onConfirm={() => {
            handleResetCanvas();
            setShowResetConfirm(false);
          }}
        />
      </div>
    );
  }
);

ColoringCanvasMult.displayName = "ColoringCanvasMult";

export default ColoringCanvasMult;
