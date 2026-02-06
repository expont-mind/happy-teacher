// Delivery Zone
export interface DeliveryZone {
  id: string;
  name: string;
  description: string | null;
  sort_order: number;
  is_active: boolean;
  created_at: string;
  location_count?: number;
}

export interface DeliveryZoneFormData {
  name: string;
  description: string;
  is_active: boolean;
}

// Delivery Location
export interface DeliveryLocation {
  id: string;
  zone_id: string;
  name: string;
  fee: number;
  description: string | null;
  sort_order: number;
  is_active: boolean;
  created_at: string;
}

export interface DeliveryLocationFormData {
  zone_id: string;
  name: string;
  fee: number;
  description: string;
  is_active: boolean;
}

// Pickup Location
export interface PickupLocation {
  id: string;
  name: string;
  address: string;
  description: string | null;
  sort_order: number;
  is_active: boolean;
  created_at: string;
}

export interface PickupLocationFormData {
  name: string;
  address: string;
  description: string;
  is_active: boolean;
}

// Countryside Province
export interface CountrysideProvince {
  id: string;
  code: string;
  name: string;
  fee: number;
  sort_order: number;
  is_active: boolean;
  created_at: string;
}

export interface CountrysideProvinceFormData {
  fee: number;
  is_active: boolean;
}
