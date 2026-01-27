const MAX_HISTORY_SIZE = 50;

export interface HistoryManagerOptions {
  canvas: HTMLCanvasElement;
  historyRef: React.MutableRefObject<ImageData[]>;
  historyIndexRef: React.MutableRefObject<number>;
  setCanUndo: (canUndo: boolean) => void;
  setCanRedo: (canRedo: boolean) => void;
  onSave?: (dataUrl: string) => void;
}

/**
 * Saves current canvas state to history
 */
export function saveToHistory({
  canvas,
  historyRef,
  historyIndexRef,
  setCanUndo,
  setCanRedo,
  onSave,
}: HistoryManagerOptions): void {
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
  if (historyRef.current.length > MAX_HISTORY_SIZE) {
    historyRef.current.shift();
    historyIndexRef.current--;
  }

  // Update button states
  setCanUndo(historyIndexRef.current > 0);
  setCanRedo(historyIndexRef.current < historyRef.current.length - 1);

  // Save progress via callback
  if (onSave) {
    try {
      const dataUrl = canvas.toDataURL();
      onSave(dataUrl);
    } catch (e) {
      console.error("Error saving progress:", e);
    }
  }
}

/**
 * Undo last action
 */
export function undo({
  canvas,
  historyRef,
  historyIndexRef,
  setCanUndo,
  setCanRedo,
  onSave,
}: HistoryManagerOptions): boolean {
  if (historyIndexRef.current <= 0) return false;

  const ctx = canvas.getContext("2d");
  if (!ctx) return false;

  historyIndexRef.current--;
  const imageData = historyRef.current[historyIndexRef.current];
  ctx.putImageData(imageData, 0, 0);

  setCanUndo(historyIndexRef.current > 0);
  setCanRedo(historyIndexRef.current < historyRef.current.length - 1);

  // Save progress via callback
  if (onSave) {
    try {
      const dataUrl = canvas.toDataURL();
      onSave(dataUrl);
    } catch (e) {
      console.error("Error saving progress:", e);
    }
  }

  return true;
}

/**
 * Redo last undone action
 */
export function redo({
  canvas,
  historyRef,
  historyIndexRef,
  setCanUndo,
  setCanRedo,
  onSave,
}: HistoryManagerOptions): boolean {
  if (historyIndexRef.current >= historyRef.current.length - 1) return false;

  const ctx = canvas.getContext("2d");
  if (!ctx) return false;

  historyIndexRef.current++;
  const imageData = historyRef.current[historyIndexRef.current];
  ctx.putImageData(imageData, 0, 0);

  setCanUndo(historyIndexRef.current > 0);
  setCanRedo(historyIndexRef.current < historyRef.current.length - 1);

  // Save progress via callback
  if (onSave) {
    try {
      const dataUrl = canvas.toDataURL();
      onSave(dataUrl);
    } catch (e) {
      console.error("Error saving progress:", e);
    }
  }

  return true;
}

/**
 * Reset history to initial state
 */
export function resetHistory(
  historyRef: React.MutableRefObject<ImageData[]>,
  historyIndexRef: React.MutableRefObject<number>,
  initialData: ImageData,
  setCanUndo: (canUndo: boolean) => void,
  setCanRedo: (canRedo: boolean) => void,
): void {
  historyRef.current = [initialData];
  historyIndexRef.current = 0;
  setCanUndo(false);
  setCanRedo(false);
}
