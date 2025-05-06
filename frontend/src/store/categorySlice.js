import { createSlice, createAsyncThunk } from "@reduxjs/toolkit"
import { supabase } from "../services/supabaseClient"

export const fetchCategories = createAsyncThunk(
  "categories/fetchCategories",
  async (params = {}, { rejectWithValue }) => {
    try {
      let query = supabase.from("categories").select("*")
      if (params.limit) query = query.limit(params.limit)
      const { data, error } = await query
      if (error) throw error
      return data
    } catch (err) {
      return rejectWithValue(err.message || "Failed to fetch categories")
    }
  }
)

export const deleteCategory = createAsyncThunk(
  "categories/deleteCategory",
  async (categoryId, { rejectWithValue }) => {
    try {
      const { error } = await supabase.from("categories").delete().eq("id", categoryId);
      if (error) throw error;
      return categoryId;
    } catch (err) {
      return rejectWithValue(err.message || "Failed to delete category");
    }
  }
);

export const fetchCategoryById = createAsyncThunk(
  'categories/fetchCategoryById',
  async (categoryId, { rejectWithValue }) => {
    try {
      const response = await fetchAdminCategoryById(categoryId);
      if (response.data) return response.data;
      throw new Error(response.error || 'Failed to fetch category');
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to fetch category');
    }
  }
);

export const createCategory = createAsyncThunk(
  'categories/createCategory',
  async (categoryData, { rejectWithValue }) => {
    try {
      const response = await createAdminCategory(categoryData);
      if (response.data) return response.data;
      throw new Error(response.error || 'Failed to create category');
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to create category');
    }
  }
);

export const updateCategory = createAsyncThunk(
  'categories/updateCategory',
  async ({ categoryId, categoryData }, { rejectWithValue }) => {
    try {
      const response = await updateAdminCategory(categoryId, categoryData);
      if (response.data) return response.data;
      throw new Error(response.error || 'Failed to update category');
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to update category');
    }
  }
);

const categorySlice = createSlice({
  name: "categories",
  initialState: {
    items: [],
    loading: false,
    error: null,
    currentCategory: null,
    mutationStatus: 'idle',
    mutationError: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchCategories.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchCategories.fulfilled, (state, action) => {
        state.loading = false
        state.items = action.payload
      })
      .addCase(fetchCategories.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload || "Failed to fetch categories"
      })
      .addCase(deleteCategory.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(deleteCategory.fulfilled, (state, action) => {
        state.loading = false
        state.items = state.items.filter((cat) => cat.id !== action.payload)
      })
      .addCase(deleteCategory.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload || "Failed to delete category"
      })
      .addCase(fetchCategoryById.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.currentCategory = null;
      })
      .addCase(fetchCategoryById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentCategory = action.payload;
      })
      .addCase(fetchCategoryById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to fetch category';
        state.currentCategory = null;
      })
      .addCase(createCategory.pending, (state) => {
        state.mutationStatus = 'loading';
        state.mutationError = null;
      })
      .addCase(createCategory.fulfilled, (state) => {
        state.mutationStatus = 'succeeded';
      })
      .addCase(createCategory.rejected, (state, action) => {
        state.mutationStatus = 'failed';
        state.mutationError = action.payload || 'Failed to create category';
      })
      .addCase(updateCategory.pending, (state) => {
        state.mutationStatus = 'loading';
        state.mutationError = null;
      })
      .addCase(updateCategory.fulfilled, (state) => {
        state.mutationStatus = 'succeeded';
      })
      .addCase(updateCategory.rejected, (state, action) => {
        state.mutationStatus = 'failed';
        state.mutationError = action.payload || 'Failed to update category';
      });
  },
})

export default categorySlice.reducer
