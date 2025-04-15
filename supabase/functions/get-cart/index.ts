// supabase/functions/get-cart/index.ts
/// <reference types="https://esm.sh/@supabase/functions-js/src/edge-runtime.d.ts" />

import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders } from '../_shared/cors.ts';

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
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

  // Fetch cart and items directly from Supabase
  const { data: cart, error: cartError } = await supabase
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
    .eq('userId', user.id)
    .single();

  if (cartError && cartError.code !== 'PGRST116') { // PGRST116: No rows found
    return new Response(JSON.stringify({ success: false, error: cartError.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }

  if (!cart) {
    return new Response(JSON.stringify({ items: [] }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  // Map cart_items to items array for frontend compatibility
  const items = (cart.cart_items || []).map(item => ({
    product: item.product,
    quantity: item.quantity
  }));

  return new Response(JSON.stringify({ items }), {
    status: 200,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
});