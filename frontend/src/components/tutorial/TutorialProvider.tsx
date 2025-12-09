"use client";

import { createContext, useContext, useState, useCallback, ReactNode } from "react";
import { TutorialConfig, TutorialContextType } from "./types";

const TutorialContext = createContext<TutorialContextType | undefined>(
  undefined
);

export function TutorialProvider({ children }: { children: ReactNode }) {
  const [isActive, setIsActive] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [config, setConfig] = useState<TutorialConfig | null>(null);

  const startTutorial = useCallback((tutorialConfig: TutorialConfig) => {
    // Check if already completed
    if (typeof window !== "undefined") {
      const completed = localStorage.getItem(tutorialConfig.completionKey);
      if (completed === "true") return;
    }

    setConfig(tutorialConfig);
    setCurrentStep(0);
    setIsActive(true);
  }, []);

  const nextStep = useCallback(() => {
    if (!config) return;

    if (currentStep < config.steps.length - 1) {
      setCurrentStep((prev) => prev + 1);
    } else {
      completeTutorial();
    }
  }, [config, currentStep]);

  const skipTutorial = useCallback(() => {
    if (!config) return;
    if (typeof window !== "undefined") {
      localStorage.setItem(config.completionKey, "true");
    }
    setIsActive(false);
    setConfig(null);
    setCurrentStep(0);
  }, [config]);

  const completeTutorial = useCallback(() => {
    if (!config) return;
    if (typeof window !== "undefined") {
      localStorage.setItem(config.completionKey, "true");
    }
    setIsActive(false);
    setConfig(null);
    setCurrentStep(0);
  }, [config]);

  return (
    <TutorialContext.Provider
      value={{
        isActive,
        currentStep,
        config,
        nextStep,
        skipTutorial,
        completeTutorial,
        startTutorial,
      }}
    >
      {children}
    </TutorialContext.Provider>
  );
}

export function useTutorial() {
  const context = useContext(TutorialContext);
  if (context === undefined) {
    throw new Error("useTutorial must be used within a TutorialProvider");
  }
  return context;
}
