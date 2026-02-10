"use client";

import { X, BookOpen, Palette, Trophy, Star, ArrowRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

interface TopicData {
  title: string;
  description: string;
  link: string;
  lessonCount: number;
  price: number;
  image: string;
}

interface TopicDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPurchase: () => void;
  topic: TopicData;
  allChildrenPurchased: boolean;
}

export default function TopicDetailModal({
  isOpen,
  onClose,
  onPurchase,
  topic,
  allChildrenPurchased,
}: TopicDetailModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200" onClick={onClose}>
      <div className="relative w-full max-w-[440px] bg-white rounded-3xl overflow-hidden animate-in zoom-in-95 duration-200 shadow-xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <button
          onClick={onClose}
          className="absolute top-3 right-3 p-2 rounded-full bg-white/80 backdrop-blur-sm hover:bg-white transition-colors z-10 cursor-pointer"
        >
          <X size={20} className="text-gray-500" />
        </button>

        {/* Hero Image */}
        <div className="relative w-full aspect-[16/10] bg-[#D6F5D6]">
          <Image
            src={topic.image}
            alt={topic.title}
            fill
            className="object-contain p-8"
          />
        </div>

        {/* Content */}
        <div className="p-6 flex flex-col gap-5">
          {/* Title + Price */}
          <div className="flex flex-col gap-2">
            <h2 className="text-xl font-extrabold text-[#333333] font-nunito">
              {topic.title}
            </h2>
            <p className="text-2xl font-black text-[#58CC02] font-nunito">
              {topic.price.toLocaleString()}₮
            </p>
          </div>

          {/* Description */}
          <p className="text-[#6B7280] font-medium text-sm font-nunito leading-relaxed">
            {topic.description}
          </p>

          {/* Features */}
          <div className="flex flex-col gap-3 bg-[#F9FAFB] rounded-2xl p-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-[#D6F5D6] flex items-center justify-center shrink-0">
                <BookOpen size={16} className="text-[#58CC02]" />
              </div>
              <p className="text-sm font-semibold text-[#4B5563] font-nunito">
                {topic.lessonCount} интерактив хичээл
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-[#D6F5D6] flex items-center justify-center shrink-0">
                <Palette size={16} className="text-[#58CC02]" />
              </div>
              <p className="text-sm font-semibold text-[#4B5563] font-nunito">
                Зурган даалгавар буд, бодлого бод
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-[#D6F5D6] flex items-center justify-center shrink-0">
                <Trophy size={16} className="text-[#58CC02]" />
              </div>
              <p className="text-sm font-semibold text-[#4B5563] font-nunito">
                Медаль, оноо, урамшуулал
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-[#D6F5D6] flex items-center justify-center shrink-0">
                <Star size={16} className="text-[#58CC02]" />
              </div>
              <p className="text-sm font-semibold text-[#4B5563] font-nunito">
                Олон хүүхэд нэмж болно
              </p>
            </div>
          </div>

          {/* Action */}
          {allChildrenPurchased ? (
            <div className="flex flex-col gap-2">
              <div className="w-full py-3.5 rounded-2xl flex items-center justify-center gap-2 font-bold font-nunito text-sm bg-[#D6F5D6] text-[#58CC02]">
                Бүх хүүхэд авсан
              </div>
              <Link href={topic.link} className="w-full">
                <button className="w-full py-3.5 rounded-2xl flex items-center justify-center gap-2 transition-all active:translate-y-1 font-extrabold font-nunito tracking-wide text-base cursor-pointer bg-[#58CC02] text-white shadow-[0_4px_0_#46A302] hover:bg-[#4CAF00]">
                  <span>Хичээл руу очих</span>
                  <ArrowRight size={16} />
                </button>
              </Link>
            </div>
          ) : (
            <button
              onClick={() => {
                onClose();
                onPurchase();
              }}
              className="w-full py-3.5 rounded-2xl flex items-center justify-center gap-2 transition-all active:translate-y-1 font-extrabold font-nunito tracking-wide text-base cursor-pointer bg-[#58CC02] text-white shadow-[0_4px_0_#46A302] hover:bg-[#4CAF00]"
            >
              {topic.price.toLocaleString()}₮ Худалдаж авах
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
