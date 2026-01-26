import type { RGB } from "./types";

/**
 * Check if a pixel is black (SVG outline)
 * Detects dark grayscale pixels including anti-aliased edges
 */
export function isBlackPixel(r: number, g: number, b: number): boolean {
  const brightness = (r + g + b) / 3;
  const maxDiff = Math.max(Math.abs(r - g), Math.abs(g - b), Math.abs(r - b));
  // Pixel is black if it's dark AND roughly grayscale (not a colored pixel)
  return brightness < 70 && maxDiff < 30;
}

/**
 * Convert hex color string to RGB values
 */
export function hexToRgb(hex: string): RGB {
  return {
    r: parseInt(hex.slice(1, 3), 16),
    g: parseInt(hex.slice(3, 5), 16),
    b: parseInt(hex.slice(5, 7), 16),
  };
}

/**
 * Convert RGB values to lowercase hex color string
 */
export function rgbToHex(r: number, g: number, b: number): string {
  return `#${[r, g, b]
    .map((x) => x.toString(16).padStart(2, "0"))
    .join("")}`.toLowerCase();
}

/**
 * Check if two colors match within a tolerance
 */
export function colorsMatch(
  r1: number,
  g1: number,
  b1: number,
  r2: number,
  g2: number,
  b2: number,
  tolerance: number = 30
): boolean {
  return (
    Math.abs(r1 - r2) <= tolerance &&
    Math.abs(g1 - g2) <= tolerance &&
    Math.abs(b1 - b2) <= tolerance
  );
}

/**
 * Create a Set of allowed colors from palette for O(1) lookups
 */
export function createColorSet(palette: string[]): Set<string> {
  return new Set([
    ...palette.map((color) => color.toLowerCase()),
    "#ffffff", // White is always allowed (for eraser)
  ]);
}
