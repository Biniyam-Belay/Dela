import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient, SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

console.log(`Function "get-public-products" up and running!`)

// Helper function to get category ID from slug
async function getCategoryIdFromSlug(supabaseClient: SupabaseClient, categorySlug: string): Promise<string | null> {
  if (!categorySlug) return null;
  try {
    const { data, error } = await supabaseClient
      .from('categories')
      .select('id')
      .eq('slug', categorySlug)
      .single(); // Expect only one category per slug

    if (error) {
      console.error(`Error fetching category ID for slug ${categorySlug}:`, error);
      return null; // Or throw an error if category must exist
    }
    return data?.id || null;
  } catch (err) {
    console.error(`Exception fetching category ID for slug ${categorySlug}:`, err);
    return null;
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
    )

    // 1. Parse Query Parameters
    const url = new URL(req.url);
    const page = parseInt(url.searchParams.get('page') || '1', 10);
    const limit = parseInt(url.searchParams.get('limit') || '10', 10);
    const categorySlug = url.searchParams.get('category');
    const search = url.searchParams.get('search');
    const skip = (page - 1) * limit;

    // 2. Build Base Query
    let query = supabaseClient
      .from('products')
      .select('*, category:categories(name, slug)', { count: 'exact' }) // Select all product fields and category name/slug, get total count
      .eq('isActive', true) // Only fetch active products for public view
      .order('createdAt', { ascending: false }) // Default sort
      .range(skip, skip + limit - 1); // Apply pagination

    // 3. Apply Filters
    // Category Filter
    if (categorySlug) {
      const categoryId = await getCategoryIdFromSlug(supabaseClient, categorySlug);
      if (categoryId) {
        query = query.eq('categoryId', categoryId);
      } else {
        // If category slug is provided but not found, return no products
        return new Response(JSON.stringify({ success: true, count: 0, totalProducts: 0, totalPages: 0, currentPage: page, data: [] }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        });
      }
    }

    // Search Filter (case-insensitive on name and description)
    if (search) {
      const searchQuery = `%${search}%`; // Prepare pattern for ilike
      query = query.or(`name.ilike.${searchQuery},description.ilike.${searchQuery}`);
    }

    // 4. Execute Query
    const { data: products, error, count: totalProducts } = await query;

    if (error) {
      console.error('Error fetching products:', error);
      throw error;
    }

    // 5. Calculate Pagination Details
    const totalPages = Math.ceil((totalProducts || 0) / limit);

    // 6. Return Response
    return new Response(JSON.stringify({
      success: true,
      count: products?.length || 0,
      totalProducts: totalProducts || 0,
      totalPages,
      currentPage: page,
      data: products || [],
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    console.error('Error in get-public-products function:', error);
    return new Response(JSON.stringify({ success: false, error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
})
