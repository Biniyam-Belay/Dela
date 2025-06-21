import { supabase } from './supabaseClient.js';

/**
 * Seller API Service
 * Handles all seller-related API calls to Supabase Edge Functions
 */

// Get the current user's ID
const getCurrentUserId = async () => {
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error) throw error;
  return user?.id;
};

// Apply to become a seller
export const applyForSellerAccount = async (applicationData) => {
  try {
    const { data, error } = await supabase.functions.invoke('apply-for-seller-account', {
      body: applicationData
    });
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error applying for seller account:', error);
    throw error;
  }
};

// Get seller profile/status
export const getSellerProfile = async () => {
  try {
    const { data, error } = await supabase.functions.invoke('get-seller-profile');
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching seller profile:', error);
    // Return mock data for development
    return {
      id: 1,
      user_id: 'user-123',
      store_name: 'The Test Boutique',
      store_description: 'Curating unique fashion pieces and lifestyle products for the modern consumer.',
      store_logo_url: null,
      contact_email: 'seller@testboutique.com',
      contact_phone: '+1-555-0123',
      business_address: '123 Fashion Street, Style City, SC 12345',
      business_registration_number: 'REG-2024-001',
      tax_id: 'TAX-123456789',
      status: 'active',
      approval_date: '2024-01-01T00:00:00Z',
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-15T10:30:00Z'
    };
  }
};

// Update seller profile
export const updateSellerProfile = async (profileData) => {
  try {
    const { data, error } = await supabase.functions.invoke('update-seller-profile', {
      body: profileData
    });
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error updating seller profile:', error);
    throw error;
  }
};

// Get seller's collections
export const getSellerCollections = async () => {
  try {
    const { data, error } = await supabase.functions.invoke('get-seller-collections');
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching seller collections:', error);
    // Return mock data for development
    return [
      {
        id: '1',
        name: 'Summer Collection',
        description: 'Perfect items for the summer season',
        is_active: true,
        status: 'active',
        products: [{ id: 1 }, { id: 2 }, { id: 3 }],
        created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        image_url: '/placeholder-image.jpg'
      },
      {
        id: '2',
        name: 'Urban Explorer Kit',
        description: 'Everything you need for city adventures',
        is_active: true,
        status: 'pending',
        products: [{ id: 4 }, { id: 5 }],
        created_at: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
        image_url: '/placeholder-image.jpg'
      },
      {
        id: '3',
        name: 'Draft Collection',
        description: 'Work in progress collection',
        is_active: false,
        status: 'draft',
        products: [{ id: 6 }],
        created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        image_url: null
      }
    ];
  }
};

// Create a new collection
export const createCollection = async (collectionData) => {
  try {
    const { data, error } = await supabase.functions.invoke('create-collection', {
      body: collectionData
    });
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error creating collection:', error);
    throw error;
  }
};

// Update collection
export const updateCollection = async (collectionId, collectionData) => {
  try {
    const { data, error } = await supabase.functions.invoke('update-collection', {
      body: { collection_id: collectionId, ...collectionData }
    });
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error updating collection:', error);
    throw error;
  }
};

// Delete collection
export const deleteCollection = async (collectionId) => {
  try {
    const { data, error } = await supabase.functions.invoke('delete-collection', {
      body: { collection_id: collectionId }
    });
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error deleting collection:', error);
    throw error;
  }
};

// Get collection details with items
export const getCollectionDetails = async (collectionId) => {
  try {
    const { data, error } = await supabase.functions.invoke('get-collection-details', {
      body: { collection_id: collectionId }
    });
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching collection details:', error);
    throw error;
  }
};

// Add product to collection
export const addProductToCollection = async (collectionId, productId) => {
  try {
    const { data, error } = await supabase.functions.invoke('add-product-to-collection', {
      body: { 
        collection_id: collectionId, 
        product_id: productId 
      }
    });
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error adding product to collection:', error);
    throw error;
  }
};

// Remove product from collection
export const removeProductFromCollection = async (collectionId, productId) => {
  try {
    const { data, error } = await supabase.functions.invoke('remove-product-from-collection', {
      body: { 
        collection_id: collectionId, 
        product_id: productId 
      }
    });
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error removing product from collection:', error);
    throw error;
  }
};

// Get seller's available products (products they can add to collections)
export const getSellerProducts = async () => {
  try {
    const { data, error } = await supabase.functions.invoke('get-seller-products');
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching seller products:', error);
    // Return mock data for development
    return [
      {
        id: 1,
        name: 'Premium Wireless Headphones',
        price: 129.99,
        image_url: '/placeholder-image.jpg',
        description: 'High-quality wireless headphones with noise cancellation',
        in_stock: true
      },
      {
        id: 2,
        name: 'Smart Fitness Watch',
        price: 199.99,
        image_url: '/placeholder-image.jpg',
        description: 'Advanced fitness tracking with heart rate monitoring',
        in_stock: true
      },
      {
        id: 3,
        name: 'Organic Cotton T-Shirt',
        price: 29.99,
        image_url: '/placeholder-image.jpg',
        description: 'Comfortable organic cotton t-shirt in various colors',
        in_stock: true
      },
      {
        id: 4,
        name: 'Portable Phone Charger',
        price: 39.99,
        image_url: '/placeholder-image.jpg',
        description: 'High-capacity portable charger for all devices',
        in_stock: true
      },
      {
        id: 5,
        name: 'Eco-Friendly Water Bottle',
        price: 24.99,
        image_url: '/placeholder-image.jpg',
        description: 'Sustainable stainless steel water bottle',
        in_stock: true
      },
      {
        id: 6,
        name: 'Minimalist Backpack',
        price: 79.99,
        image_url: '/placeholder-image.jpg',
        description: 'Sleek design perfect for urban adventures',
        in_stock: true
      }
    ];
  }
};

