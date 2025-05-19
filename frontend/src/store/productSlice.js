import { createSlice, createAsyncThunk } from "@reduxjs/toolkit"
import { supabase } from "../services/supabaseClient.js"
import { 
  fetchAdminProductById, 
  createAdminProduct, 
  updateAdminProduct 
} from '../services/adminApi.js'; 
import { fetchCategories as fetchCategoriesFromApi } from '../services/productApi.js';

export const fetchProducts = createAsyncThunk(
  "products/fetchProducts",
  async (params = {}, { rejectWithValue }) => {
    try {
      const query = new URLSearchParams();
      if (params.limit) query.append("limit", params.limit);
      if (params.page) query.append("page", params.page);
      if (typeof params.flash_deal !== "undefined") query.append("flash_deal", params.flash_deal);
      if (typeof params.price_gte !== "undefined") query.append("price_gte", params.price_gte);
      if (typeof params.price_lte !== "undefined") query.append("price_lte", params.price_lte);
      if (params.sortBy) query.append("sortBy", params.sortBy);
      if (params.order) query.append("order", params.order);
      if (params.search) query.append("search", params.search);
      if (params.category) query.append("category", params.category);
      if (typeof params.in_stock !== "undefined") query.append("in_stock", params.in_stock);
      if (params.min_rating) query.append("min_rating", params.min_rating);
      if (typeof params.is_trending !== "undefined") query.append("is_trending", params.is_trending);
      if (typeof params.is_featured !== "undefined") query.append("is_featured", params.is_featured);
      if (typeof params.is_new_arrival !== "undefined") query.append("is_new_arrival", params.is_new_arrival);

      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
      if (!supabaseUrl || !supabaseAnonKey) {
        throw new Error("Supabase URL or Anon Key is not configured in environment variables.");
      }
      
      const endpoint = `${supabaseUrl}/functions/v1/get-public-products?${query.toString()}`;
      
      const { data: { session } } = await supabase.auth.getSession();
      
      const headers = {
        'Content-Type': 'application/json',
        'apikey': supabaseAnonKey, // Required for Supabase function calls
      };

      if (session?.access_token) {
        headers['Authorization'] = `Bearer ${session.access_token}`;
      }

      const res = await fetch(endpoint, { headers });
      const responseData = await res.json();

      if (!res.ok) throw new Error(responseData.error || "Failed to fetch products");
      
      return responseData.data || []; 
    } catch (err) {
      return rejectWithValue(err.message || "Failed to fetch products");
    }
  }
);

// Async thunk for fetching categories
export const fetchCategoriesThunk = createAsyncThunk(
  "products/fetchCategories",
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetchCategoriesFromApi(); 
      return response.data || response || []; 
    } catch (err) {
      return rejectWithValue(err.message || "Failed to fetch categories");
    }
  }
);

// Async thunk for fetching reviews (mocked for now)
export const fetchReviewsThunk = createAsyncThunk(
  "products/fetchReviews",
  async (_, { rejectWithValue }) => {
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      return [
        { id: 1, name: "Sarah J.", rating: 5, comment: "Exceptional quality and service!", date: "2 weeks ago" },
        { id: 2, name: "Michael C.", rating: 5, comment: "Fast shipping, beautiful packaging.", date: "1 month ago" },
        { id: 3, name: "Emma W.", rating: 4, comment: "Love the minimalist design.", date: "2 months ago" },
      ];
    } catch (err) {
      return rejectWithValue(err.message || "Failed to fetch reviews");
    }
  }
);

export const deleteProduct = createAsyncThunk(
  "products/deleteProduct",
  async (productId, { rejectWithValue }) => {
    try {
      const { error } = await supabase.from("products").delete().eq("id", productId);
      if (error) throw error;
      return productId;
    } catch (err) {
      return rejectWithValue(err.message || "Failed to delete product");
    }
  }
);

