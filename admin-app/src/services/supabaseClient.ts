import { createClient } from '@supabase/supabase-js';

// TODO: Replace with your actual Supabase project URL and anon key
const SUPABASE_URL = 'https://exutmsxktrnltvdgnlop.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV4dXRtc3hrdHJubHR2ZGdubG9wIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQyMjM4MTUsImV4cCI6MjA1OTc5OTgxNX0.8VQdSFGvqZ5Vnn0BZiFg14PWJOU3KvmOkxkCMfPROl8';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export async function fetchProducts(searchQuery?: string, categoryId?: string) {
  let query = supabase
    .from('products')
    .select('*')
    .order('createdAt', { ascending: false })
    .limit(100);

  if (searchQuery && searchQuery.trim() !== '') {
    query = query.ilike('name', `%${searchQuery.trim()}%`);
  }
  if (categoryId && categoryId !== '') {
    query = query.eq('categoryId', categoryId);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data;
}

export async function fetchStats() {
  const [products, orders, users] = await Promise.all([
    supabase.from('products').select('id', { count: 'exact', head: true }),
    supabase.from('orders').select('id', { count: 'exact', head: true }),
    supabase.from('users').select('id', { count: 'exact', head: true })
  ]);
  return {
    products: products.count || 0,
    orders: orders.count || 0,
    users: users.count || 0
  };
}

export async function fetchRecentOrders(limit = 5) {
  const { data, error } = await supabase
    .from('orders')
    .select('*')
    .order('createdAt', { ascending: false })
    .limit(limit);
  if (error) {
    console.error("Error fetching recent orders:", error);
    throw error;
  }
  return data;
}