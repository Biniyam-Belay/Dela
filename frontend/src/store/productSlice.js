import { createSlice, createAsyncThunk } from "@reduxjs/toolkit"
import { supabase } from "../services/supabaseClient"
import { fetchAdminProductById, createAdminProduct, updateAdminProduct } from '../services/adminApi';

export const fetchProducts = createAsyncThunk(
  "products/fetchProducts",
  async (params = {}, { rejectWithValue }) => {
    try {
      // Build query string for the edge function
      const query = new URLSearchParams();
      if (params.limit) query.append("limit", params.limit);
      if (params.page) query.append("page", params.page);
      if (typeof params.flash_deal !== "undefined") query.append("flash_deal", params.flash_deal);
      if (typeof params.price_gte !== "undefined") query.append("price_gte", params.price_gte);
      if (typeof params.price_lte !== "undefined") query.append("price_lte", params.price_lte);
      if (params.sortBy) query.append("sortBy", params.sortBy);
      if (params.order) query.append("order", params.order);
      // No featured filter, since the column does not exist

      // Use the full Supabase project URL for production fetch
      const supabaseUrl = 'https://exutmsxktrnltvdgnlop.supabase.co';
      const endpoint = `${supabaseUrl}/functions/v1/get-public-products?${query.toString()}`;
      const { data: { session } } = await supabase.auth.getSession();
      const headers = session?.access_token
        ? { "Authorization": `Bearer ${session.access_token}` }
        : {};
      const res = await fetch(endpoint, { headers });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to fetch products");
      return data.data || [];
    } catch (err) {
      return rejectWithValue(err.message || "Failed to fetch products");
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
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchProducts.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.loading = false
        state.items = action.payload
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload || "Failed to fetch products"
      })
      .addCase(deleteProduct.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(deleteProduct.fulfilled, (state, action) => {
        state.loading = false
        state.items = state.items.filter((prod) => prod.id !== action.payload)
      })
      .addCase(deleteProduct.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload || "Failed to delete product"
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
      .addCase(createProduct.fulfilled, (state) => {
        state.mutationStatus = 'succeeded';
      })
      .addCase(createProduct.rejected, (state, action) => {
        state.mutationStatus = 'failed';
        state.mutationError = action.payload || 'Failed to create product';
      })
      .addCase(updateProduct.pending, (state) => {
        state.mutationStatus = 'loading';
        state.mutationError = null;
      })
      .addCase(updateProduct.fulfilled, (state) => {
        state.mutationStatus = 'succeeded';
      })
      .addCase(updateProduct.rejected, (state, action) => {
        state.mutationStatus = 'failed';
        state.mutationError = action.payload || 'Failed to update product';
      });
  },
})

export default productSlice.reducer
