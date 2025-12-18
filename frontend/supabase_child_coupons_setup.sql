-- Create child_coupons table to store purchased coupons
CREATE TABLE IF NOT EXISTS child_coupons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  child_id UUID NOT NULL REFERENCES children(id) ON DELETE CASCADE,
  coupon_id TEXT NOT NULL REFERENCES coupons(id) ON DELETE CASCADE,
  code TEXT NOT NULL,
  is_used BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  used_at TIMESTAMP WITH TIME ZONE
);

-- Enable RLS
ALTER TABLE child_coupons ENABLE ROW LEVEL SECURITY;

-- Create policy to allow users to read their own child's coupons
DROP POLICY IF EXISTS "Users can view their children's coupons" ON child_coupons;
CREATE POLICY "Users can view their children's coupons" ON child_coupons
  FOR SELECT 
  USING (
    child_id IN (
      SELECT id FROM children WHERE parent_id = auth.uid()
    )
  );

-- Create policy to allow users to insert coupons for their children
DROP POLICY IF EXISTS "Users can insert coupons for their children" ON child_coupons;
CREATE POLICY "Users can insert coupons for their children" ON child_coupons
  FOR INSERT 
  WITH CHECK (
    child_id IN (
      SELECT id FROM children WHERE parent_id = auth.uid()
    )
  );

-- Create policy to allow users to update their children's coupons
DROP POLICY IF EXISTS "Users can update their children's coupons" ON child_coupons;
CREATE POLICY "Users can update their children's coupons" ON child_coupons
  FOR UPDATE 
  USING (
    child_id IN (
      SELECT id FROM children WHERE parent_id = auth.uid()
    )
  );

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_child_coupons_child_id ON child_coupons(child_id);
CREATE INDEX IF NOT EXISTS idx_child_coupons_created_at ON child_coupons(created_at DESC);
