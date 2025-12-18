"use client";

import Image from "next/image";

interface IntroToastProps {
  message: string;
  isVisible: boolean;
  onClose: () => void;
  character?: string; // e.g., "blue-left", "iron-man", "hulk", "thor"
}

export default function IntroToast({
  message,
  isVisible,
  onClose,
  character = "blue-left",
}: IntroToastProps) {
  // Build character image path
  const characterSrc = `/character/${character}.png`;
  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center p-4">
      {/* Blurred background overlay */}
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" />

      {/* Content */}
      <div className="relative flex items-start gap-3 md:gap-4">
        {/* Speech Bubble */}
        <div className="bg-white border-2 border-gray-200 rounded-2xl shadow-xl p-5 md:p-6 max-w-[340px] md:max-w-[450px]">
          {/* Message */}
          <p className="text-sm md:text-base font-semibold text-gray-900 leading-relaxed mb-3 md:mb-4 whitespace-pre-line">
            {message}
          </p>

          {/* Dismiss Button */}
          <div className="flex justify-end">
            <button
              onClick={onClose}
              className="duo-button duo-button-green text-sm px-4 py-2"
              autoFocus
            >
              Эхлэх
            </button>
          </div>
        </div>

        {/* Character - smaller on mobile */}
        <div className="animate-float shrink-0 w-[70px] h-[70px] md:w-[140px] md:h-[140px]">
          <Image
            src={characterSrc}
            alt="Character"
            width={140}
            height={140}
            className="object-contain w-full h-full"
            priority
          />
        </div>
      </div>
    </div>
  );
}
