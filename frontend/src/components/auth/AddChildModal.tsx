"use client";

import { useState } from "react";
import { X, CheckCircle } from "lucide-react";
import Image from "next/image";
import { createClient } from "@/src/utils/supabase/client";
import { toast } from "sonner";
import Loader from "@/src/components/ui/Loader";
import { CHILD_ICONS } from "@/src/app/register/page";

interface AddChildModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  onChildAdded?: () => void;
}

export default function AddChildModal({
  isOpen,
  onClose,
  userId,
  onChildAdded,
}: AddChildModalProps) {
  const [name, setName] = useState("");
  const [childIcon, setChildIcon] = useState(CHILD_ICONS[0]);
  const [childAge, setChildAge] = useState<number>(6);
  const [childGrade, setChildGrade] = useState<number>(1);

  const [generatedPin, setGeneratedPin] = useState("");
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<"input" | "success">("input");
  const supabase = createClient();

  if (!isOpen) return null;

  const generatePin = () => {
    return Math.floor(1000 + Math.random() * 9000).toString();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setLoading(true);
    const pin = generatePin();

    try {
      const { error } = await supabase.from("children").insert({
        parent_id: userId,
        name: name,
        pin_code: pin,
        avatar: childIcon,
        age: childAge,
        class: childGrade,
      });

      if (error) throw error;

      setGeneratedPin(pin);
      setStep("success");
      toast.success("Хүүхдийн бүртгэл амжилттай үүслээ!");
      onChildAdded?.();
    } catch (error: any) {
      console.error("Error adding child:", error);
      toast.error("Алдаа гарлаа: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setName("");
    setChildIcon(CHILD_ICONS[0]);
    setChildAge(6);
    setChildGrade(1);
    setGeneratedPin("");
    setStep("input");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-[382px] bg-[#FFFAF7] rounded-[20px] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 overflow-y-auto">
        <button
          onClick={handleClose}
          className="absolute top-2 right-2 p-2 rounded-full hover:bg-black/5 transition-colors z-10"
        >
          <X size={24} className="text-[#333333]" />
        </button>

        {step === "input" ? (
          <form onSubmit={handleSubmit}>
            <div className="border border-[#0C0A0126] w-full shadow-sm bg-white rounded-[18px] p-8 flex flex-col gap-8">
              <div className="flex flex-col gap-6">
                {/* Name Input */}
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
                    value={name}
                    onChange={(e) => setName(e.target.value)}
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
                        onClick={() => setChildIcon(icon)}
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

                {/* Age Selection */}
                <div className="w-full flex flex-col gap-2">
                  <label className="text-base font-medium text-black font-nunito">
                    Нас
                  </label>
                  <div className="flex gap-2">
                    {[6, 7, 8, 9, 10].map((age) => (
                      <button
                        key={age}
                        type="button"
                        onClick={() => setChildAge(age)}
                        className={`w-[62px] h-12 flex items-center justify-center rounded-[10px] font-bold transition-all cursor-pointer ${
                          childAge === age
                            ? "bg-[#58CC02] shadow-[0_4px_0_#46A302] active:shadow-none active:translate-y-1 text-white"
                            : "bg-white hover:border-[#58CC02] border border-[#0C0A0126] text-[#333333]"
                        }`}
                      >
                        {age}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Grade Selection */}
                <div className="w-full flex flex-col gap-2">
                  <label className="text-base font-medium text-black font-nunito">
                    Анги
                  </label>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((grade) => (
                      <button
                        key={grade}
                        type="button"
                        onClick={() => setChildGrade(grade)}
                        className={`w-[62px] h-12 flex items-center justify-center rounded-[10px] font-bold transition-all cursor-pointer ${
                          childGrade === grade
                            ? "bg-[#58CC02] shadow-[0_4px_0_#46A302] active:shadow-none active:translate-y-1 text-white"
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
                  className="bg-[#58CC02] w-full shadow-[0_4px_0_#46A302] active:shadow-none active:translate-y-1 transition-all rounded-2xl px-6 py-[10px] text-white font-bold text-lg font-nunito leading-7 cursor-pointer"
                >
                  {loading ? <Loader /> : "Бүртгэх"}
                </button>
              </div>
            </div>
          </form>
        ) : (
          <div className="flex flex-col items-center gap-8 p-8">
            <div className="flex flex-col gap-[10px] items-center text-center">
              <CheckCircle size={50} className="text-[#58CC02] mx-auto" />
              <p className="text-2xl font-extrabold text-[#58CC02] leading-9 font-nunito">
                Амжилттай нэмэгдлээ!
              </p>
            </div>

            <p className="text-[#FFD700] font-bold text-5xl font-nunito">
              {generatedPin}
            </p>

            <p className="text-sm font-semibold text-[#858480] font-nunito text-center">
              Энэ кодыг хадгалж аваарай! Хүүхэд энэ кодоор нэвтрэх болно.
            </p>

            <button
              onClick={handleClose}
              className="bg-[#58CC02] w-full shadow-[0_4px_0_#46A302] active:shadow-none active:translate-y-1 transition-all rounded-2xl px-6 py-[10px] text-white font-bold text-lg font-nunito leading-7 cursor-pointer"
            >
              Үргэлжлүүлэх
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
