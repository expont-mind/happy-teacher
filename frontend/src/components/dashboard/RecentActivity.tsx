import { Star } from "lucide-react";

interface Activity {
  topic_key: string;
  lesson_id: string;
  completed_at: string;
}

interface RecentActivityProps {
  activities: Activity[];
}

export const RecentActivity = ({ activities }: RecentActivityProps) => {
  return (
    <div>
      <h3 className="font-bold text-gray-700 mb-4 flex items-center gap-2">
        <Star size={18} className="text-yellow-500" fill="currentColor" />
        Сүүлд үзсэн хичээлүүд
      </h3>
      <div className="space-y-3">
        {activities.length > 0 ? (
          activities.map((activity, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between text-sm p-3 bg-gray-50 rounded-xl border border-gray-100"
            >
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-green-500"></div>
                <span className="font-bold text-gray-700 capitalize">
                  {activity.topic_key}
                </span>
                <span className="text-gray-400">/</span>
                <span className="text-gray-600 font-medium">
                  {activity.lesson_id}
                </span>
              </div>
              <span className="text-gray-400 text-xs font-medium">
                {new Date(activity.completed_at).toLocaleDateString()}
              </span>
            </div>
          ))
        ) : (
          <div className="text-center py-6 bg-gray-50 rounded-xl border border-dashed border-gray-200">
            <p className="text-gray-400 text-sm font-medium">
              Одоогоор хичээл хийгээгүй байна.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
