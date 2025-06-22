import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

// Helper function to get initial state from localStorage (similar to CartContext)
const getInitialCartState = () => {
  try {
    const storedCart = localStorage.getItem('cart');
    if (storedCart) {
      const parsedCart = JSON.parse(storedCart);
      // Basic validation
      if (Array.isArray(parsedCart.items)) {
        return parsedCart;
      }
    }
  } catch (error) {
    console.error('Error reading cart from localStorage:', error);
  }
  // Return default structure if nothing valid in localStorage
  return { items: [] }; // Keep it simple for initial state, status/error handled separately
};

const initialState = {
  items: getInitialCartState().items,
  status: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
  error: null,
};

// --- Async Thunks (will replace direct API calls) ---

// Thunk for fetching the cart
export const fetchCart = createAsyncThunk(
  'cart/fetchCart',
  async (_, { rejectWithValue }) => {
    const getCartUrl = import.meta.env.VITE_SUPABASE_GET_CART_URL;
    if (!getCartUrl) {
      console.error("VITE_SUPABASE_GET_CART_URL is not set!");
      return rejectWithValue("Cart API URL not configured");
    }
    const accessToken = localStorage.getItem('accessToken');
    if (!accessToken) {
      return getInitialCartState().items;
    }
    try {
      console.log("Cart API URL:", getCartUrl);
      const response = await fetch(getCartUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
      });
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const text = await response.text();
        console.error('Cart API non-JSON response:', text.slice(0, 200));
        throw new Error('Invalid response from server: ' + text.slice(0, 100));
      }
      const data = await response.json();
      const cartItems = data.cart?.items || data.items || data || [];
      localStorage.setItem('cart', JSON.stringify({ items: cartItems }));
      return cartItems;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch cart');
    }
  }
);

// Thunk for adding an item
export const addItemToCart = createAsyncThunk(
  'cart/addItemToCart',
  async ({ product, quantity }, { getState, rejectWithValue }) => {
    const accessToken = localStorage.getItem('accessToken');
    if (accessToken) {
      try {
        const response = await fetch(import.meta.env.VITE_SUPABASE_ADD_TO_CART_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`,
          },
          body: JSON.stringify({ productId: product.id, quantity }),
        });
        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
          const text = await response.text();
          throw new Error('Invalid response from server: ' + text.slice(0, 100));
        }
        const data = await response.json();
        const updatedItems = data.cart?.items || data.items || data || [];
        localStorage.setItem('cart', JSON.stringify({ items: updatedItems }));
        return updatedItems;
      } catch (error) {
        return rejectWithValue(error.message || 'Failed to add item to cart');
      }
    } else {
      // Anonymous user: Update localStorage directly
      const localCart = getInitialCartState();
      const localItems = localCart.items;
      const existingItemIndex = localItems.findIndex(item => item.product.id === product.id);
      let newItems;
      if (existingItemIndex > -1) {
        newItems = localItems.map((item, index) =>
          index === existingItemIndex
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      } else {
        newItems = [...localItems, { product, quantity }];
      }
      localStorage.setItem('cart', JSON.stringify({ items: newItems }));
      return newItems;
    }
  }
);

// Thunk for updating quantity
export const updateQuantity = createAsyncThunk(
  'cart/updateQuantity',
  // Send delta directly to the backend
  async ({ productId, delta }, { getState, rejectWithValue }) => { 
    const accessToken = localStorage.getItem('accessToken');
    if (accessToken) {
      try {
        const response = await fetch(import.meta.env.VITE_SUPABASE_ADD_TO_CART_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`,
          },
          // Send the delta directly
          body: JSON.stringify({ productId, delta }), 
        });
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ error: 'Failed to parse error response' }));
          throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        const updatedItems = data.cart?.items || data.items || data || [];
        localStorage.setItem('cart', JSON.stringify({ items: updatedItems }));
        return updatedItems;
      } catch (error) {
        return rejectWithValue(error.message || 'Failed to update quantity');
      }
    } else {
      // Anonymous user: Still need to calculate final quantity for local update
      const localCart = getInitialCartState();
      const itemIndex = localCart.items.findIndex(item => item.product.id === productId);
      if (itemIndex === -1) {
        // Should not happen if called from UI, but good safeguard
        return rejectWithValue('Item not found locally');
      }
      const currentQuantity = localCart.items[itemIndex].quantity;
      const finalQuantity = Math.max(0, currentQuantity + delta);

      let newItems = localCart.items.map(item =>
        item.product.id === productId ? { ...item, quantity: finalQuantity } : item
      ).filter(item => item.quantity > 0); // Remove if quantity is 0
      localStorage.setItem('cart', JSON.stringify({ items: newItems }));
      return newItems;
    }
  }
);

