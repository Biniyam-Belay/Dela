import { configureStore } from '@reduxjs/toolkit';
import productReducer from './productSlice';
import cartReducer from './cartSlice'; 
import wishlistReducer from './wishlistSlice'; 
import categoryReducer from './categorySlice'; 
import orderReducer from './orderSlice';
import userReducer from './userSlice'; // Import userReducer

const store = configureStore({
  reducer: {
    products: productReducer,
    cart: cartReducer,
    wishlist: wishlistReducer,
    categories: categoryReducer,
    orders: orderReducer,
    users: userReducer, // Add userReducer here
  },
  // Redux Toolkit's configureStore automatically includes redux-thunk.
});

export default store;
