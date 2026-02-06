// DeliveryInfo from shop DeliveryForm
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

// Order from child_coupons table (shop orders)
export interface Order {
  id: string;
  child_id: string;
  coupon_id: string;
  code: string;
  is_used: boolean;
  created_at: string;
  phone?: string; // Phone number entered before payment
  delivery_info?: DeliveryInfo;
  delivery_status?: "pending" | "processing" | "shipped" | "delivered";
  profiles?: {
    full_name: string;
    email: string;
  };
  coupons?: {
    title: string;
    price: number;
    image: string;
  };
}

export interface OrderDataTableProps {
  data: Order[];
  loading: boolean;
}

export interface ProductUI {
  id: string;
  name: string;
  price: string;
  discountPrice?: string | null;
  stock: number;
  images: string[];
}

export interface OrderItemUI {
  quantity: number;
  size?: string | null;
  color?: string | null;
  product: ProductUI;
}

export interface OrderUI {
  id: string;
  name?: string | null;
  email?: string | null;
  phone?: string | null;
  items: OrderItemUI[];
  totalPrice?: string | null;
  status?: string | null;
  address?: {
    city?: string | null;
    district?: string | null;
    khoroo?: string | null;
    apartment?: string | null;
    detail?: string | null;
  } | null;
  createdAt?: Date | null;
  orderNumber?: string | null;
}

export interface OrderRowProps {
  order: Order;
  index: number;
}

export type OrderContentProps = {
  order: OrderUI | null;
  loading: boolean;
};

export type UserContentProps = {
  order: OrderUI | null;
  refetch: () => Promise<any>;
  loading: boolean;
};

export type ItemsProps = {
  order: OrderUI;
  item: OrderItemUI;
};

export type PriceDetailProps = {
  item: OrderItemUI;
};

export type SelectStatusProps = {
  value: string;
  onChange: (value: string) => void;
};