export const fetchProductById = createAsyncThunk(
  'products/fetchProductById',
  async (productId, { rejectWithValue }) => {
    try {
      const response = await fetchAdminProductById(productId); 
      if (response.data) return response.data;
      throw new Error(response.error || 'Failed to fetch product');
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to fetch product');
    }
  }
);

export const createProduct = createAsyncThunk(
  'products/createProduct',
  async (productData, { rejectWithValue }) => {
    try {
      const response = await createAdminProduct(productData); 
      if (response.data) return response.data;
      throw new Error(response.error || 'Failed to create product');
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to create product');
    }
  }
);

export const updateProduct = createAsyncThunk(
  'products/updateProduct',
  async ({ productId, productData }, { rejectWithValue }) => {
    try {
      const response = await updateAdminProduct(productId, productData); 
      if (response.data) return response.data;
      throw new Error(response.error || 'Failed to update product');
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to update product');
    }
  }
);

const productSlice = createSlice({
  name: "products",
  initialState: {
    items: [],
    loading: false, 
    error: null,    
    currentProduct: null, 
    mutationStatus: 'idle', 
    mutationError: null,
    
    categories: [],
    categoriesLoading: false,
    categoriesError: null,

    reviews: [],
    reviewsLoading: false,
    reviewsError: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchProducts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to fetch products";
      })
      .addCase(fetchCategoriesThunk.pending, (state) => {
        state.categoriesLoading = true;
        state.categoriesError = null;
      })
      .addCase(fetchCategoriesThunk.fulfilled, (state, action) => {
        state.categoriesLoading = false;
        state.categories = action.payload;
      })
      .addCase(fetchCategoriesThunk.rejected, (state, action) => {
        state.categoriesLoading = false;
        state.categoriesError = action.payload || "Failed to fetch categories";
      })
      .addCase(fetchReviewsThunk.pending, (state) => {
        state.reviewsLoading = true;
        state.reviewsError = null;
      })
      .addCase(fetchReviewsThunk.fulfilled, (state, action) => {
        state.reviewsLoading = false;
        state.reviews = action.payload;
      })
      .addCase(fetchReviewsThunk.rejected, (state, action) => {
        state.reviewsLoading = false;
        state.reviewsError = action.payload || "Failed to fetch reviews";
      })
      .addCase(deleteProduct.pending, (state) => {
        state.mutationStatus = 'loading'; 
        state.mutationError = null;
      })
      .addCase(deleteProduct.fulfilled, (state, action) => {
        state.mutationStatus = 'succeeded';
        state.items = state.items.filter((prod) => prod.id !== action.payload);
      })
      .addCase(deleteProduct.rejected, (state, action) => {
        state.mutationStatus = 'failed';
        state.mutationError = action.payload || "Failed to delete product";
      })
      .addCase(fetchProductById.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.currentProduct = null;
      })
      .addCase(fetchProductById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentProduct = action.payload;
      })
      .addCase(fetchProductById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to fetch product';
        state.currentProduct = null;
      })
      .addCase(createProduct.pending, (state) => {
        state.mutationStatus = 'loading';
        state.mutationError = null;
      })
      .addCase(createProduct.fulfilled, (state, action) => {
        state.mutationStatus = 'succeeded';
        state.items.push(action.payload); // Add the new product to the list
      })
      .addCase(createProduct.rejected, (state, action) => {
        state.mutationStatus = 'failed';
        state.mutationError = action.payload || 'Failed to create product';
      })
      .addCase(updateProduct.pending, (state) => {
        state.mutationStatus = 'loading';
        state.mutationError = null;
      })
      .addCase(updateProduct.fulfilled, (state, action) => {
        state.mutationStatus = 'succeeded';
        state.items = state.items.map((item) =>
          item.id === action.payload.id ? action.payload : item
        );
        if (state.currentProduct && state.currentProduct.id === action.payload.id) {
          state.currentProduct = action.payload;
        }
      })
      .addCase(updateProduct.rejected, (state, action) => {
        state.mutationStatus = 'failed';
        state.mutationError = action.payload || 'Failed to update product';
      });
  },
});

export default productSlice.reducer;