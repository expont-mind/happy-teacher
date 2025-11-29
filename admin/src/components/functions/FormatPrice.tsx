export const formatPrice = (price: number) => {
  return new Intl.NumberFormat("mn-MN").format(price) + "₮";
};
