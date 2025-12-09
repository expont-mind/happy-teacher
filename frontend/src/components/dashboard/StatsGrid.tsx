import { BookOpen, Calendar } from "lucide-react";

interface StatsGridProps {
  totalLessons: number;
  lastActiveAt: string | null;
}

export const StatsGrid = ({ totalLessons, lastActiveAt }: StatsGridProps) => {
  return (
    <div className="grid grid-cols-2 gap-4 mb-6">
      <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
        <div className="flex items-center gap-2 mb-2 text-blue-600">
          <BookOpen size={20} />
          <span className="font-bold text-sm">Нийт хичээл</span>
        </div>
        <p className="text-3xl font-black text-blue-800">{totalLessons}</p>
      </div>
      <div className="bg-purple-50 p-4 rounded-xl border border-purple-100">
        <div className="flex items-center gap-2 mb-2 text-purple-600">
          <Calendar size={20} />
          <span className="font-bold text-sm">Сүүлд орсон</span>
        </div>
        <p className="text-sm font-bold text-purple-800 mt-2">
          {lastActiveAt
            ? new Date(lastActiveAt).toLocaleDateString()
            : "Одоогоор байхгүй"}
        </p>
      </div>
    </div>
  );
};
