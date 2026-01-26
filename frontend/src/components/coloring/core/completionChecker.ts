import { hexToRgb, rgbToHex, colorsMatch, createColorSet } from "./colorUtils";
import type { CompletionResult } from "./types";

export interface CheckCompletionOptions {
  canvas: HTMLCanvasElement;
  maskData: ImageData;
  palette: string[];
  fillThreshold?: number;
  colorTolerance?: number;
}

/**
 * Checks if all required color regions are properly filled
 */
export function checkCompletion({
  canvas,
  maskData,
  palette,
  fillThreshold = 0.8,
  colorTolerance = 30,
}: CheckCompletionOptions): CompletionResult {
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) {
    return { isComplete: false, missingColors: [] };
  }

  const canvasData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const canvasPixels = canvasData.data;
  const maskPixels = maskData.data;

  const allowedColorsSet = createColorSet(palette);

  // Find required colors from mask (excluding white)
  const requiredColors = new Set<string>();
  const colorPixels = new Map<string, Set<number>>();

  for (let i = 0; i < maskPixels.length; i += 4) {
    const r = maskPixels[i];
    const g = maskPixels[i + 1];
    const b = maskPixels[i + 2];
    const maskColor = rgbToHex(r, g, b);

    // Skip white (background)
    if (allowedColorsSet.has(maskColor) && maskColor !== "#ffffff") {
      requiredColors.add(maskColor);
      if (!colorPixels.has(maskColor)) {
        colorPixels.set(maskColor, new Set());
      }
      colorPixels.get(maskColor)?.add(i);
    }
  }

  // Check if each required color area is filled
  const missingColors: string[] = [];

  requiredColors.forEach((requiredColor) => {
    const pixels = colorPixels.get(requiredColor);
    if (!pixels) return;

    const { r: reqR, g: reqG, b: reqB } = hexToRgb(requiredColor);

    let filledCount = 0;
    let totalCount = 0;

    pixels.forEach((pos) => {
      totalCount++;
      const canvasR = canvasPixels[pos];
      const canvasG = canvasPixels[pos + 1];
      const canvasB = canvasPixels[pos + 2];

      if (
        colorsMatch(canvasR, canvasG, canvasB, reqR, reqG, reqB, colorTolerance)
      ) {
        filledCount++;
      }
    });

    const fillPercentage = totalCount > 0 ? filledCount / totalCount : 0;
    if (fillPercentage < fillThreshold) {
      missingColors.push(requiredColor);
    }
  });

  return {
    isComplete: missingColors.length === 0,
    missingColors,
  };
}
