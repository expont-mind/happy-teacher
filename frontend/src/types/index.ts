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

export interface PickupLocation {
  id: string;
  name: string;
  address: string;
  description?: string;
  is_active: boolean;
}

export interface DeliveryInfo {
  type?: "delivery" | "pickup";
  zone_id: string;
  zone_name: string;
  location_id: string;
  location_name: string;
  delivery_fee: number;
  address: string;
  phone: string;
  recipient_name: string;
  notes?: string;
  pickup_location_id?: string;
  pickup_location_name?: string;
  pickup_location_address?: string;
}

export interface PurchasedCoupon {
  id: string;
  coupon_id: string;
  code: string;
  created_at: string;
  is_used: boolean;
  delivery_info?: DeliveryInfo;
  delivery_status?: "pending" | "processing" | "shipped" | "delivered";
  purchase_type?: "xp" | "qpay";
  phone?: string;
}
