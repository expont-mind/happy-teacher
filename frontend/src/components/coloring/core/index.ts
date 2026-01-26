// Types
export type {
  CanvasRefs,
  HistoryState,
  CompletionResult,
  TouchPosition,
  RGB,
} from "./types";

// Color utilities
export {
  isBlackPixel,
  hexToRgb,
  rgbToHex,
  colorsMatch,
  createColorSet,
} from "./colorUtils";

// Flood fill
export { floodFill } from "./floodFill";
export type { FloodFillOptions } from "./floodFill";

// Completion checking
export { checkCompletion } from "./completionChecker";
export type { CheckCompletionOptions } from "./completionChecker";

// History management
export {
  saveToHistory,
  undo,
  redo,
  resetHistory,
} from "./historyManager";
export type { HistoryManagerOptions } from "./historyManager";

// Touch handling
export { setupTouchHandlers, clientToCanvasCoords } from "./touchHandler";
export type { TouchHandlerOptions } from "./touchHandler";

// Image loading
export {
  loadMainImage,
  loadMaskImage,
  loadSavedProgress,
} from "./imageLoader";
export type { ImageLoadResult, MaskLoadResult } from "./imageLoader";
