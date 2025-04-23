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
    const accessToken = authHeader.split(' ')[1]; // Extract token from Bearer scheme
    const supabase: SupabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        }
      },
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
    // SECURITY: userId is always taken from the authenticated Supabase context, never from the client request.
    console.log(`[RLS DEBUG] Will insert cart with userId: ${userId}`);
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
    if (!productId || typeof quantity !== 'number') {
      console.error("Invalid input:", body);
      return new Response(JSON.stringify({ success: false, error: 'Invalid input: productId and quantity required' }), {
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
        const insertObj = { id: newCartId, userId: userId, updatedAt: new Date().toISOString() };
        console.log(`[RLS DEBUG] Insert object for cart:`, insertObj);
        const { data: newCart, error: newCartError } = await supabase
          .from('carts')
          .insert(insertObj)
          .select('id')
          .single();

        if (newCartError || !newCart) {
          // If permission denied, make it clear in the error message
          const permDenied = newCartError?.message?.includes('permission denied');
          const errorMsg = permDenied
            ? `Failed to create cart: permission denied (RLS). Check that userId matches auth.uid() and RLS policy.`
            : `Failed to create cart: ${newCartError?.message || 'Unknown error'}`;
          console.error(`Failed to create cart for user ${userId}:`, newCartError);
          return new Response(JSON.stringify({ success: false, error: errorMsg }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 500,
          });
        }
        cart = newCart;
        console.log(`Created new cart with ID: ${cart.id} for user ${userId}`);
      } else {
        console.log(`Found existing cart with ID: ${cart.id} for user ${userId}`);
      }

      // 3. Upsert or delete cart_items
      const { data: existingItem, error: existingItemError } = await supabase
        .from('cart_items')
        .select('id, quantity')
        .eq('cartId', cart.id)
        .eq('productId', product.id)
        .maybeSingle();

      if (existingItemError) {
        return new Response(JSON.stringify({ success: false, error: existingItemError.message }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 500,
        });
      }

      let newQuantity = quantity;
      if (existingItem) {
        newQuantity = existingItem.quantity + quantity;
      }

      if (newQuantity <= 0) {
        // Delete the item if the new quantity is zero or negative
        const { error: deleteError } = await supabase
          .from('cart_items')
          .delete()
          .eq('cartId', cart.id)
          .eq('productId', product.id);
        if (deleteError) {
          return new Response(JSON.stringify({ success: false, error: deleteError.message }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 500,
          });
        }
      } else {
        // Upsert (add/update) the item with the new quantity
        const { data: cartItem, error: cartItemError } = await supabase
          .from('cart_items')
          .upsert({
            cartId: cart.id,
            productId: product.id,
            quantity: newQuantity,
            updatedAt: new Date().toISOString(),
          }, { onConflict: 'cartId,productId' })
          .select()
          .single();

        if (cartItemError) {
          return new Response(JSON.stringify({ success: false, error: `Error updating cart item: ${cartItemError.message}` }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 500,
          });
        }
      }

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
