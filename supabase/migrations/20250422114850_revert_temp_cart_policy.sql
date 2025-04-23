-- Drop the temporary permissive insert policy
DROP POLICY IF EXISTS "TEMP Allow authenticated users to insert ANY cart" ON public.carts;

-- Recreate the original, specific insert policy
-- Note: This assumes the SELECT policy and cart_items policies from 20250422114231 are still in place.
CREATE POLICY "Allow authenticated users to insert their own cart"
ON public.carts
FOR INSERT
WITH CHECK (auth.uid() = "userId");
