import { Heart, Palette } from "lucide-react";

export const Footer = () => {
  return (
    <footer className="w-full bg-slate-900 text-slate-100 p-12 border-t-4 border-slate-700">
      <div className="flex flex-col gap-8">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand */}
          <div className="text-center md:text-left">
            <div className="flex items-center gap-2 justify-center md:justify-start mb-4">
              <Palette size={40} className="text-cyan-400" />
              <h3 className="text-2xl font-black text-white">LearniKids</h3>
            </div>
            <p className="text-slate-300 font-semibold">
              Making learning fun, one lesson at a time!
            </p>
          </div>

          {/* Quick Links */}
          <div className="text-center">
            <h4 className="text-lg font-black mb-4 text-white">Quick Links</h4>
            <div className="flex flex-col gap-2">
              <button className="hover:text-cyan-400 transition-colors font-semibold text-slate-300">
                About Us
              </button>
              <button className="hover:text-cyan-400 transition-colors font-semibold text-slate-300">
                Lessons
              </button>
              <button className="hover:text-cyan-400 transition-colors font-semibold text-slate-300">
                Contact
              </button>
            </div>
          </div>

          {/* Parent Info */}
          <div className="text-center">
            <h4 className="text-lg font-black mb-4 text-white">For Parents</h4>
            <div className="flex flex-col gap-2">
              <button className="hover:text-cyan-400 transition-colors font-semibold text-slate-300">
                Progress Tracking
              </button>
              <button className="hover:text-cyan-400 transition-colors font-semibold text-slate-300">
                Safety & Privacy
              </button>
              <button className="hover:text-cyan-400 transition-colors font-semibold text-slate-300">
                Support
              </button>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="w-full h-px bg-slate-700 rounded-full"></div>

        {/* Bottom Footer */}
        <div className="flex justify-between items-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <p className="text-slate-300 font-bold">
              © 2025 LearniKids. All rights reserved.
            </p>
          </div>
          <p className="text-sm text-slate-400 flex items-center justify-center gap-1">
            Designed with <Heart size={16} className="text-cyan-400" /> for
            curious young learners everywhere!
          </p>
        </div>
      </div>
    </footer>
  );
};
