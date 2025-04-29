import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { corsHeaders } from "../_shared/cors.ts"
import { createSupabaseClient } from "../_shared/supabaseClient.ts"

console.log("add-to-wishlist function started");

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

    const { product_id } = await req.json();

    if (!product_id) {
      return new Response(JSON.stringify({ error: 'Missing product_id' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      });
    }

    console.log(`Adding product ${product_id} to wishlist for user: ${user.id}`);

    const { data, error } = await supabase
      .from('wishlist_items')
      .insert({ user_id: user.id, product_id: product_id })
      .select() // Optionally select the inserted item
      .single(); // Use single() if you expect only one item or handle potential duplicates

    // Handle potential unique constraint violation gracefully
    if (error && error.code === '23505') { // 23505 is the code for unique_violation
        console.log(`Product ${product_id} already in wishlist for user ${user.id}.`);
        // Return success even if it already exists, as the desired state is achieved
        return new Response(JSON.stringify({ success: true, message: 'Item already in wishlist' }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200, // Or 200 OK, as the item is indeed in the wishlist
        });
    } else if (error) {
      console.error("Wishlist add error:", error);
      return new Response(JSON.stringify({ error: error.message }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      });
    }

    console.log(`Successfully added product ${product_id} for user ${user.id}`);

    return new Response(JSON.stringify({ success: true, item: data }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 201, // 201 Created
    });

  } catch (error) {
    console.error("Unexpected error in add-to-wishlist:", error);
    // Check if the error is due to invalid JSON payload
    if (error instanceof SyntaxError) {
        return new Response(JSON.stringify({ error: "Invalid JSON payload" }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 400,
        });
    }
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});
