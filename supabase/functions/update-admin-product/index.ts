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
  const supabase = createClient(supabaseUrl, supabaseServiceRoleKey, {
    global: { headers: { Authorization: authHeader } },
    db: { schema: 'public' }
  });

  try {
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return new Response(JSON.stringify({ success: false, error: 'Authentication failed' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 401,
      });
    }

    const url = new URL(req.url);
    const id = url.searchParams.get('id');
    if (!id) {
      return new Response(JSON.stringify({ success: false, error: 'Missing product id' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      });
    }
    const body = await req.json();
    const { name, description, price, stockQuantity, categoryId, isActive, images, originalPrice, rating, reviewCount, sellerName, sellerLocation, unitsSold, imagesToDelete } = body;

    const { data, error } = await supabase.from('products').update({
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
    }).eq('id', id).select().single();

    if (error) {
      return new Response(JSON.stringify({ success: false, error: error.message }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      });
    }

    return new Response(JSON.stringify({ success: true, data }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (err) {
    return new Response(JSON.stringify({ success: false, error: err.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});
