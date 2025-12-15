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
      <h3 className="text-lg font-extrabold text-[#333333] font-nunito mb-4 flex items-center gap-2">
        <Star size={20} className="text-[#FFD700]" fill="currentColor" />
        Сүүлд үзсэн хичээлүүд
      </h3>
      <div className="space-y-3">
        {activities.length > 0 ? (
          activities.map((activity, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between text-sm p-3 bg-white rounded-[10px] border border-[#0C0A0126]"
            >
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-[#58CC02]"></div>
                <span className="font-extrabold text-[#333333] capitalize font-nunito">
                  {activity.topic_key}
                </span>
                <span className="text-[#0C0A0126]">/</span>
                <span className="text-[#858480] font-bold font-nunito">
                  {activity.lesson_id}
                </span>
              </div>
              <span className="text-[#858480] text-xs font-bold font-nunito">
                {new Date(activity.completed_at).toLocaleDateString()}
              </span>
            </div>
          ))
        ) : (
          <div className="text-center py-6 bg-[#FFFAF7] rounded-[10px] border border-dashed border-[#0C0A0126]">
            <p className="text-[#858480] text-sm font-bold font-nunito">
              Одоогоор хичээл хийгээгүй байна.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
