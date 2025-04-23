-- Enable RLS for carts and cart_items tables
ALTER TABLE public.carts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cart_items ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (optional, but good practice)
DROP POLICY IF EXISTS "Allow authenticated users to select their own cart" ON public.carts;
DROP POLICY IF EXISTS "Allow authenticated users to insert their own cart" ON public.carts;
DROP POLICY IF EXISTS "Allow authenticated users to manage items in their own cart" ON public.cart_items;

-- Policy: Allow authenticated users to select their own cart
CREATE POLICY "Allow authenticated users to select their own cart"
ON public.carts
FOR SELECT
USING (auth.uid() = "userId");

-- Policy: Allow authenticated users to insert their own cart
CREATE POLICY "Allow authenticated users to insert their own cart"
ON public.carts
FOR INSERT
WITH CHECK (auth.uid() = "userId");

-- Policy: Allow authenticated users to manage items in their own cart
-- This covers SELECT, INSERT, UPDATE, DELETE for cart items
CREATE POLICY "Allow authenticated users to manage items in their own cart"
ON public.cart_items
FOR ALL -- Covers SELECT, INSERT, UPDATE, DELETE
USING (
    -- Check if the cart_item's cartId belongs to a cart owned by the current user
    EXISTS (
        SELECT 1
        FROM public.carts
        WHERE carts.id = cart_items."cartId" AND carts."userId" = auth.uid()
    )
)
WITH CHECK (
    -- Ensure inserts/updates also link to a cart owned by the current user
    EXISTS (
        SELECT 1
        FROM public.carts
        WHERE carts.id = cart_items."cartId" AND carts."userId" = auth.uid()
    )
);
