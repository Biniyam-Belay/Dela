import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { corsHeaders } from '../_shared/cors.ts';
import { supabaseAdmin } from '../_shared/supabaseAdmin.ts';

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { collectionId, quantity } = await req.json();
    const authHeader = req.headers.get('Authorization');
    
    if (!authHeader) {
      throw new Error('Missing authorization header');
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabaseAdmin.auth.getUser(token);

    if (userError) {
      console.error('User fetch error:', userError);
      throw new Error('Failed to get user');
    }

    const { data: products, error: productsError } = await supabaseAdmin
      .from('collection_items')
      .select('product_id')
      .eq('collection_id', collectionId);

    if (productsError) {
      console.error('Error fetching collection products:', productsError);
      throw new Error(`Failed to get collection products: ${productsError.message}`);
    }

    if (!products || products.length === 0) {
      return new Response(JSON.stringify({ cart: { items: [] } }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      });
    }

    // Get or create the user's cart
    let cartId;
    const { data: cart, error: cartError } = await supabaseAdmin
      .from('carts')
      .select('id')
      .eq('userId', user.id)
      .maybeSingle();
    if (cartError) {
      throw new Error(`Failed to get user's cart: ${cartError.message}`);
    }
    if (cart) {
      cartId = cart.id;
    } else {
      // Create a new cart for the user
      const { data: newCart, error: createCartError } = await supabaseAdmin
        .from('carts')
        .insert({ userId: user.id })
        .select('id')
        .maybeSingle();
      if (createCartError) {
        throw new Error(`Failed to create cart: ${createCartError.message}`);
      }
      cartId = newCart.id;
    }

    // Upsert cart items using correct column names
    const cartItems = products.map(p => ({
      cartId: cartId,
      productId: p.product_id,
      quantity: quantity,
      collection_id: collectionId
    }));

    const { data, error } = await supabaseAdmin
      .from('cart_items')
      .upsert(cartItems, { onConflict: 'cartId,productId' })
      .select();

    if (error) {
      console.error('Insert error:', error);
      throw new Error(`Failed to add collection to cart: ${error.message}`);
    }

    // After inserting, fetch the entire cart to return the updated state
    const { data: updatedCart, error: fetchCartError } = await supabaseAdmin
      .from('cart_items')
      .select('*, products(*)')
      .eq('cartId', cartId);

    if (fetchCartError) {
      console.error('Error fetching updated cart:', fetchCartError);
      throw new Error(`Failed to fetch updated cart: ${fetchCartError.message}`);
    }

    // Map 'products' to 'product' for frontend compatibility
    const items = (updatedCart || []).map(item => ({
      ...item,
      product: item.products,
      products: undefined // Remove the 'products' property
    }));

    return new Response(JSON.stringify({ items }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    });
  }
});
