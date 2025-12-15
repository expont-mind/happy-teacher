"use client";

import { useEffect, useState } from "react";
import { Smartphone } from "lucide-react";

export function useIsPortraitMobile() {
  const [isPortrait, setIsPortrait] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkOrientation = () => {
      const portrait = window.matchMedia("(orientation: portrait)").matches;
      const mobile = window.matchMedia("(max-width: 1024px)").matches;
      setIsPortrait(portrait);
      setIsMobile(mobile);
    };

    checkOrientation();

    window.addEventListener("resize", checkOrientation);
    window.addEventListener("orientationchange", checkOrientation);

    return () => {
      window.removeEventListener("resize", checkOrientation);
      window.removeEventListener("orientationchange", checkOrientation);
    };
  }, []);

  return isPortrait && isMobile;
}

export function RotateDevicePrompt() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center p-8 bg-white">
      <div className="flex items-center gap-4 mb-8">
        {/* Phone vertical */}
        <div className="relative">
          <Smartphone size={64} className="text-gray-400" />
        </div>

        {/* Arrow */}
        <svg
          width="40"
          height="24"
          viewBox="0 0 40 24"
          fill="none"
          className="text-green-500"
        >
          <path
            d="M2 12H38M38 12L28 2M38 12L28 22"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>

        {/* Phone horizontal */}
        <div className="relative rotate-90">
          <Smartphone size={64} className="text-green-500" />
        </div>
      </div>

      <h2 className="text-xl font-bold text-gray-800 text-center mb-2">
        Утсаа хөндлөн байрлуулна уу
      </h2>
      <p className="text-gray-500 text-center">
        Зургийг илүү сайн харахын тулд утсаа эргүүлнэ үү
      </p>
    </div>
  );
}
