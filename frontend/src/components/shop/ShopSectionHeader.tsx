interface ShopSectionHeaderProps {
  icon: React.ReactNode;
  title: string;
  subtitle?: string;
}

export const ShopSectionHeader = ({
  icon,
  title,
  subtitle,
}: ShopSectionHeaderProps) => {
  return (
    <div className="flex items-center gap-3 px-2">
      <div className="w-10 h-10 rounded-xl bg-[#58CC02]/10 flex items-center justify-center text-[#58CC02]">
        {icon}
      </div>
      <div>
        <p className="text-[#4B5563] font-bold text-2xl md:text-[28px] font-nunito">
          {title}
        </p>
        {subtitle && (
          <p className="text-gray-400 font-semibold text-sm font-nunito">
            {subtitle}
          </p>
        )}
      </div>
    </div>
  );
};
