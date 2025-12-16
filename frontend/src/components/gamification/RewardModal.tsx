import { X, Zap } from "lucide-react";

interface RewardModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNextLesson?: () => void;
  xpEarned: number;
}

export const RewardModal = ({
  isOpen,
  onClose,
  onNextLesson,
  xpEarned,
}: RewardModalProps) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl p-8 max-w-md w-full text-center relative animate-in zoom-in-95 duration-300 shadow-xl">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 cursor-pointer"
        >
          <X size={24} />
        </button>

        {/* Sun Icon */}
        <div className="mb-4 flex justify-center">
          <svg
            width="64"
            height="64"
            viewBox="0 0 64 64"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <circle cx="32" cy="32" r="16" fill="#FFD200" />
            <g stroke="#FFD200" strokeWidth="3" strokeLinecap="round">
              <line x1="32" y1="4" x2="32" y2="12" />
              <line x1="32" y1="52" x2="32" y2="60" />
              <line x1="4" y1="32" x2="12" y2="32" />
              <line x1="52" y1="32" x2="60" y2="32" />
              <line x1="12.2" y1="12.2" x2="17.9" y2="17.9" />
              <line x1="46.1" y1="46.1" x2="51.8" y2="51.8" />
              <line x1="12.2" y1="51.8" x2="17.9" y2="46.1" />
              <line x1="46.1" y1="17.9" x2="51.8" y2="12.2" />
            </g>
          </svg>
        </div>

        <h2 className="text-2xl font-bold text-yellow-500 mb-2">Гайхалтай!</h2>

        <p className="text-gray-500 mb-4">Та бутархайг зөв өнгөлөө!</p>

        <div className="flex items-center justify-center gap-1 text-xl font-bold text-green-500 mb-6">
          +{xpEarned} XP
          <Zap size={20} className="text-green-500" fill="currentColor" />
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={onNextLesson || onClose}
            className="duo-button duo-button-green flex-1 py-3 px-4 text-white font-bold"
          >
            Дараагийн даалгавар
          </button>
          <button
            onClick={onClose}
            className="duo-button duo-button-gray flex-1 py-3 px-4 text-gray-700 font-bold"
          >
            Буцах
          </button>
        </div>
      </div>
    </div>
  );
};
