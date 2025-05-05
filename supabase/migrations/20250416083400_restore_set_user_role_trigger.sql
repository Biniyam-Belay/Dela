-- Restore the trigger and function to set user_role in app_metadata on user creation
-- This will assign 'ADMIN' to admin@suriaddis.com and 'USER' to all other users

create or replace function public.handle_new_user_set_role()
returns trigger
language plpgsql
security invoker set search_path = public
as $$
declare
  user_role text;
begin
  -- Set role based on email
  if new.email = 'admin@suriaddis.com' then
    user_role := 'ADMIN';
  else
    user_role := 'USER';
  end if;

  -- Update auth.users metadata
  update auth.users
  set raw_app_meta_data = coalesce(raw_app_meta_data, '{}'::jsonb) || jsonb_build_object('user_role', user_role)
  where id = new.id;

  -- Insert into public.users table, setting updatedAt
  -- Assumes a public.users table exists with id and updatedAt columns
  insert into public.users (id, "updatedAt")
  values (new.id, now());

  return new;
end;
$$;

create or replace trigger on_auth_user_created_set_role
  after insert on auth.users
  for each row execute procedure public.handle_new_user_set_role();
