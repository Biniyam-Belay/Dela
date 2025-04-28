-- Disable RLS temporarily while making changes
ALTER TABLE public.orders DISABLE ROW LEVEL SECURITY;

-- Drop ALL existing policies on the orders table to start clean
DROP POLICY IF EXISTS "Allow ADMIN full access to orders" ON public.orders;
DROP POLICY IF EXISTS "Allow authenticated users to create their own orders" ON public.orders;
DROP POLICY IF EXISTS "Allow authenticated users to select their own orders" ON public.orders;
DROP POLICY IF EXISTS "TEMP DEBUG Allow any authenticated insert" ON public.orders; -- Remove the debug policy

-- Create the correct policies --

-- 1. Authenticated users can insert their own orders
CREATE POLICY "Allow authenticated users to create their own orders"
ON public.orders
FOR INSERT
TO authenticated
WITH CHECK (("userId" = auth.uid()));

-- 2. Authenticated users can select their own orders
CREATE POLICY "Allow authenticated users to select their own orders"
ON public.orders
FOR SELECT
TO authenticated
USING (("userId" = auth.uid()));

-- 3. ADMIN users have full access (assuming is_admin() function exists)
--    Make sure you have the is_admin() function defined, e.g., from supabase_admin_rls_policies.sql
CREATE POLICY "Allow ADMIN full access to orders"
ON public.orders
FOR ALL -- Applies to SELECT, INSERT, UPDATE, DELETE
USING ( public.is_admin() ) -- Check if the user is an admin for existing rows (SELECT, UPDATE, DELETE)
WITH CHECK ( public.is_admin() ); -- Check if the user is an admin for new/modified rows (INSERT, UPDATE)

-- Re-enable RLS
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
