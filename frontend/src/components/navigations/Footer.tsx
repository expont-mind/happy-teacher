import { Facebook, Instagram, Twitter, Heart } from "lucide-react";

export const Footer = () => {
  return (
    <footer className="w-full bg-gray-50 border-t-2 border-gray-200 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Main Footer Content */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-6">
          {/* About */}
          <div>
            <h4 className="text-sm font-black mb-3 text-gray-700 uppercase">
              Бидний тухай
            </h4>
            <div className="flex flex-col gap-2">
              <a
                href="#"
                className="text-sm text-gray-600 hover:text-[var(--duo-blue)] transition-colors font-semibold"
              >
                Танилцуулга
              </a>
              <a
                href="#"
                className="text-sm text-gray-600 hover:text-[var(--duo-blue)] transition-colors font-semibold"
              >
                Багш нар
              </a>
            </div>
          </div>

          {/* Products */}
          <div>
            <h4 className="text-sm font-black mb-3 text-gray-700 uppercase">
              Бүтээгдэхүүн
            </h4>
            <div className="flex flex-col gap-2">
              <a
                href="#"
                className="text-sm text-gray-600 hover:text-[var(--duo-blue)] transition-colors font-semibold"
              >
                Хичээлүүд
              </a>
              <a
                href="#"
                className="text-sm text-gray-600 hover:text-[var(--duo-blue)] transition-colors font-semibold"
              >
                Тоглоомууд
              </a>
            </div>
          </div>

          {/* Support */}
          <div>
            <h4 className="text-sm font-black mb-3 text-gray-700 uppercase">
              Тусламж
            </h4>
            <div className="flex flex-col gap-2">
              <a
                href="#"
                className="text-sm text-gray-600 hover:text-[var(--duo-blue)] transition-colors font-semibold"
              >
                Холбоо барих
              </a>
              <a
                href="#"
                className="text-sm text-gray-600 hover:text-[var(--duo-blue)] transition-colors font-semibold"
              >
                Түгээмэл асуулт
              </a>
            </div>
          </div>

          {/* Social */}
          <div>
            <h4 className="text-sm font-black mb-3 text-gray-700 uppercase">
              Сошиал
            </h4>
            <div className="flex gap-3">
              <a
                href="#"
                className="p-2 rounded-lg hover:bg-blue-100 transition-all group"
              >
                <Facebook
                  size={24}
                  className="text-gray-600 group-hover:text-[var(--duo-blue)]"
                  strokeWidth={2}
                />
              </a>
              <a
                href="#"
                className="p-2 rounded-lg hover:bg-pink-100 transition-all group"
              >
                <Instagram
                  size={24}
                  className="text-gray-600 group-hover:text-pink-500"
                  strokeWidth={2}
                />
              </a>
              <a
                href="#"
                className="p-2 rounded-lg hover:bg-blue-100 transition-all group"
              >
                <Twitter
                  size={24}
                  className="text-gray-600 group-hover:text-[var(--duo-blue)]"
                  strokeWidth={2}
                />
              </a>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="w-full h-px bg-gray-200 mb-6"></div>

        {/* Bottom Footer */}
        <div className="text-center">
          <p className="text-sm text-gray-500 font-semibold mb-2">
            © 2025 Happy Teacher. Бүх эрх хуулиар хамгаалагдсан.
          </p>
          <p className="text-xs text-gray-400 flex items-center justify-center gap-1">
            Хүүхдүүдийн хөгжилд зориулав
            <Heart size={14} className="text-red-400 fill-red-400" />
          </p>
        </div>
      </div>
    </footer>
  );
};
