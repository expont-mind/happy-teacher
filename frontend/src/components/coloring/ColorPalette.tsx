interface ColorPaletteProps {
  colors: { color: string; label?: string }[];
  selectedColor: string;
  setSelectedColor: (c: string) => void;
  isEraserMode?: boolean;
}

export default function ColorPalette({
  colors,
  selectedColor,
  setSelectedColor,
  isEraserMode,
}: ColorPaletteProps) {
  const isSelected = (color: string) => selectedColor === color && !isEraserMode;

  return (
    <div className="flex flex-col items-center h-full" data-tutorial="color-palette">
      <div className="bg-white rounded-2xl border-2 border-gray-200 shadow-xl p-4 h-full flex flex-col">
        {/* Header */}
        <h3 className="text-gray-700 font-bold text-center mb-4">Өнгө</h3>

        {/* Color buttons */}
        <div className="flex flex-col gap-2">
          {colors.map(({ color, label }) => (
            <button
              key={color}
              onClick={() => setSelectedColor(color)}
              className="flex flex-col items-center gap-1 group"
            >
              {/* Color button */}
              <div
                className={`w-14 h-14 rounded-xl shadow-md border-2 transition-all duration-200 ${
                  isSelected(color)
                    ? "ring-4 ring-purple-400 scale-110 border-transparent"
                    : "border-black/10 hover:scale-105"
                }`}
                style={{ backgroundColor: color }}
              />

              {/* Fraction label below */}
              {label && (
                <span
                  className={`text-sm font-semibold ${
                    isSelected(color) ? "text-purple-600" : "text-gray-600"
                  }`}
                >
                  {label}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
