import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { corsHeaders } from "../_shared/cors.ts"
import { createSupabaseClient } from "../_shared/supabaseClient.ts"

console.log("get-wishlist function started");

serve(async (req) => {
  // Handle CORS preflight request
  if (req.method === 'OPTIONS') {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabase = createSupabaseClient(req);
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      console.error("User fetch error:", userError);
      return new Response(JSON.stringify({ error: 'User not authenticated' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 401,
      });
    }

    console.log(`Fetching wishlist for user: ${user.id}`);

    // Fetch wishlist items joined with product details using snake_case columns
    const { data: wishlistItems, error: wishlistError } = await supabase
      .from('wishlist_items')
      .select(`
        id,
        product_id,
        created_at,
        products (*)
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (wishlistError) {
      console.error("Wishlist fetch error:", wishlistError);
      return new Response(JSON.stringify({ error: wishlistError.message }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      });
    }

    console.log(`Found ${wishlistItems?.length || 0} items for user ${user.id}`);

    // Structure the response as expected by the frontend slice
    const responsePayload = { wishlist: (wishlistItems || []).map(item => ({ ...item, product: item.products })) };

    return new Response(JSON.stringify(responsePayload), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    console.error("Unexpected error in get-wishlist:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});
