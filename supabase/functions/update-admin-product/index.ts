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
    global: { headers: { Authorization: authHeader! } },
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
    const {
      name, description, price, stockQuantity, categoryId, isActive, images,
      originalPrice, rating, reviewCount, sellerName, sellerLocation, unitsSold,
      isTrending, isFeatured, isNewArrival,
      imagesToDelete
    } = body;

    const updatePayload: { [key: string]: any } = {
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
      is_trending: isTrending,
      is_featured: isFeatured,
      is_new_arrival: isNewArrival,
    };

    Object.keys(updatePayload).forEach(key => {
      if (updatePayload[key] === undefined) {
        delete updatePayload[key];
      }
    });
    
    if (imagesToDelete && Array.isArray(imagesToDelete) && imagesToDelete.length > 0) {
      const pathsToRemove = imagesToDelete.map(p => p.startsWith('/') ? p.substring(1) : p).filter(p => p);
      if (pathsToRemove.length > 0) {
        console.log('Attempting to delete images from storage:', pathsToRemove);
        const { error: storageError } = await supabase.storage.from('products').remove(pathsToRemove);
        if (storageError) {
          console.error('Error deleting images from storage:', storageError);
        } else {
          console.log('Successfully deleted images from storage:', pathsToRemove);
        }
      }
    }

    const { data, error } = await supabase
      .from('products')
      .update(updatePayload)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Supabase DB update error:', error);
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
    console.error('Function error:', err);
    return new Response(JSON.stringify({ success: false, error: err.message || 'Internal server error' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});
