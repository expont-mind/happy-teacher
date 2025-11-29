"use client";

import { useState } from "react";
import { Menu, X, Home, LogIn, LogOut, User } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/src/components/auth";
import AuthModal from "@/src/components/auth/AuthModal";

export const Header = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const { user, loading, signOut } = useAuth();

  return (
    <nav className="sticky top-0 z-50 border-b-4 border-slate-700 bg-slate-900 w-full px-12 py-4 flex items-center justify-between">
      {/* Logo */}
      <div className="flex items-center gap-2">
        <Link href="/">
          <p className="text-xl font-bold text-white hidden sm:inline cursor-pointer">
            Happy Teacher
          </p>
        </Link>
      </div>

      {/* Desktop Navigation */}
      <div className="hidden md:flex items-center gap-2">
        <button className="px-4 py-2 text-white hover:text-cyan-400 font-semibold text-sm transition-colors">
          Standards
        </button>
        <button className="px-4 py-2 text-white hover:text-cyan-400 font-semibold text-sm transition-colors">
          Teachers
        </button>
        <button className="px-4 py-2 text-white hover:text-cyan-400 font-semibold text-sm transition-colors">
          Help
        </button>
        <button className="px-4 py-2 text-white hover:text-cyan-400 font-semibold text-sm transition-colors">
          Store
        </button>
        <button className="px-4 py-2 bg-yellow-400 text-slate-900 font-bold rounded-md hover:bg-yellow-500 transition-colors text-sm">
          Start Your Free Trial
        </button>
        {loading ? (
          <div className="px-4 py-2 text-white text-sm">...</div>
        ) : user ? (
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 px-4 py-2 text-white text-sm">
              <User size={16} />
              <span className="hidden lg:inline">{user.email}</span>
            </div>
            <button
              onClick={async () => {
                try {
                  await signOut();
                } catch (error) {
                  // Error is handled in AuthProvider
                }
              }}
              className="px-4 py-2 text-white hover:text-cyan-400 font-semibold text-sm transition-colors cursor-pointer flex items-center gap-2"
            >
              <LogOut size={16} />
              <span>Гарах</span>
            </button>
          </div>
        ) : (
          <button
            onClick={() => setShowAuthModal(true)}
            className="px-4 py-2 text-white hover:text-cyan-400 font-semibold text-sm transition-colors cursor-pointer flex items-center gap-2"
          >
            <LogIn size={16} />
            <span>Нэвтрэх</span>
          </button>
        )}
      </div>

      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="md:hidden p-2 rounded-lg hover:bg-slate-100 transition-colors"
      >
        {isOpen ? (
          <X size={24} className="text-slate-700" />
        ) : (
          <Menu size={24} className="text-slate-700" />
        )}
      </button>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden bg-slate-50 border-t border-slate-200 px-4 py-3 flex flex-col gap-2">
          {[
            { label: "Standards", icon: Home },
            { label: "Teachers", icon: Home },
            { label: "Help", icon: Home },
            { label: "Store", icon: Home },
          ].map((item) => (
            <button
              key={item.label}
              className="w-full text-left px-4 py-2 text-slate-700 hover:bg-slate-100 rounded-lg font-semibold text-sm transition-colors cursor-pointer"
            >
              {item.label}
            </button>
          ))}
          {loading ? (
            <div className="px-4 py-2 text-slate-700 text-sm">...</div>
          ) : user ? (
            <>
              <div className="px-4 py-2 text-slate-700 text-sm flex items-center gap-2">
                <User size={16} />
                <span>{user.email}</span>
              </div>
              <button
                onClick={async () => {
                  try {
                    await signOut();
                    setIsOpen(false);
                  } catch (error) {
                    // Error is handled in AuthProvider
                  }
                }}
                className="w-full text-left px-4 py-2 text-slate-700 hover:bg-slate-100 rounded-lg font-semibold text-sm transition-colors cursor-pointer flex items-center gap-2"
              >
                <LogOut size={16} />
                <span>Гарах</span>
              </button>
            </>
          ) : (
            <button
              onClick={() => {
                setShowAuthModal(true);
                setIsOpen(false);
              }}
              className="w-full text-left px-4 py-2 text-slate-700 hover:bg-slate-100 rounded-lg font-semibold text-sm transition-colors cursor-pointer flex items-center gap-2"
            >
              <LogIn size={16} />
              <span>Нэвтрэх</span>
            </button>
          )}
          <button className="w-full px-4 py-2 bg-yellow-400 text-slate-900 font-bold rounded-lg hover:bg-yellow-500 transition-colors text-sm mt-2 cursor-pointer">
            Start Your Free Trial
          </button>
        </div>
      )}

      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
      />
    </nav>
  );
};
