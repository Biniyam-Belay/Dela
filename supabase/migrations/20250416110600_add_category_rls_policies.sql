-- Enable Row Level Security on the categories table if not already enabled
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (optional, for a clean setup)
-- Be cautious if you have existing specific policies you want to keep.
DROP POLICY IF EXISTS "Allow admin full access" ON public.categories;
-- DROP POLICY IF EXISTS "Allow authenticated users read access" ON public.categories; -- Example if you had one
-- DROP POLICY IF EXISTS "Allow public read access" ON public.categories; -- Example if you had one

-- Create a policy granting full CRUD access (SELECT, INSERT, UPDATE, DELETE)
-- to users identified as admins.
-- *** REPLACE THE PLACEHOLDERS BELOW WITH YOUR ACTUAL TABLE/COLUMN NAMES ***
CREATE POLICY "Allow admin full access"
ON public.categories
FOR ALL
USING ( -- Condition for reading/updating/deleting existing rows
  EXISTS (
    SELECT 1
    -- VVVV-- Replace 'public.profiles' with your user table name --VVVV
    -- VVVV-- Replace 'id' with the column linking to auth.uid() --VVVV
    -- VVVV-- Replace 'role' with your role column name         --VVVV
    -- VVVV-- Replace 'admin' with the value for admin users    --VVVV
    FROM public.your_user_table_name -- E.g., public.users, public.user_profiles
    WHERE your_user_table_name.link_column = auth.uid() -- E.g., users.id = auth.uid()
      AND your_user_table_name.role_column = 'admin' -- E.g., users.role = 'admin'
    -- ^^^^-------------------------------------------------------------------------------------------------^^^^
  )
)
WITH CHECK ( -- Condition for inserting/updating rows
  EXISTS (
    SELECT 1
    -- VVVV-- Replace 'public.profiles' with your user table name --VVVV
    -- VVVV-- Replace 'id' with the column linking to auth.uid() --VVVV
    -- VVVV-- Replace 'role' with your role column name         --VVVV
    -- VVVV-- Replace 'admin' with the value for admin users    --VVVV
    FROM public.your_user_table_name -- E.g., public.users, public.user_profiles
    WHERE your_user_table_name.link_column = auth.uid() -- E.g., users.id = auth.uid()
      AND your_user_table_name.role_column = 'admin' -- E.g., users.role = 'admin'
    -- ^^^^-------------------------------------------------------------------------------------------------^^^^
  )
);

-- Optional: Add policies for non-admin read access if needed (see previous response)
-- ...
