"use client";

import { FormEvent } from "react";
import { Hash } from "lucide-react";
import Loader from "@/src/components/ui/Loader";

interface CodeLoginFormProps {
  pin: string;
  loading: boolean;
  onPinChange: (pin: string) => void;
  onSubmit: (e: FormEvent) => void;
}

export default function CodeLoginForm({
  pin,
  loading,
  onPinChange,
  onSubmit,
}: CodeLoginFormProps) {
  const handlePinChange = (value: string) => {
    const cleanValue = value.replace(/\D/g, "").slice(0, 6);
    onPinChange(cleanValue);
  };

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-9">
      <div className="border border-[#0C0A0126] w-full shadow-sm bg-white rounded-[18px] p-3 flex gap-6 justify-center">
        <div className="w-[64px] h-[64px] bg-[#0C0A0126] rounded-full flex items-center justify-center">
          <Hash size={32} color="#333333" />
        </div>
        <div className="flex flex-col max-w-[204px] justify-center">
          <p className="text-lg font-extrabold text-[#333333] font-nunito">
            Тавтай морил!
          </p>
          <p className="text-sm font-semibold text-[#858480] font-nunito">
            Кодоор нэвтрэх
          </p>
        </div>
      </div>

      <div className="border border-[#0C0A0126] w-full shadow-sm bg-white rounded-[18px] px-5 py-8 flex flex-col gap-8">
        <div className="flex flex-col gap-6">
          <div className="w-full flex flex-col gap-2">
            <label
              htmlFor="pin"
              className="text-base font-medium text-black font-nunito"
            >
              6 оронтой код
            </label>
            <input
              id="pin"
              type="text"
              value={pin}
              onChange={(e) => handlePinChange(e.target.value)}
              required
              maxLength={6}
              className="w-full p-3 bg-white border-[1.5px] border-[#0C0A0126] rounded-[10px] focus:outline-none outline-none focus:border-[#58CC02] transition-colors font-normal text-[#0C0A0199] font-nunito text-center tracking-widest text-2xl"
              placeholder="000000"
            />
            <p className="text-sm font-normal text-[#858480] font-nunito text-center">
              Хүүхдийн 6 оронтой кодоо оруулна уу
            </p>
          </div>

          <button
            type="submit"
            disabled={loading || pin.length !== 6}
            className="bg-[#58CC02] w-full shadow-[0_4px_0_#46A302] active:shadow-none active:translate-y-1 transition-all rounded-2xl px-6 py-[10px] text-white font-bold text-lg font-nunito leading-7 cursor-pointer"
          >
            {loading ? <Loader /> : "Нэвтрэх"}
          </button>
        </div>
      </div>
    </form>
  );
}
