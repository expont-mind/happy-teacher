"use client";

import Image from "next/image";
import { useEffect, useRef, useState, useCallback } from "react";
import { Toaster, toast } from "react-hot-toast";

export default function ColoringApp() {
  const canvasRef = useRef(null);
  const originalImageDataRef = useRef(null);
  const maskImageDataRef = useRef(null);
  const toastQueue = useRef([]);

  const [selectedColor, setSelectedColor] = useState("#6b3ab5");
  const [imageLoaded, setImageLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const colors = [
    "#6b3ab5",
    "#1066b4",
    "#3396c7",
    "#1a9742",
    "#fdf3dc",
    "#ffd200",
    "#ff7900",
    "#ee3030",
    "#603130",
    "#95928d",
  ];

  // ✅ Toast хязгаарлагч функц
  const showLimitedToast = useCallback((message, options = {}) => {
    if (toastQueue.current.length >= 3) {
      const firstId = toastQueue.current.shift();
      toast.dismiss(firstId);
    }
    const id = toast(message, {
      duration: 2000,
      ...options,
    });
    toastQueue.current.push(id);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) return;

    setIsLoading(true);

    // 🎨 1. Main SVG ачаалах
    const img = new window.Image();
    img.src = "/page_11.svg";

    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);
      originalImageDataRef.current = ctx.getImageData(
        0,
        0,
        canvas.width,
        canvas.height
      );
      setImageLoaded(true);
      setIsLoading(false);

      // 2. Mask ачаалах
      const maskImg = new window.Image();
      maskImg.src = "/page_12_mask.png";

      maskImg.onload = () => {
        const maskCanvas = document.createElement("canvas");
        maskCanvas.width = img.width;
        maskCanvas.height = img.height;
        const maskCtx = maskCanvas.getContext("2d");
        maskCtx.drawImage(maskImg, 0, 0, img.width, img.height);
        maskImageDataRef.current = maskCtx.getImageData(
          0,
          0,
          img.width,
          img.height
        );
      };

      maskImg.onerror = () => console.error("❌ Mask ачаалж чадсангүй!");
    };

    img.onerror = () => {
      console.error("❌ SVG ачаалж чадсангүй!");
      setIsLoading(false);
    };
  }, []);

  // 🪣 Flood fill
  const floodFill = useCallback((startX, startY, fillColor) => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const pixels = imageData.data;

    const startPos = (startY * canvas.width + startX) * 4;
    const startR = pixels[startPos];
    const startG = pixels[startPos + 1];
    const startB = pixels[startPos + 2];

    const fillR = parseInt(fillColor.slice(1, 3), 16);
    const fillG = parseInt(fillColor.slice(3, 5), 16);
    const fillB = parseInt(fillColor.slice(5, 7), 16);

    if (startR === fillR && startG === fillG && startB === fillB) return;

    const tolerance = 30;
    const isBlack = (r, g, b) => r < 50 && g < 50 && b < 50;
    if (isBlack(startR, startG, startB)) return;

    const stack = [[startX, startY]];
    const visited = new Set();

    const matchColor = (pos) => {
      const r = pixels[pos];
      const g = pixels[pos + 1];
      const b = pixels[pos + 2];
      if (isBlack(r, g, b)) return false;
      return (
        Math.abs(r - startR) <= tolerance &&
        Math.abs(g - startG) <= tolerance &&
        Math.abs(b - startB) <= tolerance
      );
    };

    const colorPixel = (pos) => {
      pixels[pos] = fillR;
      pixels[pos + 1] = fillG;
      pixels[pos + 2] = fillB;
      pixels[pos + 3] = 255;
    };

    while (stack.length) {
      const [x, y] = stack.pop();
      const key = `${x},${y}`;
      if (visited.has(key)) continue;
      if (x < 0 || x >= canvas.width || y < 0 || y >= canvas.height) continue;

      const pos = (y * canvas.width + x) * 4;
      if (!matchColor(pos)) continue;

      visited.add(key);
      colorPixel(pos);
      stack.push([x + 1, y], [x - 1, y], [x, y + 1], [x, y - 1]);
      if (visited.size > 500000) break;
    }

    ctx.putImageData(imageData, 0, 0);
  }, []);

  // 🖱️ Canvas click event
  const handleClick = useCallback(
    (e) => {
      if (!imageLoaded) return;

      const canvas = canvasRef.current;
      const rect = canvas.getBoundingClientRect();
      const x = Math.floor(
        ((e.clientX - rect.left) / rect.width) * canvas.width
      );
      const y = Math.floor(
        ((e.clientY - rect.top) / rect.height) * canvas.height
      );

      const maskData = maskImageDataRef.current;
      if (!maskData) return;

      const pos = (y * maskData.width + x) * 4;
      const r = maskData.data[pos];
      const g = maskData.data[pos + 1];
      const b = maskData.data[pos + 2];

      const toHex = (r, g, b) =>
        "#" +
        [r, g, b]
          .map((x) => x.toString(16).padStart(2, "0"))
          .join("")
          .toLowerCase();

      const maskColor = toHex(r, g, b);

      const allowedColors = [
        "#6b3ab5",
        "#1066b4",
        "#3396c7",
        "#1a9742",
        "#fdf3dc",
        "#ffd200",
        "#ff7900",
        "#ee3030",
        "#603130",
        "#95928d",
        "#ffffff",
      ];

      // 🎯 Logic
      if (!allowedColors.includes(maskColor)) {
        floodFill(x, y, selectedColor);
        return;
      }

      if (maskColor === "#ffffff") {
        showLimitedToast("Будаж болохгүй хэсэг байна 😊", {
          icon: "🖌️",
          style: {
            background: "#fff8dc",
            color: "#444",
            borderRadius: "10px",
            fontWeight: "600",
          },
        });
        return;
      }

      if (maskColor !== selectedColor.toLowerCase()) {
        showLimitedToast("Энэ хэсэгт өөр өнгө сонгоорой 🌈", {
          icon: "✨",
          style: {
            background: "#fef3c7",
            color: "#92400e",
            borderRadius: "10px",
            fontWeight: "600",
          },
        });
        return;
      }

      floodFill(x, y, selectedColor);
    },
    [imageLoaded, selectedColor, floodFill, showLimitedToast]
  );

  const resetCanvas = () => {
    const ctx = canvasRef.current.getContext("2d");
    ctx.putImageData(originalImageDataRef.current, 0, 0);
    showLimitedToast("Бүх зүйл дахин цэвэрлэгдлээ 🎨", {
      icon: "🔄",
      style: {
        background: "#e0f2fe",
        color: "#075985",
        borderRadius: "10px",
        fontWeight: "600",
      },
    });
  };

  const downloadImage = () => {
    const link = document.createElement("a");
    link.download = "coloring_result.png";
    link.href = canvasRef.current.toDataURL("image/png");
    link.click();
    showLimitedToast("Зураг хадгалагдлаа 💾", {
      icon: "💚",
      style: {
        background: "#dcfce7",
        color: "#166534",
        borderRadius: "10px",
        fontWeight: "600",
      },
    });
  };

  return (
    <div className="h-screen bg-white p-6 flex flex-col lg:flex-row gap-6">
      <Toaster position="top-center" />
      <div className="relative flex-1 rounded-xl overflow-hidden">
        <Image
          src="/page_12_background.png"
          alt="background"
          fill
          priority
          className="object-cover object-top"
        />
        <canvas
          ref={canvasRef}
          onClick={handleClick}
          className="relative w-full h-auto cursor-crosshair"
          style={{ mixBlendMode: "multiply" }}
        />
      </div>

      <div className="lg:w-72 bg-gradient-to-br from-purple-100 to-blue-100 rounded-xl p-4">
        <h2 className="text-xl font-bold text-center mb-3 text-purple-800">
          🎨 Өнгө Сонго
        </h2>
        <div className="grid grid-cols-4 gap-2 mb-4">
          {colors.map((c) => (
            <button
              key={c}
              onClick={() => setSelectedColor(c)}
              className={`w-full aspect-square rounded-lg transition-transform ${
                selectedColor === c ? "ring-4 ring-yellow-400 scale-110" : ""
              }`}
              style={{ backgroundColor: c }}
            />
          ))}
        </div>

        <div className="mb-4 bg-white p-3 rounded-lg border border-gray-200">
          <p className="text-sm font-semibold mb-2 text-gray-600">
            Сонгосон өнгө:
          </p>
          <div
            className="w-full h-10 rounded border"
            style={{ backgroundColor: selectedColor }}
          />
        </div>

        <button
          onClick={resetCanvas}
          disabled={!imageLoaded}
          className="w-full bg-red-500 hover:bg-red-600 text-white py-3 mb-2 rounded-lg font-bold"
        >
          🔄 Дахин Эхлэх
        </button>
        <button
          onClick={downloadImage}
          disabled={!imageLoaded}
          className="w-full bg-green-500 hover:bg-green-600 text-white py-3 rounded-lg font-bold"
        >
          💾 Хадгалах
        </button>
      </div>
    </div>
  );
}
