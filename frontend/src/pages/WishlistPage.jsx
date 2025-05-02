import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import { getWishlist, removeFromWishlist } from '../store/wishlistSlice';
import { addItemToCart } from '../store/cartSlice'; // Import addToCart for moving items
import { Button } from '../components/ui/button';
import Spinner from '../components/common/Spinner';
import ErrorMessage  from '../components/common/ErrorMessage';
import { FaTrashAlt, FaShoppingCart } from 'react-icons/fa'; // Icons
import { useAuth } from '../contexts/authContext'; // Use AuthContext for user

const WishlistPage = () => {
  const dispatch = useDispatch();
  const { items: wishlistItems, status, error } = useSelector((state) => state.wishlist);
  const { user } = useAuth(); // Use AuthContext for user

  useEffect(() => {
    console.log('Wishlist useEffect:', { user, status });
    // Fetch wishlist only if user is logged in and status is idle
    if (user && status === 'idle') {
      dispatch(getWishlist());
    }
  }, [dispatch, user, status]);

  const handleRemoveFromWishlist = (product_id) => {
    dispatch(removeFromWishlist(product_id));
  };

  const handleMoveToCart = (item) => {
    if (item.product) {
        // Dispatch action to add to cart (ensure your cart slice handles this)
        dispatch(addItemToCart({ product: item.product, quantity: 1 })); 
        // Then remove from wishlist
        dispatch(removeFromWishlist(item.product_id));
    } else {
        console.error("Cannot move to cart: Product data missing from wishlist item.", item);
        // Optionally show an error to the user
    }
  };

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <h1 className="text-3xl font-light mb-6">Wishlist</h1>
        <p className="text-gray-600 mb-4">Please <Link to="/login" className="text-primary hover:underline">log in</Link> to view your wishlist.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12 pt-28">
      <h1 className="text-3xl font-light mb-8">My Wishlist</h1>

      {status === 'loading' && <Spinner />}
      {status === 'failed' && <ErrorMessage type="error" message={`Error loading wishlist: ${error}`} />}
      
      {status === 'succeeded' && (
        <>
          {wishlistItems.length === 0 ? (
            <p className="text-gray-600 text-center">Your wishlist is currently empty.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {wishlistItems.map((item) => (
                item.product ? ( // Check if product data exists
                  <div key={item.id || item.product_id} className="border rounded-lg overflow-hidden shadow-sm bg-white flex flex-col">
                    <Link to={`/products/${item.product_id}`} className="block">
                      <img 
                        src={item.product.image_url || '/placeholder-image.jpg'} 
                        alt={item.product.name} 
                        className="w-full h-48 object-cover" 
                      />
                    </Link>
                    <div className="p-4 flex flex-col flex-grow">
                      <h3 className="font-semibold text-lg mb-1 truncate">
                        <Link to={`/products/${item.product_id}`} className="hover:text-primary">
                          {item.product.name}
                        </Link>
                      </h3>
                      <p className="text-gray-700 font-light text-xl mb-3">${item.product.price?.toFixed(2)}</p>
                      <div className="mt-auto flex space-x-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleMoveToCart(item)}
                          className="flex-1 flex items-center justify-center text-xs"
                        >
                          <FaShoppingCart className="mr-1" /> Move to Cart
                        </Button>
                        <Button 
                          variant="danger-outline"
                          size="icon-sm"
                          onClick={() => handleRemoveFromWishlist(item.product_id)}
                          aria-label="Remove from wishlist"
                        >
                          <FaTrashAlt />
                        </Button>
                      </div>
                    </div>
                  </div>
                ) : (
                  // Optional: Render a placeholder or error for items missing product data
                  <div key={item.id || item.product_id} className="border rounded-lg p-4 shadow-sm bg-gray-100">
                    <p className="text-red-500">Error: Product details not available.</p>
                    <Button 
                      variant="danger-outline"
                      size="sm"
                      onClick={() => handleRemoveFromWishlist(item.product_id)}
                      className="mt-2"
                    >
                      Remove Item
                    </Button>
                  </div>
                )
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default WishlistPage;
