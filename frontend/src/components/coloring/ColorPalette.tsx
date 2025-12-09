interface ColorPaletteProps {
  colors: string[];
  selectedColor: string;
  setSelectedColor: (c: string) => void;
}

export default function ColorPalette({
  colors,
  selectedColor,
  setSelectedColor,
}: ColorPaletteProps) {
  return (
    <div className="absolute top-1/2 -translate-y-1/2 left-4" data-tutorial="color-palette">
      <div className="flex flex-col gap-2">
        {colors.map((c) => (
          <button
            key={c}
            onClick={() => setSelectedColor(c)}
            className={`w-[56px] h-[56px] rounded-xl transform transition-transform cursor-pointer ${
              selectedColor === c
                ? "ring-4 ring-yellow-400 scale-125"
                : "hover:scale-110"
            }`}
            style={{ backgroundColor: c }}
          />
        ))}
      </div>
    </div>
  );
}
