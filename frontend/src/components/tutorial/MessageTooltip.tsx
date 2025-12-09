"use client";

import { useEffect } from "react";
import Image from "next/image";
import { CharacterColor, CharacterPosition } from "./types";

interface MessageTooltipProps {
  message: string;
  character?: CharacterColor;
  characterPosition?: CharacterPosition;
  isVisible: boolean;
  onClose: () => void;
  autoCloseDelay?: number;
}

export default function MessageTooltip({
  message,
  character = "yellow",
  characterPosition = "left",
  isVisible,
  onClose,
  autoCloseDelay = 5000,
}: MessageTooltipProps) {
  useEffect(() => {
    if (!isVisible || !autoCloseDelay) return;

    const timer = setTimeout(() => {
      onClose();
    }, autoCloseDelay);

    return () => clearTimeout(timer);
  }, [isVisible, autoCloseDelay, onClose]);

  if (!isVisible) return null;

  const characterSrc = `/character/${character}-${characterPosition}.png`;
  const characterSize =
    typeof window !== "undefined" && window.innerWidth < 768 ? 100 : 140;

  return (
    <div className="fixed top-8 right-8 z-50 flex items-start gap-4 tutorial-enter">
      {/* Speech Bubble */}
      <div
        className="bg-white border-2 border-gray-200 rounded-2xl shadow-lg p-5 relative"
        style={{
          maxWidth:
            typeof window !== "undefined" && window.innerWidth < 768
              ? "260px"
              : "320px",
        }}
      >
        {/* Pointer Triangle - points to right */}
        <div
          className="absolute w-0 h-0 top-6"
          style={{
            right: "-8px",
            borderTop: "8px solid transparent",
            borderBottom: "8px solid transparent",
            borderLeft: "8px solid white",
          }}
        />

        {/* Message */}
        <p className="text-base font-semibold text-gray-900 leading-relaxed mb-4 whitespace-pre-line">
          {message}
        </p>

        {/* Dismiss Button */}
        <div className="flex justify-end">
          <button
            onClick={onClose}
            className="duo-button duo-button-green text-sm px-4 py-2"
            autoFocus
          >
            Ойлголоо
          </button>
        </div>
      </div>

      {/* Character on right */}
      <div
        className="animate-float flex-shrink-0"
        style={{
          width: `${characterSize}px`,
          height: `${characterSize}px`,
        }}
      >
        <Image
          src={characterSrc}
          alt="Character"
          width={characterSize}
          height={characterSize}
          className="object-contain"
          priority
        />
      </div>
    </div>
  );
}
