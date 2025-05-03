// filepath: /supabase/functions/get-admin-orders/index.ts
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders } from '../_shared/cors.ts';

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  // Auth check
  const authHeader = req.headers.get('Authorization');
  if (!authHeader) {
    return new Response(JSON.stringify({ error: 'Missing Authorization header' }), {
      headers: corsHeaders,
      status: 401,
    });
  }
  const accessToken = authHeader.replace('Bearer ', '').trim();

  // Supabase client (use service role key for full access)
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  );

  // TODO: Add admin check here (e.g., query user role or use RLS)
  // For now, allow all authenticated users (for testing)

  // Parse query params for pagination, search, status, etc.
  const url = new URL(req.url);
  const page = parseInt(url.searchParams.get('page') || '1', 10);
  const limit = parseInt(url.searchParams.get('limit') || '10', 10);
  const offset = (page - 1) * limit;
  const search = url.searchParams.get('search') || '';
  const status = url.searchParams.get('status') || '';

  // Build query with only available fields (no join)
  let query = supabase
    .from('orders')
    .select('id, status, "totalAmount", created_at, "userId", "shippingAddress"', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (search) {
    query = query.ilike('id', `%${search}%`);
  }
  if (status) {
    query = query.eq('status', status);
  }

  const { data, error, count } = await query;
  if (error) {
    return new Response(JSON.stringify({ error: error.message }), { headers: corsHeaders, status: 400 });
  }

  return new Response(
    JSON.stringify({
      success: true,
      data: {
        orders: data,
        totalPages: Math.ceil((count || 0) / limit),
        totalOrders: count,
        currentPage: page,
      },
    }),
    { headers: corsHeaders, status: 200 }
  );
});