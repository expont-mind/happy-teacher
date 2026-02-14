"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { usePathname } from "next/navigation";
import { Volume2, VolumeOff } from "lucide-react";

const LESSON_PATTERN = /^\/topic\/[^/]+\/[^/]+$/;

export const BackgroundMusic = () => {
  const pathname = usePathname();
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [muted, setMuted] = useState(true);
  const [hasInteracted, setHasInteracted] = useState(false);

  const isLessonPage = LESSON_PATTERN.test(pathname);

  // Initialize audio once
  useEffect(() => {
    const audio = new Audio("/background-music.mp3");
    audio.loop = true;
    audio.volume = 0.3;
    audioRef.current = audio;

    return () => {
      audio.pause();
      audio.src = "";
    };
  }, []);

  // Handle play/pause based on route and mute state
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !hasInteracted) return;

    if (isLessonPage || muted) {
      audio.pause();
    } else {
      audio.play().catch(() => {});
    }
  }, [isLessonPage, muted, hasInteracted]);

  const toggle = useCallback(() => {
    if (!hasInteracted) setHasInteracted(true);
    setMuted((prev) => !prev);
  }, [hasInteracted]);

  if (isLessonPage) return null;

  return (
    <button
      onClick={toggle}
      className="fixed bottom-24 md:bottom-6 right-4 z-50 w-10 h-10 rounded-full bg-white/90 backdrop-blur-sm shadow-lg border border-gray-200 flex items-center justify-center text-gray-600 hover:text-[#58CC02] hover:border-[#58CC02] transition-all cursor-pointer"
      aria-label={muted ? "Хөгжим тоглуулах" : "Хөгжим зогсоох"}
    >
      {muted ? <VolumeOff size={18} /> : <Volume2 size={18} />}
    </button>
  );
};
