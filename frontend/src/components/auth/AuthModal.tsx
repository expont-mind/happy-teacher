"use client";

import { useState } from "react";
import { X, GraduationCap } from "lucide-react";
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
  const [username, setUsername] = useState("");
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
        await signUp(email, password, username);
      }
      setEmail("");
      setUsername("");
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-white bg-opacity-50 p-4">
      <div className="bg-white rounded-3xl p-8 max-w-md w-full relative border-2 border-gray-200 shadow-2xl">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 cursor-pointer p-2 hover:bg-gray-100 rounded-full transition-colors"
        >
          <X size={24} className="text-gray-600" />
        </button>

        {/* Header with Icon */}
        <div className="text-center mb-6">
          <div className="flex justify-center mb-3">
            <GraduationCap
              size={64}
              className="text-(--duo-green)"
              strokeWidth={2.5}
            />
          </div>
          <h2
            className="text-3xl font-black mb-2"
            style={{ color: "var(--duo-green)" }}
          >
            {isLogin ? "Нэвтрэх" : "Бүртгүүлэх"}
          </h2>
          <p className="text-sm text-gray-600 font-semibold">
            {isLogin ? "Сурахаа үргэлжлүүлээрэй!" : "Шинэ аялал эхлүүлээрэй!"}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <div>
              <label
                htmlFor="username"
                className="block text-sm font-bold text-gray-700 mb-2"
              >
                Нэр
              </label>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:border-(--duo-blue) transition-colors font-semibold"
                placeholder="Таны нэр"
              />
            </div>
          )}

          <div>
            <label
              htmlFor="email"
              className="block text-sm font-bold text-gray-700 mb-2"
            >
              Имэйл
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:border-(--duo-blue) transition-colors font-semibold"
              placeholder="имэйл@жишээ.com"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-sm font-bold text-gray-700 mb-2"
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
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:border-(--duo-blue) transition-colors font-semibold"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`duo-button w-full px-6 py-4 text-base ${
              isLogin ? "duo-button-green" : "duo-button-blue"
            }`}
          >
            {loading ? <Loader /> : isLogin ? "Нэвтрэх" : "Бүртгүүлэх"}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button
            onClick={() => {
              setIsLogin(!isLogin);
              setEmail("");
              setUsername("");
              setPassword("");
            }}
            className="text-sm font-bold cursor-pointer transition-colors"
            style={{ color: "var(--duo-blue)" }}
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
