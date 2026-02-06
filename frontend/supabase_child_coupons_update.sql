-- Update child_coupons table to add delivery fields
-- Run this in Supabase SQL Editor

-- Add delivery_info column (JSONB for flexible delivery data)
ALTER TABLE child_coupons
ADD COLUMN IF NOT EXISTS delivery_info JSONB;

-- Add delivery_status column
ALTER TABLE child_coupons
ADD COLUMN IF NOT EXISTS delivery_status TEXT DEFAULT 'pending';

-- Add constraint for delivery_status values
ALTER TABLE child_coupons
DROP CONSTRAINT IF EXISTS child_coupons_delivery_status_check;

ALTER TABLE child_coupons
ADD CONSTRAINT child_coupons_delivery_status_check
CHECK (delivery_status IN ('pending', 'processing', 'shipped', 'delivered'));

-- Create policy for admin to view all orders (using service role or authenticated admin)
-- Option 1: Allow all authenticated users to view (for admin dashboard)
DROP POLICY IF EXISTS "Admin can view all orders" ON child_coupons;
CREATE POLICY "Admin can view all orders" ON child_coupons
  FOR SELECT
  USING (auth.role() = 'authenticated');

-- Option 2: If you want to restrict to only service role
-- DROP POLICY IF EXISTS "Service role can view all orders" ON child_coupons;
-- CREATE POLICY "Service role can view all orders" ON child_coupons
--   FOR SELECT
--   USING (auth.role() = 'service_role');

-- Allow authenticated users to insert (for purchases)
DROP POLICY IF EXISTS "Authenticated users can insert coupons" ON child_coupons;
CREATE POLICY "Authenticated users can insert coupons" ON child_coupons
  FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

-- Allow authenticated users to update (for delivery info)
DROP POLICY IF EXISTS "Authenticated users can update coupons" ON child_coupons;
CREATE POLICY "Authenticated users can update coupons" ON child_coupons
  FOR UPDATE
  USING (auth.role() = 'authenticated');

-- Create index for delivery_status queries
CREATE INDEX IF NOT EXISTS idx_child_coupons_delivery_status ON child_coupons(delivery_status);

-- If the table doesn't exist at all, create it with all columns
-- Uncomment below if you need to create the table from scratch:
/*
CREATE TABLE IF NOT EXISTS child_coupons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  child_id UUID NOT NULL,
  coupon_id TEXT NOT NULL,
  code TEXT NOT NULL,
  is_used BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  used_at TIMESTAMP WITH TIME ZONE,
  delivery_info JSONB,
  delivery_status TEXT DEFAULT 'pending' CHECK (delivery_status IN ('pending', 'processing', 'shipped', 'delivered'))
);

-- Enable RLS
ALTER TABLE child_coupons ENABLE ROW LEVEL SECURITY;

-- Allow all authenticated users to view
CREATE POLICY "Authenticated users can view orders" ON child_coupons
  FOR SELECT USING (auth.role() = 'authenticated');

-- Allow authenticated users to insert
CREATE POLICY "Authenticated users can insert orders" ON child_coupons
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Allow authenticated users to update
CREATE POLICY "Authenticated users can update orders" ON child_coupons
  FOR UPDATE USING (auth.role() = 'authenticated');

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_child_coupons_child_id ON child_coupons(child_id);
CREATE INDEX IF NOT EXISTS idx_child_coupons_created_at ON child_coupons(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_child_coupons_delivery_status ON child_coupons(delivery_status);
*/
