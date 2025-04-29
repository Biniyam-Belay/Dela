import { supabase } from './supabaseClient'; // Ensure single instance usage

const getAuthHeaders = () => {
  const accessToken = localStorage.getItem('accessToken');
  if (!accessToken) {
    console.error("Wishlist API: No access token found.");
    return null;
  }
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${accessToken}`,
  };
};

// Function to fetch wishlist items
export const fetchWishlist = async () => {
  const headers = getAuthHeaders();
  if (!headers) throw new Error('User not authenticated');

  // Replace with your actual Supabase function URL
  const wishlistUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/get-wishlist`; 

  try {
    const response = await fetch(wishlistUrl, {
      method: 'GET',
      headers: headers,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Failed to parse error response' }));
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    // Assuming the function returns { wishlist: [{ product: {...} }, ...] }
    return data.wishlist || []; 
  } catch (error) {
    console.error('Error fetching wishlist:', error);
    throw error;
  }
};

// Function to add an item to the wishlist
export const addToWishlistApi = async (product_id) => {
  const headers = getAuthHeaders();
  if (!headers) throw new Error('User not authenticated');

  // Replace with your actual Supabase function URL
  const addUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/add-to-wishlist`;

  try {
    const response = await fetch(addUrl, {
      method: 'POST',
      headers: headers,
      body: JSON.stringify({ product_id }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Failed to parse error response' }));
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }
    return await response.json(); // Expect { success: true } or similar
  } catch (error) {
    console.error('Error adding to wishlist:', error);
    throw error;
  }
};

// Function to remove an item from the wishlist
export const removeFromWishlistApi = async (product_id) => {
  const headers = getAuthHeaders();
  if (!headers) throw new Error('User not authenticated');

  // Replace with your actual Supabase function URL
  const removeUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/remove-from-wishlist`;

  try {
    const response = await fetch(removeUrl, {
      method: 'POST', // Or DELETE, depending on your function design
      headers: headers,
      body: JSON.stringify({ product_id }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Failed to parse error response' }));
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }
    return await response.json(); // Expect { success: true } or similar
  } catch (error) {
    console.error('Error removing from wishlist:', error);
    throw error;
  }
};
