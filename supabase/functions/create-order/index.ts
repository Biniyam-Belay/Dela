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
  const { orderItems, shippingAddress, totalAmount, collections, hasCollections } = body;
  if (!Array.isArray(orderItems) || orderItems.length === 0 || !shippingAddress || typeof totalAmount !== 'number') {
    return new Response(JSON.stringify({ error: 'Missing or invalid order data' }), { headers: corsHeaders, status: 400 });
  }

  // --- Insert Order with collection metadata ---
  const orderMetadata = {
    hasCollections: hasCollections || false,
    collectionsCount: collections ? Object.keys(collections).length : 0,
    collections: collections || {}
  };

  const { data: order, error: orderError } = await supabase
    .from('orders')
    .insert({ 
      userId, 
      shippingAddress, 
      totalAmount, 
      status: 'pending',
      metadata: orderMetadata
    })
    .select()
    .single();

  if (orderError || !order) {
    console.error('Order Insert Error:', JSON.stringify(orderError, null, 2));
    return new Response(JSON.stringify({ error: 'Database error creating order', details: orderError }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }

  // --- Insert Order Items with collection and seller information ---
  const orderItemsData = orderItems.map(item => ({
    orderId: order.id,
    productId: item.productId,
    quantity: item.quantity,
    price: item.price,
    // Include collection metadata if available (using snake_case for database)
    ...(item.collectionId && {
      collection_id: item.collectionId
    }),
    // Include seller information for commission tracking (using snake_case for database)
    ...(item.sellerId && {
      seller_id: item.sellerId
    })
  }));

  const { error: itemsError } = await supabase.from('order_items').insert(orderItemsData);
  if (itemsError) {
    console.error('Order Items Insert Error:', JSON.stringify(itemsError, null, 2));
    return new Response(JSON.stringify({ error: 'Database error creating order items', details: itemsError }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }

  // --- Calculate and record seller earnings if this order has collections ---
  if (hasCollections && collections) {
    try {
      const commissionRate = 0.15; // 15% platform commission
      const sellerEarnings: any[] = [];

      for (const [collectionKey, collectionData] of Object.entries(collections)) {
        const collection = collectionData as any;
        if (collection.sellerId && collection.total > 0) {
          const platformCommission = collection.total * commissionRate;
          const sellerEarning = collection.total - platformCommission;

          sellerEarnings.push({
            orderId: order.id,
            sellerId: collection.sellerId,
            collectionId: collection.collectionId,
            grossAmount: collection.total,
            platformCommission: platformCommission,
            sellerEarning: sellerEarning,
            status: 'pending'
          });
        }
      }

      if (sellerEarnings.length > 0) {
        const { error: earningsError } = await supabase
          .from('seller_earnings')
          .insert(sellerEarnings);

        if (earningsError) {
          console.error('Seller Earnings Insert Error:', JSON.stringify(earningsError, null, 2));
          // Don't fail the order if earnings tracking fails, but log it
        }
      }
    } catch (earningsError) {
      console.error('Error calculating seller earnings:', earningsError);
      // Continue with order processing even if earnings calculation fails
    }
  }

  // --- Fetch Product Details for Email ---
  let productDetailsText = '';
  let productDetailsHtml = '';
  let collectionsText = '';
  let collectionsHtml = '';
  
  if (orderItems.length > 0) {
    const productIds = orderItems.map(item => item.productId);
    const { data: products, error: productsError } = await supabase
      .from('products')
      .select('id, name')
      .in('id', productIds);
    if (!productsError && products) {
      productDetailsText = orderItems.map(item => {
        const prod = products.find(p => p.id === item.productId);
        const collectionInfo = item.collectionName ? ` (from ${item.collectionName})` : '';
        return `- ${prod?.name || 'Product'} x${item.quantity}${collectionInfo}`;
      }).join('\n');
      productDetailsHtml = orderItems.map(item => {
        const prod = products.find(p => p.id === item.productId);
        const collectionInfo = item.collectionName ? ` <em>(from ${item.collectionName})</em>` : '';
        return `<li><b>${prod?.name || 'Product'}</b> &times; ${item.quantity}${collectionInfo}</li>`;
      }).join('');
    }
  }

  // --- Build collection summary for email ---
  if (hasCollections && collections) {
    const collectionList = Object.values(collections).map((collection: any) => 
      `- ${collection.collectionName} (${collection.items.length} items)`
    );
    collectionsText = collectionList.join('\n');
    collectionsHtml = collectionList.map(item => `<li>${item}</li>`).join('');
  }

  // --- Estimate Delivery Date ---
  const deliveryStart = new Date();
  deliveryStart.setDate(deliveryStart.getDate() + 3);
  const deliveryEnd = new Date();
  deliveryEnd.setDate(deliveryEnd.getDate() + 5);
  const deliveryRange = `${deliveryStart.toLocaleDateString()} - ${deliveryEnd.toLocaleDateString()}`;

  // --- Send Order Confirmation Email via SendGrid ---
  try {
    const SENDGRID_API_KEY = Deno.env.get('SENDGRID_API_KEY');
    const SENDGRID_FROM_EMAIL = Deno.env.get('SENDGRID_FROM_EMAIL');
    const toEmail = shippingAddress.email;
    if (SENDGRID_API_KEY && SENDGRID_FROM_EMAIL && toEmail) {
      const emailBody = {
        personalizations: [
          {
            to: [{ email: toEmail }],
            subject: `Dela Order Confirmation`,
          },
        ],
        from: { email: SENDGRID_FROM_EMAIL, name: 'SuriAddis' },
        content: [
          {
            type: 'text/plain',
            value:
`Thank you for your order!

Order ID: ${order.id}
Total: ${totalAmount}

${hasCollections ? `Collections Ordered:\n${collectionsText}\n\n` : ''}Items Ordered:\n${productDetailsText}\n\nShipping Address:\n${shippingAddress.street || ''} ${shippingAddress.city || ''} ${shippingAddress.country || ''}\n\nEstimated Delivery: ${deliveryRange}\n\nWe will notify you when your order ships.\n\nIf you have questions, reply to this email.`
          },
          {
            type: 'text/html',
            value:
`<h2>Thank you for your order!</h2>
<p><b>Order ID:</b> ${order.id}<br/>
<b>Total:</b> ${totalAmount}</p>
${hasCollections ? `<h3>Collections Ordered:</h3><ul>${collectionsHtml}</ul>` : ''}
<h3>Items Ordered:</h3>
<ul>${productDetailsHtml}</ul>
<h3>Shipping Address:</h3>
<p>${shippingAddress.street || ''}<br/>${shippingAddress.city || ''}<br/>${shippingAddress.country || ''}</p>
<p><b>Estimated Delivery:</b> ${deliveryRange}</p>
<p>We will notify you when your order ships.<br/>If you have questions, reply to this email.</p>`
          }
        ],
      };
      await fetch('https://api.sendgrid.com/v3/mail/send', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${SENDGRID_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(emailBody),
      });
    }
  } catch (e) {
    console.error('SendGrid email error:', e);
    // Do not fail the order if email fails
  }

  return new Response(JSON.stringify({ success: true, order }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    status: 201,
  });
});
