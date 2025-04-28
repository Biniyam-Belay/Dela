// supabase/functions/get-cart/index.ts
/// <reference types="https://esm.sh/@supabase/functions-js/src/edge-runtime.d.ts" />

import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'; // Removed SupabaseClient type import as it's not needed now
import { corsHeaders } from '../_shared/cors.ts';

console.log("Get-cart function script loaded."); // Added log

serve(async (req) => {
  console.log(`Received request: ${req.method} ${req.url}`); // Added log

  if (req.method === "OPTIONS") {
    console.log("Handling OPTIONS preflight request."); // Added log
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  // Auth
  const authHeader = req.headers.get('Authorization');
  if (!authHeader) {
    console.error("Missing Authorization header."); // Added log
    return new Response(JSON.stringify({ success: false, error: 'Missing Authorization header' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 401,
    });
  }

  // --- Reverted: Use Standard Auth Flow ---
  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
  // Create client using Anon Key and the user's Auth header
  const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    global: { headers: { Authorization: authHeader } }, // Pass user's token
    db: { schema: 'public' } // Keep explicit schema setting
  });
  // --- End Reverted ---

  // Get user using the client authenticated with the user's token
  const { data: { user }, error: userError } = await supabase.auth.getUser();

  if (userError || !user) {
    console.error("Authentication failed:", userError?.message || "User not found."); // Added log
    return new Response(JSON.stringify({ success: false, error: 'Authentication failed' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 401,
    });
  }
  console.log(`Authenticated user: ${user.id}`); // Log the user ID obtained via token

  try { // Wrap database logic in try...catch
    // Fetch cart and items directly from Supabase using the standard client
    console.log(`Executing query for user ID: ${user.id} using standard client`);

    // --- Restore Original Query ---
    const { data: cart, error: cartError } = await supabase // Use standard client
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
      .eq('userId', user.id) // Filter by the correct user ID
      .maybeSingle();
    // --- End Restore Original Query ---

    if (cartError) {
      // Log the specific database error
      console.error(`Supabase query error for user ${user.id}:`, cartError); // Log the full error object
      return new Response(JSON.stringify({ success: false, error: `Database query error: ${cartError.message}` }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500, // Keep 500 for internal server errors
      });
    }

    if (!cart) {
      console.log(`No cart found for user: ${user.id}. Returning empty cart.`); // Added log
      return new Response(JSON.stringify({ items: [] }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log(`Raw cart data fetched for user ${user.id}:`, JSON.stringify(cart, null, 2));
    console.log(`Cart found for user ${user.id}. Cart ID: ${cart.id}. Processing items...`);

    const items = (cart.cart_items || [])
      .filter(item => item && item.product)
      .map(item => ({
        product: item.product,
        quantity: item.quantity
      }));

    console.log(`Returning cart with ${items.length} valid items for user ${user.id}.`);
    return new Response(JSON.stringify({ items }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (err) {
    console.error(`Unexpected error in get-cart function for user ${user.id}:`, err);
    return new Response(JSON.stringify({ success: false, error: 'Internal server error' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});