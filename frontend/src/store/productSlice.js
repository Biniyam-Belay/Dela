import { createSlice, createAsyncThunk } from "@reduxjs/toolkit"
import { supabase } from "../utils/supabaseClient"

export const fetchProducts = createAsyncThunk(
  "products/fetchProducts",
  async (params = {}, { rejectWithValue }) => {
    try {
      let query = supabase.from("products").select("*")
      if (params.featured) query = query.eq("featured", true)
      if (params.limit) query = query.limit(params.limit)
      if (params.page) query = query.range((params.page - 1) * params.limit, params.page * params.limit - 1)
      const { data, error } = await query
      if (error) throw error
      return data
    } catch (err) {
      return rejectWithValue(err.message || "Failed to fetch products")
    }
  }
)

const productSlice = createSlice({
  name: "products",
  initialState: {
    items: [],
    loading: false,
    error: null,
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
  },
})

export default productSlice.reducer
