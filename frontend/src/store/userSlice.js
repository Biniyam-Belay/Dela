import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { supabase } from "../services/supabaseClient";

export const fetchUsers = createAsyncThunk(
  "users/fetchUsers",
  async (params = { page: 1, limit: 10, search: '', role: '' }, { rejectWithValue }) => {
    try {
      // Build query string
      const queryParams = new URLSearchParams();
      queryParams.append('page', params.page.toString());
      queryParams.append('limit', params.limit.toString());
      if (params.search) {
        queryParams.append('search', params.search);
      }
      if (params.role) {
        queryParams.append('role', params.role);
      }
      
      const queryString = queryParams.toString();
      const functionUrl = `admin-get-users${queryString ? `?${queryString}` : ''}`;

      // Invoke your Supabase Edge Function "admin-get-users"
      const { data, error: invokeError } = await supabase.functions.invoke(functionUrl, {
        method: 'GET', // Explicitly GET
        // No body for GET when query params are in URL
      });

      if (invokeError) {
        console.error(`[userSlice] Edge Function '${functionUrl}' invocation error:`, invokeError);
        let detailedError = invokeError.message;
        if (invokeError.context && invokeError.context.json) {
            detailedError = invokeError.context.json.error || invokeError.message;
        } else if (invokeError.context && typeof invokeError.context.text === 'function') {
            // Try to get text if json is not available, might give more clues for non-JSON errors
            try {
                const errorText = await invokeError.context.text();
                console.error("[userSlice] Edge Function error response text:", errorText);
                // detailedError might be augmented here if errorText is useful
            } catch (textError) {
                // Ignore if can't get text
            }
        }
        throw new Error(detailedError);
      }

      if (data && typeof data.totalUsers !== 'undefined' && typeof data.totalPages !== 'undefined' && Array.isArray(data.users)) {
        return data; 
      } else {
        console.error("[userSlice] Edge Function 'admin-get-users' returned unexpected data structure:", data);
        throw new Error("Invalid data structure from user fetch function.");
      }

    } catch (err) {
      console.error("[userSlice] fetchUsers thunk catch error:", err);
      return rejectWithValue(err.message || "Failed to fetch users via Edge Function");
    }
  }
);

export const deleteUser = createAsyncThunk(
  "users/deleteUser",
  async (userId, { rejectWithValue }) => {
    try {
      // WARNING: This is a client-side admin call.
      // For production, use an Edge Function for deleting users securely.
      // Your 'admin-get-users' function currently only lists users.
      const { data, error } = await supabase.auth.admin.deleteUser(userId);
      if (error) {
        console.error("[userSlice] Supabase admin deleteUser error:", error);
        throw error;
      }
      return userId; 
    } catch (err) {
      console.error("[userSlice] deleteUser thunk catch error:", err);
      return rejectWithValue(err.message || "Failed to delete user from auth.users");
    }
  }
);

const userSlice = createSlice({
  name: "users",
  initialState: {
    items: [],
    loading: false,
    error: null,
    totalPages: 1,
    totalUsers: 0,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchUsers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.loading = false;
        // action.payload is { users: FormattedUser[], totalUsers, totalPages }
        // from your Edge Function
        state.items = action.payload.users; 
        state.totalPages = action.payload.totalPages;
        state.totalUsers = action.payload.totalUsers;
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to fetch users";
        state.items = [];
        state.totalPages = 1;
        state.totalUsers = 0;
      })
      .addCase(deleteUser.pending, (state) => {
        state.loading = true; 
        state.error = null;
      })
      .addCase(deleteUser.fulfilled, (state, action) => {
        state.loading = false;
        state.items = state.items.filter((u) => u.id !== action.payload);
        state.totalUsers = Math.max(0, state.totalUsers - 1);
      })
      .addCase(deleteUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to delete user";
      });
  },
});

export const selectAllUsers = (state) => state.users.items;
export const selectUsersLoading = (state) => state.users.loading;
export const selectUsersError = (state) => state.users.error;

export default userSlice.reducer;
