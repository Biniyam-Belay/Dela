// frontend/src/App.jsx
import React, { useEffect, useState } from 'react'; // Import useState/useEffect for path check
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';

// --- Layouts ---
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import AdminLayout from './components/layout/AdminLayout';

// --- Pages ---
import HomePage from './pages/HomePage';
import ProductListPage from './pages/ProductListPage';
import ProductDetailPage from './pages/ProductDetailPage';
import CartPage from './pages/CartPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import CheckoutPage from './pages/CheckoutPage';
import OrderSuccessPage from './pages/OrderSuccessPage';
import ProfilePage from './pages/ProfilePage';
import NotFoundPage from './pages/NotFoundPage';

// --- Admin Pages ---
import AdminDashboardPage from './pages/admin/AdminDashboardPage';
import AdminProductListPage from './pages/admin/AdminProductListPage';
import AdminCategoryListPage from './pages/admin/AdminCategoryListPage';
import AdminProductAddEditPage from './pages/admin/AdminProductAddEditPage'; // Import Admin Product Add/Edit page later
// Import Admin Product/Category Add/Edit pages later
import AdminCategoryAddEditPage from './pages/admin/AdminCategoryAddEditPage'; // Import Admin Category Add/Edit page later

// --- Route Protection ---
import ProtectedRoute from './components/routes/ProtectedRoute';
import AdminRoute from './components/routes/AdminRoute';

// --- Component to Handle Layout Switching ---
// This helper component uses the useLocation hook, which can only be called
// inside a component rendered by the Router.
const AppContent = () => {
    const location = useLocation(); // Get current location
    const isAdminRoute = location.pathname.startsWith('/admin');

    return (
        <div className={`flex flex-col min-h-screen ${!isAdminRoute ? 'bg-background' : 'bg-gray-100'}`}> {/* Apply background based on route */}
            {!isAdminRoute && <Header />}

            {/* Use flex-grow on main content area */}
            <main className="flex-grow">
                <Routes>
                    {/* --- Public & User Routes --- */}
                    <Route path="/" element={<HomePage />} />
                    <Route path="/products" element={<ProductListPage />} />
                    <Route path="/products/:identifier" element={<ProductDetailPage />} />
                    <Route path="/cart" element={<CartPage />} />
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/register" element={<RegisterPage />} />
                    {/* Protected User Routes */}
                    <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
                    <Route path="/checkout" element={<ProtectedRoute><CheckoutPage /></ProtectedRoute>} />
                    <Route path="/order-success/:orderId" element={<ProtectedRoute><OrderSuccessPage /></ProtectedRoute>} />

                    {/* --- Admin Routes --- */}
                    <Route
                        path="/admin"
                        element={
                            <AdminRoute>
                                <AdminLayout />
                            </AdminRoute>
                        }
                    >
                        <Route index element={<Navigate to="dashboard" replace />} />
                        <Route path="dashboard" element={<AdminDashboardPage />} />
                        <Route path="products" element={<AdminProductListPage />} />
                        <Route path="products/new" element={<AdminProductAddEditPage />} />
                        <Route path="products/edit/:productId" element={<AdminProductAddEditPage />} />
                        <Route path="categories" element={<AdminCategoryListPage />} />
                        <Route path="categories/new" element={<AdminCategoryAddEditPage />} />
                        <Route path="categories/edit/:categoryId" element={<AdminCategoryAddEditPage />} />
                    </Route>

                    {/* --- Not Found --- */}
                    <Route path="*" element={<NotFoundPage />} />
                </Routes>
            </main>

            {!isAdminRoute && <Footer />}
        </div>
    );
};


// --- Main App Component ---
function App() {
  return (
    <Router>
      {/* Render the AppContent which handles layout based on location */}
      <AppContent />
    </Router>
  );
}

export default App;