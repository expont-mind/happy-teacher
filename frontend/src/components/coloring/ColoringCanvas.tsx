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
  onShowMessage?: (message: string) => void;
  onShowRelax?: () => void;
  renderColorPalette?: React.ReactNode;
  characterMessage?: string | null;
  onCloseMessage?: () => void;
  showRelaxModal?: boolean;
  onCloseRelax?: () => void;
}

export interface ColoringCanvasRef {
  checkCompletion: () => { isComplete: boolean; missingColors: string[] };
  getMistakeCount: () => number;
}

const ColoringCanvas = forwardRef<ColoringCanvasRef, ColoringCanvasProps>(
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
      onShowMessage,
      onShowRelax,
      renderColorPalette,
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
    const wrongClickCountRef = useRef<number>(0);

    const mistakeCountRef = useRef<number>(0);

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

    // Expose checkCompletion and getMistakeCount via ref
    useImperativeHandle(ref, () => ({
      checkCompletion,
      getMistakeCount: () => mistakeCountRef.current,
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

        const pos = (y * maskImageDataRef.current.width + x) * 4;
        const r = maskImageDataRef.current.data[pos];
        const g = maskImageDataRef.current.data[pos + 1];
        const b = maskImageDataRef.current.data[pos + 2];
        const maskColor = `#${[r, g, b]
          .map((x) => x.toString(16).padStart(2, "0"))
          .join("")}`;

        const allowedColors = [
          ...palette.map((color) => color.toLowerCase()),
          "#ffffff", // White is always allowed (for eraser)
        ];

        if (!allowedColors.includes(maskColor)) {
          floodFill(x, y, selectedColor);
          return;
        }

        // Цагаан хэсгийг ямар ч өнгөөр будаж болно
        if (maskColor === "#ffffff") {
          const fillColor = isEraserMode ? "#ffffff" : selectedColor;
          floodFill(x, y, fillColor);
          return;
        }

        if (maskColor !== selectedColor.toLowerCase()) {
          mistakeCountRef.current += 1;
          wrongClickCountRef.current += 1;
          if (wrongClickCountRef.current >= 5) {
            if (onShowRelax) onShowRelax();
            wrongClickCountRef.current = 0;
          } else {
            showMessage(
              "Энэ хэсэгт өөр өнгө сонгоорой!\n\nЗөв өнгө сонгоно уу."
            );
          }
          return;
        }

        // Reset wrong click counter on successful fill
        wrongClickCountRef.current = 0;

        // Use eraser mode (white) or selected color
        const fillColor = isEraserMode ? "#ffffff" : selectedColor;
        floodFill(x, y, fillColor);
      },
      [
        selectedColor,
        floodFill,
        showMessage,
        isEraserMode,
        palette,
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
        className="relative flex-1 overflow-hidden rounded-lg"
      >
        <Image
          src={backgroundImage}
          alt="background"
          fill
          priority
          className="object-contain object-top"
        />
        <canvas
          ref={canvasRef}
          onClick={handleClick}
          className="relative w-full h-auto cursor-crosshair"
          style={{ mixBlendMode: "multiply" }}
        />

        {/* Color Palette - Rendered from parent */}
        {renderColorPalette}

        {/* Toolbar Buttons - Right Side */}
        <div className="absolute top-1/2 -translate-y-1/2 right-4 flex flex-col gap-2 z-20">
          {/* Full Screen Button */}
          <button
            onClick={toggleFullScreen}
            className="cursor-pointer p-4 rounded-xl bg-white/90 hover:bg-white shadow-lg transition-all hover:scale-110 border-2 border-gray-200"
            title={isFullScreen ? "Бүтэн дэлгэцээс гарах" : "Бүтэн дэлгэц"}
            data-tutorial="fullscreen-btn"
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
            data-tutorial="undo-btn"
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
            data-tutorial="redo-btn"
          >
            <Redo
              size={20}
              className={canRedo ? "text-gray-700" : "text-gray-400"}
            />
          </button>

          {/* Reset Button */}
          <button
            onClick={resetCanvas}
            className="cursor-pointer p-4 rounded-xl bg-white/90 hover:bg-white shadow-lg transition-all hover:scale-110 border-2 border-gray-200"
            title="Дахин эхлэх"
            data-tutorial="reset-btn"
          >
            <RotateCcw size={20} className="text-gray-700" />
          </button>

          {/* Download Button */}
          <button
            onClick={downloadCanvas}
            className="cursor-pointer p-4 rounded-xl bg-white/90 hover:bg-white shadow-lg transition-all hover:scale-110 border-2 border-gray-200"
            title="Татах"
            data-tutorial="download-btn"
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
            data-tutorial="eraser-btn"
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
              data-tutorial="help-btn"
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
              data-tutorial="done-btn"
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
      </div>
    );
  }
);

ColoringCanvas.displayName = "ColoringCanvas";

export default ColoringCanvas;
