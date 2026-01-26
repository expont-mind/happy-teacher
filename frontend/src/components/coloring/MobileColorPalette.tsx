"use client";

import { memo, useCallback } from "react";
import { BottomSheet } from "@/src/components/ui/BottomSheet";

interface MobileColorPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  colors: { color: string }[];
  selectedColor: string;
  onSelectColor: (color: string) => void;
}

// Memoized to prevent re-renders when parent state changes (rerender-memo)
export const MobileColorPalette = memo(function MobileColorPalette({
  isOpen,
  onClose,
  colors,
  selectedColor,
  onSelectColor,
}: MobileColorPaletteProps) {
  // Memoized handler to avoid recreation
  const handleSelectColor = useCallback(
    (color: string) => {
      onSelectColor(color);
      onClose();
    },
    [onSelectColor, onClose]
  );

  return (
    <BottomSheet isOpen={isOpen} onClose={onClose} title="Өнгө сонгох">
      <div className="grid grid-cols-4 gap-3">
        {colors.map(({ color }) => (
          <button
            key={color}
            onClick={() => handleSelectColor(color)}
            className={`w-12 h-12 rounded-xl transition-all cursor-pointer ${
              selectedColor === color
                ? "ring-4 ring-offset-2 ring-gray-400 scale-110"
                : "hover:scale-105"
            }`}
            style={{ backgroundColor: color }}
            aria-label={`Select color ${color}`}
          />
        ))}
      </div>
    </BottomSheet>
  );
});
