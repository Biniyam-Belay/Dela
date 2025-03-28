import React from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import { FaTrashAlt } from 'react-icons/fa'; // Import trash icon

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
};

const CartPage = () => {
  const { cartItems, removeItem, updateQuantity, clearCart, cartTotal, cartCount } = useCart();

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Your Shopping Cart</h1>

      {cartItems.length === 0 ? (
        <div className="text-center py-10 bg-gray-100 rounded-lg">
          <p className="text-xl text-gray-600 mb-4">Your cart is empty.</p>
          <Link
            to="/products"
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded transition duration-300"
          >
            Continue Shopping
          </Link>
        </div>
      ) : (
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Cart Items List */}
          <div className="lg:w-2/3 space-y-4">
            {cartItems.map(({ product, quantity }) => (
              <div key={product.id} className="flex items-center border rounded-lg p-4 bg-white shadow-sm gap-4">
                {/* Product Image */}
                <Link to={`/products/${product.slug || product.id}`}>
                   <img
                     src={product.images?.[0] || '/placeholder-image.jpg'}
                     alt={product.name}
                     className="w-20 h-20 object-cover rounded"
                     onError={(e) => { e.target.onerror = null; e.target.src = '/placeholder-image.jpg'; }}
                   />
                </Link>

                {/* Product Info */}
                <div className="flex-grow">
                   <Link to={`/products/${product.slug || product.id}`} className="hover:text-blue-600">
                     <h3 className="text-lg font-semibold">{product.name}</h3>
                   </Link>
                  <p className="text-sm text-gray-500">{formatCurrency(product.price)} each</p>
                </div>

                {/* Quantity Control */}
                <div className="flex items-center border rounded">
                  <button
                    onClick={() => updateQuantity(product.id, quantity - 1)}
                    className="px-3 py-1 border-r hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={quantity <= 1}
                  >
                    -
                  </button>
                  <span className="w-10 text-center py-1">{quantity}</span>
                  <button
                    onClick={() => updateQuantity(product.id, quantity + 1)}
                    className="px-3 py-1 border-l hover:bg-gray-100"
                     // disabled={quantity >= product.stockQuantity} // Optional stock check
                  >
                    +
                  </button>
                </div>

                {/* Item Total Price */}
                <div className="w-24 text-right font-semibold">
                  {formatCurrency(parseFloat(product.price) * quantity)}
                </div>

                {/* Remove Button */}
                <button
                  onClick={() => removeItem(product.id)}
                  className="text-red-500 hover:text-red-700 transition-colors"
                  title="Remove item"
                >
                  <FaTrashAlt size={18} />
                </button>
              </div>
            ))}
             {/* Clear Cart Button */}
             <div className="text-right mt-4">
                  <button
                      onClick={clearCart}
                      className="text-sm text-gray-500 hover:text-red-600 underline"
                  >
                      Clear Cart
                  </button>
             </div>
          </div>

          {/* Order Summary */}
          <div className="lg:w-1/3 bg-gray-100 p-6 rounded-lg shadow-md h-fit sticky top-24"> {/* Sticky summary */}
            <h2 className="text-2xl font-semibold mb-6 border-b pb-3">Order Summary</h2>
            <div className="space-y-3 mb-6">
              <div className="flex justify-between">
                <span>Subtotal ({cartCount} items)</span>
                <span className="font-semibold">{formatCurrency(cartTotal)}</span>
              </div>
              {/* Add Shipping costs later */}
              <div className="flex justify-between">
                <span>Shipping</span>
                <span className="text-gray-600">Calculated at checkout</span>
              </div>
               {/* Add Taxes later */}
               <div className="flex justify-between">
                <span>Taxes</span>
                <span className="text-gray-600">Calculated at checkout</span>
              </div>
            </div>
            <div className="flex justify-between border-t pt-4 font-bold text-xl">
              <span>Estimated Total</span>
              <span>{formatCurrency(cartTotal)}</span> {/* Update when shipping/taxes added */}
            </div>
            <Link
                to="/checkout" // Link to checkout page (create later)
                className="block w-full mt-6 bg-green-600 hover:bg-green-700 text-white text-center font-bold py-3 rounded transition duration-300"
            >
              Proceed to Checkout
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};

export default CartPage;