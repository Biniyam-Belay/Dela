// backend/prisma/seed.js

import 'dotenv/config'; // Load .env file
import { PrismaClient } from '@prisma/client';
import { createClient } from '@supabase/supabase-js'; // Import Supabase client
// Adjust the path based on your project structure (e.g., ../../src/utils if seed.js is in prisma/)
import { hashPassword } from '../utils/passwordHelper.js'
import generateSlug from '../utils/generateSlug.js';

const prisma = new PrismaClient();

// --- Initialize Supabase Admin Client ---
// Ensure SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are in your .env
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceRoleKey) {
  console.error('❌ Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env file. Cannot seed Supabase Auth users.');
  process.exit(1);
}

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// Helper to create user in Supabase Auth
const createSupabaseAuthUser = async (email, password, userData = {}) => {
  const { data, error } = await supabaseAdmin.auth.admin.createUser({
    email: email,
    password: password,
    email_confirm: true, // Automatically confirm email for seeded users
    user_metadata: { name: userData.name || email.split('@')[0] }, // Add name to metadata
    // app_metadata: { role: userData.role || 'USER' } // You might store role here too if needed
  });

  if (error) {
    // Handle potential error if user already exists in Supabase Auth
    if (error.message.includes('already registered')) {
      console.warn(`Supabase Auth: User ${email} already exists. Skipping creation.`);
      // Optionally, you could try to fetch the existing user ID here if needed
      const { data: existingUserData, error: getUserError } = await supabaseAdmin.auth.admin.listUsers({ email: email });
      if (getUserError || !existingUserData || existingUserData.users.length === 0) {
          console.error(`Supabase Auth: Failed to retrieve existing user ${email}:`, getUserError);
          return null; // Indicate failure
      }
      console.log(`Supabase Auth: Found existing user ID: ${existingUserData.users[0].id}`);
      return existingUserData.users[0]; // Return the existing user object
    } else {
      console.error(`Supabase Auth: Error creating user ${email}:`, error.message);
      throw error; // Re-throw other errors
    }
  }
  console.log(`Supabase Auth: User ${email} created successfully with ID: ${data.user.id}`);
  return data.user; // Return the created user object (contains the ID)
};


