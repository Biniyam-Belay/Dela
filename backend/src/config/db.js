// src/config/db.js
import { PrismaClient } from '@prisma/client';

// Update the Prisma client to use the Supabase database connection string
const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'info', 'warn', 'error'] : ['error'],
  datasources: {
    db: {
      url: process.env.DATABASE_URL, // Ensure DATABASE_URL is set to the Supabase connection string
    },
  },
});

export default prisma;