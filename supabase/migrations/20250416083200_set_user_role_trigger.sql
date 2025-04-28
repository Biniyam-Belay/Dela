-- Function to handle setting the role in app_metadata
create or replace function public.handle_new_user_set_role()
returns trigger
language plpgsql
security definer set search_path = public
as $$
declare
  user_role text;
begin
  -- Check if the new user's email is the admin email
  if new.email = 'admin@suriaddis.com' then
    user_role := 'ADMIN';
  else
    user_role := 'USER'; -- Assign 'USER' role to others
  end if;

  -- Update the raw_app_meta_data field
  -- Merge the new role with existing app_metadata (like provider info)
  update auth.users
  set raw_app_meta_data = coalesce(raw_app_meta_data, '{}'::jsonb) || jsonb_build_object('user_role', user_role)
  where id = new.id;

  return new;
end;
$$;

-- Trigger to call the function after a new user is inserted in auth.users
-- Use CREATE OR REPLACE TRIGGER to avoid errors if it already exists from a partial run
create or replace trigger on_auth_user_created_set_role
  after insert on auth.users
  for each row execute procedure public.handle_new_user_set_role();