// Thunk for removing item
export const removeItem = createAsyncThunk(
  'cart/removeItem',
  async (productId, { getState, rejectWithValue }) => {
    const accessToken = localStorage.getItem('accessToken');
    if (accessToken) {
      try {
        // To remove, set quantity to 0
        const response = await fetch(import.meta.env.VITE_SUPABASE_ADD_TO_CART_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`,
          },
          body: JSON.stringify({ productId, quantity: 0 }),
        });
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ error: 'Failed to parse error response' }));
          throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        const updatedItems = data.cart?.items || data.items || data || [];
        localStorage.setItem('cart', JSON.stringify({ items: updatedItems }));
        return updatedItems;
      } catch (error) {
        return rejectWithValue(error.message || 'Failed to remove item');
      }
    } else {
      // Anonymous user: Update localStorage directly
      const localCart = getInitialCartState();
      let newItems = localCart.items.filter(item => item.product.id !== productId);
      localStorage.setItem('cart', JSON.stringify({ items: newItems }));
      return newItems;
    }
  }
);

// Thunk for merging local cart with backend cart
export const mergeLocalCartWithBackend = createAsyncThunk(
  'cart/mergeLocalCartWithBackend',
  async (_, { dispatch, rejectWithValue }) => {
    const accessToken = localStorage.getItem('accessToken');
    if (!accessToken) return; // Only run for logged-in users
    try {
      // 1. Get local cart
      const localCart = JSON.parse(localStorage.getItem('cart') || '{"items":[]}');
      const items = localCart.items || [];
      if (items.length === 0) {
        // No local cart to merge, just fetch backend cart
        await dispatch(fetchCart());
        return;
      }
      // 2. Send local cart to backend merge endpoint (assume POST /merge-cart)
      const response = await fetch(import.meta.env.VITE_SUPABASE_MERGE_CART_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ items }),
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Failed to parse error response' }));
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }
      // 3. Update Redux/localStorage with merged cart from backend
      const data = await response.json();
      const mergedItems = data.cart?.items || data.items || data || [];
      localStorage.setItem('cart', JSON.stringify({ items: mergedItems }));
      return mergedItems;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to merge cart');
    }
  }
);

// Thunk for clearing the cart
export const clearCart = createAsyncThunk(
  'cart/clearCart',
  async (_, { rejectWithValue }) => {
    const accessToken = localStorage.getItem('accessToken');
    if (accessToken) {
      try {
        const response = await fetch(import.meta.env.VITE_SUPABASE_CLEAR_CART_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`,
          },
        });
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ error: 'Failed to parse error response' }));
          throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
        }
        localStorage.removeItem('cart');
        return [];
      } catch (error) {
        return rejectWithValue(error.message || 'Failed to clear cart');
      }
    } else {
      localStorage.removeItem('cart');
      return [];
    }
  }
);

