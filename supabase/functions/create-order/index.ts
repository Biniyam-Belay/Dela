import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { decodeJwt } from 'https://esm.sh/jose@4.14.4';
import { corsHeaders } from '../_shared/cors.ts';

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  console.log('--- Minimal Test Function Start ---');

  // --- Auth ---
  const authHeader = req.headers.get('Authorization');
  if (!authHeader) {
    console.error('Missing Authorization header');
    return new Response(JSON.stringify({ success: false, error: 'Missing Authorization header' }), {
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
    console.log('Decoded userId from JWT:', userId);
  } catch (e) {
    console.error('Failed to decode JWT:', e);
    return new Response(JSON.stringify({ success: false, error: 'Invalid access token' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 401,
    });
  }

  // --- Supabase Client (Service Role) ---
  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  if (!supabaseUrl || !serviceRoleKey) {
    console.error('Missing Supabase environment variables');
    return new Response(JSON.stringify({ success: false, error: 'Missing Supabase environment variables' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    db: { schema: 'public' }
  });
  console.log('Supabase client created with service_role key.');

  // --- Hardcoded Order Data ---
  const testOrderData = {
    userId: userId, // Use the decoded userId
    shippingAddress: { test: '123 Test St' },
    totalAmount: 99.99,
    status: 'test-processing',
  };
  console.log('Attempting to insert test order:', testOrderData);

  // --- Insert Order ---
  const { data: order, error: orderError } = await supabase
    .from('orders')
    .insert(testOrderData)
    .select()
    .single();

  if (orderError || !order) {
    console.error('Minimal Test - Order Insert Error:', JSON.stringify(orderError, null, 2));
    return new Response(JSON.stringify({ success: false, error: `Minimal Test - Database error creating order: ${orderError?.message || 'Unknown error'}` }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }

  console.log('Minimal Test - Order Insert Success:', order);
  return new Response(JSON.stringify({ success: true, data: order }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    status: 201,
  });
});
