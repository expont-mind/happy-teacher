"use client";

import { LogOut } from "lucide-react";

export const LogoutButton = () => {
  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" }).catch(() => null);
    window.location.href = "/login";
  };

  return (
    <button
      onClick={handleLogout}
      className="w-full py-1.5 px-2 flex items-center gap-2 rounded-sm bg-white hover:bg-[#F4F4F5] transition-colors cursor-pointer"
    >
      <LogOut size={16} className="text-gray-500" />
      <p className="font-Inter text-sm font-normal text-gray-500">Гарах</p>
    </button>
  );
};
