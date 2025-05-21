import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { supabase } from "../services/supabaseClient";

export const fetchOrders = createAsyncThunk(
  "orders/fetchOrders",
  async (params = { page: 1, limit: 10, search: '', status: '' }, { rejectWithValue }) => {
    try {
      const queryParams = new URLSearchParams();
      queryParams.append('page', params.page.toString());
      queryParams.append('limit', params.limit.toString());
      if (params.search) queryParams.append('search', params.search);
      if (params.status) queryParams.append('status', params.status);

      const queryString = queryParams.toString();
      const functionToInvoke = `get-admin-orders${queryString ? `?${queryString}` : ''}`;

      const { data: functionResponse, error: invokeError } = await supabase.functions.invoke(functionToInvoke, { method: 'GET' });

      if (invokeError) {
        let detailedError = invokeError.message;
        if (invokeError.context && invokeError.context.json) {
          detailedError = invokeError.context.json.error || invokeError.message;
        }
        throw new Error(detailedError);
      }

      // Always return a safe object for the reducer
      const safeData = functionResponse && functionResponse.data
        ? functionResponse.data
        : { orders: [], totalPages: 1, totalOrders: 0 };

      console.log('[orderSlice] Returning safeData to reducer:', safeData); // <-- Add this line

      return safeData;
    } catch (err) {
      return rejectWithValue(err.message || "Failed to fetch orders via Edge Function");
    }
  }
);

export const createOrder = createAsyncThunk(
  "orders/createOrder",
  async (orderDetails, { rejectWithValue }) => {
    try {
      // Ensure orderDetails contains: { orderItems, shippingAddress, totalAmount }
      const { data: functionResponse, error: invokeError } = await supabase.functions.invoke(
        "create-order", // Name of the Edge Function
        {
          body: orderDetails, // Pass orderDetails as the body
          method: 'POST', // Specify the method
        }
      );

      if (invokeError) {
        let detailedError = invokeError.message;
        // Attempt to parse more detailed error from function response if available
        if (invokeError.context && invokeError.context.json && invokeError.context.json.error) {
          detailedError = invokeError.context.json.error;
          if (invokeError.context.json.details) {
            detailedError += `: ${JSON.stringify(invokeError.context.json.details)}`;
          }
        } else if (functionResponse && functionResponse.error) { // Sometimes error is in data
            detailedError = functionResponse.error;
            if (functionResponse.details) {
                 detailedError += `: ${JSON.stringify(functionResponse.details)}`;
            }
        }
        throw new Error(detailedError);
      }

      // The Edge function is expected to return an object containing the created order.
      // e.g., { order: { id: '...', ... }, orderItemsData: [...], message: '...' }
      if (functionResponse && functionResponse.order && functionResponse.order.id) {
        return functionResponse.order; // Return only the order object
      } else {
        // Log the problematic response for debugging
        console.error(
          "Unexpected response structure from create-order function or missing order/order.id:",
          functionResponse
        );
        // Throw an error that will be caught by rejectWithValue
        throw new Error(
          "Failed to process order creation response: order data is invalid or missing."
        );
      }

    } catch (err) {
      return rejectWithValue(err.message || "Failed to create order via Edge Function");
    }
  }
);

const orderSlice = createSlice({
  name: "orders",
  initialState: {
    items: [],
    loading: false,
    error: null,
    currentOrder: null,
    totalPages: 1,
    totalOrders: 0,
    mutationStatus: 'idle',
    mutationError: null,
  },
  reducers: {
    clearOrderError: (state) => {
      state.error = null;
      state.mutationError = null;
    },
    resetMutationStatus: (state) => {
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
        state.items = action.payload.orders || [];
        state.totalPages = action.payload.totalPages || 1;
        state.totalOrders = action.payload.totalOrders || 0;
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
        state.currentOrder = action.payload; // Assuming payload is the created order
      })
      .addCase(createOrder.rejected, (state, action) => {
        state.mutationStatus = 'failed';
        state.mutationError = action.payload || "Failed to create order";
      });
  },
});

export const { clearOrderError, resetMutationStatus } = orderSlice.actions;
export const selectAllOrders = (state) => state.orders.items;
export const selectOrdersLoading = (state) => state.orders.loading;
export const selectOrderError = (state) => state.orders.error;
export const selectTotalOrders = (state) => state.orders.totalOrders;
export const selectOrderTotalPages = (state) => state.orders.totalPages;
export const selectCurrentOrder = (state) => state.orders.currentOrder;
export const selectOrderStatus = (state) => state.orders.mutationStatus;
export const selectOrderMutationError = (state) => state.orders.mutationError;

export default orderSlice.reducer;
