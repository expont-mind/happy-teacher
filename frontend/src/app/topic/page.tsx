import Link from "next/link";
import {
  BookOpen,
  Plus,
  Minus,
  Divide,
  Ruler,
  Target,
  BookMarked,
  Zap,
  X,
} from "lucide-react";

export default function TopicsPage() {
  const topics = [
    {
      key: "fractions",
      title: "Бутархай",
      icon: BookOpen,
      color: "var(--duo-blue)",
      bgColor: "from-blue-100 to-blue-50",
      borderColor: "border-blue-300",
    },
    {
      key: "multiplication",
      title: "Үржих",
      icon: X,
      color: "var(--duo-purple)",
      bgColor: "from-purple-100 to-purple-50",
      borderColor: "border-purple-300",
    },
  ];

  return (
    <div className="min-h-screen bg-linear-to-b from-blue-50 to-white py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-4">
            <Target
              size={64}
              className="text-(--duo-green)"
              strokeWidth={2.5}
            />
          </div>
          <h1
            className="text-4xl md:text-5xl font-black mb-3"
            style={{ color: "var(--duo-green)" }}
          >
            Сэдвүүд
          </h1>
          <p className="text-lg text-gray-600 font-semibold">
            Сонирхолтой сэдвээ сонгоод эхлээрэй!
          </p>
        </div>

        {/* Topics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {topics.map((topic) => {
            const IconComponent = topic.icon;
            return (
              <Link
                key={topic.key}
                href={`/topic/${topic.key}`}
                className="cursor-pointer group"
              >
                <div
                  className={`duo-card bg-linear-to-br ${topic.bgColor} border-2 ${topic.borderColor} p-8`}
                >
                  {/* Icon */}
                  <div className="mb-4 flex justify-center">
                    <div className="p-4 bg-white rounded-2xl group-hover:scale-110 transition-transform">
                      <IconComponent
                        size={48}
                        style={{ color: topic.color }}
                        strokeWidth={2.5}
                      />
                    </div>
                  </div>

                  {/* Title */}
                  <h2
                    className="text-3xl font-black mb-3 text-center"
                    style={{ color: topic.color }}
                  >
                    {topic.title}
                  </h2>

                  {/* Description */}
                  <p className="text-gray-600 font-semibold mb-4 text-center">
                    Хичээлүүд, дасгалууд болон тоглоомууд
                  </p>

                  {/* Progress */}
                  <div className="duo-progress mb-4">
                    <div
                      className="duo-progress-fill"
                      style={{ width: "0%" }}
                    ></div>
                  </div>

                  {/* Stats */}
                  <div className="flex gap-4 text-sm justify-center">
                    <div className="flex items-center gap-1">
                      <BookMarked
                        size={18}
                        className="text-gray-600"
                        strokeWidth={2}
                      />
                      <span className="font-bold text-gray-700">
                        0/10 хичээл
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Zap
                        size={18}
                        className="text-(--duo-yellow-dark)"
                        strokeWidth={2}
                      />
                      <span className="font-bold text-gray-700">0 XP</span>
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        {/* Coming Soon Section */}
        <div className="mt-12 text-center">
          <h3 className="text-2xl font-black mb-6 text-gray-700">
            Удахгүй нэмэгдэх сэдвүүд
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { icon: Plus, title: "Нэмэх", color: "text-green-500" },
              { icon: Minus, title: "Хасах", color: "text-red-500" },
              { icon: Divide, title: "Хуваах", color: "text-blue-500" },
              { icon: Ruler, title: "Геометр", color: "text-purple-500" },
            ].map((item, idx) => {
              const IconComponent = item.icon;
              return (
                <div
                  key={idx}
                  className="p-6 bg-white rounded-2xl border-2 border-gray-200 opacity-60"
                >
                  <div className="flex justify-center mb-2">
                    <IconComponent
                      size={40}
                      className={`${item.color} grayscale`}
                      strokeWidth={2}
                    />
                  </div>
                  <p className="font-bold text-gray-500">{item.title}</p>
                  <p className="text-xs text-gray-400 mt-1">Удахгүй</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
