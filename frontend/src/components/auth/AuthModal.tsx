"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { useAuth } from "./AuthProvider";
import Loader from "@/src/components/ui/Loader";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function AuthModal({
  isOpen,
  onClose,
  onSuccess,
}: AuthModalProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { signIn, signUp } = useAuth();

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isLogin) {
        await signIn(email, password);
      } else {
        await signUp(email, password);
      }
      setEmail("");
      setPassword("");
      onSuccess?.();
      onClose();
    } catch (error) {
      // Error is handled in AuthProvider
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-3xl p-8 max-w-md w-full mx-4 relative border-4 border-slate-700">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 cursor-pointer p-2 hover:bg-slate-100 rounded-full transition-colors"
        >
          <X size={24} className="text-slate-700" />
        </button>

        <h2 className="text-3xl font-extrabold text-purple-800 mb-6 text-center">
          {isLogin ? "Нэвтрэх" : "Бүртгүүлэх"}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-semibold text-slate-700 mb-2"
            >
              Имэйл
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-3 border-2 border-slate-300 rounded-xl focus:outline-none focus:border-purple-600"
              placeholder="имэйл@жишээ.com"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-sm font-semibold text-slate-700 mb-2"
            >
              Нууц үг
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              className="w-full px-4 py-3 border-2 border-slate-300 rounded-xl focus:outline-none focus:border-purple-600"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full cursor-pointer px-6 py-3 bg-purple-600 text-white font-bold rounded-xl hover:bg-purple-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? (
              <div className="flex items-center justify-center gap-2">
                <Loader />
                <span>Түр хүлээнэ үү...</span>
              </div>
            ) : isLogin ? (
              "Нэвтрэх"
            ) : (
              "Бүртгүүлэх"
            )}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button
            onClick={() => {
              setIsLogin(!isLogin);
              setEmail("");
              setPassword("");
            }}
            className="text-sm text-purple-600 hover:text-purple-700 font-semibold cursor-pointer"
          >
            {isLogin
              ? "Бүртгэл байхгүй юу? Бүртгүүлэх"
              : "Аль хэдийн бүртгэлтэй юу? Нэвтрэх"}
          </button>
        </div>
      </div>
    </div>
  );
}
