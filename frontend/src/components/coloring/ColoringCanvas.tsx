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

interface ColoringCanvasProps {
  mainImage: string;
  maskImage: string;
  backgroundImage: string;
  selectedColor: string;
  setImageLoaded: (loaded: boolean) => void;
  palette: string[];
  isEraserMode?: boolean;
  onShowMessage?: (message: string) => void;
  onShowRelax?: () => void;
  onSuccessfulFill?: () => void;
}

export interface ColoringCanvasRef {
  checkCompletion: () => { isComplete: boolean; missingColors: string[] };
  getMistakeCount: () => number;
  undo: () => void;
  redo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  resetCanvas: () => void;
  downloadCanvas: () => void;
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
      isEraserMode = false,
      onShowMessage,
      onShowRelax,
      onSuccessfulFill,
    },
    ref,
  ) => {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const originalImageDataRef = useRef<ImageData | null>(null);
    const maskImageDataRef = useRef<ImageData | null>(null);
    const historyRef = useRef<ImageData[]>([]);
    const historyIndexRef = useRef<number>(-1);
    const wrongClickCountRef = useRef<number>(0);

    const [canUndo, setCanUndo] = useState(false);
    const [canRedo, setCanRedo] = useState(false);
    const [isMaskReady, setIsMaskReady] = useState(false);
    const [debugInfo, setDebugInfo] = useState<{
      device: string;
      canvasSize: string;
      pixelRatio: number;
      screenSize: string;
    } | null>(null);

    const mistakeCountRef = useRef<number>(0);

    // Show message via callback
    const showMessage = useCallback(
      (message: string) => {
        if (onShowMessage) {
          onShowMessage(message);
        }
      },
      [onShowMessage],
    );

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

        // Skip white (background)
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
          historyIndexRef.current + 1,
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

      // Save to localStorage
      try {
        const dataUrl = canvas.toDataURL();
        localStorage.setItem(`coloring_progress_${mainImage}`, dataUrl);
      } catch (e) {
        console.error("Error saving progress:", e);
      }
    }, [mainImage]);

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

      // Save undo state to localStorage
      try {
        const dataUrl = canvas.toDataURL();
        localStorage.setItem(`coloring_progress_${mainImage}`, dataUrl);
      } catch (e) {
        console.error("Error saving progress:", e);
      }
    }, [mainImage]);

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

      // Save redo state to localStorage
      try {
        const dataUrl = canvas.toDataURL();
        localStorage.setItem(`coloring_progress_${mainImage}`, dataUrl);
      } catch (e) {
        console.error("Error saving progress:", e);
      }
    }, [mainImage]);

    // Reset canvas
    const resetCanvas = useCallback(() => {
      const ctx = canvasRef.current?.getContext("2d");
      if (!ctx || !originalImageDataRef.current) return;
      ctx.putImageData(originalImageDataRef.current, 0, 0);

      // Reset history
      historyRef.current = [originalImageDataRef.current];
      historyIndexRef.current = 0;
      setCanUndo(false);
      setCanRedo(false);

      // Clear localStorage
      localStorage.removeItem(`coloring_progress_${mainImage}`);
      window.location.reload();
    }, [mainImage]);

    // Download canvas as image
    const downloadCanvas = useCallback(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const link = document.createElement("a");
      link.download = "coloring.png";
      link.href = canvas.toDataURL("image/png");
      link.click();
    }, []);

    // Expose methods via ref
    useImperativeHandle(
      ref,
      () => ({
        checkCompletion,
        getMistakeCount: () => mistakeCountRef.current,
        undo,
        redo,
        canUndo,
        canRedo,
        resetCanvas,
        downloadCanvas,
      }),
      [
        checkCompletion,
        undo,
        redo,
        canUndo,
        canRedo,
        resetCanvas,
        downloadCanvas,
      ],
    );

    // Flood fill logic
    const floodFill = useCallback(
      (startX: number, startY: number, fillColor: string) => {
        const canvas = canvasRef.current;
        const maskData = maskImageDataRef.current;
        if (!canvas || !maskData) return;
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

        const isBlack = (r: number, g: number, b: number) =>
          r < 50 && g < 50 && b < 50;
        // Always block black pixels (SVG outlines) - both for painting and erasing
        if (isBlack(startR, startG, startB)) return;

        // Get mask color at start position for boundary detection
        const startMaskR = maskData.data[startPos];
        const startMaskG = maskData.data[startPos + 1];
        const startMaskB = maskData.data[startPos + 2];

        const stack: Array<[number, number]> = [[startX, startY]];
        const visited = new Set<string>();

        const matchColor = (pos: number) => {
          const r = pixels[pos];
          const g = pixels[pos + 1];
          const b = pixels[pos + 2];
          // Always treat black pixels as boundaries (SVG outlines)
          if (isBlack(r, g, b)) return false;

          // Use mask color for boundary detection (exact match required)
          const maskR = maskData.data[pos];
          const maskG = maskData.data[pos + 1];
          const maskB = maskData.data[pos + 2];

          return (
            maskR === startMaskR &&
            maskG === startMaskG &&
            maskB === startMaskB
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
      [saveToHistory],
    );

    // Process click/touch at coordinates
    const processClick = useCallback(
      (clientX: number, clientY: number) => {
        if (!canvasRef.current || !maskImageDataRef.current) return;
        const rect = canvasRef.current.getBoundingClientRect();
        const x = Math.floor(
          ((clientX - rect.left) / rect.width) * canvasRef.current.width,
        );
        const y = Math.floor(
          ((clientY - rect.top) / rect.height) * canvasRef.current.height,
        );

        // Bounds check - ensure x, y are within canvas
        if (
          x < 0 ||
          x >= canvasRef.current.width ||
          y < 0 ||
          y >= canvasRef.current.height
        ) {
          return;
        }

        const pos = (y * maskImageDataRef.current.width + x) * 4;

        // Safety check for mask data bounds
        if (pos < 0 || pos + 2 >= maskImageDataRef.current.data.length) {
          return;
        }

        const r = maskImageDataRef.current.data[pos];
        const g = maskImageDataRef.current.data[pos + 1];
        const b = maskImageDataRef.current.data[pos + 2];

        // Safety check for undefined values
        if (r === undefined || g === undefined || b === undefined) {
          return;
        }

        const maskColor = `#${[r, g, b]
          .map((c) => c.toString(16).padStart(2, "0"))
          .join("")}`.toLowerCase();

        const allowedColors = [
          ...palette.map((color) => color.toLowerCase()),
          "#ffffff", // White is always allowed (for eraser)
        ];

        if (!allowedColors.includes(maskColor)) {
          const fillColor = isEraserMode ? "#ffffff" : selectedColor;
          floodFill(x, y, fillColor);
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
            showMessage("Бодлогоо дахин бодоод !\n\nЗөв өнгөө сонгоорой");
          }
          return;
        }

        // Reset wrong click counter on successful fill
        wrongClickCountRef.current = 0;

        // Notify parent of successful fill
        if (onSuccessfulFill) onSuccessfulFill();

        // Use eraser mode (white) or selected color
        const fillColor = isEraserMode ? "#ffffff" : selectedColor;
        floodFill(x, y, fillColor);
      },
      [
        selectedColor,
        floodFill,
        isEraserMode,
        palette,
        onShowRelax,
        showMessage,
        onSuccessfulFill,
      ],
    );

    // Mouse click handler
    const handleClick = useCallback(
      (e: React.MouseEvent<HTMLCanvasElement>) => {
        processClick(e.clientX, e.clientY);
      },
      [processClick],
    );

    // Track touch start position for distinguishing tap from scroll
    const touchStartRef = useRef<{ x: number; y: number; time: number } | null>(
      null,
    );

    // Store handlers in refs for proper cleanup on iOS Safari
    const touchStartHandlerRef = useRef<((e: TouchEvent) => void) | null>(null);
    const touchEndHandlerRef = useRef<((e: TouchEvent) => void) | null>(null);

    // Use native event listeners for iOS Safari compatibility
    // React's synthetic events don't support { passive: false } which is needed for preventDefault()
    // Only attach listeners after mask is ready to prevent issues on first load
    useEffect(() => {
      const canvas = canvasRef.current;
      if (!canvas || !isMaskReady) return;

      // Remove any existing handlers first (critical for iOS Safari)
      if (touchStartHandlerRef.current) {
        canvas.removeEventListener("touchstart", touchStartHandlerRef.current);
      }
      if (touchEndHandlerRef.current) {
        canvas.removeEventListener("touchend", touchEndHandlerRef.current);
      }

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
        // Check if mask data is ready before processing
        if (!maskImageDataRef.current) return;

        const touch = e.changedTouches[0];
        if (!touch || !touchStartRef.current) return;

        const deltaX = Math.abs(touch.clientX - touchStartRef.current.x);
        const deltaY = Math.abs(touch.clientY - touchStartRef.current.y);
        const deltaTime = Date.now() - touchStartRef.current.time;

        // Only process as tap if movement is small (< 10px) and quick (< 300ms)
        if (deltaX < 10 && deltaY < 10 && deltaTime < 300) {
          e.preventDefault();
          processClick(touch.clientX, touch.clientY);
        }

        touchStartRef.current = null;
      };

      // Store handlers in refs for cleanup
      touchStartHandlerRef.current = handleTouchStart;
      touchEndHandlerRef.current = handleTouchEnd;

      // Add native event listeners with { passive: false } for iOS Safari
      canvas.addEventListener("touchstart", handleTouchStart, {
        passive: true,
      });
      canvas.addEventListener("touchend", handleTouchEnd, { passive: false });

      return () => {
        // Use the stored refs for cleanup to ensure we remove the correct handlers
        if (touchStartHandlerRef.current) {
          canvas.removeEventListener(
            "touchstart",
            touchStartHandlerRef.current,
          );
          touchStartHandlerRef.current = null;
        }
        if (touchEndHandlerRef.current) {
          canvas.removeEventListener("touchend", touchEndHandlerRef.current);
          touchEndHandlerRef.current = null;
        }
        touchStartRef.current = null;
      };
    }, [processClick, isMaskReady]);

    // Load images
    useEffect(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d", { willReadFrequently: true });
      if (!ctx) return;

      // Reset all refs and state when loading new image
      // This is critical for lesson switching without refresh
      setIsMaskReady(false);
      maskImageDataRef.current = null;
      originalImageDataRef.current = null;
      historyRef.current = [];
      historyIndexRef.current = -1;
      setCanUndo(false);
      setCanRedo(false);

      const img = new window.Image();
      img.crossOrigin = "Anonymous";
      img.src = mainImage;
      img.onload = () => {
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);

        // Debug info for device/canvas diagnostics
        setDebugInfo({
          device: navigator.userAgent,
          canvasSize: `${canvas.width} x ${canvas.height}`,
          pixelRatio: window.devicePixelRatio,
          screenSize: `${screen.width} x ${screen.height}`,
        });

        originalImageDataRef.current = ctx.getImageData(
          0,
          0,
          canvas.width,
          canvas.height,
        );

        // Check for saved progress
        const savedDataUrl = localStorage.getItem(
          `coloring_progress_${mainImage}`,
        );

        if (savedDataUrl) {
          const savedImg = new window.Image();
          savedImg.src = savedDataUrl;
          savedImg.onload = () => {
            ctx.drawImage(savedImg, 0, 0);
            const currentData = ctx.getImageData(
              0,
              0,
              canvas.width,
              canvas.height,
            );
            historyRef.current = [currentData];
            historyIndexRef.current = 0;
            setCanUndo(false);
            setCanRedo(false);
          };
        } else {
          // Save initial state to history
          historyRef.current = [originalImageDataRef.current];
          historyIndexRef.current = 0;
          setCanUndo(false);
          setCanRedo(false);
        }

        setImageLoaded(true);

        const maskImg = new window.Image();
        maskImg.crossOrigin = "Anonymous";
        maskImg.src = maskImage;
        maskImg.onload = () => {
          const maskCanvas = document.createElement("canvas");
          maskCanvas.width = img.width;
          maskCanvas.height = img.height;
          const maskCtx = maskCanvas.getContext("2d");
          if (!maskCtx) return;

          // Disable smoothing to preserve exact colors when scaling mask
          maskCtx.imageSmoothingEnabled = false;

          maskCtx.drawImage(maskImg, 0, 0, img.width, img.height);
          maskImageDataRef.current = maskCtx.getImageData(
            0,
            0,
            img.width,
            img.height,
          );
          setIsMaskReady(true);
        };
      };
    }, [mainImage, maskImage, setImageLoaded]);

    return (
      <div className="relative overflow-hidden rounded-3xl">
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
          className="relative w-full h-auto cursor-crosshair touch-action-manipulation"
          style={{
            mixBlendMode: "multiply",
            touchAction: "manipulation",
            WebkitTouchCallout: "none",
            WebkitUserSelect: "none",
            WebkitTapHighlightColor: "transparent",
          }}
        />
        {/* Debug info overlay */}
        {debugInfo && (
          <div className="absolute top-2 left-2 bg-black/70 text-white text-xs p-2 rounded max-w-[300px] wrap-break-word z-50">
            <p>
              <strong>Device:</strong> {debugInfo.device}
            </p>
            <p>
              <strong>Canvas:</strong> {debugInfo.canvasSize}
            </p>
            <p>
              <strong>Pixel Ratio:</strong> {debugInfo.pixelRatio}
            </p>
            <p>
              <strong>Screen:</strong> {debugInfo.screenSize}
            </p>
          </div>
        )}
      </div>
    );
  },
);

ColoringCanvas.displayName = "ColoringCanvas";

export default ColoringCanvas;
