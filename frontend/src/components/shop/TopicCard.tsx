import Image from "next/image";
import Link from "next/link";
import { BookOpen, Check, Info, ArrowRight } from "lucide-react";

interface TopicData {
  title: string;
  description: string;
  link: string;
  lessonCount: number;
  price: number;
  image: string;
}

interface TopicCardProps {
  topic: TopicData;
  allChildrenPurchased: boolean;
  onPurchase: () => void;
  onDetail?: () => void;
}

export const TopicCard = ({
  topic,
  allChildrenPurchased,
  onPurchase,
  onDetail,
}: TopicCardProps) => {
  return (
    <div className="group relative bg-white border-2 border-[#E5E5E5] rounded-[24px] overflow-hidden hover:border-[#58CC02] transition-all duration-300 flex flex-col h-full">
      {/* Clickable area for detail */}
      <div
        className={onDetail ? "cursor-pointer" : ""}
        onClick={onDetail}
      >
        {/* Image */}
        <div className="relative w-full aspect-video bg-[#D6F5D6]">
          <Image
            src={topic.image}
            alt={topic.title}
            fill
            className="object-contain p-6"
          />
          {/* Lesson Count Badge */}
          <div className="absolute top-3 left-3 flex items-center gap-1.5 bg-white/90 backdrop-blur-sm rounded-xl px-3 py-1.5 shadow-md">
            <BookOpen size={14} className="text-[#58CC02]" />
            <p className="text-[#4B5563] font-bold text-sm font-nunito">
              {topic.lessonCount} хичээл
            </p>
          </div>
          {/* Info badge */}
          {onDetail && (
            <div className="absolute top-3 right-3 flex items-center gap-1 bg-white/90 backdrop-blur-sm rounded-xl px-2.5 py-1.5 shadow-md">
              <Info size={14} className="text-[#58CC02]" />
              <p className="text-[#4B5563] font-bold text-xs font-nunito">
                Дэлгэрэнгүй
              </p>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex flex-col gap-2 grow p-5">
          <h3 className="text-[#4B5563] font-extrabold font-nunito text-lg leading-tight group-hover:text-[#58CC02] transition-colors">
            {topic.title}
          </h3>
          <p className="text-gray-500 font-bold font-nunito text-sm leading-snug line-clamp-2">
            {topic.description}
          </p>
        </div>
      </div>

      {/* Action */}
      <div className="px-5 pb-5 flex flex-col gap-2">
        {allChildrenPurchased ? (
          <>
            <div className="w-full py-3 rounded-2xl flex items-center justify-center gap-2 font-bold font-nunito text-sm bg-[#D6F5D6] text-[#58CC02]">
              <Check size={18} strokeWidth={3} />
              <span>Бүх хүүхэд авсан</span>
            </div>
            <Link href={topic.link} className="w-full">
              <button className="w-full py-3 rounded-2xl flex items-center justify-center gap-2 transition-all active:translate-y-1 font-extrabold font-nunito tracking-wide text-sm cursor-pointer bg-[#58CC02] text-white shadow-[0_4px_0_#46A302] hover:bg-[#4CAF00]">
                <span>Хичээл руу очих</span>
                <ArrowRight size={16} />
              </button>
            </Link>
          </>
        ) : (
          <button
            onClick={onPurchase}
            className="w-full py-3 rounded-2xl flex items-center justify-center gap-2 transition-all active:translate-y-1 font-extrabold font-nunito tracking-wide text-sm cursor-pointer bg-[#58CC02] text-white shadow-[0_4px_0_#46A302] hover:bg-[#4CAF00]"
          >
            <span>{topic.price.toLocaleString()}₮ Худалдаж авах</span>
          </button>
        )}
      </div>
    </div>
  );
};
