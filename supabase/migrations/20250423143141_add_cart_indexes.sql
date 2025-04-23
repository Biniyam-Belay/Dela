-- Index on carts.userId
CREATE INDEX IF NOT EXISTS idx_carts_user_id ON public.carts("userId"); -- Use quoted name

-- Composite index on cart_items (cartId, productId)
CREATE INDEX IF NOT EXISTS idx_cart_items_cart_product ON public.cart_items("cartId", "productId"); -- Use quoted names if needed

-- Index on cart_items.created_at for sorting
CREATE INDEX IF NOT EXISTS idx_cart_items_created_at ON public.cart_items(created_at);