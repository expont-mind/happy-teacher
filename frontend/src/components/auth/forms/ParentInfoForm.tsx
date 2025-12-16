"use client";

import { FormEvent } from "react";
import { User } from "lucide-react";
import Loader from "@/src/components/ui/Loader";
import Link from "next/link";

interface ParentInfoFormProps {
  phone: string;
  email: string;
  password: string;
  loading: boolean;
  onPhoneChange: (phone: string) => void;
  onEmailChange: (email: string) => void;
  onPasswordChange: (password: string) => void;
  onSubmit: (e: FormEvent) => void;
}

export default function ParentInfoForm({
  phone,
  email,
  password,
  loading,
  onPhoneChange,
  onEmailChange,
  onPasswordChange,
  onSubmit,
}: ParentInfoFormProps) {
  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-9">
      <div className="border border-[#0C0A0126] w-full shadow-sm bg-white rounded-[18px] p-3 flex gap-6 justify-center">
        <div className="w-[64px] h-[64px] bg-[#0C0A0126] rounded-full flex items-center justify-center">
          <User size={32} color="#333333" />
        </div>
        <div className="flex flex-col max-w-[204px]">
          <p className="text-lg font-extrabold text-[#333333] font-nunito">
            Эхлэцгээе!
          </p>
          <p className="text-sm font-semibold text-[#858480] font-nunito">
            Таны холбоо барих мэдээллийг бөглөнө үү.
          </p>
        </div>
      </div>

      <div className="border border-[#0C0A0126] w-full shadow-sm bg-white rounded-[18px] px-5 py-8 flex flex-col gap-8">
        <div className="flex flex-col gap-6">
          <div className="w-full flex flex-col gap-2">
            <label
              htmlFor="phone"
              className="text-base font-medium text-black font-nunito"
            >
              Утасны дугаар
            </label>
            <input
              id="phone"
              type="tel"
              value={phone}
              onChange={(e) => onPhoneChange(e.target.value)}
              required
              className="w-full p-3 bg-white border-[1.5px] border-[#0C0A0126] rounded-[10px] focus:outline-none outline-none focus:border-[#58CC02] transition-colors text-base font-normal text-[#0C0A0199] font-nunito"
              placeholder="99112233"
            />
          </div>

          <div className="w-full flex flex-col gap-2">
            <label
              htmlFor="email"
              className="text-base font-medium text-black font-nunito"
            >
              Имайл хаяг
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => onEmailChange(e.target.value)}
              required
              className="w-full p-3 bg-white border-[1.5px] border-[#0C0A0126] rounded-[10px] focus:outline-none outline-none focus:border-[#58CC02] transition-colors text-base font-normal text-[#0C0A0199] font-nunito"
              placeholder="example@email.com"
            />
          </div>

          <div className="w-full flex flex-col gap-2">
            <label
              htmlFor="password"
              className="text-base font-medium text-black font-nunito"
            >
              Нууц үг
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => onPasswordChange(e.target.value)}
              required
              minLength={6}
              className="w-full p-3 bg-white border-[1.5px] border-[#0C0A0126] rounded-[10px] focus:outline-none outline-none focus:border-[#58CC02] transition-colors text-base font-normal text-[#0C0A0199] font-nunito"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="bg-[#58CC02] w-full shadow-[0_4px_0_#46A302] active:shadow-none active:translate-y-1 transition-all rounded-2xl px-6 py-[10px] text-white font-bold text-lg font-nunito leading-7 cursor-pointer"
          >
            {loading ? <Loader /> : "Үргэлжлүүлэх"}
          </button>
        </div>

        <div className="w-full h-px bg-[#0C0A0126]"></div>

        <p className="text-base font-normal text-[#0C0A01] font-nunito text-center">
          Аль хэдийн бүртгэлтэй юу?{" "}
          <Link href="/login" className="text-[#58CC02] font-bold underline">
            Нэвтрэх
          </Link>
        </p>
      </div>
    </form>
  );
}
