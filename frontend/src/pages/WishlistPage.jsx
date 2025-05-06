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
import toast from 'react-hot-toast';
import { formatETB } from '../utils/utils';
import { Helmet } from 'react-helmet';

const WishlistPage = () => {
  const dispatch = useDispatch();
  const { items: wishlistItems, status, error } = useSelector((state) => state.wishlist);
  const { user } = useAuth(); // Use AuthContext for user
  const [moveProcessingIds, setMoveProcessingIds] = React.useState(new Set());

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

  const handleMoveToCart = async (item) => {
    if (!item.product || moveProcessingIds.has(item.product_id)) return;
    setMoveProcessingIds(prev => new Set(prev).add(item.product_id));
    try {
      await dispatch(addItemToCart({ product: item.product, quantity: 1 })).unwrap();
      await dispatch(removeFromWishlist(item.product_id)).unwrap();
      toast.success(`${item.product.name} moved to cart!`);
    } catch (err) {
      toast.error(err?.message || 'Failed to move item to cart.');
    } finally {
      setMoveProcessingIds(prev => {
        const next = new Set(prev);
        next.delete(item.product_id);
        return next;
      });
    }
  };

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] bg-gradient-to-br from-gray-50 to-white">
        <h1 className="text-4xl font-semibold mb-4 text-neutral-800 tracking-tight">Wishlist</h1>
        <p className="text-gray-500 mb-6 text-lg">Please <Link to="/login" className="text-primary font-medium hover:underline">log in</Link> to view your wishlist.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-20 pt-36 animate-fade-in">
      <Helmet>
        <title>Wishlist | SuriAddis</title>
        <meta name="description" content="View and manage your wishlist. Save your favorite products for later on SuriAddis." />
      </Helmet>
      <h1 className="text-3xl font-semibold mb-12 text-neutral-800 tracking-tight text-center">My Wishlist</h1>

      {status === 'loading' && <Spinner />}
      {status === 'failed' && <ErrorMessage type="error" message={`Error loading wishlist: ${error}`} />}
      {status === 'succeeded' && (
        <>
          {wishlistItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-32">
              <img src="/placeholder-image.jpg" alt="Empty wishlist" className="w-36 h-36 opacity-20 mb-8 rounded-full border-4 border-dashed border-primary/20" />
              <p className="text-gray-400 text-xl font-medium">Your wishlist is currently empty.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
              {wishlistItems.map((item) => (
                item.product ? (
                  <div
                    key={item.id || item.product_id}
                    className="relative flex flex-col bg-white rounded-2xl border border-neutral-200 hover:border-neutral-400 transition-all duration-300 overflow-hidden group hover:-translate-y-1 hover:scale-[1.02]"
                  >
                    <Link to={`/products/${item.product_id}`} className="block relative">
                      <img
                        src={item.product.image_url || '/placeholder-image.jpg'}
                        alt={item.product.name}
                        className="w-full h-56 object-cover object-center transition-transform duration-300 group-hover:scale-105 bg-neutral-100 rounded-t-2xl"
                      />
                    </Link>
                    <div className="flex-1 flex flex-col p-5">
                      <h3 className="font-semibold text-lg mb-1 truncate text-neutral-900">
                        <Link to={`/products/${item.product_id}`} className="hover:text-primary transition-colors">
                          {item.product.name}
                        </Link>
                      </h3>
                      <p className="text-neutral-800 text-xl font-medium mb-4">{formatETB(item.product.price)}</p>
                      <div className="flex gap-2 mt-auto">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleMoveToCart(item)}
                          className="flex-1 flex items-center justify-center text-xs rounded-lg border-neutral-200 hover:bg-neutral-900/5 font-semibold bg-white/80 backdrop-blur disabled:opacity-60 text-neutral-800"
                          disabled={moveProcessingIds.has(item.product_id)}
                        >
                          <FaShoppingCart className="mr-2 text-neutral-800" />
                          {moveProcessingIds.has(item.product_id) ? 'Moving...' : 'Move to Cart'}
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleRemoveFromWishlist(item.product_id)}
                          aria-label="Remove from wishlist"
                          className="text-red-500 hover:bg-red-50 rounded-lg border border-transparent hover:border-red-200"
                        >
                          <FaTrashAlt />
                        </Button>
                      </div>
                    </div>
                    <div className="absolute top-4 right-4 bg-neutral-900/80 text-white rounded-full px-3 py-1 text-xs font-semibold border border-neutral-300 select-none pointer-events-none">
                      Wishlisted
                    </div>
                  </div>
                ) : (
                  <div key={item.id || item.product_id} className="border rounded-2xl p-6 bg-gray-100 flex flex-col items-center justify-center">
                    <p className="text-red-400 mb-2 font-semibold">Error: Product details not available.</p>
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
