import { PriceDetailProps } from ".";
import { formatPrice } from "../functions";

export const PriceDetail = ({ item }: PriceDetailProps) => {
  const quantity = Number(item?.quantity) || 0;

  const unitPrice = item?.product?.discountPrice
    ? Number(item.product.discountPrice)
    : Number(item?.product?.price ?? 0);

  const total = unitPrice * quantity;

  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 w-full">
          <p className="text-black text-sm font-medium max-w-[300px] w-full truncate whitespace-nowrap overflow-hidden">
            {item?.product?.name}
          </p>
          <p className="text-black text-sm font-medium">x{item?.quantity}</p>
        </div>
        <p className="text-black text-sm font-medium">{formatPrice(total)}</p>
      </div>
    </div>
  );
};
