import { useEffect } from 'react';
import store from '../store/store.js'; // Changed from named import to default import
import { fetchCart } from '../store/cartSlice';

// Initializes the cart on app load
export default function CartInitializer() {
  const dispatch = store.dispatch;
  useEffect(() => {
    dispatch(fetchCart());
  }, [dispatch]);
  return null;
}
