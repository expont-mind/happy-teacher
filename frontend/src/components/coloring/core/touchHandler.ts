import type { TouchPosition } from "./types";

export interface TouchHandlerOptions {
  canvas: HTMLCanvasElement;
  maskDataRef: React.MutableRefObject<ImageData | null>;
  touchStartRef: React.MutableRefObject<TouchPosition | null>;
  processClick: (clientX: number, clientY: number) => void;
  tapThreshold?: number;
  timeThreshold?: number;
}

/**
 * Creates touch event handlers for iOS Safari compatibility
 * Returns cleanup function
 */
export function setupTouchHandlers({
  canvas,
  maskDataRef,
  touchStartRef,
  processClick,
  tapThreshold = 10,
  timeThreshold = 300,
}: TouchHandlerOptions): () => void {
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
    if (!maskDataRef.current) return;

    const touch = e.changedTouches[0];
    if (!touch || !touchStartRef.current) return;

    const deltaX = Math.abs(touch.clientX - touchStartRef.current.x);
    const deltaY = Math.abs(touch.clientY - touchStartRef.current.y);
    const deltaTime = Date.now() - touchStartRef.current.time;

    // Only process as tap if movement is small and quick
    if (deltaX < tapThreshold && deltaY < tapThreshold && deltaTime < timeThreshold) {
      if (e.cancelable) e.preventDefault();
      processClick(touch.clientX, touch.clientY);
    }

    touchStartRef.current = null;
  };

  // Add native event listeners with { passive: true/false }
  canvas.addEventListener("touchstart", handleTouchStart, { passive: true });
  canvas.addEventListener("touchend", handleTouchEnd, { passive: false });

  // Return cleanup function
  return () => {
    canvas.removeEventListener("touchstart", handleTouchStart);
    canvas.removeEventListener("touchend", handleTouchEnd);
    touchStartRef.current = null;
  };
}

/**
 * Calculate canvas coordinates from client coordinates
 */
export function clientToCanvasCoords(
  clientX: number,
  clientY: number,
  canvas: HTMLCanvasElement
): { x: number; y: number } | null {
  const rect = canvas.getBoundingClientRect();
  const x = Math.floor(((clientX - rect.left) / rect.width) * canvas.width);
  const y = Math.floor(((clientY - rect.top) / rect.height) * canvas.height);

  // Bounds check
  if (x < 0 || x >= canvas.width || y < 0 || y >= canvas.height) {
    return null;
  }

  return { x, y };
}
