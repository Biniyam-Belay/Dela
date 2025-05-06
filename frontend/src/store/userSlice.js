import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { supabase } from "../services/supabaseClient";

export const fetchUsers = createAsyncThunk(
  "users/fetchUsers",
  async (params = {}, { rejectWithValue }) => {
    try {
      // Get the current user's access token
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;
      if (!token) throw new Error("No access token found. Please log in as an admin.");
      const url = new URL(import.meta.env.VITE_SUPABASE_ADMIN_GET_USERS_URL);
      if (params.search) url.searchParams.append("search", params.search);
      if (params.role) url.searchParams.append("role", params.role);
      if (params.page) url.searchParams.append("page", params.page);
      if (params.limit) url.searchParams.append("limit", params.limit);
      const res = await fetch(url.toString(), {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to fetch users");
      return data;
    } catch (err) {
      return rejectWithValue(err.message || "Failed to fetch users");
    }
  }
);

export const deleteUser = createAsyncThunk(
  "users/deleteUser",
  async (userId, { rejectWithValue }) => {
    try {
      const { error } = await supabase.from("users").delete().eq("id", userId);
      if (error) throw error;
      return userId;
    } catch (err) {
      return rejectWithValue(err.message || "Failed to delete user");
    }
  }
);

const userSlice = createSlice({
  name: "users",
  initialState: {
    items: [],
    totalPages: 1,
    totalUsers: 0,
    loading: false,
    error: null,
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
        state.items = action.payload.users || [];
        state.totalPages = action.payload.totalPages || 1;
        state.totalUsers = action.payload.totalUsers || 0;
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to fetch users";
      })
      .addCase(deleteUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteUser.fulfilled, (state, action) => {
        state.loading = false;
        state.items = state.items.filter((u) => u.id !== action.payload);
      })
      .addCase(deleteUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to delete user";
      });
  },
});

export default userSlice.reducer;
