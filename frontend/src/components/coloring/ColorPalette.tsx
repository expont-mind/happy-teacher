interface ColorPaletteProps {
  colors: { color: string; label?: string }[];
  selectedColor: string;
  setSelectedColor: (c: string) => void;
}

export default function ColorPalette({
  colors,
  selectedColor,
  setSelectedColor,
}: ColorPaletteProps) {
  return (
    <div className="absolute top-1/2 -translate-y-1/2 left-4 z-50" data-tutorial="color-palette">
      <div className="flex flex-col gap-2 p-2 bg-white rounded-2xl border-2 border-slate-200 shadow-xl max-h-[80vh] overflow-y-auto hide-scrollbar">
        {colors.map(({ color, label }) => (
          <button
            key={color}
            onClick={() => setSelectedColor(color)}
            className={`group relative flex flex-col items-center gap-1 p-2 rounded-xl transition-all duration-200 ${selectedColor === color
              ? "bg-white shadow-md ring-2 ring-purple-500 scale-105"
              : "hover:bg-white/50"
              }`}
          >
            {/* Color Swatch */}
            <div
              className={`w-8 h-8 rounded-lg shadow-sm border border-black/10 transition-transform ${selectedColor === color ? "scale-100" : "group-hover:scale-110"
                }`}
              style={{ backgroundColor: color }}
            />

            {/* Label - only show if provided */}
            {label && (
              <span className={`text-base font-black min-w-8 text-center leading-none ${selectedColor === color ? "text-purple-600" : "text-slate-700"
                }`}>
                {label}
              </span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
