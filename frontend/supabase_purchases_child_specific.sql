-- Migration: Make purchases child-specific
-- This ensures that all purchases are tied to specific children

-- Step 1: Check if there are any purchases with null child_id
-- SELECT COUNT(*) FROM purchases WHERE child_id IS NULL;

-- Step 2: If you want to delete old null child_id purchases (optional)
-- DELETE FROM purchases WHERE child_id IS NULL;

-- Step 3: Add NOT NULL constraint to child_id column
-- This will prevent future purchases without a child_id
ALTER TABLE purchases 
ALTER COLUMN child_id SET NOT NULL;

-- Step 4: Update the unique constraint if it exists
-- First, drop the old constraint if it exists
-- ALTER TABLE purchases DROP CONSTRAINT IF EXISTS purchases_user_topic_unique;

-- Then create a new unique constraint that includes child_id
-- This prevents duplicate purchases for the same child
ALTER TABLE purchases 
DROP CONSTRAINT IF EXISTS purchases_user_id_topic_key_key,
ADD CONSTRAINT purchases_user_child_topic_unique 
UNIQUE (user_id, child_id, topic_key);

-- Note: Run this migration in Supabase SQL Editor
-- Make sure to backup your data before running this migration
