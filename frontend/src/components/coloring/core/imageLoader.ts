export interface ImageLoadResult {
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  originalImageData: ImageData;
}

export interface MaskLoadResult {
  maskImageData: ImageData;
}

/**
 * Loads main image into canvas
 */
export function loadMainImage(
  canvas: HTMLCanvasElement,
  imageSrc: string
): Promise<ImageLoadResult> {
  return new Promise((resolve, reject) => {
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) {
      reject(new Error("Could not get canvas context"));
      return;
    }

    const img = new window.Image();
    img.crossOrigin = "Anonymous";
    img.src = imageSrc;

    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);

      const originalImageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

      resolve({
        canvas,
        ctx,
        originalImageData,
      });
    };

    img.onerror = () => {
      reject(new Error(`Failed to load image: ${imageSrc}`));
    };
  });
}

/**
 * Loads mask image and extracts image data
 */
export function loadMaskImage(
  maskSrc: string,
  width: number,
  height: number
): Promise<MaskLoadResult> {
  return new Promise((resolve, reject) => {
    const maskImg = new window.Image();
    maskImg.crossOrigin = "Anonymous";
    maskImg.src = maskSrc;

    maskImg.onload = () => {
      const maskCanvas = document.createElement("canvas");
      maskCanvas.width = width;
      maskCanvas.height = height;
      const maskCtx = maskCanvas.getContext("2d");

      if (!maskCtx) {
        reject(new Error("Could not get mask canvas context"));
        return;
      }

      // Disable smoothing to preserve exact colors when scaling mask
      maskCtx.imageSmoothingEnabled = false;
      maskCtx.drawImage(maskImg, 0, 0, width, height);

      const maskImageData = maskCtx.getImageData(0, 0, width, height);

      resolve({ maskImageData });
    };

    maskImg.onerror = () => {
      reject(new Error(`Failed to load mask image: ${maskSrc}`));
    };
  });
}

/**
 * Loads saved progress from a data URL
 */
export function loadSavedProgress(
  canvas: HTMLCanvasElement,
  savedDataUrl: string | null
): Promise<ImageData | null> {
  return new Promise((resolve) => {
    if (!savedDataUrl) {
      resolve(null);
      return;
    }

    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) {
      resolve(null);
      return;
    }

    const savedImg = new window.Image();
    savedImg.src = savedDataUrl;

    savedImg.onload = () => {
      ctx.drawImage(savedImg, 0, 0);
      const currentData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      resolve(currentData);
    };

    savedImg.onerror = () => {
      resolve(null);
    };
  });
}
