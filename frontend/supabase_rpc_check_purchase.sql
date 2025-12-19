-- Create a secure function to check child purchases
-- This bypasses RLS to allow checking purchases when logged in via Code (Anonymous)

CREATE OR REPLACE FUNCTION check_child_purchase(
  p_child_id uuid,
  p_topic_key text
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER -- Run as database owner to bypass RLS
SET search_path = public -- Secure search path
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM purchases
    WHERE child_id = p_child_id
    AND topic_key = p_topic_key
  );
END;
$$;

-- Grant execute permission to anon/public role (needed for Code login)
GRANT EXECUTE ON FUNCTION check_child_purchase(uuid, text) TO anon;
GRANT EXECUTE ON FUNCTION check_child_purchase(uuid, text) TO authenticated;
GRANT EXECUTE ON FUNCTION check_child_purchase(uuid, text) TO service_role;
