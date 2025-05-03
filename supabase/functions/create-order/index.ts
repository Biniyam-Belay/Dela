import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { decodeJwt } from 'https://esm.sh/jose@4.14.4';
import { corsHeaders } from '../_shared/cors.ts';

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  // --- Auth ---
  const authHeader = req.headers.get('Authorization');
  if (!authHeader) {
    return new Response(JSON.stringify({ error: 'Missing Authorization header' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 401,
    });
  }
  const accessToken = authHeader.replace('Bearer ', '').trim();
  let userId;
  try {
    const jwtPayload = decodeJwt(accessToken);
    userId = jwtPayload.sub;
    if (!userId) throw new Error('No sub in JWT');
  } catch (e) {
    return new Response(JSON.stringify({ error: 'Invalid access token' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 401,
    });
  }

  // --- Supabase Client (Anon Key, RLS enforced) ---
  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY');
  if (!supabaseUrl || !supabaseAnonKey) {
    return new Response(JSON.stringify({ error: 'Missing Supabase environment variables' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
  const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    global: {
      headers: { 'Authorization': `Bearer ${accessToken}` },
    },
    db: { schema: 'public' },
  });

  // --- Parse and Validate Order Data ---
  let body;
  try {
    body = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON' }), { headers: corsHeaders, status: 400 });
  }
  const { orderItems, shippingAddress, totalAmount } = body;
  if (!Array.isArray(orderItems) || orderItems.length === 0 || !shippingAddress || typeof totalAmount !== 'number') {
    return new Response(JSON.stringify({ error: 'Missing or invalid order data' }), { headers: corsHeaders, status: 400 });
  }

  // --- Insert Order ---
  const { data: order, error: orderError } = await supabase
    .from('orders')
    .insert({ userId, shippingAddress, totalAmount, status: 'pending' })
    .select()
    .single();

  if (orderError || !order) {
    console.error('Order Insert Error:', JSON.stringify(orderError, null, 2));
    return new Response(JSON.stringify({ error: 'Database error creating order', details: orderError }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }

  // --- Insert Order Items ---
  const orderItemsData = orderItems.map(item => ({
    orderId: order.id,
    productId: item.productId,
    quantity: item.quantity,
    price: item.price,
  }));
  const { error: itemsError } = await supabase.from('order_items').insert(orderItemsData);
  if (itemsError) {
    console.error('Order Items Insert Error:', JSON.stringify(itemsError, null, 2));
    return new Response(JSON.stringify({ error: 'Database error creating order items', details: itemsError }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }

  return new Response(JSON.stringify({ success: true, order }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    status: 201,
  });
});
