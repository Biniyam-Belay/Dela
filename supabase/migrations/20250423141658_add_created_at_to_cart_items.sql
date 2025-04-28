-- Add created_at column to cart_items table
ALTER TABLE public.cart_items
ADD COLUMN created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL;

-- Optional: Backfill created_at for existing items using "updatedAt" as an approximation
-- This assumes "updatedAt" was close to creation time for old items. Adjust if needed.
UPDATE public.cart_items
SET created_at = "updatedAt" -- Use quoted camelCase column name
WHERE created_at IS NULL;