"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/src/components/auth";
import { createClient } from "@/src/utils/supabase/client";
import { toast } from "sonner";
import Loader from "@/src/components/ui/Loader";
import Image from "next/image";

export default function SettingsForm() {
  const { user, loading } = useAuth();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [notifications, setNotifications] = useState({
    sms: false,
    gmail: true,
    report: false,
  });
  const [isSaving, setIsSaving] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [passwordLoading, setPasswordLoading] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    if (user) {
      setFullName(user.user_metadata?.full_name || "");
      setEmail(user.email || "");
      setPhone(user.phone || user.user_metadata?.phone || "");

      const savedSettings = user.user_metadata?.notification_settings;
      if (savedSettings) {
        setNotifications(savedSettings);
      }
    }
  }, [user]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      const { error } = await supabase.auth.updateUser({
        data: {
          full_name: fullName,
          phone: phone,
          notification_settings: notifications,
        },
      });

      if (error) throw error;
      toast.success("Мэдээлэл амжилттай хадгалагдлаа");
    } catch (error: any) {
      toast.error("Алдаа гарлаа: " + error.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword) {
      toast.error("Шинэ нууц үгээ оруулна уу");
      return;
    }
    setPasswordLoading(true);

    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) throw error;
      toast.success("Нууц үг амжилттай солигдлоо");
      setCurrentPassword("");
      setNewPassword("");
    } catch (error: any) {
      toast.error("Алдаа: " + error.message);
    } finally {
      setPasswordLoading(false);
    }
  };

  const toggleNotification = async (key: keyof typeof notifications) => {
    const newSettings = {
      ...notifications,
      [key]: !notifications[key],
    };
    setNotifications(newSettings);

    try {
      const { error } = await supabase.auth.updateUser({
        data: { notification_settings: newSettings },
      });

      if (error) throw error;
    } catch (error: any) {
      console.error("Error saving notification settings:", error);
      toast.error("Тохиргоог хадгалж чадсангүй");
      setNotifications((prev) => ({
        ...prev,
        [key]: !prev[key],
      }));
    }
  };

  if (loading) return null;

  return (
    <div className="w-full max-w-[424px] flex flex-col gap-8">
      {/* Header Card */}
      <div className="flex flex-col gap-[10px]">
        <p className="text-black font-bold text-[32px] font-nunito leading-[42px]">
          Тохиргоо
        </p>
        <p className="text-[#858480] font-semibold text-base font-nunito leading-5">
          Өөрийн мэдээллээ засаж, тохируулна уу
        </p>
      </div>
      {/* Main Form Card */}

      <form
        onSubmit={handleUpdateProfile}
        className="flex flex-col gap-7 border border-[#0C0A0126] bg-white rounded-[16px] p-5"
      >
        <div className="flex flex-col gap-[10px] ">
          <div className="flex items-center gap-[10px]">
            <Image src="/svg/User.svg" alt="User" width={32} height={32} />
            <p className="text-black font-bold text-[20px] font-nunito">
              Эцэг эхийн бүртгэл
            </p>
          </div>
          <div className="w-full h-px bg-[#0C0A0126]"></div>
        </div>

        <div className="flex flex-col gap-5">
          <div className="w-full flex flex-col gap-2">
            <label className="text-base font-medium text-black font-nunito">
              Утасны дугаар
            </label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full p-3 bg-white border-[1.5px] border-[#0C0A0126] rounded-[10px] focus:outline-none outline-none focus:border-[#58CC02] transition-colors text-base font-normal text-[#0C0A0199] font-nunito"
              placeholder="Утасны дугаар"
            />
          </div>

          <div className="w-full flex flex-col gap-2">
            <label className="text-base font-medium text-black font-nunito">
              Имэйл хаяг
            </label>
            <input
              type="email"
              value={email}
              disabled
              className="w-full p-3 bg-gray-50 border-[1.5px] border-[#0C0A0126] rounded-[10px] text-base font-normal text-gray-400 font-nunito cursor-not-allowed"
            />
          </div>

          <div className="flex">
            <button
              type="submit"
              disabled={isSaving}
              className="bg-[#58CC02] shadow-[0_4px_0_#46A302] active:shadow-none active:translate-y-1 transition-all rounded-2xl px-7 py-[10px] text-white font-bold text-lg font-nunito leading-7 cursor-pointer hover:brightness-95 disabled:opacity-70"
            >
              {isSaving ? <Loader /> : "Хадгалах"}
            </button>
          </div>
        </div>
      </form>

      <div className="flex flex-col gap-4 border border-[#0C0A0126] bg-white rounded-[16px] p-5">
        <div className="flex flex-col gap-[10px] ">
          <div className="flex items-center gap-[10px]">
            <Image
              src="/svg/BellSimpleRinging.svg"
              alt="User"
              width={32}
              height={32}
            />
            <p className="text-black font-bold text-[20px] font-nunito">
              Мэдэгдлийн тохиргоо
            </p>
          </div>
          <div className="w-full h-px bg-[#0C0A0126]"></div>
        </div>

        <div className="flex flex-col gap-[10px]">
          <div className="flex items-center justify-between p-3">
            <div className="flex flex-col gap-1">
              <p className="text-black font-bold text-sm font-nunito">
                Имайл мэдэгдэл
              </p>
              <p className="text-[#858480] font-medium text-xs font-nunito">
                3 хичээл бүрт явцын тайлан
              </p>
            </div>
            <button
              type="button"
              onClick={() => toggleNotification("gmail")}
              className={`w-[44px] h-[24px] rounded-full p-[2px] transition-colors duration-200 ease-in-out cursor-pointer ${
                notifications.gmail ? "bg-[#58CC02]" : "bg-[#E5E5E5]"
              }`}
            >
              <div
                className={`w-5 h-5 bg-white rounded-full transition-transform duration-200 ease-in-out ${
                  notifications.gmail ? "translate-x-[20px]" : "translate-x-0"
                }`}
              />
            </button>
          </div>
          <div className="flex items-center justify-between p-3">
            <div className="flex flex-col gap-1">
              <p className="text-black font-bold text-sm font-nunito">
                SMS мэдэгдэл
              </p>
              <p className="text-[#858480] font-medium text-xs font-nunito">
                2 өдөр идэвхгүй бол сануулга
              </p>
            </div>
            <button
              type="button"
              onClick={() => toggleNotification("sms")}
              className={`w-[44px] h-[24px] rounded-full p-[2px] transition-colors duration-200 ease-in-out cursor-pointer ${
                notifications.sms ? "bg-[#58CC02]" : "bg-[#E5E5E5]"
              }`}
            >
              <div
                className={`w-5 h-5 bg-white rounded-full transition-transform duration-200 ease-in-out ${
                  notifications.sms ? "translate-x-[20px]" : "translate-x-0"
                }`}
              />
            </button>
          </div>
          <div className="flex items-center justify-between p-3">
            <div className="flex flex-col gap-1">
              <p className="text-black font-bold text-sm font-nunito">
                Долоо хоногийн тайлан
              </p>
              <p className="text-[#858480] font-medium text-xs font-nunito">
                Даваа бүр нийлбэр явц
              </p>
            </div>
            <button
              type="button"
              onClick={() => toggleNotification("report")}
              className={`w-[44px] h-[24px] rounded-full p-[2px] transition-colors duration-200 ease-in-out cursor-pointer ${
                notifications.report ? "bg-[#58CC02]" : "bg-[#E5E5E5]"
              }`}
            >
              <div
                className={`w-5 h-5 bg-white rounded-full transition-transform duration-200 ease-in-out ${
                  notifications.report ? "translate-x-[20px]" : "translate-x-0"
                }`}
              />
            </button>
          </div>
        </div>
      </div>

      <form
        onSubmit={handleChangePassword}
        className="flex flex-col gap-7 border border-[#0C0A0126] bg-white rounded-[16px] p-5"
      >
        <div className="flex flex-col gap-[10px] ">
          <div className="flex items-center gap-[10px]">
            <Image src="/svg/LockKey.svg" alt="User" width={32} height={32} />
            <p className="text-black font-bold text-[20px] font-nunito">
              Нууц үг солих
            </p>
          </div>
          <div className="w-full h-px bg-[#0C0A0126]"></div>
        </div>

        <div className="flex flex-col gap-5">
          <div className="w-full flex flex-col gap-2">
            <label className="text-base font-medium text-black font-nunito">
              Одоогийн нууц үг
            </label>
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="w-full p-3 bg-white border-[1.5px] border-[#0C0A0126] rounded-[10px] focus:outline-none outline-none focus:border-[#58CC02] transition-colors text-base font-normal text-[#0C0A0199] font-nunito"
            />
          </div>

          <div className="w-full flex flex-col gap-2">
            <label className="text-base font-medium text-black font-nunito">
              Шинэ нууц үг
            </label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full p-3 bg-white border-[1.5px] border-[#0C0A0126] rounded-[10px] focus:outline-none outline-none focus:border-[#58CC02] transition-colors text-base font-normal text-[#0C0A0199] font-nunito"
            />
          </div>

          <div className="flex">
            <button
              type="submit"
              disabled={passwordLoading}
              className="bg-[#58CC02] shadow-[0_4px_0_#46A302] active:shadow-none active:translate-y-1 transition-all rounded-2xl px-7 py-[10px] text-white font-bold text-lg font-nunito leading-7 cursor-pointer hover:brightness-95 disabled:opacity-70"
            >
              {passwordLoading ? <Loader /> : "Нууц үг солих"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
