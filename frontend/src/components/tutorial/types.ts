export type CharacterColor = "yellow" | "white" | "blue";
export type CharacterPosition = "left" | "right";
export type TooltipPosition = "top" | "bottom" | "left" | "right";

export interface TutorialStep {
  id: string;
  targetSelector: string;
  title: string;
  character: CharacterColor;
  characterPosition: CharacterPosition;
  tooltipPosition: TooltipPosition;
  highlightTarget?: boolean;
}

export interface TutorialConfig {
  pageKey: string;
  steps: TutorialStep[];
  completionKey: string;
}

export interface TutorialContextType {
  isActive: boolean;
  currentStep: number;
  config: TutorialConfig | null;
  nextStep: () => void;
  skipTutorial: () => void;
  completeTutorial: () => void;
  startTutorial: (config: TutorialConfig) => void;
}
