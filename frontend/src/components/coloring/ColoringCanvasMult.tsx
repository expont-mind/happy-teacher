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
  palettePosition?: "left" | "bottom"; // New prop for palette position
  onShowMessage?: (message: string) => void;
  onShowRelax?: () => void;
  characterMessage?: string | null;
  onCloseMessage?: () => void;
  showRelaxModal?: boolean;
  onCloseRelax?: () => void;
}

export interface ColoringCanvasRef {
  checkCompletion: () => { isComplete: boolean; missingColors: string[] };
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
      palettePosition = "bottom", // Default to bottom
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

    const [isEraserMode, setIsEraserMode] = useState(false);
    const [canUndo, setCanUndo] = useState(false);
    const [canRedo, setCanRedo] = useState(false);
    const [isFullScreen, setIsFullScreen] = useState(false);
    const [showResetConfirm, setShowResetConfirm] = useState(false);
    const wrongClickCountRef = useRef<number>(0);

    // Check completion status
    const checkCompletion = useCallback((): {
      isComplete: boolean;
      missingColors: string[];
    } => {
      const canvas = canvasRef.current;
      const maskData = maskImageDataRef.current;
      if (!canvas || !maskData) {
        return { isComplete: false, missingColors: [] };
      }

      const ctx = canvas.getContext("2d", { willReadFrequently: true });
      if (!ctx) {
        return { isComplete: false, missingColors: [] };
      }

      const canvasData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const canvasPixels = canvasData.data;
      const maskPixels = maskData.data;

      // Get allowed colors from palette prop (convert to lowercase for comparison)
      const allowedColors = [
        ...palette.map((color) => color.toLowerCase()),
        "#ffffff", // White is always allowed (for eraser)
      ];

      // Find required colors from mask (excluding white)
      const requiredColors = new Set<string>();
      const colorPixels = new Map<string, Set<number>>();

      for (let i = 0; i < maskPixels.length; i += 4) {
        const r = maskPixels[i];
        const g = maskPixels[i + 1];
        const b = maskPixels[i + 2];
        const maskColor = `#${[r, g, b]
          .map((x) => x.toString(16).padStart(2, "0"))
          .join("")}`.toLowerCase();

        if (allowedColors.includes(maskColor) && maskColor !== "#ffffff") {
          requiredColors.add(maskColor);
          if (!colorPixels.has(maskColor)) {
            colorPixels.set(maskColor, new Set());
          }
          colorPixels.get(maskColor)?.add(i);
        }
      }

      // Check if each required color area is filled
      const missingColors: string[] = [];
      const tolerance = 30;

      requiredColors.forEach((requiredColor) => {
        const pixels = colorPixels.get(requiredColor);
        if (!pixels) return;

        const [reqR, reqG, reqB] = [
          parseInt(requiredColor.slice(1, 3), 16),
          parseInt(requiredColor.slice(3, 5), 16),
          parseInt(requiredColor.slice(5, 7), 16),
        ];

        let filledCount = 0;
        let totalCount = 0;

        pixels.forEach((pos) => {
          totalCount++;
          const canvasR = canvasPixels[pos];
          const canvasG = canvasPixels[pos + 1];
          const canvasB = canvasPixels[pos + 2];

          // Check if pixel matches the required color (with tolerance)
          if (
            Math.abs(canvasR - reqR) <= tolerance &&
            Math.abs(canvasG - reqG) <= tolerance &&
            Math.abs(canvasB - reqB) <= tolerance
          ) {
            filledCount++;
          }
        });

        // Consider filled if at least 80% of pixels match
        const fillPercentage = totalCount > 0 ? filledCount / totalCount : 0;
        if (fillPercentage < 0.8) {
          missingColors.push(requiredColor);
        }
      });

      return {
        isComplete: missingColors.length === 0,
        missingColors,
      };
    }, [palette]);

