"use client";

import Image from "next/image";
import { toast } from "sonner";
import { ShoppingCart } from "lucide-react";

type CharacterColor = "yellow" | "green" | "blue" | "red" | "white";

interface CharacterToastProps {
  message: string;
  character?: CharacterColor;
  showPurchaseButton?: boolean;
  onPurchase?: () => void;
  toastId?: string | number;
}

// Map colors to available character images
const characterMap: Record<CharacterColor, string> = {
  yellow: "yellow",
  green: "yellow",  // green байхгүй учир yellow ашиглана
  blue: "blue",
  red: "blue",      // red байхгүй учир blue ашиглана
  white: "white",
};

function CharacterToastContent({
  message,
  character = "yellow",
  showPurchaseButton = false,
  onPurchase,
  toastId,
}: CharacterToastProps) {
  const mappedCharacter = characterMap[character] || "yellow";
  const characterSrc = `/character/${mappedCharacter}-left.png`;

  return (
    <div className="flex items-start gap-2 md:gap-3">
      {/* Character */}
      <div className="w-10 h-10 md:w-14 md:h-14 shrink-0 -ml-1 md:-ml-2 -mt-1">
        <Image
          src={characterSrc}
          alt="Character"
          width={56}
          height={56}
          className="object-contain w-10 h-10 md:w-14 md:h-14"
        />
      </div>
      {/* Content */}
      <div className="flex-1 pt-1">
        <p className="text-xs md:text-sm font-semibold text-gray-800 leading-snug">{message}</p>
        {showPurchaseButton && onPurchase && (
          <button
            onClick={() => {
              toast.dismiss(toastId);
              onPurchase();
            }}
            className="duo-button duo-button-green text-xs px-2.5 py-1 md:px-3 md:py-1.5 mt-1.5 md:mt-2 flex items-center gap-1 md:gap-1.5"
          >
            <ShoppingCart size={14} />
            Худалдаж авах
          </button>
        )}
      </div>
    </div>
  );
}

export function showCharacterToast(message: string, character: CharacterColor = "yellow") {
  toast.custom(
    () => (
      <div className="bg-white border-2 border-amber-200 rounded-2xl shadow-lg px-3 py-2.5 min-w-[260px] max-w-[calc(100vw-32px)] md:px-4 md:py-3 md:min-w-[300px]">
        <CharacterToastContent message={message} character={character} />
      </div>
    ),
    {
      duration: 4000,
      position: "top-center",
    }
  );
}

export function showCharacterToastWithPurchase(
  message: string,
  onPurchase: () => void,
  character: CharacterColor = "yellow"
) {
  const toastId = toast.custom(
    (id) => (
      <div className="bg-white border-2 border-amber-200 rounded-2xl shadow-lg px-3 py-2.5 min-w-[260px] max-w-[calc(100vw-32px)] md:px-4 md:py-3 md:min-w-[300px]">
        <CharacterToastContent
          message={message}
          character={character}
          showPurchaseButton={true}
          onPurchase={onPurchase}
          toastId={id}
        />
      </div>
    ),
    {
      duration: 6000,
      position: "top-center",
    }
  );
  return toastId;
}

// Convenience functions for different toast types
export function showSuccessToast(message: string) {
  showCharacterToast(message, "yellow");
}

export function showErrorToast(message: string) {
  showCharacterToast(message, "blue");
}

export function showInfoToast(message: string) {
  showCharacterToast(message, "white");
}

// Custom character toast for Marvel/custom characters (top-right position)
interface CustomCharacterToastContentProps {
  message: string;
  character: string; // e.g., "iron-man", "hulk", "thor"
}

function CustomCharacterToastContent({
  message,
  character,
}: CustomCharacterToastContentProps) {
  const characterSrc = `/character/${character}.png`;

  return (
    <div className="flex items-start gap-3">
      {/* Character */}
      <div className="w-14 h-14 md:w-16 md:h-16 shrink-0 animate-float">
        <Image
          src={characterSrc}
          alt="Character"
          width={64}
          height={64}
          className="object-contain w-full h-full"
        />
      </div>
      {/* Content */}
      <div className="flex-1 pt-1">
        <p className="text-sm md:text-base font-semibold text-gray-800 leading-snug whitespace-pre-line">
          {message}
        </p>
      </div>
    </div>
  );
}

export function showCustomCharacterToast(message: string, character: string) {
  // Dismiss any existing toasts first to prevent overlap
  toast.dismiss();

  toast.custom(
    () => (
      <div className="bg-white border-2 border-purple-300 rounded-2xl shadow-xl px-4 py-3 min-w-[280px] max-w-[360px]">
        <CustomCharacterToastContent message={message} character={character} />
      </div>
    ),
    {
      duration: 5000,
      position: "top-right",
    }
  );
}

// Error toast for wrong color selection (same positioning as Marvel toast)
export function showErrorToastTopRight(message: string, character: CharacterColor = "yellow") {
  // Dismiss any existing toasts first to prevent overlap
  toast.dismiss();

  toast.custom(
    () => (
      <div className="bg-white border-2 border-red-200 rounded-2xl shadow-lg px-3 py-2.5 min-w-[260px] max-w-[calc(100vw-32px)] md:px-4 md:py-3 md:min-w-[300px]">
        <CharacterToastContent message={message} character={character} />
      </div>
    ),
    {
      duration: 4000,
      position: "top-right",
    }
  );
}

export default CharacterToastContent;
