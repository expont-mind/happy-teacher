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
    <div className="flex items-start gap-3">
      {/* Character */}
      <div className="w-14 h-14 shrink-0 -ml-2 -mt-1">
        <Image
          src={characterSrc}
          alt="Character"
          width={56}
          height={56}
          className="object-contain"
        />
      </div>
      {/* Content */}
      <div className="flex-1 pt-1">
        <p className="text-sm font-semibold text-gray-800 leading-snug">{message}</p>
        {showPurchaseButton && onPurchase && (
          <button
            onClick={() => {
              toast.dismiss(toastId);
              onPurchase();
            }}
            className="duo-button duo-button-green text-xs px-3 py-1.5 mt-2 flex items-center gap-1.5"
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
      <div className="bg-white border-2 border-amber-200 rounded-2xl shadow-lg px-4 py-3 min-w-[300px]">
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
      <div className="bg-white border-2 border-amber-200 rounded-2xl shadow-lg px-4 py-3 min-w-[300px]">
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

export default CharacterToastContent;
