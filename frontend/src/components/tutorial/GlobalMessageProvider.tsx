"use client";

import { createContext, useContext, useState, useCallback } from "react";
import MessageTooltip from "./MessageTooltip";
import { CharacterColor } from "./types";

interface GlobalMessageContextType {
  showMessage: (message: string, type?: "success" | "error" | "info") => void;
}

const GlobalMessageContext = createContext<
  GlobalMessageContextType | undefined
>(undefined);

export function GlobalMessageProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [message, setMessage] = useState<string | null>(null);
  const [character, setCharacter] = useState<CharacterColor>("yellow");

  const showMessage = useCallback(
    (msg: string, type: "success" | "error" | "info" = "info") => {
      const characterMap: Record<string, CharacterColor> = {
        success: "yellow",
        error: "blue",
        info: "white",
      };
      setCharacter(characterMap[type]);
      setMessage(msg);
    },
    []
  );

  return (
    <GlobalMessageContext.Provider value={{ showMessage }}>
      {children}
      <MessageTooltip
        message={message || ""}
        character={character}
        characterPosition="right"
        isVisible={!!message}
        onClose={() => setMessage(null)}
        autoCloseDelay={5000}
      />
    </GlobalMessageContext.Provider>
  );
}

export function useGlobalMessage() {
  const context = useContext(GlobalMessageContext);
  if (!context) {
    throw new Error(
      "useGlobalMessage must be used within GlobalMessageProvider"
    );
  }
  return context;
}
