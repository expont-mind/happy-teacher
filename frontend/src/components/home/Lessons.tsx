import Image from "next/image";
import Link from "next/link";

const LESSONS_DATA = [
  {
    title: "Бутархай",
    description: "Бутархай тоонуудтай танилцаж, хөгжилтэй аргаар суралцаарай.",
    icon: "/svg/Strategy.svg",
    link: "/topic/fractions",
    lessonCount: 15,
  },
  {
    title: "Үржих",
    description: "Үржих хүрдээ цээжилж, тоо бодох хурдаа нэмэгдүүлээрэй.",
    icon: "/svg/Calculator.svg",
    link: "/topic/multiplication",
    lessonCount: 14,
  },
];

export const Lessons = () => {
  return (
    <div className="w-full flex justify-center bg-white py-[126px] px-4">
      <div className="max-w-[1280px] w-full flex flex-col gap-20 items-center">
        <div className="flex flex-col gap-6 items-center text-center">
          <p className="text-[#0C0A01] text-3xl md:text-5xl font-bold font-nunito">
            Бидний хичээлүүд
          </p>
          <p className="text-[#54534D] text-lg md:text-2xl font-normal font-nunito">
            Үе шаттайгаар өсөн дэвших математикийн сургалт
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 w-full">
          {LESSONS_DATA.map((lesson, index) => (
            <Link href={lesson.link} key={index} className="w-full">
              <div className="w-full h-full border-2 border-[#0C0A0126] hover:border-[#58CC02] hover:bg-[#58CC02]/5 transition-all duration-300 rounded-[20px] py-8 pl-8 pr-8 md:pr-16 flex flex-col gap-8 cursor-pointer group relative overflow-hidden">
                <div className="absolute top-0 right-0 p-6">
                  <span className="bg-[#58CC02]/10 text-[#58CC02] px-4 py-2 rounded-full font-bold font-nunito text-sm border border-[#58CC02]/20">
                    {lesson.lessonCount} Хичээл
                  </span>
                </div>

                <div className="group-hover:scale-110 transition-transform duration-300 w-fit p-4 bg-[#58CC02]/10 rounded-2xl">
                  <Image
                    src={lesson.icon}
                    alt={lesson.title}
                    width={60}
                    height={60}
                  />
                </div>
                <div className="flex flex-col gap-3">
                  <p className="text-black font-bold text-[26px] font-nunito group-hover:text-[#58CC02] transition-colors">
                    {lesson.title}
                  </p>
                  <p className="text-[#54534D] text-xl md:text-2xl font-normal font-nunito">
                    {lesson.description}
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};
