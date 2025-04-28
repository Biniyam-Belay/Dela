import { configureStore } from "@reduxjs/toolkit"
import cartReducer from "./cartSlice.js"
import orderReducer from "./orderSlice.js"
import productReducer from "./productSlice.js"
import categoryReducer from "./categorySlice.js"

const store = configureStore({
  reducer: {
    cart: cartReducer,
    orders: orderReducer,
    products: productReducer,
    categories: categoryReducer,
  },
})

export default store
export { store }
