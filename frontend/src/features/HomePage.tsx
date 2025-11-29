"use client";

import Link from "next/link";

export const HomePage = () => {
  return (
    <div className="min-h-screen w-full relative overflow-hidden">
      {/* Animated gradient background */}
      <div className="absolute inset-0 bg-linear-to-br from-yellow-200 via-blue-200 to-green-200 animate-gradient-xy"></div>

      {/* Decorative shapes */}
      <div className="absolute top-20 left-10 w-32 h-32 bg-yellow-300 rounded-full opacity-30 blur-2xl animate-bounce"></div>
      <div className="absolute top-40 right-20 w-40 h-40 bg-blue-300 rounded-full opacity-30 blur-2xl animate-pulse"></div>
      <div className="absolute bottom-20 left-1/4 w-36 h-36 bg-pink-300 rounded-full opacity-30 blur-2xl animate-bounce delay-300"></div>
      <div className="absolute bottom-40 right-1/3 w-28 h-28 bg-green-300 rounded-full opacity-30 blur-2xl animate-pulse delay-500"></div>

      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4 py-12">
        {/* Main content container */}
        <div className="max-w-4xl w-full text-center space-y-8">
          {/* Logo/Title section */}
          <div className="space-y-4 animate-fade-in">
            <div className="flex justify-center items-center gap-4 mb-6">
              <div className="text-7xl md:text-8xl animate-bounce">🎨</div>
              <h1 className="text-5xl md:text-7xl font-extrabold text-transparent bg-clip-text bg-linear-to-r from-purple-600 via-pink-600 to-blue-600 drop-shadow-lg">
                Happy Teacher
              </h1>
              <div className="text-7xl md:text-8xl animate-bounce delay-200">
                ✨
              </div>
            </div>

            <p className="text-2xl md:text-3xl font-bold text-gray-800 drop-shadow-md">
              Математикийн хөгжилтэй ертөнц рүү тавтай морил! 🚀
            </p>
          </div>

          {/* Description cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-12 mb-8">
            <div className="bg-white/90 backdrop-blur-sm rounded-3xl p-6 shadow-2xl border-4 border-yellow-400 transform hover:scale-105 transition-transform duration-300 cursor-pointer">
              <div className="text-5xl mb-4">🔢</div>
              <h3 className="text-2xl font-bold text-purple-700 mb-2">
                Бутархай
              </h3>
              <p className="text-lg text-gray-700">
                Бутархай тоонуудтай танилцаж, хөгжилтэй дасгал хий!
              </p>
            </div>

            <div className="bg-white/90 backdrop-blur-sm rounded-3xl p-6 shadow-2xl border-4 border-blue-400 transform hover:scale-105 transition-transform duration-300 cursor-pointer">
              <div className="text-5xl mb-4">✖️</div>
              <h3 className="text-2xl font-bold text-blue-700 mb-2">Үржих</h3>
              <p className="text-lg text-gray-700">
                Үржих үйлдлээр дасгал хийж, ур чадвараа сайжруулаарай!
              </p>
            </div>
          </div>

          {/* Main CTA Button */}
          <div className="mt-10 animate-fade-in-up">
            <Link
              href="/topic"
              className="cursor-pointer inline-block group relative"
            >
              <div className="absolute -inset-1 bg-linear-to-r from-pink-600 via-purple-600 to-blue-600 rounded-3xl blur opacity-75 group-hover:opacity-100 transition duration-300"></div>
              <div className="relative bg-linear-to-r from-pink-500 via-purple-500 to-blue-500 text-white px-12 py-6 rounded-3xl text-2xl md:text-3xl font-extrabold shadow-2xl transform group-hover:scale-105 transition-transform duration-300 border-4 border-white">
                <span className="flex items-center gap-3">
                  <span>🎯</span>
                  <span>Сэдвүүд рүү орох</span>
                  <span>👉</span>
                </span>
              </div>
            </Link>
          </div>

          {/* Fun features */}
          <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 shadow-lg border-2 border-yellow-300">
              <div className="text-4xl mb-2">🎨</div>
              <p className="text-sm font-semibold text-gray-700">Будах</p>
            </div>
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 shadow-lg border-2 border-blue-300">
              <div className="text-4xl mb-2">🎮</div>
              <p className="text-sm font-semibold text-gray-700">Тоглох</p>
            </div>
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 shadow-lg border-2 border-pink-300">
              <div className="text-4xl mb-2">🏆</div>
              <p className="text-sm font-semibold text-gray-700">Ялах</p>
            </div>
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 shadow-lg border-2 border-green-300">
              <div className="text-4xl mb-2">⭐</div>
              <p className="text-sm font-semibold text-gray-700">Сургах</p>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes gradient-xy {
          0%,
          100% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
        }
        .animate-gradient-xy {
          background-size: 200% 200%;
          animation: gradient-xy 15s ease infinite;
        }
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in {
          animation: fade-in 1s ease-out;
        }
        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in-up {
          animation: fade-in-up 1s ease-out 0.3s both;
        }
        .delay-200 {
          animation-delay: 0.2s;
        }
        .delay-300 {
          animation-delay: 0.3s;
        }
        .delay-500 {
          animation-delay: 0.5s;
        }
      `}</style>
    </div>
  );
};
