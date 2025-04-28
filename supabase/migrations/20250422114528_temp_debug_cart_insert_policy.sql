-- Drop the previous specific insert policy
DROP POLICY IF EXISTS "Allow authenticated users to insert their own cart" ON public.carts;

-- Add a temporary, more permissive insert policy for debugging
-- Allows any authenticated user to insert into carts
CREATE POLICY "TEMP Allow authenticated users to insert ANY cart"
ON public.carts
FOR INSERT
TO authenticated -- Applies only to logged-in users
WITH CHECK (true); -- Allows the insert regardless of column values

-- Note: The SELECT policy and policies for cart_items remain from the previous migration.
