import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import toast from 'react-hot-toast';
import { 
  FiArrowLeft, 
  FiShoppingCart, 
  FiHome, 
  FiHeart,
  FiShare2,
  FiTag
} from 'react-icons/fi';
import { supabase } from '../services/supabaseClient.js';
import { addCollectionToCart } from '../store/cartSlice';
import ProductCard from '../components/ui/ProductCard';
import Spinner from '../components/common/Spinner.jsx';
import { Helmet } from 'react-helmet';
import { formatETB } from '../utils/utils';

const CollectionDetailPage = () => {
  const { collectionId } = useParams();
  const dispatch = useDispatch();
  const [collection, setCollection] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAddingToCart, setIsAddingToCart] = useState(false);

  useEffect(() => {
    fetchCollectionDetails();
  }, [collectionId]);

  const fetchCollectionDetails = async () => {
    try {
      setLoading(true);
      
      // Check if the collectionId is a valid UUID (not a mock numeric ID)
      const isNumericId = /^\d+$/.test(collectionId);
      if (isNumericId) {
        console.warn('Received numeric collection ID:', collectionId, 'This suggests mock data is being used');
        // Try to get a real collection instead
        const { data: realCollections, error } = await supabase
          .from('collections')
          .select('id, name')
          .eq('status', 'active')
          .limit(1);
        
        if (!error && realCollections && realCollections.length > 0) {
          const realCollectionId = realCollections[0].id;
          console.log('Redirecting to real collection:', realCollectionId);
          // Redirect to the real collection
          window.location.href = `/collections/${realCollectionId}`;
          return;
        }
      }
      
      // Try direct database query first instead of Edge Function
      console.log('Fetching collection details for ID:', collectionId);
      const { data: collectionData, error: dbError } = await supabase
        .from('collections')
        .select(`
          id,
          name,
          description,
          price,
          image_url,
          status,
          created_at,
          seller_id,
          sellers (
            id,
            store_name,
            contact_email
          ),
          collection_items (
            products (
              id,
              name,
              description,
              price,
              image_url,
              category
            )
          )
        `)
        .eq('id', collectionId)
        .eq('status', 'active')
        .single();

      if (dbError) {
        console.error('Database query error:', dbError);
        throw dbError;
      }

      if (collectionData) {
        console.log('Collection data from database:', collectionData);
        
        // Transform the data to match expected format
        const transformedCollection = {
          id: collectionData.id,
          name: collectionData.name,
          description: collectionData.description,
          price: collectionData.price,
          image_url: collectionData.image_url || 'https://exutmsxktrnltvdgnlop.supabase.co/storage/v1/object/public/public_assets/placeholder.webp',
          seller: {
            id: collectionData.seller_id,
            store_name: collectionData.sellers?.store_name || 'Unknown Store',
            contact_email: collectionData.sellers?.contact_email || ''
          },
          // Add products with seller information from the collection
          products: collectionData.collection_items?.map(item => ({
            ...item.products,
            seller_id: collectionData.seller_id // Add seller ID to each product
          })).filter(Boolean) || [],
          created_at: collectionData.created_at
        };
        
        setCollection(transformedCollection);
      } else {
        throw new Error('Collection not found');
      }
    } catch (err) {
      console.error('Error fetching collection details:', err);
      setError('Failed to load collection details');
      // Don't use mock data fallback as it contains numeric IDs that break checkout
      // Instead, show an error message to the user
      console.log('Not using mock data fallback to prevent UUID errors in checkout');
    } finally {
      setLoading(false);
    }
  };

  const getMockCollection = () => ({
    id: collectionId,
    name: 'Summer Vibes Collection',
    description: 'Experience the essence of summer with our carefully curated collection of bright, airy, and comfortable pieces perfect for the season.',
    image_url: '/images/hero-2.jpg',
    price: 199.99,
    seller_name: 'The Test Boutique',
    seller_id: 1,
    status: 'active',
    created_at: '2024-01-15T00:00:00Z',
    products: [
      {
        id: 1,
        name: 'Sunset Breeze Dress',
        price: 79.99,
        image_url: '/images/dress-summer.jpg',
        description: 'Flowing summer dress in sunset orange',
        category: 'Dresses'
      },
      {
        id: 2,
        name: 'Beach Day Sandals',
        price: 45.99,
        image_url: '/images/sandals-beach.jpg',
        description: 'Comfortable sandals for beach walks',
        category: 'Footwear'
      },
      {
        id: 3,
        name: 'Sun Hat Classic',
        price: 29.99,
        image_url: '/images/hat-sun.jpg',
        description: 'Wide-brimmed sun hat for protection',
        category: 'Accessories'
      },
      {
        id: 4,
        name: 'Lightweight Cardigan',
        price: 59.99,
        image_url: '/images/cardigan-light.jpg',
        description: 'Perfect for cool summer evenings',
        category: 'Outerwear'
      }
    ]
  });

  const handleAddToCart = async () => {
    if (!collection || isAddingToCart) return;
    
    // Prevent adding collections with numeric IDs (mock data) to cart
    if (typeof collection.id === 'number') {
      toast.error('Collection data unavailable. Please refresh the page.');
      return;
    }
    
    setIsAddingToCart(true);
    try {
      await dispatch(addCollectionToCart({ collection, quantity: 1 })).unwrap();
      toast.success(`${collection.name} added to cart!`);
    } catch (error) {
      console.error('Error adding collection to cart:', error);
      toast.error(error || 'Failed to add collection to cart');
    } finally {
      setIsAddingToCart(false);
    }
  };

  const handleAddToWishlist = () => {
    // Add collection to wishlist logic
    console.log('Adding collection to wishlist:', collection.id);
  };

  const handleShare = () => {
    // Share collection logic
    if (navigator.share) {
      navigator.share({
        title: collection.name,
        text: collection.description,
        url: window.location.href,
      });
    } else {
      // Fallback to clipboard
      navigator.clipboard.writeText(window.location.href);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <div className="container mx-auto px-4 py-32">
          <div className="flex justify-center items-center h-64">
            <Spinner />
          </div>
        </div>
      </div>
    );
  }

  if (error || !collection) {
    return (
      <div className="min-h-screen bg-white">
        <div className="container mx-auto px-4 py-32">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Collection Not Found</h1>
            <p className="text-gray-600 mb-8">{error || 'The collection you\'re looking for doesn\'t exist.'}</p>
            <Link
              to="/collections"
              className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <FiArrowLeft className="mr-2 h-4 w-4" />
              Back to Collections
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <Helmet>
        <title>{collection.name} | SuriAddis</title>
        <meta name="description" content={collection.description} />
      </Helmet>

      {/* Header */}
      <div className="bg-gray-50 py-8 mt-20">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between">
            <Link
              to="/collections"
              className="inline-flex items-center text-gray-600 hover:text-gray-900"
            >
              <FiArrowLeft className="mr-2 h-4 w-4" />
              Back to Collections
            </Link>
            <div className="flex items-center space-x-2">
              <button
                onClick={handleShare}
                className="p-2 text-gray-600 hover:text-gray-900 rounded-lg hover:bg-gray-100"
              >
                <FiShare2 className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Collection Hero */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Collection Image */}
          <div className="aspect-square rounded-2xl overflow-hidden">
            <img
              src={collection.image_url || '/placeholder-image.jpg'}
              alt={collection.name}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.target.src = '/placeholder-image.jpg';
              }}
            />
          </div>

          {/* Collection Info */}
          <div className="flex flex-col justify-center">
            <div className="mb-6">
              <div className="flex items-center mb-2">
                <FiHome className="h-4 w-4 text-gray-500 mr-2" />
                <span className="text-sm text-gray-600">
                  Curated by {collection.seller_name}
                </span>
              </div>
              <h1 className="text-4xl font-bold text-gray-900 mb-4">
                {collection.name}
              </h1>
              <p className="text-lg text-gray-600 mb-6">
                {collection.description}
              </p>
            </div>

            {/* Collection Price */}
            {collection.price && (
              <div className="mb-6">
                <div className="flex items-center mb-2">
                  <FiTag className="h-5 w-5 text-gray-500 mr-2" />
                  <span className="text-sm text-gray-600">Collection Price</span>
                </div>
                <p className="text-3xl font-bold text-gray-900">
                  ${collection.price.toFixed(2)}
                </p>
                <p className="text-sm text-gray-500">
                  Save when you buy the complete collection
                </p>
              </div>
            )}

            {/* Collection Actions */}
            <div className="flex space-x-4">
              <button
                onClick={handleAddToCart}
                disabled={isAddingToCart}
                className="flex-1 inline-flex items-center justify-center px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed transition-colors"
              >
                <FiShoppingCart className="mr-2 h-5 w-5" />
                {isAddingToCart ? 'Adding...' : 'Add Collection to Cart'}
              </button>
              <button
                onClick={handleAddToWishlist}
                className="px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <FiHeart className="h-5 w-5" />
              </button>
            </div>

            {/* Collection Stats */}
            <div className="mt-8 pt-8 border-t border-gray-200">
              <div className="grid grid-cols-2 gap-4 text-center">
                <div>
                  <p className="text-2xl font-bold text-gray-900">
                    {collection.products?.length || 0}
                  </p>
                  <p className="text-sm text-gray-500">Items</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">
                    {new Date(collection.created_at).toLocaleDateString('en-US', { 
                      month: 'short', 
                      year: 'numeric' 
                    })}
                  </p>
                  <p className="text-sm text-gray-500">Created</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Collection Products */}
      <div className="container mx-auto px-4 py-12">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Items in this Collection
          </h2>
          <p className="text-gray-600">
            {collection.products?.length || 0} carefully selected products
          </p>
        </div>

        {collection.products && collection.products.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {collection.products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-500">No products in this collection yet.</p>
          </div>
        )}
      </div>

      {/* Seller Info */}
      <div className="bg-gray-50 py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <div className="mb-6">
              <div className="h-16 w-16 bg-gray-300 rounded-full mx-auto mb-4 flex items-center justify-center">
                <FiHome className="h-8 w-8 text-gray-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {collection.seller_name}
              </h3>
              <p className="text-gray-600 mb-6">
                Discover more collections and products from this seller
              </p>
              <Link
                to={`/sellers/${collection.seller_id}`}
                className="inline-flex items-center px-6 py-3 bg-white text-gray-900 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors"
              >
                <FiHome className="mr-2 h-4 w-4" />
                Visit Store
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Related Collections */}
      <div className="container mx-auto px-4 py-12">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            You might also like
          </h2>
          <p className="text-gray-600">
            Other collections you might find interesting
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Placeholder for related collections */}
          <div className="text-center py-12 col-span-full">
            <p className="text-gray-500">Related collections will appear here</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CollectionDetailPage;
