import { Flame } from "lucide-react";
import { StatsGrid } from "./StatsGrid";
import { RecentActivity } from "./RecentActivity";

interface ChildData {
  id: string;
  name: string;
  streak_count: number;
  total_lessons: number;
  last_active_at: string | null;
  recent_activity: {
    topic_key: string;
    lesson_id: string;
    completed_at: string;
  }[];
}

interface ChildCardProps {
  child: ChildData;
}

export const ChildCard = ({ child }: ChildCardProps) => {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center text-3xl border-4 border-white shadow-sm">
            👶
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-800">{child.name}</h2>
            <p className="text-gray-500 text-sm font-medium">Сурагч</p>
          </div>
        </div>
        <div className="flex flex-col items-end gap-2">
          <div className="flex items-center gap-2 bg-orange-50 px-4 py-2 rounded-xl border border-orange-100">
            <Flame className="text-orange-500" fill="currentColor" size={20} />
            <span className="font-bold text-orange-700">
              {child.streak_count} өдөр
            </span>
          </div>
        </div>
      </div>

      <StatsGrid
        totalLessons={child.total_lessons}
        lastActiveAt={child.last_active_at}
      />

      <RecentActivity activities={child.recent_activity} />
    </div>
  );
};
