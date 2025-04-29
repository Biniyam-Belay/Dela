import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { createOrderApi } from '../services/orderApi';

// Async thunk for creating an order
export const createOrder = createAsyncThunk(
  'order/createOrder',
  async (orderData, { rejectWithValue }) => {
    try {
      const response = await createOrderApi(orderData);
      if (!response.success) {
        throw new Error(response.error || 'Order creation failed');
      }
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message || 'Order creation failed');
    }
  }
);

const orderSlice = createSlice({
  name: 'order',
  initialState: {
    order: null,
    status: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
    error: null,
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
      });
  },
});

export const { resetOrderState } = orderSlice.actions;
export default orderSlice.reducer;

// Selectors
export const selectOrder = (state) => state.orders.order;
export const selectOrderStatus = (state) => state.orders.status;
export const selectOrderError = (state) => state.orders.error;
