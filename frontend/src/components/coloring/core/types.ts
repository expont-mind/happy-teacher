/**
 * Shared types for coloring canvas components
 */

export interface CanvasRefs {
  canvas: HTMLCanvasElement | null;
  maskData: ImageData | null;
  originalData: ImageData | null;
}

export interface HistoryState {
  history: ImageData[];
  currentIndex: number;
}

export interface CompletionResult {
  isComplete: boolean;
  missingColors: string[];
}

export interface TouchPosition {
  x: number;
  y: number;
  time: number;
}

export interface RGB {
  r: number;
  g: number;
  b: number;
}
