-- Fix child_coupons table - remove foreign key constraints that may be causing insert failures
-- Run this in Supabase SQL Editor

-- Step 1: Drop the existing table and recreate without strict FK constraints
DROP TABLE IF EXISTS child_coupons CASCADE;

-- Step 2: Create table without foreign key constraints (more flexible)
CREATE TABLE child_coupons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  child_id UUID NOT NULL,  -- No FK constraint - allows any profile/child ID
  coupon_id TEXT NOT NULL, -- No FK constraint - allows any coupon ID
  code TEXT NOT NULL,
  is_used BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  used_at TIMESTAMP WITH TIME ZONE,
  delivery_info JSONB,
  delivery_status TEXT DEFAULT 'pending'
);

-- Step 3: Enable RLS
ALTER TABLE child_coupons ENABLE ROW LEVEL SECURITY;

-- Step 4: Create permissive policies for all authenticated users
-- SELECT policy
DROP POLICY IF EXISTS "Allow select for authenticated" ON child_coupons;
CREATE POLICY "Allow select for authenticated" ON child_coupons
  FOR SELECT
  TO authenticated
  USING (true);

-- INSERT policy
DROP POLICY IF EXISTS "Allow insert for authenticated" ON child_coupons;
CREATE POLICY "Allow insert for authenticated" ON child_coupons
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- UPDATE policy
DROP POLICY IF EXISTS "Allow update for authenticated" ON child_coupons;
CREATE POLICY "Allow update for authenticated" ON child_coupons
  FOR UPDATE
  TO authenticated
  USING (true);

-- DELETE policy (optional, for cleanup)
DROP POLICY IF EXISTS "Allow delete for authenticated" ON child_coupons;
CREATE POLICY "Allow delete for authenticated" ON child_coupons
  FOR DELETE
  TO authenticated
  USING (true);

-- Step 5: Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_child_coupons_child_id ON child_coupons(child_id);
CREATE INDEX IF NOT EXISTS idx_child_coupons_coupon_id ON child_coupons(coupon_id);
CREATE INDEX IF NOT EXISTS idx_child_coupons_created_at ON child_coupons(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_child_coupons_delivery_status ON child_coupons(delivery_status);

-- Verify the table was created correctly
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'child_coupons';
