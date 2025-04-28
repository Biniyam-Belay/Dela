-- Disable RLS temporarily while making changes
ALTER TABLE public.orders DISABLE ROW LEVEL SECURITY;

-- Drop ALL existing policies on the orders table to start clean
DROP POLICY IF EXISTS "Allow ADMIN full access to orders" ON public.orders;
DROP POLICY IF EXISTS "Allow authenticated users to create their own orders" ON public.orders;
DROP POLICY IF EXISTS "Allow authenticated users to select their own orders" ON public.orders;
DROP POLICY IF EXISTS "Allow order insert" ON public.orders; -- Remove insecure public insert
DROP POLICY IF EXISTS "Allow service role full access to orders" ON public.orders; -- Supabase handles service_role implicitly
DROP POLICY IF EXISTS "Allow users to read their own orders" ON public.orders; -- Remove insecure public select

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
FOR ALL
USING ( public.is_admin() ) -- Use schema-qualified function call
WITH CHECK ( public.is_admin() );

-- Re-enable RLS
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
