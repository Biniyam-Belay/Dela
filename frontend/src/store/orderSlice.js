import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { supabase } from "../services/supabaseClient"; // Adjust path if needed

export const fetchOrders = createAsyncThunk(
  "orders/fetchOrders",
  async (params = { page: 1, limit: 10, search: '', status: '' }, { rejectWithValue }) => {
    try {
      const { page, limit, search, status } = params;
      const offset = (page - 1) * limit;

      let query = supabase
        .from("orders")
        .select(`*`, { count: "exact" })
        .order("created_at", { ascending: false });

      if (search) {
        query = query.or(`order_number.ilike.%${search}%,shipping_address->>firstName.ilike.%${search}%,shipping_address->>lastName.ilike.%${search}%,shipping_address->>email.ilike.%${search}%`);
      }

      if (status) {
        query = query.eq("status", status);
      }

      query = query.range(offset, offset + limit - 1);

      const { data, error, count } = await query;

      if (error) {
        throw error;
      }
      
      const totalOrders = count || 0;
      const totalPages = Math.ceil(totalOrders / limit);

      const responseData = data || [];
      return { data: responseData, totalOrders, totalPages };
    } catch (err) {
      return rejectWithValue(err.message || "Failed to fetch orders");
    }
  }
);

export const createOrder = createAsyncThunk(
  "orders/createOrder",
  async (orderDetails, { rejectWithValue }) => {
    try {
      const { data, error } = await supabase
        .from("orders")
        .insert([
          // Map orderDetails to your table columns
          // e.g., { 
          //   user_id: orderDetails.userId, 
          //   total_amount: orderDetails.totalAmount, 
          //   status: 'Pending', // or 'Processing'
          //   shipping_address: orderDetails.shippingAddress,
          //   // ... other fields
          // }
        ])
        .select()
        .single();

      if (error) {
        throw error;
      }

      return data;
    } catch (err) {
      return rejectWithValue(err.message || "Failed to create order");
    }
  }
);

const orderSlice = createSlice({
  name: "orders",
  initialState: {
    items: [],
    loading: false, // For fetch operations
    error: null,    // For fetch operations
    currentOrder: null,
    totalPages: 1,
    totalOrders: 0,
    mutationStatus: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
    mutationError: null,
  },
  reducers: {
    clearOrderError: (state) => {
      state.error = null;
      state.mutationError = null; // Clear mutation error as well
    },
    resetMutationStatus: (state) => { // New reducer to reset mutation status
      state.mutationStatus = 'idle';
      state.mutationError = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchOrders.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchOrders.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload.data;
        state.totalPages = action.payload.totalPages;
        state.totalOrders = action.payload.totalOrders;
      })
      .addCase(fetchOrders.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to fetch orders";
        state.items = [];
        state.totalPages = 1;
        state.totalOrders = 0;
      })
      .addCase(createOrder.pending, (state) => {
        state.mutationStatus = 'loading';
        state.mutationError = null;
      })
      .addCase(createOrder.fulfilled, (state, action) => {
        state.mutationStatus = 'succeeded';
        // Optionally add to items or set currentOrder
        // state.items.unshift(action.payload);
        // state.totalOrders++;
        // state.currentOrder = action.payload;
      })
      .addCase(createOrder.rejected, (state, action) => {
        state.mutationStatus = 'failed';
        state.mutationError = action.payload || "Failed to create order";
      });
  },
});

export const { clearOrderError, resetMutationStatus } = orderSlice.actions;

export const selectAllOrders = (state) => state.orders.items;
export const selectOrdersLoading = (state) => state.orders.loading; // Loading for fetch
export const selectOrderError = (state) => state.orders.error; // Error for fetch
export const selectTotalOrders = (state) => state.orders.totalOrders;
export const selectOrderTotalPages = (state) => state.orders.totalPages;
export const selectCurrentOrder = (state) => state.orders.currentOrder;
export const selectOrderStatus = (state) => state.orders.mutationStatus; // Renamed from selectOrderMutationStatus
export const selectOrderMutationError = (state) => state.orders.mutationError; // Selector for mutation error

export default orderSlice.reducer;
