import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders } from '../_shared/cors.ts';

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  const authHeader = req.headers.get('Authorization');
  if (!authHeader) {
    return new Response(JSON.stringify({ success: false, error: 'Missing Authorization header' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 401,
    });
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  const supabaseServiceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

  // Client for authentication check (uses user's token)
  const supabaseUserClient = createClient(supabaseUrl, supabaseServiceRoleKey, {
    global: { headers: { Authorization: authHeader } },
    db: { schema: 'public' }
  });

  // Client for database operations (uses service role key ONLY, bypasses RLS)
  const supabaseAdminClient = createClient(supabaseUrl, supabaseServiceRoleKey);

  try {
    // 1. Verify the user is authenticated (needed to get user context for the SQL function)
    const { data: { user }, error: userError } = await supabaseUserClient.auth.getUser();
    if (userError || !user) {
      return new Response(JSON.stringify({ success: false, error: 'Authentication failed' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 401,
      });
    }

    // 2. AUTHORIZATION CHECK: Call the is_admin() SQL function
    const { data: isAdmin, error: rpcError } = await supabaseUserClient.rpc('is_admin');

    if (rpcError) {
        console.error('Error calling is_admin function:', rpcError);
        return new Response(JSON.stringify({ success: false, error: 'Error checking user permissions.' }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 500, // Internal Server Error because the RPC failed
        });
    }

    if (isAdmin !== true) { // Check if the function returned true
      console.warn(`User ${user.id} failed is_admin() check.`);
      return new Response(JSON.stringify({ success: false, error: 'Forbidden: Admin role required.' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 403, // Use 403 Forbidden status code
      });
    }

    // 3. Proceed with product creation if authorized
    const body = await req.json();
    console.log("Received body in function:", JSON.stringify(body, null, 2)); // Log received body

    const {
      name,
      description,
      price,
      stockQuantity,
      categoryId,
      isActive,
      images,
      originalPrice,
      rating,
      reviewCount,
      sellerName,
      sellerLocation,
      unitsSold,
      slug // Extract slug from body
    } = body;

    if (!slug || typeof slug !== 'string' || !slug.trim()) {
      console.error("Slug is missing or invalid in request body:", slug);
      return new Response(JSON.stringify({ success: false, error: 'Slug is required and must be a non-empty string.' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      });
    }
    console.log("Extracted slug:", slug);

    // 4. Perform the insert using the admin client (bypasses RLS)
    const { data, error } = await supabaseAdminClient.from('products').insert([
      {
        name,
        description,
        price,
        stock_quantity: stockQuantity,
        category_id: categoryId,
        is_active: isActive,
        images,
        original_price: originalPrice,
        rating,
        review_count: reviewCount,
        seller_name: sellerName,
        seller_location: sellerLocation,
        units_sold: unitsSold,
        slug: slug // Ensure slug is included in the insert object
      }
    ]).select().single();

    if (error) {
      console.error("Database insert error:", error);
      return new Response(JSON.stringify({ success: false, error: error.message }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      });
    }

    return new Response(JSON.stringify({ success: true, data }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 201,
    });
  } catch (err) {
    console.error("Function error:", err);
    return new Response(JSON.stringify({ success: false, error: err.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});
