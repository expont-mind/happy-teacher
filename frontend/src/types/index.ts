export interface Coupon {
  id: string;
  title: string;
  description: string;
  cost: number;
  price: number;
  image: string;
  color: string;
  codePrefix: string;
}

export interface DeliveryInfo {
  zone_id: string;
  zone_name: string;
  location_id: string;
  location_name: string;
  delivery_fee: number;
  address: string;
  phone: string;
  recipient_name: string;
  notes?: string;
}

export interface PurchasedCoupon {
  id: string;
  coupon_id: string;
  code: string;
  created_at: string;
  is_used: boolean;
  delivery_info?: DeliveryInfo;
  delivery_status?: "pending" | "processing" | "shipped" | "delivered";
}
