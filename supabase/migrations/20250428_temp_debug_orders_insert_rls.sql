-- Temporary Debugging Policy for orders INSERT
-- Allows ANY authenticated user to insert ANY order, regardless of userId.
-- REMOVE THIS POLICY AFTER DEBUGGING!

-- Disable RLS temporarily
ALTER TABLE public.orders DISABLE ROW LEVEL SECURITY;

-- Drop previous attempt if it exists
DROP POLICY IF EXISTS "TEMP DEBUG Allow any authenticated insert" ON public.orders;

-- Create the temporary permissive policy
CREATE POLICY "TEMP DEBUG Allow any authenticated insert"
ON public.orders
FOR INSERT
TO authenticated
WITH CHECK (true);

-- Re-enable RLS
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
