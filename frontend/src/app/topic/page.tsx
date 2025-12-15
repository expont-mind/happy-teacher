import Link from "next/link";
import { BookOpen, BookMarked, Zap, X } from "lucide-react";
import Image from "next/image";

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
    <div className="w-full h-[calc(100vh-75px)] flex justify-center bg-[#FFFAF7]">
      <div className="max-w-[1280px] w-full flex flex-col gap-14">
        <div className="mt-[50px] relative w-full bg-linear-to-r from-[#6FDC6F] to-[#32CD32] py-7 px-14 flex items-center gap-7 rounded-[20px]">
          <div className="absolute top-3 right-4 rotate-10">
            <Image
              src="/svg/Sparkle.svg"
              alt="Sparkle"
              width={32}
              height={32}
            />
          </div>
          <div className="w-[90px] h-[90px] rounded-full bg-white border-[3px] border-[#58CC02]">
            {/* icon */}
          </div>
          <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-1.5">
              <p className="text-white font-extrabold text-[24px] font-nunito">
                Сайна уу, Болд!
              </p>
              <p className="text-white font-medium text-sm font-nunito">
                Өнөөдөр юу сурах вэ?
              </p>
            </div>
            <div className="flex gap-5">
              <div className="bg-[#FFFFFF40] rounded-[20px] px-[10px] py-1.5 flex items-center gap-[10px]">
                <Image src="/svg/Fire.svg" alt="Fire" width={32} height={32} />
                <div className="flex flex-col w-[64px]">
                  <p className="text-white font-semibold text-sm font-nunito">
                    Streak
                  </p>
                  <p className="text-white font-extrabold text-sm font-nunito">
                    0 өдөр
                  </p>
                </div>
              </div>
              <div className="bg-[#FFFFFF40] rounded-[20px] px-[10px] py-1.5 flex items-center gap-[10px]">
                <Image
                  src="/svg/Lightning.svg"
                  alt="Lightning"
                  width={32}
                  height={32}
                />
                <div className="flex flex-col w-[64px]">
                  <p className="text-white font-semibold text-sm font-nunito">
                    XP
                  </p>
                  <p className="text-white font-extrabold text-sm font-nunito">
                    0
                  </p>
                </div>
              </div>
              <div className="bg-[#FFFFFF40] rounded-[20px] px-[10px] py-1.5 flex items-center gap-[10px]">
                <Image
                  src="/svg/Medal.svg"
                  alt="Medal"
                  width={32}
                  height={32}
                />
                <div className="flex flex-col w-[64px]">
                  <p className="text-white font-semibold text-sm font-nunito">
                    Level
                  </p>
                  <p className="text-white font-extrabold text-sm font-nunito">
                    0
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-7 py-6">
          <p className="text-black font-bold text-[32px] font-nunito">
            Хичээлүүд
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
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
        </div>
      </div>
    </div>
  );
}
