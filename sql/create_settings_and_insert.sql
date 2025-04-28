-- Create the settings table if it does not exist, then insert the landing image URL

create table if not exists settings (
  key text primary key,
  landing_image_url text
);

insert into settings (key, landing_image_url)
values ('landing_image', 'https://your-supabase-bucket-url/path/to/your-image.jpg');
