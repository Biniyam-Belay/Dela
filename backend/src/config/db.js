// src/config/db.js
import { PrismaClient } from '@prisma/client';

// Add detailed logging in development
const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'info', 'warn', 'error'] : ['error'],
});

export default prisma;