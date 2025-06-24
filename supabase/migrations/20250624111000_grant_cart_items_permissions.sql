GRANT SELECT, INSERT ON TABLE public.cart_items TO service_role;
GRANT SELECT ON TABLE public.cart_items TO authenticated, anon;
GRANT UPDATE ON TABLE public.cart_items TO service_role;