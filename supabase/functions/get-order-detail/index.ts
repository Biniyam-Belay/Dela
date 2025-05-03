import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders } from '../_shared/cors.ts';

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  // Parse order ID from query string
  const url = new URL(req.url);
  const orderId = url.searchParams.get('id');
  if (!orderId) {
    return new Response(JSON.stringify({ error: 'Missing order ID' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    });
  }

  // Auth: get user from JWT
  const authHeader = req.headers.get('Authorization');
  if (!authHeader) {
    return new Response(JSON.stringify({ error: 'Missing Authorization header' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 401,
    });
  }
  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY');
  const accessToken = authHeader.replace('Bearer ', '').trim();
  const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    global: {
      headers: { 'Authorization': `Bearer ${accessToken}` },
    },
    db: { schema: 'public' },
  });

  // Fetch order (RLS will ensure only owner or admin can access)
  const { data: order, error } = await supabase
    .from('orders')
    .select(`
      id, userId, shippingAddress, totalAmount, status, created_at,
      order_items(
        id, productId, quantity, price
      )
    `)
    .eq('id', orderId)
    .maybeSingle(); // Use maybeSingle to avoid error if no rows

  if (error || !order) {
    console.error('Order fetch error:', error, 'OrderId:', orderId);
    return new Response(JSON.stringify({ error: error?.message || 'Order not found' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 404,
    });
  }

  return new Response(JSON.stringify({ success: true, data: order }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    status: 200,
  });
});
