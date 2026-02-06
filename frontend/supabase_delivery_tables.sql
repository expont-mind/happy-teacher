-- Delivery System Tables for Happy Teacher
-- Run this in Supabase SQL Editor

-- =====================================================
-- 1. DELIVERY ZONES TABLE (6 UB zones)
-- =====================================================
CREATE TABLE IF NOT EXISTS delivery_zones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 2. DELIVERY LOCATIONS TABLE (nested under zones)
-- =====================================================
CREATE TABLE IF NOT EXISTS delivery_locations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  zone_id UUID NOT NULL REFERENCES delivery_zones(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  fee INTEGER NOT NULL DEFAULT 0,
  description TEXT,
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for faster zone lookup
CREATE INDEX IF NOT EXISTS idx_delivery_locations_zone_id ON delivery_locations(zone_id);

-- =====================================================
-- 3. PICKUP LOCATIONS TABLE (for "Очиж авах" option)
-- =====================================================
CREATE TABLE IF NOT EXISTS pickup_locations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  address TEXT NOT NULL,
  description TEXT,
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 4. COUNTRYSIDE PROVINCES TABLE (21 aimags)
-- =====================================================
CREATE TABLE IF NOT EXISTS countryside_provinces (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  fee INTEGER NOT NULL DEFAULT 25000,
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- ROW LEVEL SECURITY (RLS)
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE delivery_zones ENABLE ROW LEVEL SECURITY;
ALTER TABLE delivery_locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE pickup_locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE countryside_provinces ENABLE ROW LEVEL SECURITY;

-- Public full access for all tables (for development)
-- NOTE: In production, restrict INSERT/UPDATE/DELETE to authenticated admin users

CREATE POLICY "Public full access delivery_zones" ON delivery_zones
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Public full access delivery_locations" ON delivery_locations
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Public full access pickup_locations" ON pickup_locations
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Public full access countryside_provinces" ON countryside_provinces
  FOR ALL USING (true) WITH CHECK (true);
