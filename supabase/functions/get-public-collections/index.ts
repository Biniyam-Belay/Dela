import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders } from '../_shared/cors.ts';

console.log(`Function "get-public-collections" up and running!`);

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    const url = new URL(req.url);
    const page = parseInt(url.searchParams.get('page') || '1', 10);
    const limit = parseInt(url.searchParams.get('limit') || '20', 10);
    const searchTerm = url.searchParams.get('search');
    const sortBy = url.searchParams.get('sortBy') || 'created_at';
    const sortOrder = url.searchParams.get('sortOrder') || 'desc';
    const price_gte = url.searchParams.get('price_gte');
    const price_lte = url.searchParams.get('price_lte');

    console.log(`Function called with params: page=${page}, limit=${limit}, search=${searchTerm}, sortBy=${sortBy}, sortOrder=${sortOrder}, price_gte=${price_gte}, price_lte=${price_lte}`);

    const from = (page - 1) * limit;
    const to = from + limit - 1;

    let query = supabase
      .from('collections')
      .select(`
        id,
        name,
        description,
        price,
        cover_image_url,
        status,
        created_at,
        seller_id,
        sellers!collections_seller_id_fkey (
          store_name,
          contact_email
        )
      `, { count: 'exact' })
      .eq('status', 'active')
      .range(from, to)
      .order(sortBy, { ascending: sortOrder === 'asc' });

    if (searchTerm) {
      console.log(`Applying search term: ${searchTerm}`);
      query = query.or(`name.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`);
    }

    if (price_gte) {
      console.log(`Applying price_gte filter: ${price_gte}`);
      query = query.gte('price', parseFloat(price_gte));
    }

    if (price_lte) {
      console.log(`Applying price_lte filter: ${price_lte}`);
      query = query.lte('price', parseFloat(price_lte));
    }

    const { data: collections, error, count } = await query;

    if (error) {
      console.error('Error fetching collections:', error);
      throw error;
    }

    console.log(`Fetched ${collections?.length} collections out of ${count} total`);

    // Transform the data to include seller name
    const transformedCollections = collections?.map(collection => ({
      id: collection.id,
      name: collection.name,
      description: collection.description,
      price: collection.price,
      cover_image_url: collection.cover_image_url, // Use cover_image_url from the database
      status: collection.status,
      created_at: collection.created_at,
      seller_id: collection.seller_id,
      seller_name: collection.sellers?.store_name || 'Unknown Seller',
      seller_email: collection.sellers?.contact_email,
      product_count: 0, // We'll add this back later
      products: [] // We'll add this back later
    })) || [];

    return new Response(
      JSON.stringify({
        collections: transformedCollections,
        total: count,
        page,
        limit,
        has_more: count ? (page * limit) < count : false
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error) {
    console.error('Error in get-public-collections function:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Failed to fetch collections',
        details: error.message 
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
