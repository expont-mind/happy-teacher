"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { CharacterColor } from "./types";

interface RelaxModalProps {
  isVisible: boolean;
  onClose: () => void;
  character?: CharacterColor;
}

export default function RelaxModal({
  isVisible,
  onClose,
  character = "yellow",
}: RelaxModalProps) {
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    if (!isVisible) {
      setCountdown(5);
      return;
    }

    if (countdown <= 0) {
      onClose();
      return;
    }

    const timer = setTimeout(() => {
      setCountdown((prev) => prev - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [isVisible, countdown, onClose]);

  if (!isVisible) return null;

  const characterSrc = `/character/${character}-left.png`;
  const characterSize =
    typeof window !== "undefined" && window.innerWidth < 768 ? 120 : 180;

  return (
    <div
      className="fixed inset-0 z-100 flex items-center justify-center"
      style={{
        backgroundColor: "rgba(0, 0, 0, 0.7)",
        backdropFilter: "blur(4px)",
      }}
    >
      <div className="flex items-center gap-6 tutorial-enter">
        {/* Character */}
        <div
          className="animate-float shrink-0"
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

        {/* Speech Bubble */}
        <div
          className="bg-white border-2 border-gray-200 rounded-2xl shadow-2xl p-6 relative"
          style={{
            maxWidth:
              typeof window !== "undefined" && window.innerWidth < 768
                ? "260px"
                : "320px",
          }}
        >
          {/* Pointer Triangle */}
          <div
            className="absolute w-0 h-0"
            style={{
              left: "-12px",
              top: "50%",
              transform: "translateY(-50%)",
              borderTop: "12px solid transparent",
              borderBottom: "12px solid transparent",
              borderRight: "12px solid white",
            }}
          />

          {/* Message */}
          <p className="text-lg font-bold text-gray-900 leading-relaxed mb-4 text-center">
            Хэсэгхэн амрая!
          </p>
          <p className="text-base text-gray-600 leading-relaxed mb-4 text-center">
            Сайтар бодоод өнгөө сонгоорой.
          </p>

          {/* Countdown */}
          <div className="flex justify-center">
            <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center">
              <span className="text-2xl font-bold text-gray-700">
                {countdown}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
