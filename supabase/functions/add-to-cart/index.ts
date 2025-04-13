// Setup type definitions for built-in Supabase Runtime APIs
/// <reference types="https://esm.sh/@supabase/functions-js/src/edge-runtime.d.ts" />

import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { PrismaClient } from 'npm:@prisma/client/edge'; // Use npm: specifier
import { corsHeaders } from '../_shared/cors.ts'; // Import shared CORS headers
import { v4 as uuidv4 } from "https://deno.land/std@0.224.0/uuid/mod.ts"; // Import Deno standard UUID

console.log("Add-to-cart function script loaded."); // Log script load

serve(async (req) => {
  console.log(`Received request: ${req.method} ${req.url}`); // Log every request

  // Handle CORS preflight request FIRST
  if (req.method === 'OPTIONS') {
    console.log("Handling OPTIONS preflight request."); // Log OPTIONS handling
    return new Response('ok', { headers: corsHeaders });
  }

  // Initialize Prisma Client *inside* the handler, after OPTIONS check
  let prisma;
  try {
    console.log("Initializing Prisma Client for request...");
    prisma = new PrismaClient({
      datasources: {
        db: {
          url: Deno.env.get('DATABASE_URL'),
        },
      },
    });
    console.log("Prisma Client initialized successfully for request.");
  } catch (initError) {
    console.error("FATAL: Prisma Client initialization failed:", initError);
    return new Response(JSON.stringify({ success: false, error: 'Database initialization error' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500, // Internal Server Error
    });
  }

  // Now proceed with the rest of the logic, using the initialized `prisma` instance
  try {
    console.log("Processing non-OPTIONS request...");
    // 1. Get User ID from JWT
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('Missing Authorization header');
    }
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    );
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
    if (userError || !user) {
      console.error('Auth error:', userError);
      return new Response(JSON.stringify({ success: false, error: 'Authentication failed' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 401,
      });
    }
    const userId = user.id;

    // 2. Parse Request Body
    const { productId, quantity } = await req.json();
    if (!productId || typeof quantity !== 'number' || quantity <= 0) {
      return new Response(JSON.stringify({ success: false, error: 'Invalid input: productId and positive quantity required' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      });
    }

    // 3. Prisma Transaction
    const updatedCart = await prisma.$transaction(async (tx) => {
      // a. Verify Product
      const product = await tx.product.findUnique({ where: { id: productId } });
      if (!product) {
        throw new Error('ProductNotFound');
      }
      // Optional: Stock check
      // if (product.stockQuantity < quantity) { throw new Error('InsufficientStock'); }

      // b. Find or Create Cart
      let cart = await tx.cart.findUnique({ where: { userId: userId } });
      if (!cart) {
        const newCartId = uuidv4.generate(); // Generate UUID using Deno module
        console.log(`Deno: Cart not found for user ${userId}. Creating new cart with ID: ${newCartId}`);
        cart = await tx.cart.create({
          data: {
            id: newCartId, // Explicitly provide the generated ID
            userId: userId,
          },
        });
      } else {
        console.log(`Deno: Found existing cart ${cart.id} for user ${userId}`);
      }

      // c. Upsert Cart Item
      console.log(`Deno: Upserting item: Product ID ${product.id}, Cart ID ${cart.id}, Quantity ${quantity}`);
      await tx.cartItem.upsert({
        where: { cartId_productId: { cartId: cart.id, productId: product.id } },
        update: { quantity: { increment: quantity } },
        create: { cartId: cart.id, productId: product.id, quantity: quantity },
      });
      console.log(`Deno: Upsert successful for item: Product ID ${product.id}`);

      // d. Fetch final cart state
      console.log(`Deno: Fetching final cart state for cart ID: ${cart.id}`);
      const finalCart = await tx.cart.findUnique({
        where: { id: cart.id },
        include: {
          items: {
            include: {
              product: {
                select: { id: true, name: true, price: true, images: true /* Adjust fields */ },
              },
            },
            orderBy: { createdAt: 'asc' },
          },
        },
      });
      if (!finalCart) {
        console.error(`Deno: Failed to retrieve final cart state for cart ID: ${cart.id}`);
        throw new Error('Failed to retrieve updated cart state.');
      }
      console.log(`Deno: Successfully fetched final cart state for cart ID: ${cart.id}`);
      return finalCart;
    }); // End transaction

    // 4. Return Success Response
    console.log("Deno: Transaction successful. Sending updated cart to client.");
    return new Response(JSON.stringify(updatedCart), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    console.error(`Error processing ${req.method} request:`, error);
    let status = 500;
    let message = error.message || 'Internal Server Error';

    if (error.message === 'ProductNotFound') {
      status = 404;
      message = 'Product not found.';
    } else if (error.message === 'InsufficientStock') {
      status = 400;
      message = 'Insufficient stock.';
    } else if (error.code === 'P2011' && error.message.includes('"carts"."id"')) {
      message = 'Failed to generate or assign cart ID.';
    }

    return new Response(JSON.stringify({ success: false, error: message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: status,
    });
  } finally {
    // Disconnect Prisma Client if it was initialized successfully
    if (prisma) {
      try {
        await prisma.$disconnect();
        console.log("Prisma Client disconnected successfully.");
      } catch (disconnectError) {
        console.error("Error disconnecting Prisma Client:", disconnectError);
      }
    }
  }
});