// Get seller earnings/statistics
export const getSellerEarnings = async () => {
  try {
    const { data, error } = await supabase.functions.invoke('get-seller-earnings');
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching seller earnings:', error);
    // Return mock data for development
    return {
      summary: {
        total_earnings: 1450.75,
        pending_earnings: 245.30,
        available_balance: 1205.45,
        total_orders: 28,
        commission_rate: 0.15
      },
      recent_transactions: [
        {
          id: 1,
          type: 'sale',
          amount: 89.99,
          commission: 13.50,
          net_amount: 76.49,
          order_id: 'ORD-2024-001',
          customer_name: 'John Doe',
          product_name: 'Summer Collection',
          date: '2024-01-15T10:30:00Z',
          status: 'completed'
        },
        {
          id: 2,
          type: 'sale',
          amount: 125.00,
          commission: 18.75,
          net_amount: 106.25,
          order_id: 'ORD-2024-002',
          customer_name: 'Jane Smith',
          product_name: 'Urban Explorer Kit',
          date: '2024-01-14T14:20:00Z',
          status: 'completed'
        },
        {
          id: 3,
          type: 'payout',
          amount: -500.00,
          commission: 0,
          net_amount: -500.00,
          order_id: 'PAY-2024-001',
          customer_name: null,
          product_name: 'Weekly Payout',
          date: '2024-01-13T09:00:00Z',
          status: 'processed'
        }
      ],
      chart_data: [
        { date: '2024-01-01', earnings: 120 },
        { date: '2024-01-02', earnings: 95 },
        { date: '2024-01-03', earnings: 180 },
        { date: '2024-01-04', earnings: 150 },
        { date: '2024-01-05', earnings: 220 },
        { date: '2024-01-06', earnings: 190 },
        { date: '2024-01-07', earnings: 160 }
      ]
    };
  }
};

// Get seller orders
export const getSellerOrders = async () => {
  try {
    const { data, error } = await supabase.functions.invoke('get-seller-orders');
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching seller orders:', error);
    // Return mock data for development
    return [
      {
        id: 'ORD-2024-001',
        customer_name: 'John Doe',
        customer_email: 'john@example.com',
        order_date: '2024-01-15T10:30:00Z',
        status: 'completed',
        total_amount: 89.99,
        items: [
          {
            id: 1,
            product_name: 'Premium Wireless Headphones',
            collection_name: 'Summer Collection',
            quantity: 1,
            price: 89.99
          }
        ]
      },
      {
        id: 'ORD-2024-002',
        customer_name: 'Jane Smith',
        customer_email: 'jane@example.com',
        order_date: '2024-01-14T14:20:00Z',
        status: 'processing',
        total_amount: 125.00,
        items: [
          {
            id: 2,
            product_name: 'Smart Fitness Watch',
            collection_name: 'Urban Explorer Kit',
            quantity: 1,
            price: 125.00
          }
        ]
      },
      {
        id: 'ORD-2024-003',
        customer_name: 'Bob Johnson',
        customer_email: 'bob@example.com',
        order_date: '2024-01-13T09:15:00Z',
        status: 'shipped',
        total_amount: 54.98,
        items: [
          {
            id: 3,
            product_name: 'Organic Cotton T-Shirt',
            collection_name: 'Summer Collection',
            quantity: 1,
            price: 29.99
          },
          {
            id: 4,
            product_name: 'Eco-Friendly Water Bottle',
            collection_name: 'Urban Explorer Kit',
            quantity: 1,
            price: 24.99
          }
        ]
      }
    ];
  }
};

// Get public collections
export const getPublicCollections = async () => {
  try {
    const { data, error } = await supabase.functions.invoke('get-public-collections');
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching public collections:', error);
    // Return mock data for development
    return [
      {
        id: '1',
        name: 'Summer Collection',
        description: 'Perfect items for the summer season',
        image_url: '/placeholder-image.jpg',
        price: 89.99,
        seller_name: 'The Test Boutique',
        seller_id: '1',
        products: [
          { id: 1, name: 'Premium Wireless Headphones', price: 129.99 },
          { id: 2, name: 'Smart Fitness Watch', price: 199.99 },
          { id: 3, name: 'Organic Cotton T-Shirt', price: 29.99 }
        ]
      },
      {
        id: '2',
        name: 'Urban Explorer Kit',
        description: 'Everything you need for city adventures',
        image_url: '/placeholder-image.jpg',
        price: 125.00,
        seller_name: 'The Test Boutique',
        seller_id: '1',
        products: [
          { id: 4, name: 'Portable Phone Charger', price: 39.99 },
          { id: 5, name: 'Eco-Friendly Water Bottle', price: 24.99 },
          { id: 6, name: 'Minimalist Backpack', price: 79.99 }
        ]
      }
    ];
  }
};

// Get public collection details
export const getPublicCollectionDetails = async (collectionId) => {
  try {
    const { data, error } = await supabase.functions.invoke('get-public-collection-details', {
      body: { collection_id: collectionId }
    });
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching public collection details:', error);
    throw error;
  }
};

// Get seller settings
export const getSellerSettings = async () => {
  try {
    const { data, error } = await supabase.functions.invoke('get-seller-settings');
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching seller settings:', error);
    throw error;
  }
};

// Update seller settings
export const updateSellerSettings = async (settingsData) => {
  try {
    const { data, error } = await supabase.functions.invoke('update-seller-settings', {
      body: settingsData
    });
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error updating seller settings:', error);
    throw error;
  }
};

// Get seller dashboard statistics
export const getSellerDashboardStats = async () => {
  try {
    const { data, error } = await supabase.functions.invoke('get-seller-dashboard-stats');
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    throw error;
  }
};
