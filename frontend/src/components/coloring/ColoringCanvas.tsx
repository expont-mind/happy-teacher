"use client";
import {
  useEffect,
  useRef,
  useCallback,
  useImperativeHandle,
  forwardRef,
  useState,
  useMemo,
} from "react";
import Image from "next/image";
import {
  isBlackPixel,
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
  loadSavedProgress,
} from "./core";
import type { TouchPosition, CompletionResult } from "./core";
import { useAuth } from "@/src/components/auth/AuthProvider";
import {
  saveColoringProgress,
  loadColoringProgress,
  deleteColoringProgress,
} from "@/src/utils/coloringProgressStorage";

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
  checkCompletion: () => CompletionResult;
  getMistakeCount: () => number;
  undo: () => void;
  redo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  resetCanvas: () => Promise<void>;
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
    const mistakeCountRef = useRef<number>(0);
    const touchStartRef = useRef<TouchPosition | null>(null);
    const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const pendingDataUrlRef = useRef<string | null>(null);
    const isResettingRef = useRef<boolean>(false);

    const [canUndo, setCanUndo] = useState(false);
    const [canRedo, setCanRedo] = useState(false);
    const [isMaskReady, setIsMaskReady] = useState(false);

    const { activeProfile } = useAuth();

    const profileInfo = useMemo(
      () =>
        activeProfile
          ? {
              id: activeProfile.id,
              type: activeProfile.type,
              parentId: activeProfile.parentId,
            }
          : null,
      [activeProfile],
    );

    // Flush any pending save immediately
    const flushSave = useCallback(() => {
      if (isResettingRef.current) return;
      if (saveTimeoutRef.current !== null) {
        clearTimeout(saveTimeoutRef.current);
        saveTimeoutRef.current = null;
      }
      const dataUrl = pendingDataUrlRef.current;
      if (dataUrl) {
        pendingDataUrlRef.current = null;
        saveColoringProgress(profileInfo, mainImage, dataUrl);
      }
    }, [profileInfo, mainImage]);

    // Debounced save to Supabase (1s trailing)
    const debouncedSave = useCallback(
      (dataUrl: string) => {
        if (isResettingRef.current) return;
        pendingDataUrlRef.current = dataUrl;
        if (saveTimeoutRef.current !== null)
          clearTimeout(saveTimeoutRef.current);
        saveTimeoutRef.current = setTimeout(() => {
          if (isResettingRef.current) return;
          pendingDataUrlRef.current = null;
          saveColoringProgress(profileInfo, mainImage, dataUrl);
          saveTimeoutRef.current = null;
        }, 500);
      },
      [profileInfo, mainImage],
    );

    // Flush pending save on page unload, tab switch, or component unmount
    useEffect(() => {
      const handleBeforeUnload = () => flushSave();
      const handleVisibilityChange = () => {
        if (document.visibilityState === "hidden") flushSave();
      };

      window.addEventListener("beforeunload", handleBeforeUnload);
      document.addEventListener("visibilitychange", handleVisibilityChange);

      return () => {
        window.removeEventListener("beforeunload", handleBeforeUnload);
        document.removeEventListener(
          "visibilitychange",
          handleVisibilityChange,
        );
        flushSave();
      };
    }, [flushSave]);

    // Show message via callback
    const showMessage = useCallback(
      (message: string) => {
        onShowMessage?.(message);
      },
      [onShowMessage],
    );

    // Check completion status using core module
    const handleCheckCompletion = useCallback((): CompletionResult => {
      const canvas = canvasRef.current;
      const maskData = maskImageDataRef.current;
      if (!canvas || !maskData) {
        return { isComplete: false, missingColors: [] };
      }
      return checkCompletion({ canvas, maskData, palette });
    }, [palette]);

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
        onSave: debouncedSave,
      };
    }, [debouncedSave]);

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

    const handleResetCanvas = useCallback(async () => {
      // Set resetting flag to true to block any pending saves or new saves
      isResettingRef.current = true;

      // Cancel any pending debounced save
      if (saveTimeoutRef.current !== null) {
        clearTimeout(saveTimeoutRef.current);
        saveTimeoutRef.current = null;
      }
      pendingDataUrlRef.current = null;

      const ctx = canvasRef.current?.getContext("2d");
      if (!ctx || !originalImageDataRef.current) {
        isResettingRef.current = false;
        return;
      }

      ctx.putImageData(originalImageDataRef.current, 0, 0);
      resetHistory(
        historyRef,
        historyIndexRef,
        originalImageDataRef.current,
        setCanUndo,
        setCanRedo,
      );
      mistakeCountRef.current = 0;
      wrongClickCountRef.current = 0;

      try {
        const blankDataUrl = canvasRef.current?.toDataURL("image/png");
        if (blankDataUrl) {
          await saveColoringProgress(profileInfo, mainImage, blankDataUrl);
        }
      } finally {
        // Only allow saving again after overwrite is done
        setTimeout(() => {
          isResettingRef.current = false;
        }, 500);
      }
    }, [profileInfo, mainImage]);

    const handleDownloadCanvas = useCallback(() => {
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
        checkCompletion: handleCheckCompletion,
        getMistakeCount: () => mistakeCountRef.current,
        undo: handleUndo,
        redo: handleRedo,
        canUndo,
        canRedo,
        resetCanvas: handleResetCanvas,
        downloadCanvas: handleDownloadCanvas,
      }),
      [
        handleCheckCompletion,
        handleUndo,
        handleRedo,
        canUndo,
        canRedo,
        handleResetCanvas,
        handleDownloadCanvas,
      ],
    );

    // Process click/touch at coordinates
    const processClick = useCallback(
      (clientX: number, clientY: number) => {
        const canvas = canvasRef.current;
        const maskData = maskImageDataRef.current;
        if (!canvas || !maskData) return;

        const coords = clientToCanvasCoords(clientX, clientY, canvas);
        if (!coords) return;
        const { x, y } = coords;

        const pos = (y * maskData.width + x) * 4;
        if (pos < 0 || pos + 2 >= maskData.data.length) return;

        const r = maskData.data[pos];
        const g = maskData.data[pos + 1];
        const b = maskData.data[pos + 2];
        if (r === undefined || g === undefined || b === undefined) return;

        const maskColor = rgbToHex(r, g, b);
        const allowedColorsSet = createColorSet(palette);

        // If mask color is not in palette, just fill without checking
        if (!allowedColorsSet.has(maskColor)) {
          const fillColor = isEraserMode ? "#ffffff" : selectedColor;
          if (
            floodFill({ canvas, maskData, startX: x, startY: y, fillColor })
          ) {
            handleSaveToHistory();
          }
          return;
        }

        // White can be painted with any color
        if (maskColor === "#ffffff") {
          const fillColor = isEraserMode ? "#ffffff" : selectedColor;
          if (
            floodFill({ canvas, maskData, startX: x, startY: y, fillColor })
          ) {
            handleSaveToHistory();
          }
          return;
        }

        // If eraser mode, allow erasing
        if (isEraserMode) {
          if (
            floodFill({
              canvas,
              maskData,
              startX: x,
              startY: y,
              fillColor: "#ffffff",
            })
          ) {
            handleSaveToHistory();
          }
          return;
        }

        // Check if selected color matches
        if (maskColor !== selectedColor.toLowerCase()) {
          mistakeCountRef.current += 1;
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
        onSuccessfulFill?.();

        const fillColor = isEraserMode ? "#ffffff" : selectedColor;
        if (floodFill({ canvas, maskData, startX: x, startY: y, fillColor })) {
          handleSaveToHistory();
        }
      },
      [
        selectedColor,
        isEraserMode,
        palette,
        onShowRelax,
        showMessage,
        onSuccessfulFill,
        handleSaveToHistory,
      ],
    );

    // Mouse click handler
    const handleClick = useCallback(
      (e: React.MouseEvent<HTMLCanvasElement>) => {
        processClick(e.clientX, e.clientY);
      },
      [processClick],
    );

    // Touch event handlers for iOS Safari compatibility
    useEffect(() => {
      const canvas = canvasRef.current;
      if (!canvas || !isMaskReady) return;

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
          e.preventDefault();
          processClick(touch.clientX, touch.clientY);
        }
        touchStartRef.current = null;
      };

      canvas.addEventListener("touchstart", handleTouchStart, {
        passive: true,
      });
      canvas.addEventListener("touchend", handleTouchEnd, { passive: false });

      return () => {
        canvas.removeEventListener("touchstart", handleTouchStart);
        canvas.removeEventListener("touchend", handleTouchEnd);
        touchStartRef.current = null;
      };
    }, [processClick, isMaskReady]);

    // Load images using core modules
    useEffect(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      // Reset all refs and state when loading new image
      setIsMaskReady(false);
      maskImageDataRef.current = null;
      originalImageDataRef.current = null;
      historyRef.current = [];
      historyIndexRef.current = -1;
      setCanUndo(false);
      setCanRedo(false);

      loadMainImage(canvas, mainImage)
        .then(async ({ originalImageData }) => {
          originalImageDataRef.current = originalImageData;

          // Check for saved progress from Supabase
          const savedDataUrl = await loadColoringProgress(
            profileInfo,
            mainImage,
          );
          const savedProgress = await loadSavedProgress(canvas, savedDataUrl);
          if (savedProgress) {
            historyRef.current = [savedProgress];
            historyIndexRef.current = 0;
          } else {
            historyRef.current = [originalImageData];
            historyIndexRef.current = 0;
          }
          setCanUndo(false);
          setCanRedo(false);
          setImageLoaded(true);

          // Load mask
          const { maskImageData } = await loadMaskImage(
            maskImage,
            canvas.width,
            canvas.height,
          );
          maskImageDataRef.current = maskImageData;
          setIsMaskReady(true);
        })
        .catch((error) => {
          console.error("Error loading images:", error);
        });
    }, [mainImage, maskImage, setImageLoaded, profileInfo]);

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
      </div>
    );
  },
);

ColoringCanvas.displayName = "ColoringCanvas";

export default ColoringCanvas;
