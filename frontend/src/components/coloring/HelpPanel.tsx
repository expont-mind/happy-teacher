import { memo } from "react";
import Image from "next/image";

interface HelpPanelProps {
  helpOpen: boolean;
  setHelpOpen: (open: boolean) => void;
  helpImage: string;
  helpVideoId?: string;
}

// Memoized to prevent re-renders when parent state changes (rerender-memo)
const HelpPanel = memo(function HelpPanel({
  helpOpen,
  setHelpOpen,
  helpImage,
  helpVideoId,
}: HelpPanelProps) {
  if (!helpOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      <div
        className="absolute inset-0 bg-black/40 cursor-pointer"
        onClick={() => setHelpOpen(false)}
      />
      <div className="bg-white rounded-2xl lg:rounded-3xl p-3 lg:p-4 shadow-2xl relative max-w-2xl lg:max-w-4xl w-full animate-fadeIn mx-4">
        <button
          onClick={() => setHelpOpen(false)}
          className="absolute top-3 right-3 rounded-full bg-pink-300 hover:bg-pink-400 text-white p-2 font-bold shadow-lg z-10 cursor-pointer"
        >
          ✖
        </button>

        {helpVideoId ? (
          <div className="aspect-video w-full">
            <iframe
              src={`https://www.youtube.com/embed/${helpVideoId}?autoplay=1`}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="w-full h-full rounded-xl"
            />
          </div>
        ) : (
          <div className="relative w-full aspect-video">
            <Image
              src={helpImage}
              alt="Help"
              fill
              className="object-contain rounded-xl"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 672px, 896px"
            />
          </div>
        )}
      </div>
    </div>
  );
});

export default HelpPanel;
