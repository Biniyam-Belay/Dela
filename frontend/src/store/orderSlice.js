import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { createOrderApi } from '../services/orderApi';
import { fetchAdminOrders } from '../services/adminApi';

// Async thunk for creating an order
export const createOrder = createAsyncThunk(
  'order/createOrder',
  async (orderData, { rejectWithValue }) => {
    try {
      const response = await createOrderApi(orderData);
      if (!response.success) {
        throw new Error(response.error || 'Order creation failed');
      }
      // Fix: support both { order } and { data } from backend
      return response.order || response.data;
    } catch (error) {
      return rejectWithValue(error.message || 'Order creation failed');
    }
  }
);

// Async thunk for fetching orders
export const fetchOrders = createAsyncThunk(
  'orders/fetchOrders',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await fetchAdminOrders(params);
      if (response.data) {
        return response.data;
      } else if (response.success) {
        return response;
      } else {
        throw new Error(response.error || 'Failed to fetch orders');
      }
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch orders');
    }
  }
);

const orderSlice = createSlice({
  name: 'order',
  initialState: {
    order: null,
    status: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
    error: null,
    orders: [],
    totalPages: 1,
    totalOrders: 0,
    loading: false,
  },
  reducers: {
    resetOrderState: (state) => {
      state.order = null;
      state.status = 'idle';
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(createOrder.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(createOrder.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.order = action.payload;
        state.error = null;
      })
      .addCase(createOrder.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload || action.error.message;
      })
      .addCase(fetchOrders.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchOrders.fulfilled, (state, action) => {
        state.loading = false;
        state.orders = action.payload.orders || [];
        state.totalPages = action.payload.totalPages || 1;
        state.totalOrders = action.payload.totalOrders || 0;
      })
      .addCase(fetchOrders.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to fetch orders';
      });
  },
});

export const { resetOrderState } = orderSlice.actions;
export default orderSlice.reducer;

// Selectors
export const selectOrder = (state) => state.orders.order;
export const selectOrderStatus = (state) => state.orders.status;
export const selectOrderError = (state) => state.orders.error;
