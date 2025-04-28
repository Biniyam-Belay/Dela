-- Insert or update the landing image URL in the settings table

insert into settings (key, landing_image_url)
values ('landing_image', 'https://your-supabase-bucket-url/path/to/your-image.jpg')
on conflict (key) do update
set landing_image_url = excluded.landing_image_url;
