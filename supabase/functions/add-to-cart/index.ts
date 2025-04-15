// Setup type definitions for built-in Supabase Runtime APIs
/// <reference types="https://esm.sh/@supabase/functions-js/src/edge-runtime.d.ts" />

import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient, SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders } from '../_shared/cors.ts';
// Remove deno.land/std/uuid import - it was causing the CORS issue
// import { generate as uuidv4Generate } from "https://deno.land/std@0.224.0/uuid/v4.ts";

console.log("Add-to-cart function script loaded (Final Version).");

serve(async (req) => {
  // Handle OPTIONS request - Revert to using imported headers
  if (req.method === 'OPTIONS') {
    console.log("Handling OPTIONS preflight request (Final Version).");
    return new Response('ok', {
      status: 200,
      headers: corsHeaders // Use imported headers
    });
  }

  // Wrap remaining logic in try...catch
  try {
    console.log(`Received request: ${req.method} ${req.url}`);

    // --- Auth Section ---
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      console.error("Missing Authorization header.");
      return new Response(JSON.stringify({ success: false, error: 'Missing Authorization header' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 401,
      });
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const supabase: SupabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
      db: { schema: 'public' }
    });

    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      console.error("Authentication failed:", userError?.message || "User not found.");
      return new Response(JSON.stringify({ success: false, error: 'Authentication failed' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 401,
      });
    }
    const userId = user.id;
    console.log(`Authenticated user: ${userId}`);
    // --- End Auth Section ---

    // --- Body Parsing Section ---
    let body;
    try {
      body = await req.json();
    } catch (e) {
      console.error("Failed to parse JSON body:", e.message);
      return new Response(JSON.stringify({ success: false, error: 'Invalid JSON body' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      });
    }
    const { productId, quantity } = body;
    if (!productId || typeof quantity !== 'number' || quantity <= 0) {
      console.error("Invalid input:", body);
      return new Response(JSON.stringify({ success: false, error: 'Invalid input: productId and positive quantity required' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      });
    }
    console.log(`Request details - Product ID: ${productId}, Quantity: ${quantity}`);
    // --- End Body Parsing Section ---

    // --- Database Operations ---
    try {
      // 1. Check if product exists
      console.log(`Checking existence for product ID: ${productId}`);
      const { data: product, error: productError } = await supabase
        .from('products')
        .select('id, name, price, images, slug')
        .eq('id', productId)
        .single();

      if (productError || !product) {
        console.error(`Product not found or error fetching product ${productId}:`, productError?.message);
        return new Response(JSON.stringify({ success: false, error: productError?.message || 'Product not found' }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 404,
        });
      }
      console.log(`Product ${productId} found.`);

      // 2. Find or create cart
      console.log(`Finding or creating cart for user: ${userId}`);
      let { data: cart, error: cartError } = await supabase
        .from('carts')
        .select('id')
        .eq('userId', userId)
        .maybeSingle();

      if (cartError) {
        console.error(`Error finding cart for user ${userId}:`, cartError);
        return new Response(JSON.stringify({ success: false, error: `Error finding cart: ${cartError.message}` }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 500,
        });
      }

      if (!cart) {
        console.log(`No cart found for user ${userId}, creating new one.`);
        // Use crypto.randomUUID() instead of deno.land/std
        const newCartId = crypto.randomUUID();
        console.log(`Generated new cart ID: ${newCartId}`);
        const { data: newCart, error: newCartError } = await supabase
          .from('carts')
          .insert({ id: newCartId, userId: userId, updatedAt: new Date().toISOString() })
          .select('id')
          .single();

        if (newCartError || !newCart) {
          console.error(`Failed to create cart for user ${userId}:`, newCartError);
          return new Response(JSON.stringify({ success: false, error: `Failed to create cart: ${newCartError?.message || 'Unknown error'}` }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 500,
          });
        }
        cart = newCart;
        console.log(`Created new cart with ID: ${cart.id} for user ${userId}`);
      } else {
        console.log(`Found existing cart with ID: ${cart.id} for user ${userId}`);
      }

      // 3. Upsert cart_items
      console.log(`Upserting item for cart ID: ${cart.id}, product ID: ${productId}`);
      const { data: cartItem, error: cartItemError } = await supabase
        .from('cart_items')
        .upsert({
          cartId: cart.id,
          productId: product.id,
          quantity,
          updatedAt: new Date().toISOString(),
        }, { onConflict: 'cartId,productId' })
        .select()
        .single();

      if (cartItemError) {
        console.error(`Error upserting cart item for cart ${cart.id}, product ${productId}:`, cartItemError);
        return new Response(JSON.stringify({ success: false, error: `Error updating cart item: ${cartItemError.message}` }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 500,
        });
      }
      console.log(`Successfully upserted cart item. Cart Item ID: ${cartItem.id}`);

      // 4. Fetch updated cart with items and product details
      console.log(`Fetching updated cart details for cart ID: ${cart.id}`);
      const { data: updatedCart, error: updatedCartError } = await supabase
        .from('carts')
        .select(`
          id,
          userId,
          cart_items(
            id,
            quantity,
            product:products(
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
        console.error(`Error fetching updated cart details for cart ${cart.id}:`, updatedCartError);
        return new Response(JSON.stringify({ success: false, error: `Error fetching updated cart: ${updatedCartError.message}` }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 500,
        });
      }
      console.log(`Successfully fetched updated cart details for cart ${cart.id}`);

      // 5. Return cart in frontend format
      const items = (updatedCart.cart_items || [])
        .filter(item => item && item.product) // Ensure item and nested product exist
        .map(item => ({
          product: item.product,
          quantity: item.quantity
        }));

      console.log(`Returning updated cart with ${items.length} items.`);
      return new Response(JSON.stringify({ items }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });

    } catch (dbErr) {
      console.error(`Database/Processing error in add-to-cart function for user ${userId}:`, dbErr);
      return new Response(JSON.stringify({ success: false, error: 'Internal server error during processing' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      });
    }
    // --- End Database Operations ---

  } catch (err) {
    console.error(`Unexpected error during initial setup in add-to-cart function:`, err);
    return new Response(JSON.stringify({ success: false, error: 'Internal server error during setup' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});
