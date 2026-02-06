-- Add phone column to child_coupons table
-- Run this in Supabase SQL Editor

ALTER TABLE child_coupons
ADD COLUMN IF NOT EXISTS phone TEXT;

-- Create index for phone queries
CREATE INDEX IF NOT EXISTS idx_child_coupons_phone ON child_coupons(phone);

-- Verify the column was added
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'child_coupons' AND column_name = 'phone';
