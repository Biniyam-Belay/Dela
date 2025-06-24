ALTER TABLE public.cart_items
ADD COLUMN collection_id UUID NULL,
ADD CONSTRAINT fk_collection
  FOREIGN KEY(collection_id)
  REFERENCES public.collections(id)
  ON DELETE SET NULL;
