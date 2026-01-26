"use client";

import { memo, useCallback } from "react";
import { FractionLabel } from "@/src/components/ui/Fraction";

interface ColorPaletteProps {
  colors: { color: string; label?: string }[];
  selectedColor: string;
  setSelectedColor: (c: string) => void;
  isEraserMode?: boolean;
}

// Memoized to prevent re-renders when parent state changes (rerender-memo)
const ColorPalette = memo(function ColorPalette({
  colors,
  selectedColor,
  setSelectedColor,
  isEraserMode,
}: ColorPaletteProps) {
  // Memoized check function to avoid recreation
  const isSelected = useCallback(
    (color: string) => selectedColor === color && !isEraserMode,
    [selectedColor, isEraserMode]
  );

  return (
    <div className="sticky top-6 self-start" data-tutorial="color-palette">
      <div className="bg-white rounded-2xl border-2 border-gray-200 shadow-xl p-4">
        {/* Header */}
        <h3 className="text-gray-700 font-bold text-center mb-4">Өнгө</h3>

        {/* Color buttons - wrap in grid */}
        <div className="grid grid-cols-2 gap-2">
          {colors.map(({ color, label }, index) => (
            <button
              key={`${color}-${index}`}
              onClick={() => setSelectedColor(color)}
              className="flex flex-col items-center gap-1 group cursor-pointer"
            >
              {/* Color button */}
              <div
                className={`w-12 h-12 rounded-xl shadow-md border-2 transition-all duration-200 ${
                  isSelected(color)
                    ? "ring-4 ring-purple-400 scale-110 border-transparent"
                    : "border-black/10 hover:scale-105"
                }`}
                style={{ backgroundColor: color }}
              />

              {/* Fraction label below */}
              {label && (
                <FractionLabel
                  label={label}
                  className={`text-xs font-semibold ${
                    isSelected(color) ? "text-purple-600" : "text-gray-600"
                  }`}
                />
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
});

export default ColorPalette;
