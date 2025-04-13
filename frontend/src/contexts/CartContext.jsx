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
    let accessToken; // Declare accessToken outside try block
    try {
      accessToken = localStorage.getItem('accessToken'); // Get token
      console.log("Attempting to add item. Access Token:", accessToken ? "Present" : "Missing"); // Log token presence

      // --- Logic for Logged-in Users (Sync with Backend) ---
      if (accessToken) {
        console.log(`Calling add-to-cart function for product ${productToAdd.id} with quantity ${quantity}`);
        // 1. Call add-to-cart Supabase function
        const response = await fetch(import.meta.env.VITE_SUPABASE_ADD_TO_CART_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}` // Use the retrieved token
          },
          body: JSON.stringify({ productId: productToAdd.id, quantity })
        });

        console.log("Add to cart response status:", response.status); // Log response status

        if (!response.ok) {
          let errorData = { message: `HTTP error! status: ${response.status}` };
          try {
              errorData = await response.json();
          } catch (e) {
              console.error("Failed to parse error response JSON:", e);
          }
          console.error("Add to cart API error:", errorData);

          // Check for specific foreign key error related to user
          if (errorData.error && typeof errorData.error === 'string' && errorData.error.includes('carts_userId_fkey')) {
              console.error("User ID constraint violation. The user associated with the token may no longer exist or be valid. Please try logging out and back in.");
              // Optionally, trigger a logout or show a more user-friendly message
              alert("There was an issue validating your session. Please log out and log back in.");
          }

          console.warn("Backend sync failed, proceeding with local update only.");
        } else {
            // Update based on Backend Response (Assuming backend returns the full updated cart)
            const updatedCartData = await response.json();
            console.log("Add to cart response data:", updatedCartData); // Log successful response data

            if (updatedCartData && Array.isArray(updatedCartData.items)) {
               // Transform backend items to match frontend structure { product: {...}, quantity: number }
               const transformedItems = updatedCartData.items.map(item => {
                   if (!item.product) {
                       console.warn("Cart item from backend missing product details:", item);
                       return null;
                   }
                   return {
                       product: item.product,
                       quantity: item.quantity
                   };
               }).filter(item => item !== null);

               setCartItems(transformedItems);
               console.log(`Cart updated successfully from backend response for user ${updatedCartData.userId}`);
               return; // Exit early as backend provided the state
            } else {
                console.warn("Add to cart response format unexpected or missing items array:", updatedCartData);
            }
        }
      }

      // --- Local Update (For Anonymous Users OR Fallback for Logged-in Users if backend fails/response unusable) ---
      console.log(`Performing local cart update for product ${productToAdd.name}`);
      setCartItems(prevItems => {
        const existingItem = prevItems.find(item => item.product.id === productToAdd.id);
        if (existingItem) {
          const newQuantity = existingItem.quantity + quantity;
          return prevItems.map(item =>
            item.product.id === productToAdd.id
              ? { ...item, quantity: newQuantity }
              : item
          );
        } else {
          const productDetails = {
              id: productToAdd.id,
              name: productToAdd.name,
              price: productToAdd.price,
              images: productToAdd.images || [],
          };
          return [...prevItems, { product: productDetails, quantity: quantity }];
        }
      });
      console.log(`Added ${quantity} of ${productToAdd.name} to local cart`);

    } catch (error) {
      console.error("Error in addItem function (local update stage):", error.message);
      alert(`Failed to add item locally: ${error.message}`);
    }
  }, []); // Dependency array is empty

  const removeItem = useCallback(async (productId) => {
    setCartItems(prevItems => prevItems.filter(item => item.product.id !== productId));
    console.log(`Removed item with ID ${productId} from cart (Local)`);
  }, []);

  const updateQuantity = useCallback(async (productId, newQuantity) => {
    const quantity = Math.max(1, newQuantity);
    setCartItems(prevItems =>
      prevItems.map(item =>
        item.product.id === productId
          ? { ...item, quantity: quantity }
          : item
      )
    );
    console.log(`Updated quantity for ID ${productId} to ${quantity} (Local)`);
  }, []);

  const clearCart = useCallback(async () => {
    setCartItems([]);
    console.log('Cart cleared (Local)');
  }, []);

  // --- Calculated Values ---

  const cartCount = useMemo(() => {
    return cartItems.reduce((count, item) => count + item.quantity, 0);
  }, [cartItems]);

  const cartTotal = useMemo(() => {
    return cartItems.reduce((total, item) => {
        const price = parseFloat(item.product.price) || 0;
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