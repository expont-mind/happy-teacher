"use client";

import { useAuth } from "@/src/components/auth";
import {
  User,
  ChevronDown,
  Target,
  BookOpen,
  Users,
  Heart,
  Sparkles,
  Brain,
  Gamepad2,
  Medal,
  TrendingUp,
} from "lucide-react";
import Image from "next/image";
import { useState } from "react";

const faqData = [
  {
    id: 1,
    title: "Бидний зорилго",
    icon: Target,
    content:
      "Хүүхдийг цээжлүүлэх биш - ойлгуулах, шахах биш - сонирхуулах, айдас төрүүлэх биш - өөртөө итгэх итгэлийг нэмэх, уйлуулах биш – дурлуулах зорьдог.",
  },
  {
    id: 2,
    title: "Happy Academy-д хүүхэд юу сурч, олж авах вэ?",
    icon: BookOpen,
    contentItems: [
      { icon: Brain, text: "Математикийн бат бөх суурь ойлголт" },
      { icon: Gamepad2, text: "Тоглоом мэт интерактив хичээлүүд" },
      {
        icon: Medal,
        text: "Оноо, медаль, урамшууллаар дэмжигдсэн суралцах орчин",
      },
      { icon: TrendingUp, text: "Алхам алхмаар ахиц гаргах систем" },
    ],
  },
  {
    id: 3,
    title: "Эцэг эхчүүдэд зориулсан давуу тал",
    icon: Users,
    content:
      "• Хүүхдийн ахиц, явцыг тогтмол харах боломж\n• Хүүхэд хичээлээ бие даан, сонирхолтойгоор үзнэ\n• Нэг удаагийн төлбөр нэг сэдвийг бүхэлд нь ойлгоно\n• Гэрээсээ, хүссэн үедээ суралцах уян хатан систем",
  },
  {
    id: 4,
    title: "Яагаад Happy Academy гэж?",
    icon: Heart,
    content:
      "Учир нь бид:\n• Хүүхдийг аз жаргалтай суралцагч байгаасай гэж хүсдэг\n• Математикийг айдас биш, боломж болгохыг зорьдог\n• Суралцах үйл явцыг хөгжилтэй аялал болгодог",
  },
  {
    id: 5,
    title: "Happy Academy",
    icon: Sparkles,
    content: "Аз жаргалтайгаар суралцаж, итгэлтэйгээр урагшилна.",
  },
];

export default function HelpContent() {
  const { user, activeProfile } = useAuth();
  const [openId, setOpenId] = useState<number | null>(null);

  const getProfileAvatar = () => {
    if (activeProfile?.avatar) {
      return activeProfile.avatar;
    }
    return null;
  };

  const avatar = getProfileAvatar();
  const isLoggedIn = user || activeProfile;

  const toggleAccordion = (id: number) => {
    if (openId === id) {
      setOpenId(null);
    } else if (openId !== null) {
      setOpenId(null);
      setTimeout(() => {
        setOpenId(id);
      }, 300);
    } else {
      setOpenId(id);
    }
  };

  return (
    <div className="w-full min-h-[calc(100vh-77px)] flex justify-center bg-white">
      <div className="max-w-[1280px] w-full flex flex-col items-center gap-8 md:gap-14 py-8 md:py-14 px-4">
        <div className="flex flex-col gap-5 items-center max-w-[600px]">
          {isLoggedIn && avatar ? (
            <div className="w-[60px] h-[60px] overflow-hidden">
              <Image
                src={avatar}
                alt="Хэрэглэгчийн зураг"
                width={60}
                height={60}
                className="w-full h-full object-cover"
              />
            </div>
          ) : (
            <div className="w-[60px] h-[60px] rounded-full bg-[#D9D9D9] flex items-center justify-center">
              <User size={32} className="text-gray-500" />
            </div>
          )}
          <h1 className="text-black font-semibold text-2xl font-nunito text-center">
            Happy Academy гэж юу вэ?
          </h1>
          <p className="text-[#858480] font-semibold text-md font-nunito text-center">
            Happy Academy бол хүүхдүүдэд математикийг ойлгомжтой, хөгжилтэй,
            дарамтгүй аргаар заах онлайн сургалтын платформ юм. Бид хүүхэд
            бүрийн суралцах онцлогт тохирсон шат дараалсан хичээл, интерактив
            даалгавар, урамшууллын систем-ээр дамжуулан жинхэнэ ойлголт, бодит
            ахицыг бий болгодог.
          </p>
        </div>
        <div className="flex flex-col gap-4 w-full max-w-[700px]">
          {faqData.map((item) => {
            const IconComponent = item.icon;
            return (
              <div
                key={item.id}
                className="w-full border border-[#0C0A0126] rounded-[10px] overflow-hidden"
              >
                <button
                  onClick={() => toggleAccordion(item.id)}
                  className="w-full flex items-center justify-between px-5 py-4 bg-white hover:bg-[#F9F9F9] transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <IconComponent size={20} className="text-[#4CAF50]" />
                    <h2 className="text-black font-semibold text-base font-nunito text-left">
                      {item.title}
                    </h2>
                  </div>
                  <ChevronDown
                    size={20}
                    className={`text-gray-500 transition-transform duration-500 shrink-0 ${
                      openId === item.id ? "rotate-180" : ""
                    }`}
                  />
                </button>
                <div
                  className={`overflow-hidden transition-all duration-500 ease-in-out ${
                    openId === item.id ? "max-h-[500px]" : "max-h-0"
                  }`}
                >
                  <div className="px-5 pb-4 pt-2 bg-[#F9F9F9]">
                    {item.contentItems ? (
                      <div className="flex flex-col gap-2">
                        {item.contentItems.map((contentItem, index) => {
                          const ContentIcon = contentItem.icon;
                          return (
                            <div
                              key={index}
                              className="flex items-center gap-2"
                            >
                              <ContentIcon
                                size={16}
                                className="text-[#4CAF50]"
                              />
                              <p className="text-[#555] text-sm font-nunito">
                                {contentItem.text}
                              </p>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <p className="text-[#555] text-sm font-nunito whitespace-pre-line leading-relaxed">
                        {item.content}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
