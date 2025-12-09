import { Trophy } from "lucide-react";

interface XPProgressBarProps {
  xp: number;
  level: number;
}

export const XPProgressBar = ({ xp, level }: XPProgressBarProps) => {
  // Level up every 100 XP
  // Current level progress = xp % 100
  const progress = xp % 100;

  return (
    <div className="w-full max-w-xs">
      <div className="flex justify-between items-center mb-1">
        <div className="flex items-center gap-2">
          <div className="bg-yellow-100 p-1 rounded-lg">
            <Trophy size={16} className="text-yellow-600" />
          </div>
          <span className="font-bold text-gray-700 text-sm">Level {level}</span>
        </div>
        <span className="text-xs font-bold text-gray-500">
          {progress}/100 XP
        </span>
      </div>
      <div className="h-3 bg-gray-100 rounded-full overflow-hidden border border-gray-200">
        <div
          className="h-full bg-yellow-400 rounded-full transition-all duration-500 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
};
