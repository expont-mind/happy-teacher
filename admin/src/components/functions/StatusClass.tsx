export const getStatusClass = (status: string) => {
  const statusMap: Record<string, string> = {
    pending: "bg-[#F97316]",
    shipped: "bg-[#2563EB]",
    delivered: "bg-[#18BA51]",
    cancelled: "bg-[#E11D48]",
  };
  return statusMap[status];
};
