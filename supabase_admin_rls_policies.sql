-- Helper function to check if the user has the ADMIN role from JWT app_metadata
-- Adjust 'user_role' if you used a different key in the metadata
CREATE OR REPLACE FUNCTION is_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER -- Allows checking JWT claims securely
SET search_path = public
AS $$
  SELECT (auth.jwt() ->> 'app_metadata')::jsonb ->> 'user_role' = 'ADMIN';
$$;

-- ----------------------------------------
-- Policies for 'products' table
-- ----------------------------------------
-- Ensure RLS is enabled: ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- Allow admins to do anything with products
CREATE POLICY "Allow ADMIN full access to products"
ON public.products
FOR ALL -- Covers SELECT, INSERT, UPDATE, DELETE
USING ( is_admin() )
WITH CHECK ( is_admin() );

-- Keep existing public read policy (if needed)
-- Ensure it runs AFTER the admin policy (or combine logic if necessary)
-- CREATE POLICY "Allow public read access to products" ON public.products FOR SELECT USING (true);


-- ----------------------------------------
-- Policies for 'categories' table
-- ----------------------------------------
-- Ensure RLS is enabled: ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

-- Allow public read access to categories
CREATE POLICY "Allow public read access to categories"
ON public.categories
FOR SELECT
USING (true);

-- Allow ADMIN full access to categories
CREATE POLICY "Allow ADMIN full access to categories"
ON public.categories
FOR INSERT, UPDATE, DELETE
USING ( is_admin() )
WITH CHECK ( is_admin() );

-- Add similar policies for other tables admins need to manage (e.g., orders)

