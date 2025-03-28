import React, { createContext, useState, useContext, useEffect, useMemo, useCallback } from 'react';

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

  const addItem = useCallback((productToAdd, quantity = 1) => {
    setCartItems(prevItems => {
      const existingItem = prevItems.find(item => item.product.id === productToAdd.id);

      if (existingItem) {
        // Update quantity, respecting stock limit (if needed - basic implementation here)
        const newQuantity = existingItem.quantity + quantity;
        // Optional: Check against productToAdd.stockQuantity if available
        // const cappedQuantity = Math.min(newQuantity, productToAdd.stockQuantity);

        return prevItems.map(item =>
          item.product.id === productToAdd.id
            ? { ...item, quantity: newQuantity /* or cappedQuantity */ }
            : item
        );
      } else {
        // Add new item
        // Optional: Check against productToAdd.stockQuantity
        // const cappedQuantity = Math.min(quantity, productToAdd.stockQuantity);
        return [...prevItems, { product: productToAdd, quantity: quantity /* or cappedQuantity */ }];
      }
    });
    // Add feedback later (e.g., toast notification)
    console.log(`Added ${quantity} of ${productToAdd.name} to cart`);
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