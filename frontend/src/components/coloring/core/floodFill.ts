import { isBlackPixel, hexToRgb } from "./colorUtils";

export interface FloodFillOptions {
  canvas: HTMLCanvasElement;
  maskData: ImageData;
  startX: number;
  startY: number;
  fillColor: string;
  maxPixels?: number;
}

/**
 * Performs flood fill on canvas using mask-based boundary detection
 * Returns true if any pixels were filled
 */
export function floodFill({
  canvas,
  maskData,
  startX,
  startY,
  fillColor,
  maxPixels = 500000,
}: FloodFillOptions): boolean {
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) return false;

  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const pixels = imageData.data;

  const startPos = (startY * canvas.width + startX) * 4;
  const startR = pixels[startPos];
  const startG = pixels[startPos + 1];
  const startB = pixels[startPos + 2];

  const { r: fillR, g: fillG, b: fillB } = hexToRgb(fillColor);

  // Don't fill if already the same color
  if (startR === fillR && startG === fillG && startB === fillB) return false;

  // Don't fill transparent pixels (gaps in SVG outlines)
  const startA = pixels[startPos + 3];
  if (startA < 128) return false;

  // Don't fill black pixels (SVG outlines)
  if (isBlackPixel(startR, startG, startB, startA)) return false;

  // Get mask color at start position for boundary detection
  const startMaskR = maskData.data[startPos];
  const startMaskG = maskData.data[startPos + 1];
  const startMaskB = maskData.data[startPos + 2];

  const stack: Array<[number, number]> = [[startX, startY]];
  const visited = new Set<string>();

  const matchColor = (pos: number): boolean => {
    const r = pixels[pos];
    const g = pixels[pos + 1];
    const b = pixels[pos + 2];
    const a = pixels[pos + 3];

    // Transparent pixels are boundaries (gaps in SVG outlines)
    if (a < 128) return false;

    // Black pixels are boundaries
    if (isBlackPixel(r, g, b, a)) return false;

    // Use mask color for boundary detection (exact match required)
    const maskR = maskData.data[pos];
    const maskG = maskData.data[pos + 1];
    const maskB = maskData.data[pos + 2];
    const maskA = maskData.data[pos + 3];

    // Transparent mask pixels are boundaries
    if (maskA < 128) return false;

    return (
      maskR === startMaskR && maskG === startMaskG && maskB === startMaskB
    );
  };

  const colorPixel = (pos: number): void => {
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
    if (x < 0 || x >= canvas.width || y < 0 || y >= canvas.height) continue;

    const pos = (y * canvas.width + x) * 4;
    if (!matchColor(pos)) continue;

    visited.add(key);
    colorPixel(pos);
    stack.push([x + 1, y], [x - 1, y], [x, y + 1], [x, y - 1]);

    if (visited.size > maxPixels) break;
  }

  ctx.putImageData(imageData, 0, 0);
  return visited.size > 0;
}
