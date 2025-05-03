// frontend/src/App.jsx
import React, { useEffect, useState } from 'react'; // Import useState/useEffect for path check
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider } from './contexts/authContext'; // Assuming AuthProvider wraps everything

// --- Layouts ---
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import AdminLayout from './components/layout/AdminLayout';

// --- Pages ---
import HomePage from './pages/HomePage';
import ProductListPage from './pages/ProductListPage';
import ProductDetailPage from './pages/ProductDetailPage.jsx';
import CartPage from './pages/CartPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import CheckoutPage from './pages/CheckoutPage';
import OrderSuccessPage from './pages/OrderSuccessPage';
import ProfilePage from './pages/ProfilePage';
import NotFoundPage from './pages/NotFoundPage';
import CollectionsPage from './pages/CollectionsPage';
import WishlistPage from './pages/WishlistPage';

// --- Admin Pages ---
import AdminDashboardPage from './pages/admin/AdminDashboardPage';
import AdminProductListPage from './pages/admin/AdminProductListPage';
import AdminCategoryListPage from './pages/admin/AdminCategoryListPage';
import AdminProductAddEditPage from './pages/admin/AdminProductAddEditPage';
import AdminCategoryAddEditPage from './pages/admin/AdminCategoryAddEditPage';
import AdminOrderListPage from './pages/admin/AdminOrderListPage';   // Ensure this path is correct
import AdminUserListPage from './pages/admin/AdminUserListPage';     // Ensure this path is correct
import AdminSettingsPage from './pages/admin/AdminSettingsPage';   // Ensure this path is correct
import AdminFinancePage from './pages/admin/AdminFinancePage'; // Import the new page
import AdminAnalyticsPage from './pages/admin/AdminAnalyticsPage'; // Import the analytics page

// --- Route Protection ---
import ProtectedRoute from './components/routes/ProtectedRoute';
import AdminRoute from './components/routes/AdminRoute';

// --- Utilities ---
import ScrollToTop from './components/common/ScrollToTop'; // Import the new component

// --- Component to Handle Layout Switching ---
// This helper component uses the useLocation hook, which can only be called
// inside a component rendered by the Router.
const AppContent = () => {
    const location = useLocation(); // Get current location
    const isAdminRoute = location.pathname.startsWith('/admin');

    return (
        <div className={`flex flex-col min-h-screen ${!isAdminRoute ? 'bg-background' : 'bg-gray-100'}`}> {/* Apply background based on route */}
            <ScrollToTop /> {/* Add ScrollToTop here */}
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
                    <Route path="/collections" element={<CollectionsPage />} />
                    <Route path="/wishlist" element={<WishlistPage />} />
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
                        <Route path="orders" element={<AdminOrderListPage />} />
                        <Route path="users" element={<AdminUserListPage />} />
                        <Route path="finance" element={<AdminFinancePage />} /> {/* Add Finance Route */}
                        <Route path="analytics" element={<AdminAnalyticsPage />} /> {/* Add Analytics Route */}
                        <Route path="settings" element={<AdminSettingsPage />} />
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
  // Just render AppContent directly
  return <AppContent />;
}

export default App;