import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { corsHeaders } from "../_shared/cors.ts"
import { createSupabaseClient } from "../_shared/supabaseClient.ts"

console.log("get-wishlist function started");

serve(async (req) => {
  // Handle CORS preflight request
  if (req.method === 'OPTIONS') {
    return new Response("ok", {
      headers: {
        ...corsHeaders,
        'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
        'Access-Control-Allow-Headers': 'authorization, content-type, x-client-info, apikey',
        'Access-Control-Allow-Origin': '*',
      },
    });
  }

  try {
    const supabase = createSupabaseClient(req);
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      console.error("User fetch error:", userError);
      return new Response(JSON.stringify({ error: 'User not authenticated' }), {
        headers: {
          ...corsHeaders,
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json',
        },
        status: 401,
      });
    }

    console.log('User in get-wishlist:', user);
    console.log(`Fetching wishlist for user: ${user.id}`);

    const { data: wishlistItems, error: wishlistError } = await supabase
      .from('wishlist_items')
      .select(`
        id,
        product_id,
        createdAt,
        products (*)
      `)
      .eq('userId', user.id)
      .order('createdAt', { ascending: false });

    if (wishlistError) {
      console.error('Wishlist fetch error:', wishlistError);
      return new Response(JSON.stringify({ error: wishlistError.message }), {
        headers: {
          ...corsHeaders,
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json',
        },
        status: 500,
      });
    }

    console.log(`Found ${wishlistItems?.length || 0} items for user ${user.id}`);

    // Structure the response as expected by the frontend slice
    const responsePayload = { wishlist: (wishlistItems || []).map(item => ({ ...item, product: item.products })) };

    return new Response(JSON.stringify(responsePayload), {
      headers: {
        ...corsHeaders,
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json',
      },
      status: 200,
    });

  } catch (error) {
    console.error("Unexpected error in get-wishlist:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: {
        ...corsHeaders,
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json',
      },
      status: 500,
    });
  }
});
