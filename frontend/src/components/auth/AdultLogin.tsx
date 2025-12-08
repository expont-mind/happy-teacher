"use client";

import { useState } from "react";
import { X, Mail, Lock, User } from "lucide-react";
import { useAuth } from "./AuthProvider";
import Loader from "@/src/components/ui/Loader";

interface AdultLoginProps {
  onSuccess: () => void;
  onBack: () => void;
}

export default function AdultLogin({ onSuccess, onBack }: AdultLoginProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { signIn, signUp } = useAuth();

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
      onSuccess();
    } catch (error) {
      // Error is handled in AuthProvider
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-b from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full animate-bounce-in">
        {/* Back Button */}
        <button
          onClick={onBack}
          className="mb-8 duo-button duo-button-gray px-4 py-2 text-sm"
        >
          ← Буцах
        </button>

        {/* Login Card */}
        <div className="duo-card p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-block bg-linear-to-r from-blue-400 to-purple-400 rounded-full p-4 mb-4 shadow-lg">
              <User size={48} className="text-white" />
            </div>
            <h2
              className="text-4xl font-black mb-2"
              style={{ color: "var(--duo-blue)" }}
            >
              {isLogin ? "Нэвтрэх" : "Бүртгүүлэх"}
            </h2>
            <p className="font-bold" style={{ color: "var(--duo-gray-700)" }}>
              {isLogin ? "Сурахаа үргэлжлүүлээрэй!" : "Шинэ аялал эхлүүлээрэй!"}
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {!isLogin && (
              <div>
                <label
                  htmlFor="username"
                  className="flex text-sm font-bold mb-2 items-center gap-2"
                  style={{ color: "var(--duo-gray-700)" }}
                >
                  <User size={18} />
                  Нэр
                </label>
                <input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  className="w-full px-4 py-4 bg-white border-2 border-gray-300 rounded-xl focus:outline-none focus:border-blue-400 transition-colors font-semibold placeholder-gray-400"
                  placeholder="Таны нэр"
                  style={{ color: "var(--duo-gray-900)" }}
                />
              </div>
            )}

            <div>
              <label
                htmlFor="email"
                className="flex text-sm font-bold mb-2 items-center gap-2"
                style={{ color: "var(--duo-gray-700)" }}
              >
                <Mail size={18} />
                Имэйл
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-4 bg-white border-2 border-gray-300 rounded-xl focus:outline-none focus:border-blue-400 transition-colors font-semibold placeholder-gray-400"
                placeholder="имэйл@жишээ.com"
                style={{ color: "var(--duo-gray-900)" }}
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="flex text-sm font-bold mb-2 items-center gap-2"
                style={{ color: "var(--duo-gray-700)" }}
              >
                <Lock size={18} />
                Нууц үг
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className="w-full px-4 py-4 bg-white border-2 border-gray-300 rounded-xl focus:outline-none focus:border-blue-400 transition-colors font-semibold placeholder-gray-400"
                placeholder="••••••••"
                style={{ color: "var(--duo-gray-900)" }}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`duo-button w-full px-6 py-4 text-base ${
                isLogin ? "duo-button-blue" : "duo-button-green"
              }`}
            >
              {loading ? <Loader /> : isLogin ? "Нэвтрэх" : "Бүртгүүлэх"}
            </button>
          </form>

          {/* Toggle */}
          <div className="mt-6 text-center">
            <button
              onClick={() => {
                setIsLogin(!isLogin);
                setEmail("");
                setUsername("");
                setPassword("");
              }}
              className="text-sm font-bold transition-colors"
              style={{ color: "var(--duo-blue)" }}
            >
              {isLogin
                ? "Бүртгэл байхгүй юу? Бүртгүүлэх"
                : "Аль хэдийн бүртгэлтэй юу? Нэвтрэх"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
