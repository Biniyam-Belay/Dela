// Setup type definitions for built-in Supabase Runtime APIs
/// <reference types="https://esm.sh/@supabase/functions-js/src/edge-runtime.d.ts" />

import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders } from '../_shared/cors.ts';
import { v4 as uuidv4 } from "https://deno.land/std@0.224.0/uuid/mod.ts";

console.log("Add-to-cart function script loaded.");

serve(async (req) => {
  console.log(`Received request: ${req.method} ${req.url}`);

  if (req.method === 'OPTIONS') {
    console.log("Handling OPTIONS preflight request.");
    return new Response('ok', { headers: corsHeaders });
  }

  // Auth
  const authHeader = req.headers.get('Authorization');
  if (!authHeader) {
    return new Response(JSON.stringify({ success: false, error: 'Missing Authorization header' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 401,
    });
  }

  // Supabase Auth
  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
  const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    global: { headers: { Authorization: authHeader } }
  });
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) {
    return new Response(JSON.stringify({ success: false, error: 'Authentication failed' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 401,
    });
  }
  const userId = user.id;

  // Parse Request Body
  let body;
  try {
    body = await req.json();
  } catch (e) {
    return new Response(JSON.stringify({ success: false, error: 'Invalid JSON body' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    });
  }
  const { productId, quantity } = body;
  if (!productId || typeof quantity !== 'number' || quantity <= 0) {
    return new Response(JSON.stringify({ success: false, error: 'Invalid input: productId and positive quantity required' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    });
  }

  // 1. Check if product exists
  const { data: product, error: productError } = await supabase
    .from('products')
    .select('id, name, price, images, slug')
    .eq('id', productId)
    .single();
  if (productError || !product) {
    return new Response(JSON.stringify({ success: false, error: 'Product not found' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 404,
    });
  }

  // 2. Find or create cart
  let { data: cart, error: cartError } = await supabase
    .from('carts')
    .select('id')
    .eq('userId', userId)
    .single();
  if (cartError && cartError.code !== 'PGRST116') { // Not just 'no rows'
    return new Response(JSON.stringify({ success: false, error: cartError.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
  if (!cart) {
    // Create cart
    const newCartId = uuidv4.generate();
    const { data: newCart, error: newCartError } = await supabase
      .from('carts')
      .insert({ id: newCartId, userId })
      .select('id')
      .single();
    if (newCartError || !newCart) {
      return new Response(JSON.stringify({ success: false, error: 'Failed to create cart' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      });
    }
    cart = newCart;
  }

  // 3. Upsert cart_items
  const { data: cartItem, error: cartItemError } = await supabase
    .from('cart_items')
    .upsert({
      cartId: cart.id,
      productId: product.id,
      quantity,
      updatedAt: new Date().toISOString(),
      // createdAt will be set by default if new
    }, { onConflict: 'cartId,productId' })
    .select()
    .single();
  if (cartItemError) {
    return new Response(JSON.stringify({ success: false, error: cartItemError.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }

  // 4. Fetch updated cart with items and product details
  const { data: updatedCart, error: updatedCartError } = await supabase
    .from('carts')
    .select(`
      id,
      userId,
      cart_items(
        id,
        quantity,
        product:productId(
          id,
          name,
          price,
          images,
          slug
        )
      )
    `)
    .eq('id', cart.id)
    .single();
  if (updatedCartError) {
    return new Response(JSON.stringify({ success: false, error: updatedCartError.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }

  // 5. Return cart in frontend format
  const items = (updatedCart.cart_items || []).map(item => ({
    product: item.product,
    quantity: item.quantity
  }));
  return new Response(JSON.stringify({ items }), {
    status: 200,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
});
