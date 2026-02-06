import { createClient } from "@/src/utils/supabase/client";
import { PickupLocation } from "@/src/types";

export interface DeliveryZoneDB {
  id: string;
  name: string;
  description: string | null;
  sort_order: number;
  is_active: boolean;
  created_at: string;
  delivery_locations?: DeliveryLocationDB[];
}

export interface DeliveryLocationDB {
  id: string;
  zone_id: string;
  name: string;
  fee: number;
  description: string | null;
  sort_order: number;
  is_active: boolean;
  created_at: string;
}

export interface CountrysideProvinceDB {
  id: string;
  code: string;
  name: string;
  fee: number;
  sort_order: number;
  is_active: boolean;
  created_at: string;
}

export interface DeliveryConfigDB {
  zones: DeliveryZoneDB[];
  pickupLocations: PickupLocation[];
  countryside: CountrysideProvinceDB[];
}

export async function getDeliveryConfig(): Promise<DeliveryConfigDB> {
  const supabase = createClient();

  const [zonesRes, pickupRes, provincesRes] = await Promise.all([
    supabase
      .from("delivery_zones")
      .select("*, delivery_locations(*)")
      .eq("is_active", true)
      .order("sort_order"),
    supabase
      .from("pickup_locations")
      .select("*")
      .eq("is_active", true)
      .order("sort_order"),
    supabase
      .from("countryside_provinces")
      .select("*")
      .eq("is_active", true)
      .order("sort_order"),
  ]);

  return {
    zones: (zonesRes.data as DeliveryZoneDB[]) || [],
    pickupLocations: (pickupRes.data as PickupLocation[]) || [],
    countryside: (provincesRes.data as CountrysideProvinceDB[]) || [],
  };
}

export async function getPickupLocations(): Promise<PickupLocation[]> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("pickup_locations")
    .select("*")
    .eq("is_active", true)
    .order("sort_order");

  if (error) {
    console.error("Error fetching pickup locations:", error);
    return [];
  }

  return (data as PickupLocation[]) || [];
}
