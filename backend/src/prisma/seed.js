// backend/prisma/seed.js

import { PrismaClient } from '@prisma/client';
// Adjust the path based on your project structure (e.g., ../../src/utils if seed.js is in prisma/)
import { hashPassword } from '../src/utils/passwordHelper.js';
import generateSlug from '../src/utils/generateSlug.js';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Start seeding ...');

  // --- 1. Clean existing data (Optional but recommended for repeatable dev seeds) ---
  // Delete in reverse order of dependency or based on relation constraints
  console.log('🧹 Deleting existing data...');
  // Delete relations first
  await prisma.orderItem.deleteMany();
  await prisma.cartItem.deleteMany();
  // Delete models with relations pointing to them
  await prisma.order.deleteMany();
  await prisma.cart.deleteMany();
  await prisma.address.deleteMany();
  await prisma.product.deleteMany(); // Depends on Category
  await prisma.category.deleteMany(); // Depends on User (if added relation)
  await prisma.user.deleteMany();
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
  // Ensure password matches what you want to use for login!
  const adminPasswordPlainText = 'adminpassword'; // Change if needed
  const adminPasswordHashed = await hashPassword(adminPasswordPlainText);

  await prisma.user.upsert({ // Use upsert: create if not exists, update if exists
    where: { email: 'admin@suriaddis.com' },
    update: { // Update fields if admin already exists (e.g., ensure role is ADMIN)
        name: 'Admin User',
        password: adminPasswordHashed,
        role: 'ADMIN',
    },
    create: { // Create if admin doesn't exist
      email: 'admin@suriaddis.com',
      name: 'Admin User',
      password: adminPasswordHashed,
      role: 'ADMIN', // Match the Role enum value in schema.prisma
    },
  });
  console.log(`✅ Admin user seeded/updated (Login: admin@suriaddis.com / ${adminPasswordPlainText})`);

  // --- 5. Seed Regular User (Optional) ---
  console.log('👤 Seeding regular user (optional)...');
  const userPasswordPlainText = 'password123';
  const userPasswordHashed = await hashPassword(userPasswordPlainText);
   await prisma.user.upsert({
    where: { email: 'user@example.com' },
     update: {
         name: 'Test User',
         password: userPasswordHashed,
         role: 'USER',
     },
    create: {
      email: 'user@example.com',
      name: 'Test User',
      password: userPasswordHashed,
      role: 'USER',
    },
  });
   console.log(`✅ Regular user seeded/updated (Login: user@example.com / ${userPasswordPlainText})`);


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