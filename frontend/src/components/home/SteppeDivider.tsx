interface SteppeDividerProps {
  topColor: string;
  bottomColor: string;
  className?: string;
}

export const SteppeDivider = ({
  topColor,
  bottomColor,
  className = "",
}: SteppeDividerProps) => {
  return (
    <div
      className={`w-full overflow-hidden leading-[0] ${className}`}
      style={{ backgroundColor: topColor }}
    >
      <svg
        viewBox="0 0 1440 80"
        preserveAspectRatio="none"
        className="w-full h-[40px] md:h-[60px] lg:h-[80px] block"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M0,40 C240,80 480,0 720,40 C960,80 1200,0 1440,40 L1440,80 L0,80 Z"
          fill={bottomColor}
        />
      </svg>
    </div>
  );
};
