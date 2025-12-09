"use client";

import { useEffect, useState, useRef } from "react";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { TutorialStep } from "./types";

interface CharacterTooltipProps {
  step: TutorialStep;
  targetElement: HTMLElement;
  onNext: () => void;
  onSkip: () => void;
  showSkip: boolean;
}

export default function CharacterTooltip({
  step,
  targetElement,
  onNext,
  onSkip,
  showSkip,
}: CharacterTooltipProps) {
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const [pointerStyle, setPointerStyle] = useState({});
  const tooltipRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const calculatePosition = () => {
      if (!targetElement || !tooltipRef.current) return;

      const targetRect = targetElement.getBoundingClientRect();
      const tooltipRect = tooltipRef.current.getBoundingClientRect();
      const characterWidth = window.innerWidth < 768 ? 120 : 160;
      const gap = 20;

      let top = 0;
      let left = 0;
      let pointerClass = {};

      switch (step.tooltipPosition) {
        case "bottom":
          top = targetRect.bottom + gap;
          left = targetRect.left + targetRect.width / 2 - tooltipRect.width / 2;
          pointerClass = {
            top: "-8px",
            left: "50%",
            transform: "translateX(-50%)",
            borderLeft: "8px solid transparent",
            borderRight: "8px solid transparent",
            borderBottom: "8px solid white",
          };
          break;
        case "top":
          // Position below the element to avoid overlap
          top = targetRect.bottom + gap;
          left = targetRect.left + targetRect.width / 2 - tooltipRect.width / 2;
          pointerClass = {
            top: "-8px",
            left: "50%",
            transform: "translateX(-50%)",
            borderLeft: "8px solid transparent",
            borderRight: "8px solid transparent",
            borderBottom: "8px solid white",
          };
          break;
        case "left":
          top = targetRect.top + targetRect.height / 2 - tooltipRect.height / 2;
          left = targetRect.left - tooltipRect.width - gap - characterWidth;
          pointerClass = {
            right: "-8px",
            top: "50%",
            transform: "translateY(-50%)",
            borderTop: "8px solid transparent",
            borderBottom: "8px solid transparent",
            borderLeft: "8px solid white",
          };
          break;
        case "right":
          top = targetRect.top + targetRect.height / 2 - tooltipRect.height / 2;
          left = targetRect.right + gap + characterWidth;
          pointerClass = {
            left: "-8px",
            top: "50%",
            transform: "translateY(-50%)",
            borderTop: "8px solid transparent",
            borderBottom: "8px solid transparent",
            borderRight: "8px solid white",
          };
          break;
      }

      // Ensure tooltip stays within viewport
      const padding = 16;
      if (left < padding) left = padding;
      if (left + tooltipRect.width > window.innerWidth - padding) {
        left = window.innerWidth - tooltipRect.width - padding;
      }
      if (top < padding) top = padding;
      if (top + tooltipRect.height > window.innerHeight - padding) {
        top = window.innerHeight - tooltipRect.height - padding;
      }

      setPosition({ top, left });
      setPointerStyle(pointerClass);
    };

    calculatePosition();

    // Update position on scroll and resize (follow the target element)
    window.addEventListener("resize", calculatePosition);
    window.addEventListener("scroll", calculatePosition);

    return () => {
      window.removeEventListener("resize", calculatePosition);
      window.removeEventListener("scroll", calculatePosition);
    };
  }, [step, targetElement]);

  const characterSrc = `/character/${step.character}-${step.characterPosition}.png`;
  const characterSize = typeof window !== "undefined" && window.innerWidth < 768 ? 120 : 160;

  const characterLeft =
    step.characterPosition === "left"
      ? position.left - characterSize - 16
      : position.left + (tooltipRef.current?.offsetWidth || 0) + 16;

  const characterTop = position.top + (tooltipRef.current?.offsetHeight || 0) / 2 - characterSize / 2;

  return (
    <>
      {/* Character Image */}
      <div
        className="fixed z-61 animate-float"
        style={{
          top: `${characterTop}px`,
          left: `${characterLeft}px`,
          width: `${characterSize}px`,
          height: `${characterSize}px`,
        }}
      >
        <Image
          src={characterSrc}
          alt="Tutorial character"
          width={characterSize}
          height={characterSize}
          className="object-contain"
          priority
        />
      </div>

      {/* Speech Bubble */}
      <div
        ref={tooltipRef}
        className="fixed z-61 bg-white border-2 border-gray-200 rounded-2xl shadow-lg p-6 tutorial-enter"
        style={{
          top: `${position.top}px`,
          left: `${position.left}px`,
          maxWidth: typeof window !== "undefined" && window.innerWidth < 768 ? "280px" : "400px",
        }}
        role="dialog"
        aria-label="Tutorial step"
      >
        {/* Pointer Triangle */}
        <div
          className="absolute w-0 h-0"
          style={pointerStyle}
        />

        {/* Content */}
        <p className="text-base font-semibold text-gray-900 leading-relaxed mb-4">
          {step.title}
        </p>

        {/* Buttons */}
        <div className="flex gap-3 justify-end">
          {showSkip && (
            <button
              onClick={onSkip}
              className="duo-button duo-button-gray text-sm px-4 py-2"
            >
              Алгасах
            </button>
          )}
          <button
            onClick={onNext}
            className="duo-button duo-button-green text-sm px-4 py-2 flex items-center gap-2"
            autoFocus
          >
            <span>Дараах</span>
            <ArrowRight size={16} />
          </button>
        </div>
      </div>
    </>
  );
}
