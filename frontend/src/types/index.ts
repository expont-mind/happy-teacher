export interface Coupon {
  id: string;
  title: string;
  description: string;
  cost: number;
  image: string;
  color: string;
  codePrefix: string;
}

export interface PurchasedCoupon {
  id: string;
  coupon_id: string;
  code: string;
  created_at: string;
  is_used: boolean;
}
