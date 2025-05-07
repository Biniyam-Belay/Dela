import { configureStore } from '@reduxjs/toolkit';
import productReducer from './productSlice';
import cartReducer from './cartSlice'; 
import wishlistReducer from './wishlistSlice'; 
// Import other reducers here if you have them

const store = configureStore({
  reducer: {
    products: productReducer,
    cart: cartReducer,
    wishlist: wishlistReducer,
    // Add other reducers here:
    // example: user: userReducer,
  },
  // Redux Toolkit's configureStore automatically includes redux-thunk.
});

export default store; // Ensure this is a default export
