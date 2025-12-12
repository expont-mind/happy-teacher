"use client";

import { FormEvent } from "react";
import { User } from "lucide-react";
import Image from "next/image";
import Loader from "@/src/components/ui/Loader";
import { CHILD_ICONS } from "@/src/app/register/page";

interface ChildInfoFormProps {
  childName: string;
  childIcon: string;
  childAge: number;
  childGrade: number;
  loading: boolean;
  onNameChange: (name: string) => void;
  onIconChange: (icon: string) => void;
  onAgeChange: (age: number) => void;
  onGradeChange: (grade: number) => void;
  onSubmit: (e: FormEvent) => void;
}

export default function ChildInfoForm({
  childName,
  childIcon,
  childAge,
  childGrade,
  loading,
  onNameChange,
  onIconChange,
  onAgeChange,
  onGradeChange,
  onSubmit,
}: ChildInfoFormProps) {
  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-9">
      <div className="border border-[#0C0A0126] w-full shadow-sm bg-white rounded-[18px] p-3 flex gap-6 justify-center">
        <div className="w-[64px] h-[64px] bg-[#0C0A0126] rounded-full flex items-center justify-center">
          <User size={32} color="#333333" />
        </div>
        <div className="flex flex-col max-w-[230px]">
          <p className="text-lg font-extrabold text-[#333333] font-nunito">
            Хүүхдийн тухай бичнэ үү!
          </p>
          <p className="text-sm font-semibold text-[#858480] font-nunito">
            Хүүхдийнхээ нэр, нас, анги болон дуртай дүрсийг сонгоорой.
          </p>
        </div>
      </div>

      <div className="border border-[#0C0A0126] w-full shadow-sm bg-white rounded-[18px] px-5 py-8 flex flex-col gap-8">
        <div className="flex flex-col gap-6">
          <div className="w-full flex flex-col gap-2">
            <label
              htmlFor="childName"
              className="text-base font-medium text-black font-nunito"
            >
              Хүүхдийн нэр
            </label>
            <input
              id="childName"
              type="text"
              value={childName}
              onChange={(e) => onNameChange(e.target.value)}
              required
              className="w-full p-3 bg-white border-[1.5px] border-[#0C0A0126] rounded-[10px] focus:outline-none outline-none focus:border-[#58CC02] transition-colors text-base font-normal text-[#0C0A0199] font-nunito"
              placeholder="Болд"
            />
          </div>
          <div className="w-full flex flex-col gap-2">
            <label className="text-base font-medium text-black font-nunito">
              Дуртай дүрсээ сонгоорой
            </label>
            <div className="grid grid-cols-4 gap-5">
              {CHILD_ICONS.map((icon) => (
                <button
                  key={icon}
                  type="button"
                  onClick={() => onIconChange(icon)}
                  className={`relative w-[70.5px] h-[70.5px] flex justify-center items-center rounded-[10px] transition-all cursor-pointer overflow-hidden ${
                    childIcon === icon
                      ? "bg-[#2FC45124] border-[3px] border-[#58CC02] "
                      : "bg-[#FFFAF7] hover:border-[#58CC02] border border-[#0C0A0126]"
                  }`}
                >
                  <Image
                    src={icon}
                    alt="child icon"
                    width={32}
                    height={32}
                    className="object-contain object-center"
                  />
                </button>
              ))}
            </div>
          </div>

          <div className="w-full flex flex-col gap-2">
            <label className="text-base font-medium text-black font-nunito">
              Нас
            </label>
            <div className="flex gap-2">
              {[6, 7, 8, 9, 10].map((age) => (
                <button
                  key={age}
                  type="button"
                  onClick={() => onAgeChange(age)}
                  className={`w-[62px] h-12 flex items-center justify-center rounded-[10px] font-bold transition-all cursor-pointer ${
                    childAge === age
                      ? "bg-[#58CC02] border-b-4 border-[#46A302] text-white"
                      : "bg-white hover:border-[#58CC02] border border-[#0C0A0126] text-[#333333]"
                  }`}
                >
                  {age}
                </button>
              ))}
            </div>
          </div>

          <div className="w-full flex flex-col gap-2">
            <label className="text-base font-medium text-black font-nunito">
              Анги
            </label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((grade) => (
                <button
                  key={grade}
                  type="button"
                  onClick={() => onGradeChange(grade)}
                  className={`w-[62px] h-12 flex items-center justify-center rounded-[10px] font-bold transition-all cursor-pointer ${
                    childGrade === grade
                      ? "bg-[#58CC02] border-b-4 border-[#46A302] text-white"
                      : "bg-white hover:border-[#58CC02] border border-[#0C0A0126] text-[#333333]"
                  }`}
                >
                  {grade}
                </button>
              ))}
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="bg-[#58CC02] w-full border-b-4 border-[#46A302] rounded-2xl px-6 py-[10px] text-white font-bold text-lg font-nunito leading-7 cursor-pointer"
          >
            {loading ? <Loader /> : "Бүртгэх"}
          </button>
        </div>
      </div>
    </form>
  );
}
