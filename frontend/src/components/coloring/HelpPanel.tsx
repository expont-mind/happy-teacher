interface HelpPanelProps {
  helpOpen: boolean;
  setHelpOpen: (open: boolean) => void;
  helpImage: string;
}

export default function HelpPanel({
  helpOpen,
  setHelpOpen,
  helpImage,
}: HelpPanelProps) {
  if (!helpOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      <div
        className="absolute inset-0 bg-black/40"
        onClick={() => setHelpOpen(false)}
      />
      <div className="bg-white rounded-3xl p-4 shadow-2xl relative max-w-md w-full animate-fadeIn">
        <button
          onClick={() => setHelpOpen(false)}
          className="absolute top-3 right-3 rounded-full bg-pink-300 hover:bg-pink-400 text-white p-2 font-bold shadow-lg"
        >
          ✖
        </button>
        <img src={helpImage} alt="Help" className="w-full rounded-xl" />
      </div>
    </div>
  );
}