async function main() {
  console.log('🌱 Start seeding ...');

  // --- 1. Clean existing data ---
  console.log('🧹 Deleting existing data...');
  // Delete Prisma data (ensure public.users is deleted AFTER auth users if using cascade)
  await prisma.orderItem.deleteMany();
  await prisma.cartItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.cart.deleteMany();
  await prisma.address.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();
  await prisma.user.deleteMany(); // Deletes from public.users
  console.log('🗑️ Existing data deleted.');

  // --- 2. Seed Categories ---
  console.log('🏷️ Seeding categories...');
  const dresses = await prisma.category.create({
    data: {
      name: 'Dresses',
      slug: generateSlug('Dresses'),
      description: 'Beautiful dresses for every occasion.',
    },
  });

  const tops = await prisma.category.create({
    data: {
      name: 'Tops',
      slug: generateSlug('Tops'),
      description: 'Stylish tops, blouses, and sweaters.',
    },
  });

   const accessories = await prisma.category.create({
    data: {
      name: 'Accessories',
      slug: generateSlug('Accessories'),
      description: 'Scarves, bags, and more.',
    },
  });
  console.log('✅ Categories seeded.');

  // --- 3. Seed Products ---
  console.log('📦 Seeding products...');
  await prisma.product.createMany({
    data: [
      // Dresses
      {
        name: 'Floral Print Midi Dress',
        slug: generateSlug('Floral Print Midi Dress'),
        description: 'A light and airy midi dress with a vibrant floral pattern. Perfect for summer days. V-neckline and tie waist.',
        price: 59.90,
        originalPrice: 75.00, // Example discount
        stockQuantity: 45,
        images: ['/images/dress-floral-1.jpg', '/images/dress-floral-2.jpg'],
        categoryId: dresses.id,
        rating: 4.5,
        reviewCount: 28,
        sellerName: 'Fashion Hub',
        sellerLocation: 'Cityville',
        unitsSold: 112,
      },
      {
        name: 'Elegant Beige Maxi Dress',
        slug: generateSlug('Elegant Beige Maxi Dress'),
        description: 'Flowy and elegant maxi dress in a neutral beige tone. Ideal for evening events or beach walks.',
        price: 85.00,
        stockQuantity: 20,
        images: ['/images/dress-maxi-beige.jpg'],
        categoryId: dresses.id,
        rating: 4.8,
        reviewCount: 15,
        sellerName: 'Style Boutique',
        sellerLocation: 'Metropolis',
        unitsSold: 45,
      },
      {
        name: 'Casual Smocked Mini Dress',
        slug: generateSlug('Casual Smocked Mini Dress'),
        description: 'Comfortable smocked bodice mini dress for a relaxed yet stylish look. Square neckline.',
        price: 45.50,
        stockQuantity: 60,
        images: ['/images/dress-mini-smocked.jpg'],
        categoryId: dresses.id,
        rating: 4.2,
        reviewCount: 35,
        sellerName: 'Casual Corner',
        sellerLocation: 'Townsburg',
        unitsSold: 98,
      },
      // Tops
      {
        name: 'Lace Detail V-Neck Sweater',
        slug: generateSlug('Lace Detail V-Neck Sweater'),
        description: 'Soft knit sweater with delicate lace detailing around the V-neck. Cozy and chic.',
        price: 55.00,
        stockQuantity: 70,
        images: ['/images/sweater-lace-pink.jpg'],
        categoryId: tops.id,
        rating: 4.6,
        reviewCount: 42,
        sellerName: 'Cozy Knits Co.',
        sellerLocation: 'Cityville',
        unitsSold: 150,
      },
      {
        name: 'Classic Crewneck Pullover',
        slug: generateSlug('Classic Crewneck Pullover'),
        description: 'A timeless crewneck pullover in a versatile beige color. Essential wardrobe staple.',
        price: 49.00,
        stockQuantity: 90,
        images: ['/images/sweater-beige.jpg'],
        categoryId: tops.id,
        rating: 4.3,
        reviewCount: 55,
        sellerName: 'Everyday Style',
        sellerLocation: 'Metropolis',
        unitsSold: 210,
      },
       {
        name: 'Ruffled Sleeveless Top',
        slug: generateSlug('Ruffled Sleeveless Top'),
        description: 'Playful sleeveless top with ruffled details. Great for warm weather.',
        price: 32.00,
        originalPrice: 40.00, // Example discount
        stockQuantity: 55,
        images: ['/images/top-ruffle-pink.jpg'],
        categoryId: tops.id,
        rating: 4.0,
        reviewCount: 18,
        sellerName: 'Summer Breeze',
        sellerLocation: 'Townsburg',
        unitsSold: 77,
      },
       // Accessories
       {
        name: 'Lightweight Patterned Scarf',
        slug: generateSlug('Lightweight Patterned Scarf'),
        description: 'Soft, lightweight scarf with a subtle pattern. Adds a touch of elegance.',
        price: 22.50,
        stockQuantity: 100,
        images: ['/images/scarf-patterned.jpg'],
        categoryId: accessories.id,
        rating: 4.7,
        reviewCount: 30,
        sellerName: 'Accessorize Me',
        sellerLocation: 'Cityville',
        unitsSold: 130,
      },
    ],
     skipDuplicates: true, // Optional: useful if you run seed multiple times without cleaning
  });
  console.log('✅ Products seeded.');

  // --- 4. Seed Admin User ---
  console.log('👤 Seeding admin user...');
  const adminEmail = 'admin@suriaddis.com';
  const adminPasswordPlainText = 'adminpassword';

  // Step 4a: Create user in Supabase Auth FIRST
  const authAdmin = await createSupabaseAuthUser(adminEmail, adminPasswordPlainText, { name: 'Admin User', role: 'ADMIN' });

  // Step 4b: Create user in Prisma public.users using the ID from Supabase Auth
  if (authAdmin && authAdmin.id) {
    try {
      const prismaAdmin = await prisma.user.create({
        data: {
          id: authAdmin.id, // Use the ID from Supabase Auth
          email: adminEmail,
          name: 'Admin User',
          role: 'ADMIN',
        },
      });
      console.log(`✅ Prisma: Admin user created (ID: ${prismaAdmin.id})`);
    } catch (prismaError) {
        if (prismaError.code === 'P2002' && prismaError.meta?.target?.includes('id')) {
             console.warn(`Prisma: User with ID ${authAdmin.id} likely already inserted by trigger. Skipping Prisma create.`);
        } else if (prismaError.code === 'P2002' && prismaError.meta?.target?.includes('email')) {
             console.warn(`Prisma: User with email ${adminEmail} already exists. Skipping Prisma create.`);
        } else {
            console.error(`Prisma: Error creating admin user ${adminEmail}:`, prismaError);
        }
    }
  } else {
    console.error(`❌ Failed to create or retrieve Supabase Auth admin user ${adminEmail}. Skipping Prisma user creation.`);
  }

  // --- 5. Seed Regular User (Optional) ---
  console.log('👤 Seeding regular user (optional)...');
  const userEmail = 'user@example.com';
  const userPasswordPlainText = 'password123';

  // Step 5a: Create user in Supabase Auth FIRST
  const authUser = await createSupabaseAuthUser(userEmail, userPasswordPlainText, { name: 'Test User', role: 'USER' });

  // Step 5b: Create user in Prisma public.users using the ID from Supabase Auth
  if (authUser && authUser.id) {
     try {
        const prismaUser = await prisma.user.create({
          data: {
            id: authUser.id, // Use the ID from Supabase Auth
            email: userEmail,
            name: 'Test User',
            role: 'USER',
          },
        });
        console.log(`✅ Prisma: Regular user created (ID: ${prismaUser.id})`);
     } catch (prismaError) {
         if (prismaError.code === 'P2002' && prismaError.meta?.target?.includes('id')) {
              console.warn(`Prisma: User with ID ${authUser.id} likely already inserted by trigger. Skipping Prisma create.`);
         } else if (prismaError.code === 'P2002' && prismaError.meta?.target?.includes('email')) {
              console.warn(`Prisma: User with email ${userEmail} already exists. Skipping Prisma create.`);
         } else {
             console.error(`Prisma: Error creating regular user ${userEmail}:`, prismaError);
         }
     }
  } else {
    console.error(`❌ Failed to create or retrieve Supabase Auth regular user ${userEmail}. Skipping Prisma user creation.`);
  }

  console.log('🎉 Seeding finished.');
}

main()
  .catch((e) => {
    console.error('❌ Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    // Close Prisma Client connection
    await prisma.$disconnect();
    console.log('🔌 Prisma Client disconnected.');
  });