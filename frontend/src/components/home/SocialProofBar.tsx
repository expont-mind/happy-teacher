import { Users, BookOpen, Star, Brain } from "lucide-react";

const stats = [
  { icon: Users, label: "2,000+ Хүүхэд", color: "#58CC02" },
  { icon: BookOpen, label: "50+ Хичээл", color: "#1CB0F6" },
  { icon: Star, label: "4.9 Үнэлгээ", color: "#FFC800" },
  { icon: Brain, label: "Шинжлэх ухаанд суурилсан", color: "#CE82FF" },
];

export const SocialProofBar = () => {
  return (
    <section className="w-full bg-white py-4 lg:py-5 px-4 lg:px-8">
      <div className="max-w-[1280px] mx-auto flex flex-wrap justify-center gap-6 lg:gap-14">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="flex items-center gap-2 text-[#4B5563] font-nunito font-bold text-sm lg:text-base"
          >
            <stat.icon size={20} color={stat.color} strokeWidth={2.5} />
            <span>{stat.label}</span>
          </div>
        ))}
      </div>
    </section>
  );
};
