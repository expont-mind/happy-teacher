"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { WhiteCircle } from "@/components/svg";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setLoading(true);

    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    }).catch(() => null);

    if (response?.ok) {
      router.replace("/");
      router.refresh();
      return;
    }

    setError("Имэйл эсвэл нууц үг буруу байна");
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#F4F4F5] flex items-center justify-center p-4">
      <div className="w-full max-w-[400px] bg-white border border-[#E2E8F0] rounded-lg p-8 flex flex-col gap-6">
        <div className="flex gap-2 items-center justify-center">
          <div className="p-2 rounded-lg bg-[#2563EB]">
            <WhiteCircle />
          </div>
          <div className="flex flex-col">
            <p className="font-Inter text-sm font-medium text-[#334155]">
              Expont Mind
            </p>
            <p className="font-Inter text-xs font-normal text-[#334155]">
              Admin
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="email"
              className="font-Inter text-sm font-medium text-[#334155]"
            >
              Имэйл
            </label>
            <input
              id="email"
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="h-10 px-3 rounded-lg border border-[#E2E8F0] font-Inter text-sm text-[#020617] outline-none focus:border-[#2563EB]"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="password"
              className="font-Inter text-sm font-medium text-[#334155]"
            >
              Нууц үг
            </label>
            <input
              id="password"
              type="password"
              required
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="h-10 px-3 rounded-lg border border-[#E2E8F0] font-Inter text-sm text-[#020617] outline-none focus:border-[#2563EB]"
            />
          </div>

          {error && (
            <p className="font-Inter text-sm text-red-600">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="h-10 rounded-lg bg-[#2563EB] font-Inter text-sm font-medium text-white hover:bg-[#1D4ED8] transition-colors disabled:opacity-60 cursor-pointer"
          >
            {loading ? "Нэвтэрч байна..." : "Нэвтрэх"}
          </button>
        </form>
      </div>
    </div>
  );
}
