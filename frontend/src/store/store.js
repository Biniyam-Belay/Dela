import { configureStore } from "@reduxjs/toolkit"
import cartReducer from "./cartSlice.js"
import orderReducer from "./orderSlice.js"
import productReducer from "./productSlice.js"
import categoryReducer from "./categorySlice.js"
import wishlistReducer from "./wishlistSlice.js" // Import the new wishlist reducer
import userReducer from "./userSlice.js" // Import the new user reducer

const store = configureStore({
  reducer: {
    cart: cartReducer,
    orders: orderReducer,
    products: productReducer,
    categories: categoryReducer,
    wishlist: wishlistReducer, // Add the wishlist reducer here
    users: userReducer, // Add the user reducer here
  },
})

export default store
export { store }
