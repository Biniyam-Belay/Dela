import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders } from '../_shared/cors.ts';

console.log(`Function "get-public-products" up and running!`);

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
    const limit = parseInt(url.searchParams.get('limit') || '12', 10);
    const categorySlug = url.searchParams.get('category'); // Assuming category is passed as slug
    const searchTerm = url.searchParams.get('search');
    const sortBy = url.searchParams.get('sortBy') || 'name'; // Use 'name' as the default sort column (temporary fix)
    const sortOrder = url.searchParams.get('sortOrder') || 'asc'; // Default to 'asc' for name sorting
    const price_gte = url.searchParams.get('price_gte');
    const price_lte = url.searchParams.get('price_lte');

    console.log(`Function called with params: page=${page}, limit=${limit}, category=${categorySlug}, search=${searchTerm}, sortBy=${sortBy}, sortOrder=${sortOrder}, price_gte=${price_gte}, price_lte=${price_lte}`); // Log entry params

    const from = (page - 1) * limit;
    const to = from + limit - 1;

    let query = supabase
      .from('products')
      .select(`
        *,
        category:categories ( name, slug )
      `, { count: 'exact' })
      .eq('is_active', true) // Only fetch active products
      .range(from, to)
      .order(sortBy, { ascending: sortOrder === 'asc' }); // Ensure .order() uses the correct column name from sortBy

    if (searchTerm) {
      console.log(`Applying search term: ${searchTerm}`);
      query = query.ilike('name', `%${searchTerm}%`);
    }

    // --- Filter by price range ---
    if (price_gte !== null) {
      const gteValue = parseFloat(price_gte);
      if (!isNaN(gteValue)) {
        console.log(`Applying price filter: >= ${gteValue}`);
        query = query.gte('price', gteValue);
      }
    }
    if (price_lte !== null) {
      const lteValue = parseFloat(price_lte);
      if (!isNaN(lteValue)) {
        console.log(`Applying price filter: <= ${lteValue}`);
        query = query.lte('price', lteValue);
      }
    }
    // ---------------------------

    // --- Filter by category slug ---
    if (categorySlug) {
      console.log(`Attempting to filter by category slug: ${categorySlug}`);
      // Fetch the category ID based on the slug first
      console.log(`Fetching category ID for slug: ${categorySlug}`);
      const { data: categoryData, error: categoryError } = await supabase
        .from('categories')
        .select('id')
        .eq('slug', categorySlug)
        .maybeSingle();

      if (categoryError) {
        console.error("Error fetching category by slug:", categoryError);
         return new Response(JSON.stringify({ success: false, error: `Error finding category: ${categoryError.message}` }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 500,
        });
      }

      if (categoryData) {
        console.log(`Found category ID: ${categoryData.id}. Applying filter.`);
        // --- Use category_id for filtering ---
        query = query.eq('category_id', categoryData.id);
        // ------------------------------------
      } else {
        // Category slug not found, return empty results for this filter
        console.warn(`Category slug "${categorySlug}" not found. Returning empty results.`);
        return new Response(JSON.stringify({ success: true, data: [], count: 0, currentPage: page, totalPages: 0 }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200,
        });
      }
    }

    console.log("Executing final product query..."); // Log before final query execution
    const { data, error, count } = await query;

    if (error) {
      console.error("Error executing final product query:", error); // Log the specific error
      // --- Check if the error is about the column name ---
      if (error.message.includes("column") && error.message.includes("does not exist")) {
         return new Response(JSON.stringify({ success: false, error: `Database query error: ${error.message}. Check column names.` }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 500, // Internal Server Error because the function code is wrong
        });
      }
      // --- End column name check ---
      return new Response(JSON.stringify({ success: false, error: error.message }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400, // Or 500 depending on the error type
      });
    }

    console.log(`Query successful. Found ${count} products.`); // Log success

    const totalProducts = count || 0;
    const totalPages = Math.ceil(totalProducts / limit);

    return new Response(JSON.stringify({
        success: true,
        data,
        count: totalProducts,
        currentPage: page,
        totalPages,
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (err) {
    console.error("Unexpected function error:", err); // Log unexpected function errors
    return new Response(JSON.stringify({ success: false, error: `Unexpected function error: ${err.message}` }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});
