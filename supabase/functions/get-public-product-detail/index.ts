import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
// --- Import shared CORS headers ---
import { corsHeaders } from '../_shared/cors.ts';
// ---------------------------------

console.log(`Function "get-public-product-detail" up and running!`);

serve(async (req) => {
  // --- Handle CORS preflight requests ---
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }
  // ------------------------------------

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    const url = new URL(req.url);
    const identifier = url.searchParams.get('identifier'); // Can be slug or ID

    if (!identifier) {
      return new Response(JSON.stringify({ success: false, error: 'Missing product identifier (slug or ID)' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }, // Add corsHeaders here too
        status: 400,
      });
    }

    console.log(`Fetching product with identifier: ${identifier}`);

    // Try fetching by slug first, then by ID if it looks like a UUID
    const isUUID = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(identifier);

    let query = supabase
      .from('products')
      .select(`
        *,
        category:categories ( name, slug )
      `)
      .eq('is_active', true);

    if (isUUID) {
      console.log(`Identifier looks like UUID, querying by id.`);
      query = query.eq('id', identifier);
    } else {
      console.log(`Identifier looks like slug, querying by slug.`);
      query = query.eq('slug', identifier);
    }

    const { data, error } = await query.maybeSingle(); // Use maybeSingle as slug/id might not match

    if (error) {
      console.error("Error fetching product detail:", error);
      return new Response(JSON.stringify({ success: false, error: error.message }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }, // Add corsHeaders here too
        status: 500, // Use 500 for database errors
      });
    }

    if (!data) {
      console.log(`Product not found for identifier: ${identifier}`);
      return new Response(JSON.stringify({ success: false, error: 'Product not found' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }, // Add corsHeaders here too
        status: 404,
      });
    }

    console.log(`Product found: ${data.name}`);
    return new Response(JSON.stringify({ success: true, data }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }, // Add corsHeaders here too
      status: 200,
    });

  } catch (err) {
    console.error("Unexpected function error:", err);
    return new Response(JSON.stringify({ success: false, error: `Unexpected function error: ${err.message}` }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }, // Add corsHeaders here too
      status: 500,
    });
  }
});
