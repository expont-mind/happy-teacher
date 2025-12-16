"use client";

import { useEffect, useState, useCallback } from "react";
import { useTutorial } from "./TutorialProvider";
import CharacterTooltip from "./CharacterTooltip";

export default function TutorialOverlay() {
  const { isActive, currentStep, config, nextStep, skipTutorial } =
    useTutorial();
  const [targetElement, setTargetElement] = useState<HTMLElement | null>(null);
  const [highlightRect, setHighlightRect] = useState<DOMRect | null>(null);

  const updateTargetElement = useCallback(() => {
    if (!isActive || !config) return;

    const step = config.steps[currentStep];
    const element = document.querySelector(step.targetSelector) as HTMLElement;

    if (element) {
      setTargetElement(element);
      setHighlightRect(element.getBoundingClientRect());

      // Scroll target into view
      element.scrollIntoView({
        behavior: "smooth",
        block: "center",
        inline: "center",
      });
    } else {
      // If element not found (e.g., user not logged in), skip to next step
      const timer = setTimeout(() => {
        if (currentStep < config.steps.length - 1) {
          nextStep();
        } else {
          skipTutorial();
        }
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [isActive, currentStep, config, nextStep, skipTutorial]);

  useEffect(() => {
    updateTargetElement();

    // Update position on scroll and resize
    const handleUpdate = () => {
      if (targetElement) {
        setHighlightRect(targetElement.getBoundingClientRect());
      }
    };

    window.addEventListener("scroll", handleUpdate);
    window.addEventListener("resize", handleUpdate);

    return () => {
      window.removeEventListener("scroll", handleUpdate);
      window.removeEventListener("resize", handleUpdate);
    };
  }, [updateTargetElement, targetElement]);

  // Keyboard navigation
  useEffect(() => {
    if (!isActive) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        skipTutorial();
      } else if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        nextStep();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isActive, nextStep, skipTutorial]);

  if (!isActive || !config || !targetElement || !highlightRect) return null;

  const currentStepData = config.steps[currentStep];
  const showHighlight = currentStepData.highlightTarget !== false;

  return (
    <>
      {/* Backdrop with spotlight effect */}

      {/* Highlighted Element Spotlight - cuts through the backdrop */}
      {showHighlight && (
        <div
          className="fixed z-9999 pointer-events-none transition-all duration-300"
          style={{
            top: `${highlightRect.top - 4}px`,
            left: `${highlightRect.left - 4}px`,
            width: `${highlightRect.width + 8}px`,
            height: `${highlightRect.height + 8}px`,
            boxShadow: "0 0 0 9999px rgba(0, 0, 0, 0.6)",
            borderRadius: "var(--radius-xl)",
          }}
        />
      )}

      {/* Character Tooltip */}
      <CharacterTooltip
        step={currentStepData}
        targetElement={targetElement}
        onNext={nextStep}
        onSkip={skipTutorial}
        showSkip={currentStep === 0}
      />
    </>
  );
}
