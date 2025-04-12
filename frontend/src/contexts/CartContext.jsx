import React, { createContext, useState, useContext, useEffect, useMemo, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { supabase } from '../utils/supabaseClient'; // Adjust the import based on your project structure

// Create the context
const CartContext = createContext(null);

// Initial state helper function (reads from localStorage)
const getInitialCartState = () => {
    try {
        const storedCart = localStorage.getItem('shoppingCart');
        if (storedCart) {
            const parsedCart = JSON.parse(storedCart);
            // Basic validation: Ensure it's an array
            return Array.isArray(parsedCart) ? parsedCart : [];
        }
    } catch (error) {
        console.error("Error reading cart from localStorage:", error);
    }
    return []; // Default to empty array if nothing stored or error
};


// Create the provider component
export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState(getInitialCartState); // Array of { product: {...}, quantity: number }

  // Effect to save cart to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem('shoppingCart', JSON.stringify(cartItems));
    } catch (error) {
      console.error("Error saving cart to localStorage:", error);
    }
  }, [cartItems]);

  // --- Cart Actions ---

  const addItem = useCallback(async (productToAdd, quantity = 1) => {
    try {
      // 1. Call add-to-cart Supabase function
      const response = await fetch(import.meta.env.VITE_SUPABASE_ADD_TO_CART_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        },
        body: JSON.stringify({ productId: productToAdd.id, quantity })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      // 2. Update local cart
      setCartItems(prevItems => {
        const existingItem = prevItems.find(item => item.product.id === productToAdd.id);

        if (existingItem) {
          // Update quantity
          const newQuantity = existingItem.quantity + quantity;
          return prevItems.map(item =>
            item.product.id === productToAdd.id
              ? { ...item, quantity: newQuantity }
              : item
          );
        } else {
          // Add new item
          return [...prevItems, { product: productToAdd, quantity: quantity }];
        }
      });

      console.log(`Added ${quantity} of ${productToAdd.name} to cart`);
    } catch (error) {
      console.error("Error adding item to cart:", error);
      // Handle error (e.g., display error message to user)
    }
  }, []);


  const removeItem = useCallback((productId) => {
    setCartItems(prevItems => prevItems.filter(item => item.product.id !== productId));
    console.log(`Removed item with ID ${productId} from cart`);
  }, []);


  const updateQuantity = useCallback((productId, newQuantity) => {
    // Ensure quantity is at least 1
    const quantity = Math.max(1, newQuantity);
    // Optional: Check against stock limit
    // const productInCart = cartItems.find(item => item.product.id === productId)?.product;
    // const cappedQuantity = productInCart ? Math.min(quantity, productInCart.stockQuantity) : quantity;


    setCartItems(prevItems =>
      prevItems.map(item =>
        item.product.id === productId
          ? { ...item, quantity: quantity /* or cappedQuantity */ }
          : item
      )
    );
    console.log(`Updated quantity for ID ${productId} to ${quantity}`);
  }, [/* cartItems - uncomment if using stock check */]); // Add cartItems dependency if stock check uses it


  const clearCart = useCallback(() => {
    setCartItems([]);
    console.log('Cart cleared');
  }, []);

  // --- Calculated Values ---

  const cartCount = useMemo(() => {
    // Sum of quantities of all items in the cart
    return cartItems.reduce((count, item) => count + item.quantity, 0);
  }, [cartItems]);

  const cartTotal = useMemo(() => {
    // Sum of (item price * item quantity) for all items
    return cartItems.reduce((total, item) => {
        const price = parseFloat(item.product.price) || 0; // Ensure price is a number
        return total + (price * item.quantity);
    }, 0);
  }, [cartItems]);


  // Value provided by the context
  const contextValue = {
    cartItems,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    cartCount,
    cartTotal,
  };

  return (
    <CartContext.Provider value={contextValue}>
      {children}
    </CartContext.Provider>
  );
};

// Custom hook to use the cart context easily
export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};