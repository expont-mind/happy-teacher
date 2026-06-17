import { hexToRgb, rgbToHex, createColorSet } from "./colorUtils";
import type { CompletionResult } from "./types";

export interface CheckCompletionOptions {
  canvas: HTMLCanvasElement;
  maskData: ImageData;
  palette: string[];
  fillThreshold?: number;
}

/**
 * Checks if all required color regions are properly filled
 */
export function checkCompletion({
  canvas,
  maskData,
  palette,
  fillThreshold = 0.8,
}: CheckCompletionOptions): CompletionResult {
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) {
    return { isComplete: false, missingColors: [] };
  }

  const canvasData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const canvasPixels = canvasData.data;
  const maskPixels = maskData.data;

  const allowedColorsSet = createColorSet(palette);

  // Canonical colors = palette + white + black. A painted canvas pixel counts
  // toward a required color only when its NEAREST canonical color is exactly
  // that color. This mirrors the flood-fill matcher and is stricter than a
  // fixed RGB tolerance: a region painted with a *different* palette color
  // (even a near-identical one) no longer satisfies its neighbour's
  // requirement, and unpainted white / black-outline pixels resolve to
  // white / black instead of being mistaken for an answer color.
  const canonical: Array<{ hex: string; r: number; g: number; b: number }> = [
    ...palette.map((hex) => {
      const { r, g, b } = hexToRgb(hex);
      return { hex: hex.toLowerCase(), r, g, b };
    }),
    { hex: "#ffffff", r: 255, g: 255, b: 255 },
    { hex: "#000000", r: 0, g: 0, b: 0 },
  ];
  const nearestCache = new Map<number, string>();
  const nearestCanonical = (r: number, g: number, b: number): string => {
    const key = (r << 16) | (g << 8) | b;
    const cached = nearestCache.get(key);
    if (cached !== undefined) return cached;
    let bestHex = canonical[0]?.hex ?? "#ffffff";
    let bestDist = Infinity;
    for (const c of canonical) {
      const dr = c.r - r;
      const dg = c.g - g;
      const db = c.b - b;
      const dist = dr * dr + dg * dg + db * db;
      if (dist < bestDist) {
        bestDist = dist;
        bestHex = c.hex;
      }
    }
    nearestCache.set(key, bestHex);
    return bestHex;
  };

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

    let filledCount = 0;
    let totalCount = 0;

    pixels.forEach((pos) => {
      totalCount++;
      if (
        nearestCanonical(
          canvasPixels[pos],
          canvasPixels[pos + 1],
          canvasPixels[pos + 2],
        ) === requiredColor
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
