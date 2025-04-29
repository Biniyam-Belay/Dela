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

const categorySlice = createSlice({
  name: "categories",
  initialState: {
    items: [],
    loading: false,
    error: null,
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
  },
})

export default categorySlice.reducer
