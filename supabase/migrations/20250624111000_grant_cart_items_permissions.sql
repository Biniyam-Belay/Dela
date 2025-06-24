GRANT SELECT, INSERT, UPDATE ON TABLE public.cart_items TO service_role;
GRANT SELECT ON TABLE public.cart_items TO authenticated, anon;