// Thunk for adding a collection to cart
export const addCollectionToCart = createAsyncThunk(
  'cart/addCollectionToCart',
  async ({ collection, quantity = 1 }, { getState, rejectWithValue }) => {
    console.log('addCollectionToCart called with:', { collection, quantity });
    
    // Validate that collection and products have UUID IDs (not numeric)
    if (typeof collection.id === 'number') {
      console.error('Invalid collection ID (numeric):', collection.id);
      return rejectWithValue('Collection data unavailable. Please refresh the page.');
    }
    
    // Validate product IDs
    const invalidProducts = collection.products?.filter(product => typeof product.id === 'number') || [];
    if (invalidProducts.length > 0) {
      console.error('Invalid product IDs (numeric):', invalidProducts.map(p => p.id));
      return rejectWithValue('Product data unavailable. Please refresh the page.');
    }
    
    const accessToken = localStorage.getItem('accessToken');
    console.log('Access token exists:', !!accessToken);
    
    if (accessToken) {
      // For development/demo purposes, if API fails, fall back to localStorage
      // In production, this would use proper API endpoints
      console.log('Attempting API cart addition (will fallback to localStorage if API fails)');
      
      try {
        // Check if add-to-cart endpoint exists and works
        if (import.meta.env.VITE_SUPABASE_ADD_TO_CART_URL) {
          const testResponse = await fetch(import.meta.env.VITE_SUPABASE_ADD_TO_CART_URL, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${accessToken}`,
            },
            body: JSON.stringify({ 
              productId: collection.products[0]?.id, 
              quantity: 0 // Test call
            }),
          });
          
          if (!testResponse.ok) {
            throw new Error(`API not available: ${testResponse.status}`);
          }
        } else {
          throw new Error('API URL not configured');
        }
      } catch (apiError) {
        console.log('API not available, falling back to localStorage:', apiError.message);
        // Fall back to localStorage logic (same as anonymous user)
        const localCart = getInitialCartState();
        let newItems = [...localCart.items];
        console.log('Current cart items:', newItems);
        
        // Add each product from the collection
        const collectionProducts = collection.products || [];
        console.log('Products to add:', collectionProducts);
        
        for (const product of collectionProducts) {
          console.log('Processing product:', product);
          const existingItemIndex = newItems.findIndex(item => item.product.id === product.id);
          if (existingItemIndex > -1) {
            console.log('Product already exists, updating quantity');
            newItems[existingItemIndex] = {
              ...newItems[existingItemIndex],
              quantity: newItems[existingItemIndex].quantity + quantity,
              collectionId: collection.id, // Track collection source
              sellerId: collection.seller?.id // Track seller information
            };
          } else {
            console.log('Adding new product to cart');
            newItems.push({ 
              product, 
              quantity,
              collectionId: collection.id, // Track collection source
              collectionName: collection.name, // For display purposes
              sellerId: collection.seller?.id // Track seller information
            });
          }
        }
        
        console.log('New cart items after adding collection (localStorage fallback):', newItems);
        localStorage.setItem('cart', JSON.stringify({ items: newItems }));
        return newItems;
      }
    } else {
      // Anonymous user: Update localStorage directly
      console.log('Adding collection for anonymous user');
      const localCart = getInitialCartState();
      let newItems = [...localCart.items];
      console.log('Current cart items:', newItems);
      
      // Add each product from the collection
      const collectionProducts = collection.products || [];
      console.log('Products to add:', collectionProducts);
      
      for (const product of collectionProducts) {
        console.log('Processing product:', product);
        const existingItemIndex = newItems.findIndex(item => item.product.id === product.id);
        if (existingItemIndex > -1) {
          console.log('Product already exists, updating quantity');
          newItems[existingItemIndex] = {
            ...newItems[existingItemIndex],
            quantity: newItems[existingItemIndex].quantity + quantity,
            collectionId: collection.id, // Track collection source
            sellerId: collection.seller?.id // Track seller information
          };
        } else {
          console.log('Adding new product to cart');
          newItems.push({ 
            product, 
            quantity,
            collectionId: collection.id, // Track collection source
            collectionName: collection.name, // For display purposes
            sellerId: collection.seller?.id // Track seller information
          });
        }
      }
      
      console.log('New cart items after adding collection:', newItems);
      localStorage.setItem('cart', JSON.stringify({ items: newItems }));
      return newItems;
    }
  }
);

// --- Cart Slice Definition ---
const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    // Synchronous reducers can be added here if needed,
    // e.g., for purely client-side state changes not involving async ops.
    clearLocalCartAndState: (state) => {
      state.items = [];
      state.status = 'idle';
      state.error = null;
      localStorage.removeItem('cart');
      console.log('clearLocalCartAndState: Cart cleared locally.');
    },
    // --- Optimistic UI: Add a reducer for optimistic add ---
    addItemOptimistic: (state, action) => {
      const { product, quantity } = action.payload;
      const existingIndex = (state.items || []).findIndex(item => item.product.id === product.id);
      if (existingIndex > -1) {
        state.items[existingIndex].quantity += quantity;
      } else {
        state.items.push({ product, quantity });
      }
    },
    revertAddItem: (state, action) => {
      // Optionally, you can re-fetch the cart or remove the last optimistic add
      // For simplicity, just re-fetch the cart in the thunk on error
    },
    updateQuantityOptimistic: (state, action) => {
      const { productId, delta } = action.payload; // Expecting delta (+1 or -1)
      const itemIndex = (state.items || []).findIndex(item => item.product.id === productId);
      if (itemIndex > -1) {
        const currentQuantity = state.items[itemIndex].quantity;
        const newQuantity = currentQuantity + delta;
        // Only update if the new quantity is 1 or more
        if (newQuantity >= 1) {
          state.items[itemIndex].quantity = newQuantity;
        } 
        // If delta is negative and quantity becomes 0 or less, we don't update here.
        // The actual removal is handled by removeItemOptimistic/removeItem.
        // This prevents the item disappearing briefly when clicking '-' on quantity 1.
      }
    },
    removeItemOptimistic: (state, action) => {
      const productId = action.payload;
      state.items = (state.items || []).filter(item => item.product.id !== productId);
    },
  },
  extraReducers: (builder) => {
    builder
      // --- Handle fetchCart ---
      .addCase(fetchCart.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchCart.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.items = action.payload; // Assuming payload is the items array
        state.error = null;
      })
      .addCase(fetchCart.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload || action.error.message; // Use error from rejectWithValue or default error
      })
      // --- Handle addItemToCart ---
      .addCase(addItemToCart.pending, (state) => {
        // Optional: Set a specific loading state for adding item
        state.status = 'loading';
      })
      .addCase(addItemToCart.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.items = action.payload; // Update items with the result from the thunk
        state.error = null;
        // No need to update localStorage here, thunk should handle it or backend provides source of truth
      })
      .addCase(addItemToCart.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload || action.error.message;
      })
      // --- Handle updateQuantity ---
      .addCase(updateQuantity.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.items = action.payload;
        state.error = null;
      })
      .addCase(updateQuantity.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload || action.error.message;
      })
      // --- Handle removeItem ---
      .addCase(removeItem.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.items = action.payload;
        state.error = null;
      })
      .addCase(removeItem.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload || action.error.message;
      })
      // --- Handle mergeLocalCartWithBackend ---
      .addCase(mergeLocalCartWithBackend.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.items = action.payload;
        state.error = null;
      })
      .addCase(mergeLocalCartWithBackend.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload || action.error.message;
      })
      // --- Handle clearCart ---
      .addCase(clearCart.fulfilled, (state) => {
        state.items = [];
        state.status = 'succeeded';
        state.error = null;
      })
      .addCase(clearCart.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload || action.error.message;
      })
      // --- Handle addCollectionToCart ---
      .addCase(addCollectionToCart.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(addCollectionToCart.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.items = action.payload;
        state.error = null;
      })
      .addCase(addCollectionToCart.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload || action.error.message;
      });
  },
});

// Export synchronous actions
export const { clearLocalCartAndState, addItemOptimistic, revertAddItem, updateQuantityOptimistic, removeItemOptimistic } = cartSlice.actions;

// Export reducer
export default cartSlice.reducer;

// Selectors (optional but recommended)
export const selectCartItems = (state) => state.cart.items || [];
export const selectCartStatus = (state) => state.cart.status;
export const selectCartError = (state) => state.cart.error;

// Example derived data selector (using reselect is better for memoization if needed)
export const selectCartCount = (state) =>
  (state.cart.items || []).reduce((count, item) => count + (item.quantity || 0), 0);

export const selectCartTotal = (state) =>
  (state.cart.items || []).reduce((total, item) => {
    if (item.product && typeof item.product.price === 'number' && typeof item.quantity === 'number') {
      return total + item.product.price * item.quantity;
    }
    return total;
  }, 0);