import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { fetchWishlist, addToWishlistApi, removeFromWishlistApi } from '../services/wishlistApi';

// Async thunk to fetch wishlist items
export const getWishlist = createAsyncThunk(
  'wishlist/getWishlist',
  async (_, { rejectWithValue }) => {
    try {
      const items = await fetchWishlist();
      // Ensure items is always an array, even if API returns null/undefined
      return items || []; 
    } catch (error) {
      console.error("Error fetching wishlist in slice:", error);
      return rejectWithValue(error.message || 'Failed to fetch wishlist');
    }
  }
);

// Async thunk to add an item to the wishlist
export const addToWishlist = createAsyncThunk(
  'wishlist/addToWishlist',
  async (productId, { dispatch, rejectWithValue }) => {
    try {
      await addToWishlistApi(productId);
      // Optionally, refetch the wishlist or optimistically update
      // For simplicity, we refetch here
      dispatch(getWishlist()); 
      return { productId }; // Return productId for potential optimistic updates
    } catch (error) {
      console.error("Error adding to wishlist in slice:", error);
      return rejectWithValue(error.message || 'Failed to add item to wishlist');
    }
  }
);

// Async thunk to remove an item from the wishlist
export const removeFromWishlist = createAsyncThunk(
  'wishlist/removeFromWishlist',
  async (productId, { dispatch, rejectWithValue }) => {
    try {
      await removeFromWishlistApi(productId);
      // Refetch the wishlist after removal
      dispatch(getWishlist());
      return { productId }; // Return productId for potential optimistic updates
    } catch (error) {
      console.error("Error removing from wishlist in slice:", error);
      return rejectWithValue(error.message || 'Failed to remove item from wishlist');
    }
  }
);

const wishlistSlice = createSlice({
  name: 'wishlist',
  initialState: {
    items: [], // Array of wishlist items (likely { product: {...} } structure)
    status: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
    error: null,
  },
  reducers: {
    clearWishlistState: (state) => {
        state.items = [];
        state.status = 'idle';
        state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Get Wishlist
      .addCase(getWishlist.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(getWishlist.fulfilled, (state, action) => {
        state.status = 'succeeded';
        // Ensure payload is an array before assigning
        state.items = Array.isArray(action.payload) ? action.payload : [];
        state.error = null;
      })
      .addCase(getWishlist.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      // Add To Wishlist (handles potential optimistic updates if needed later)
      .addCase(addToWishlist.pending, (state) => {
        // Optionally set a specific status like 'adding'
      })
      .addCase(addToWishlist.fulfilled, (state, action) => {
        // State is updated via getWishlist dispatch, no direct mutation here needed
        // unless doing optimistic updates.
      })
      .addCase(addToWishlist.rejected, (state, action) => {
        state.error = action.payload; // Store specific add error if needed
      })
      // Remove From Wishlist (handles potential optimistic updates if needed later)
      .addCase(removeFromWishlist.pending, (state) => {
        // Optionally set a specific status like 'removing'
      })
      .addCase(removeFromWishlist.fulfilled, (state, action) => {
        // State is updated via getWishlist dispatch, no direct mutation here needed
        // unless doing optimistic updates.
      })
      .addCase(removeFromWishlist.rejected, (state, action) => {
        state.error = action.payload; // Store specific remove error if needed
      });
  },
});

export const { clearWishlistState } = wishlistSlice.actions;

export default wishlistSlice.reducer;