    // Expose checkCompletion via ref
    useImperativeHandle(ref, () => ({
      checkCompletion,
    }));

    // Show message via callback
    const showMessage = useCallback(
      (message: string) => {
        if (onShowMessage) {
          onShowMessage(message);
        }
      },
      [onShowMessage]
    );

    // Save state to history
    const saveToHistory = useCallback(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d", { willReadFrequently: true });
      if (!ctx) return;

      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

      // Remove any future history if we're not at the end
      if (historyIndexRef.current < historyRef.current.length - 1) {
        historyRef.current = historyRef.current.slice(
          0,
          historyIndexRef.current + 1
        );
      }

      // Add new state
      historyRef.current.push(imageData);
      historyIndexRef.current = historyRef.current.length - 1;

      // Limit history size
      if (historyRef.current.length > 50) {
        historyRef.current.shift();
        historyIndexRef.current--;
      }

      // Update button states
      setCanUndo(historyIndexRef.current > 0);
      setCanRedo(historyIndexRef.current < historyRef.current.length - 1);
    }, []);

    // Undo function
    const undo = useCallback(() => {
      if (historyIndexRef.current <= 0) return;

      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      historyIndexRef.current--;
      const imageData = historyRef.current[historyIndexRef.current];
      ctx.putImageData(imageData, 0, 0);

      setCanUndo(historyIndexRef.current > 0);
      setCanRedo(historyIndexRef.current < historyRef.current.length - 1);
    }, []);

    // Redo function
    const redo = useCallback(() => {
      if (historyIndexRef.current >= historyRef.current.length - 1) return;

      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      historyIndexRef.current++;
      const imageData = historyRef.current[historyIndexRef.current];
      ctx.putImageData(imageData, 0, 0);

      setCanUndo(historyIndexRef.current > 0);
      setCanRedo(historyIndexRef.current < historyRef.current.length - 1);
    }, []);

    // Flood fill logic
    const floodFill = useCallback(
      (startX: number, startY: number, fillColor: string) => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d", { willReadFrequently: true });
        if (!ctx) return;
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const pixels = imageData.data;

        const startPos = (startY * canvas.width + startX) * 4;
        const startR = pixels[startPos];
        const startG = pixels[startPos + 1];
        const startB = pixels[startPos + 2];

        const fillR = parseInt(fillColor.slice(1, 3), 16);
        const fillG = parseInt(fillColor.slice(3, 5), 16);
        const fillB = parseInt(fillColor.slice(5, 7), 16);

        if (startR === fillR && startG === fillG && startB === fillB) return;

        const tolerance = 30;
        const isBlack = (r: number, g: number, b: number) =>
          r < 50 && g < 50 && b < 50;
        if (isBlack(startR, startG, startB)) return;

        const stack: Array<[number, number]> = [[startX, startY]];
        const visited = new Set<string>();

        const matchColor = (pos: number) => {
          const r = pixels[pos];
          const g = pixels[pos + 1];
          const b = pixels[pos + 2];
          if (isBlack(r, g, b)) return false;
          return (
            Math.abs(r - startR) <= tolerance &&
            Math.abs(g - startG) <= tolerance &&
            Math.abs(b - startB) <= tolerance
          );
        };

        const colorPixel = (pos: number) => {
          pixels[pos] = fillR;
          pixels[pos + 1] = fillG;
          pixels[pos + 2] = fillB;
          pixels[pos + 3] = 255;
        };

        while (stack.length) {
          const current = stack.pop();
          if (!current) break;
          const [x, y] = current;
          const key = `${x},${y}`;
          if (visited.has(key)) continue;
          if (x < 0 || x >= canvas.width || y < 0 || y >= canvas.height)
            continue;

          const pos = (y * canvas.width + x) * 4;
          if (!matchColor(pos)) continue;

          visited.add(key);
          colorPixel(pos);
          stack.push([x + 1, y], [x - 1, y], [x, y + 1], [x, y - 1]);
          if (visited.size > 500000) break;
        }

        ctx.putImageData(imageData, 0, 0);
        saveToHistory();
      },
      [saveToHistory]
    );

    // Canvas click
    const handleClick = useCallback(
      (e: React.MouseEvent<HTMLCanvasElement>) => {
        if (!canvasRef.current || !maskImageDataRef.current) return;
        const rect = canvasRef.current.getBoundingClientRect();
        const x = Math.floor(
          ((e.clientX - rect.left) / rect.width) * canvasRef.current.width
        );
        const y = Math.floor(
          ((e.clientY - rect.top) / rect.height) * canvasRef.current.height
        );

        // Use eraser mode (white) or selected color
        const fillColor = isEraserMode ? "#ffffff" : selectedColor;

        // Check mask color at click position
        const maskData = maskImageDataRef.current;
        const pos = (y * canvasRef.current.width + x) * 4;
        const r = maskData.data[pos];
        const g = maskData.data[pos + 1];
        const b = maskData.data[pos + 2];
        const maskColor = `#${[r, g, b]
          .map((c) => c.toString(16).padStart(2, "0"))
          .join("")}`.toLowerCase();

        // Get allowed colors from palette
        const allowedColors = [
          ...palette.map((color) => color.toLowerCase()),
          "#ffffff",
        ];

        // If mask color is not in palette, just fill without checking
        if (!allowedColors.includes(maskColor)) {
          floodFill(x, y, fillColor);
          return;
        }

        // Цагаан хэсгийг ямар ч өнгөөр будаж болно
        if (maskColor === "#ffffff") {
          floodFill(x, y, fillColor);
          return;
        }

        // If eraser mode, allow erasing
        if (isEraserMode) {
          floodFill(x, y, fillColor);
          return;
        }

        // TEMPORARILY DISABLED: Check if selected color matches the mask color
        // if (maskColor !== selectedColor.toLowerCase()) {
        //   wrongClickCountRef.current += 1;
        //   if (wrongClickCountRef.current >= 5) {
        //     if (onShowRelax) onShowRelax();
        //     wrongClickCountRef.current = 0;
        //   } else {
        //     showMessage(
        //       "Энэ хэсэгт өөр өнгө сонгоорой!\n\nЗөв өнгө сонгоно уу."
        //     );
        //   }
        //   return;
        // }

        // TEMPORARILY DISABLED: Reset wrong click counter on successful fill
        wrongClickCountRef.current = 0;

        // Correct color selected, fill it
        floodFill(x, y, fillColor);
      },
      [
        selectedColor,
        floodFill,
        isEraserMode,
        palette,
        showMessage,
        onShowRelax,
      ]
    );

    // Load images
    useEffect(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d", { willReadFrequently: true });
      if (!ctx) return;

      const img = new window.Image();
      img.src = mainImage;
      img.onload = () => {
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);
        originalImageDataRef.current = ctx.getImageData(
          0,
          0,
          canvas.width,
          canvas.height
        );

        // Save initial state to history
        historyRef.current = [originalImageDataRef.current];
        historyIndexRef.current = 0;
        setCanUndo(false);
        setCanRedo(false);

        setImageLoaded(true);

        const maskImg = new window.Image();
        maskImg.src = maskImage;
        maskImg.onload = () => {
          const maskCanvas = document.createElement("canvas");
          maskCanvas.width = img.width;
          maskCanvas.height = img.height;
          const maskCtx = maskCanvas.getContext("2d");
          if (!maskCtx) return;
          maskCtx.drawImage(maskImg, 0, 0, img.width, img.height);
          maskImageDataRef.current = maskCtx.getImageData(
            0,
            0,
            img.width,
            img.height
          );
        };
      };
    }, [mainImage, maskImage, setImageLoaded]);

    const resetCanvas = useCallback(() => {
      const ctx = canvasRef.current?.getContext("2d");
      if (!ctx || !originalImageDataRef.current) return;
      ctx.putImageData(originalImageDataRef.current, 0, 0);

      // Reset history
      historyRef.current = [originalImageDataRef.current];
      historyIndexRef.current = 0;
      setCanUndo(false);
      setCanRedo(false);
      setIsEraserMode(false);
    }, []);

    const downloadCanvas = useCallback(() => {
      const dataUrl = canvasRef.current?.toDataURL("image/png");
      if (!dataUrl) return;
      const link = document.createElement("a");
      link.href = dataUrl;
      link.download = "coloring_result.png";
      link.click();
    }, []);

    const toggleFullScreen = useCallback(() => {
      const container = containerRef.current;
      if (!container) return;

      if (!isFullScreen) {
        // Enter fullscreen
        if (container.requestFullscreen) {
          container.requestFullscreen();
        } else if ((container as any).webkitRequestFullscreen) {
          (container as any).webkitRequestFullscreen();
        } else if ((container as any).mozRequestFullScreen) {
          (container as any).mozRequestFullScreen();
        } else if ((container as any).msRequestFullscreen) {
          (container as any).msRequestFullscreen();
        }
        setIsFullScreen(true);
      } else {
        // Exit fullscreen
        if (document.exitFullscreen) {
          document.exitFullscreen();
        } else if ((document as any).webkitExitFullscreen) {
          (document as any).webkitExitFullscreen();
        } else if ((document as any).mozCancelFullScreen) {
          (document as any).mozCancelFullScreen();
        } else if ((document as any).msExitFullscreen) {
          (document as any).msExitFullscreen();
        }
        setIsFullScreen(false);
      }
    }, [isFullScreen]);

    // Listen for fullscreen changes
    useEffect(() => {
      const handleFullscreenChange = () => {
        const isCurrentlyFullscreen = !!(
          document.fullscreenElement ||
          (document as any).webkitFullscreenElement ||
          (document as any).mozFullScreenElement ||
          (document as any).msFullscreenElement
        );
        setIsFullScreen(isCurrentlyFullscreen);
      };

      document.addEventListener("fullscreenchange", handleFullscreenChange);
      document.addEventListener(
        "webkitfullscreenchange",
        handleFullscreenChange
      );
      document.addEventListener("mozfullscreenchange", handleFullscreenChange);
      document.addEventListener("MSFullscreenChange", handleFullscreenChange);

      return () => {
        document.removeEventListener(
          "fullscreenchange",
          handleFullscreenChange
        );
        document.removeEventListener(
          "webkitfullscreenchange",
          handleFullscreenChange
        );
        document.removeEventListener(
          "mozfullscreenchange",
          handleFullscreenChange
        );
        document.removeEventListener(
          "MSFullscreenChange",
          handleFullscreenChange
        );
      };
    }, []);

    return (
      <div
        ref={containerRef}
        className="relative w-full aspect-4/3 overflow-hidden rounded-lg bg-white"
      >
        {/* Background Image */}
        <Image
          src={backgroundImage}
          alt="background"
          fill
          priority
          className="object-contain object-center"
        />

        {/* Canvas - overlays the background */}
        <canvas
          ref={canvasRef}
          onClick={handleClick}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 max-w-full max-h-full cursor-crosshair"
          style={{ mixBlendMode: "multiply" }}
        />

        {/* Color Palette - Position based on palettePosition prop */}
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
                  onClick={() => setSelectedColor(color)}
                  className={`group relative flex flex-col items-center gap-0.5 p-1 rounded-xl transition-all duration-200 shrink-0 ${
                    selectedColor === color
                      ? "bg-white shadow-md ring-2 ring-green-500 scale-105"
                      : "hover:bg-white/50"
                  }`}
                >
                  <div
                    className={`w-8 h-8 rounded-lg shadow-sm border border-black/10 transition-transform ${
                      selectedColor === color
                        ? "scale-100"
                        : "group-hover:scale-110"
                    }`}
                    style={{ backgroundColor: color }}
                  />

                  {label && (
                    <span
                      className={`text-base font-black min-w-8 text-center leading-none ${
                        selectedColor === color
                          ? "text-green-600"
                          : "text-slate-700"
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

        {/* Toolbar Buttons - Right Side */}
        <div className="absolute top-1/2 -translate-y-1/2 right-4 flex flex-col gap-2 z-20">
          {/* Full Screen Button */}
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
            onClick={undo}
            disabled={!canUndo}
            className={`cursor-pointer p-4 rounded-xl shadow-lg transition-all hover:scale-110 border-2 ${
              canUndo
                ? "bg-white/90 hover:bg-white border-gray-200"
                : "bg-gray-200 border-gray-300 opacity-50 cursor-not-allowed"
            }`}
            title="Буцах"
          >
            <Undo
              size={20}
              className={canUndo ? "text-gray-700" : "text-gray-400"}
            />
          </button>

          {/* Redo Button */}
          <button
            onClick={redo}
            disabled={!canRedo}
            className={`cursor-pointer p-4 rounded-xl shadow-lg transition-all hover:scale-110 border-2 ${
              canRedo
                ? "bg-white/90 hover:bg-white border-gray-200"
                : "bg-gray-200 border-gray-300 opacity-50 cursor-not-allowed"
            }`}
            title="Урагшлах"
          >
            <Redo
              size={20}
              className={canRedo ? "text-gray-700" : "text-gray-400"}
            />
          </button>

          {/* Reset Button */}
          <button
            onClick={() => setShowResetConfirm(true)}
            className="cursor-pointer p-4 rounded-xl bg-white/90 hover:bg-white shadow-lg transition-all hover:scale-110 border-2 border-gray-200"
            title="Дахин эхлэх"
          >
            <RotateCcw size={20} className="text-gray-700" />
          </button>

          {/* Download Button */}
          <button
            onClick={downloadCanvas}
            className="cursor-pointer p-4 rounded-xl bg-white/90 hover:bg-white shadow-lg transition-all hover:scale-110 border-2 border-gray-200"
            title="Татах"
          >
            <Download size={20} className="text-gray-700" />
          </button>

          {/* Eraser Toggle Button */}
          <button
            onClick={() => setIsEraserMode(!isEraserMode)}
            className={`cursor-pointer p-4 rounded-xl shadow-lg transition-all hover:scale-110 border-2 ${
              isEraserMode
                ? "bg-red-500 hover:bg-red-600 border-red-600"
                : "bg-white/90 hover:bg-white border-gray-200"
            }`}
            title="Бүдсэн хэсгийг арилгах"
          >
            <Eraser
              size={20}
              className={isEraserMode ? "text-white" : "text-gray-700"}
            />
          </button>

          {/* Help Button */}
          {setHelpOpen && (
            <button
              onClick={() => setHelpOpen(true)}
              className="cursor-pointer p-4 rounded-xl bg-purple-600 hover:bg-purple-700 text-white shadow-lg transition-all hover:scale-110 border-2 border-purple-700"
              title="Тусламж"
            >
              <HelpCircle size={20} />
            </button>
          )}

          {/* Done Button */}
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

        {/* Character Message Tooltip - inside container for fullscreen visibility */}
        <MessageTooltip
          message={characterMessage || ""}
          character="yellow"
          characterPosition="left"
          isVisible={!!characterMessage}
          onClose={onCloseMessage || (() => {})}
          autoCloseDelay={8000}
        />

        {/* Relax Modal - inside container for fullscreen visibility */}
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
            resetCanvas();
            setShowResetConfirm(false);
          }}
        />
      </div>
    );
  }
);

ColoringCanvasMult.displayName = "ColoringCanvasMult";

export default ColoringCanvasMult;
