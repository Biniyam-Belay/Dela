GRANT SELECT, INSERT ON TABLE public.carts TO service_role;
GRANT SELECT ON TABLE public.carts TO authenticated, anon;
