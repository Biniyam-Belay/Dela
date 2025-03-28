// frontend/src/App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/layout/Header'; // Assuming Header exists
import Footer from './components/layout/Footer'; // Assuming Footer exists
import HomePage from './pages/HomePage';
import ProductListPage from './pages/ProductListPage';
import ProductDetailPage from './pages/ProductDetailPage';
import LoginPage from './pages/LoginPage'; // Import LoginPage
import RegisterPage from './pages/RegisterPage'; // Import RegisterPage
import NotFoundPage from './pages/NotFoundPage';
import ProtectedRoute from './components/routes/ProtectedRoute'; // We'll create this next
import ProfilePage from './pages/ProfilePage'; // We'll create this next
import CartPage from './pages/CartPage'; // Import CartPage
import CheckoutPage from './pages/CheckoutPage'; // We'll create this later
import OrderSuccessPage from './pages/OrderSuccessPage';

function App() {
  return (
    <Router>
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-grow container mx-auto px-4 py-6">
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<HomePage />} />
            <Route path="/products" element={<ProductListPage />} />
            <Route path="/products/:identifier" element={<ProductDetailPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/cart" element={<CartPage />} /> {/* Add Cart Route */}

            {/* Protected Routes */}
            <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
            {/* Add /checkout as protected route later */}
            {/* <Route path="/checkout" element={<ProtectedRoute><CheckoutPage /></ProtectedRoute>}/> */}

            <Route
              path="/checkout"
              element={
                <ProtectedRoute>
                  <CheckoutPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/order-success/:orderId" // Dynamic route for order ID
              element={
                <ProtectedRoute> {/* Usually only logged-in users see this */}
                  <OrderSuccessPage />
                </ProtectedRoute>
              }
            />

            {/* Catch all 404 */}
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;