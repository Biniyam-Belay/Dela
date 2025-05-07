import { configureStore } from '@reduxjs/toolkit';
import productReducer from './productSlice';
import cartReducer from './cartSlice'; 
import wishlistReducer from './wishlistSlice'; 
import categoryReducer from './categorySlice'; 
import orderReducer from './orderSlice'; // Assuming you have an orderSlice.js

const store = configureStore({
  reducer: {
    products: productReducer,
    cart: cartReducer,
    wishlist: wishlistReducer,
    categories: categoryReducer,
    orders: orderReducer, // Add your order reducer here
    // Add other reducers here:
    // example: user: userReducer,
  },
  // Redux Toolkit's configureStore automatically includes redux-thunk.
});

export default store;
