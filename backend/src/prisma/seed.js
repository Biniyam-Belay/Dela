import { PrismaClient } from '@prisma/client';
import { hashPassword } from '../utils/passwordHelper.js' // Adjust path if necessary
import generateSlug from '../utils/generateSlug.js'; // Adjust path if necessary

const prisma = new PrismaClient();

async function main() {
  console.log('Start seeding ...');

  // --- Clean existing data (optional, good for repeatable seeds) ---
  // Be careful with this in production! Only for dev seeding.
  console.log('Deleting existing data...');
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.cartItem.deleteMany();
  await prisma.cart.deleteMany();
  await prisma.address.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();
  await prisma.user.deleteMany();
  console.log('Existing data deleted.');

  // --- Seed Categories ---
  console.log('Seeding categories...');
  const electronics = await prisma.category.create({
    data: {
      name: 'Electronics',
      slug: generateSlug('Electronics'),
      description: 'Gadgets, devices, and accessories',
    },
  });

  const clothing = await prisma.category.create({
    data: {
      name: 'Clothing',
      slug: generateSlug('Clothing'),
      description: 'Apparel for men and women',
    },
  });

  const books = await prisma.category.create({
      data: {
        name: 'Books',
        slug: generateSlug('Books'),
        description: 'Fiction, non-fiction, and more',
      },
  });
  console.log('Categories seeded.');

  // --- Seed Products ---
  console.log('Seeding products...');
  await prisma.product.createMany({ // Use createMany for efficiency
    data: [
      // Electronics
      {
        name: 'Wireless Noise-Cancelling Headphones',
        slug: generateSlug('Wireless Noise-Cancelling Headphones'),
        description: 'Immersive sound experience with adaptive noise cancellation. Long battery life.',
        price: 249.99,
        stockQuantity: 50,
        images: ['/images/headphones.jpg', '/images/headphones-alt.jpg'], // Use relative paths or URLs
        categoryId: electronics.id,
      },
      {
        name: 'Smartwatch Pro',
        slug: generateSlug('Smartwatch Pro'),
        description: 'Track your fitness, notifications, and more. Sleek design.',
        price: 199.50,
        stockQuantity: 35,
        images: ['/images/smartwatch.jpg'],
        categoryId: electronics.id,
      },
      // Clothing
      {
        name: 'Classic Cotton T-Shirt',
        slug: generateSlug('Classic Cotton T-Shirt'),
        description: 'Soft and comfortable 100% cotton t-shirt. Available in various colors.',
        price: 19.99,
        stockQuantity: 120,
        images: ['/images/tshirt-blue.jpg', '/images/tshirt-white.jpg'],
        categoryId: clothing.id,
      },
      {
        name: 'Slim Fit Jeans',
        slug: generateSlug('Slim Fit Jeans'),
        description: 'Modern slim fit jeans with a touch of stretch for comfort.',
        price: 49.95,
        stockQuantity: 80,
        images: ['/images/jeans.jpg'],
        categoryId: clothing.id,
      },
       // Books
      {
        name: 'The Midnight Library',
        slug: generateSlug('The Midnight Library'),
        description: 'A novel about choices, regrets, and the infinite possibilities of life.',
        price: 15.99,
        stockQuantity: 60,
        images: ['/images/book-midnight-library.jpg'],
        categoryId: books.id,
      },
      {
        name: 'Atomic Habits',
        slug: generateSlug('Atomic Habits'),
        description: 'An easy & proven way to build good habits & break bad ones.',
        price: 18.50,
        stockQuantity: 75,
        images: ['/images/book-atomic-habits.jpg'],
        categoryId: books.id,
      },
      // Product without category (Example)
       {
        name: 'Handmade Ceramic Mug',
        slug: generateSlug('Handmade Ceramic Mug'),
        description: 'Unique handmade mug, perfect for your morning coffee.',
        price: 25.00,
        stockQuantity: 40,
        images: ['/images/mug.jpg'],
        // categoryId: null, // Omit or set to null
      },
    ],
  });
  console.log('Products seeded.');

  // --- Seed Users (Optional - Create an Admin user) ---
  console.log('Seeding admin user...');
  const adminPassword = await hashPassword('adminpassword'); // Use a secure password!
  await prisma.user.create({
    data: {
      email: 'admin@suriaddis.com',
      name: 'Admin User',
      password: adminPassword,
      role: 'ADMIN', // Ensure Role enum matches ('ADMIN')
    },
  });
  console.log('Admin user seeded.');

  console.log('Seeding finished.');
}

main()
  .catch((e) => {
    console.error('Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });