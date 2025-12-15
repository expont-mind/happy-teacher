-- Create pending_invoices table for storing invoice mappings during payment flow
CREATE TABLE IF NOT EXISTS pending_invoices (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    transaction_id TEXT NOT NULL UNIQUE,
    invoice_id TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '24 hours')
);

-- Index for faster lookups by transaction_id
CREATE INDEX IF NOT EXISTS idx_pending_invoices_transaction_id ON pending_invoices(transaction_id);

-- Index for cleanup of expired invoices
CREATE INDEX IF NOT EXISTS idx_pending_invoices_expires_at ON pending_invoices(expires_at);

-- Enable RLS (but we'll make it permissive for API routes)
ALTER TABLE pending_invoices ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Service role can manage pending_invoices" ON pending_invoices;
DROP POLICY IF EXISTS "Allow all for pending_invoices" ON pending_invoices;

-- Create permissive policy that allows all operations
-- This is safe because this table only stores temporary invoice mappings
CREATE POLICY "Allow all for pending_invoices" ON pending_invoices
    FOR ALL
    USING (true)
    WITH CHECK (true);

-- Grant permissions to authenticated and anon roles (for API routes)
GRANT ALL ON pending_invoices TO authenticated;
GRANT ALL ON pending_invoices TO anon;
GRANT ALL ON pending_invoices TO service_role;

-- Optional: Create a function to clean up expired pending invoices (can be called via cron)
CREATE OR REPLACE FUNCTION cleanup_expired_pending_invoices()
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM pending_invoices WHERE expires_at < NOW();
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
