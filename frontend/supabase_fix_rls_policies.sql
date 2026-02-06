-- Fix RLS Policies for Delivery Tables
-- Run this if you already created the tables with restrictive policies

-- Drop old policies
DROP POLICY IF EXISTS "Public read delivery_zones" ON delivery_zones;
DROP POLICY IF EXISTS "Auth write delivery_zones" ON delivery_zones;
DROP POLICY IF EXISTS "Public read delivery_locations" ON delivery_locations;
DROP POLICY IF EXISTS "Auth write delivery_locations" ON delivery_locations;
DROP POLICY IF EXISTS "Public read pickup_locations" ON pickup_locations;
DROP POLICY IF EXISTS "Auth write pickup_locations" ON pickup_locations;
DROP POLICY IF EXISTS "Public read countryside_provinces" ON countryside_provinces;
DROP POLICY IF EXISTS "Auth write countryside_provinces" ON countryside_provinces;

-- Create new permissive policies
CREATE POLICY "Public full access delivery_zones" ON delivery_zones
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Public full access delivery_locations" ON delivery_locations
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Public full access pickup_locations" ON pickup_locations
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Public full access countryside_provinces" ON countryside_provinces
  FOR ALL USING (true) WITH CHECK (true);
