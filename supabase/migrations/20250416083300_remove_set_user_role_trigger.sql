-- Drop the trigger from the auth.users table
DROP TRIGGER IF EXISTS on_auth_user_created_set_role ON auth.users;

-- Drop the function
DROP FUNCTION IF EXISTS public.handle_new_user_set_role();

