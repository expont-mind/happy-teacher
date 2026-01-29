export interface OrderDataTableProps {
  data: any[];
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
  order: any;
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
