import { X, Trophy } from "lucide-react";

interface RewardModalProps {
  isOpen: boolean;
  onClose: () => void;
  xpEarned: number;
  bonus?: string;
  type: "lesson" | "streak" | "level_up";
}

export const RewardModal = ({
  isOpen,
  onClose,
  xpEarned,
  bonus,
  type,
}: RewardModalProps) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl p-8 max-w-sm w-full text-center relative animate-in zoom-in-95 duration-300 shadow-xl border-4 border-yellow-100">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
        >
          <X size={24} />
        </button>

        <div className="mb-6 flex justify-center">
          <div className="relative">
            <div className="absolute inset-0 bg-yellow-200 rounded-full blur-xl opacity-50 animate-pulse"></div>
            <Trophy
              size={80}
              className="text-yellow-500 relative z-10 animate-bounce"
              fill="currentColor"
            />
          </div>
        </div>

        <h2 className="text-3xl font-black text-gray-800 mb-2">
          {type === "level_up" ? "Level Up!" : "Great Job!"}
        </h2>

        <div className="text-5xl font-black text-yellow-500 mb-4 drop-shadow-sm">
          +{xpEarned} XP
        </div>

        {bonus && (
          <div className="inline-block bg-purple-100 text-purple-700 px-4 py-1 rounded-full font-bold text-sm mb-6 animate-pulse">
            {bonus}
          </div>
        )}

        <button
          onClick={onClose}
          className="w-full py-3 rounded-xl bg-green-500 hover:bg-green-600 text-white font-bold text-lg shadow-b-4 transition-transform active:scale-95 cursor-pointer"
        >
          Continue
        </button>
      </div>
    </div>
  );
};
