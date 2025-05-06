import { useEffect } from 'react';
import { store } from '../store/store.js';
import { fetchCart } from '../store/cartSlice';

// Initializes the cart on app load
export default function CartInitializer() {
  const dispatch = store.dispatch;
  useEffect(() => {
    dispatch(fetchCart());
  }, [dispatch]);
  return null;
}
