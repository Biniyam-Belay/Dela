// frontend/src/App.jsx
import React, { useEffect, useState } from 'react'; // Import useState/useEffect for path check
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider } from './contexts/authContext'; // Assuming AuthProvider wraps everything

// --- Layouts ---
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import AdminLayout from './components/layout/AdminLayout';
import SellerLayout from './components/layout/SellerLayout';

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
import CollectionDetailPage from './pages/CollectionDetailPage';
import WishlistPage from './pages/WishlistPage';
import MyOrdersPage from './pages/MyOrdersPage'; // Import MyOrdersPage

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

// --- Seller Pages ---
import SellerApplicationPage from './pages/seller/SellerApplicationPage';
import SellerApplicationSubmittedPage from './pages/seller/SellerApplicationSubmittedPage';
import SellerDashboardPage from './pages/seller/SellerDashboardPage';
import SellerCollectionsPage from './pages/seller/SellerCollectionsPage';
import CollectionFormPage from './pages/seller/CollectionFormPage';
import SellerProductsPage from './pages/seller/SellerProductsPage';
import SellerOrdersPage from './pages/seller/SellerOrdersPage';
import SellerEarningsPage from './pages/seller/SellerEarningsPage';
import SellerProfilePage from './pages/seller/SellerProfilePage';
import SellerSettingsPage from './pages/seller/SellerSettingsPage';

// --- Route Protection ---
import ProtectedRoute from './components/routes/ProtectedRoute';
import AdminRoute from './components/routes/AdminRoute';
import SellerRoute from './components/routes/SellerRoute';

// --- Utilities ---
import ScrollToTop from './components/common/ScrollToTop'; // Import the new component

// --- Component to Handle Layout Switching ---
// This helper component uses the useLocation hook, which can only be called
// inside a component rendered by the Router.
const AppContent = () => {
    const location = useLocation(); // Get current location
    const isAdminRoute = location.pathname.startsWith('/admin');
    const isSellerRoute = location.pathname.startsWith('/seller');

    return (
        <div className={`flex flex-col min-h-screen ${!isAdminRoute && !isSellerRoute ? 'bg-background' : 'bg-gray-100'}`}> {/* Apply background based on route */}
            <ScrollToTop /> {/* Add ScrollToTop here */}
            {!isAdminRoute && !isSellerRoute && <Header />}

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
                    <Route path="/collections/:collectionId" element={<CollectionDetailPage />} />
                    <Route path="/wishlist" element={<WishlistPage />} />
                    {/* Protected User Routes */}
                    <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
                    <Route path="/checkout" element={<ProtectedRoute><CheckoutPage /></ProtectedRoute>} />
                    <Route path="/order-success/:orderId" element={<ProtectedRoute><OrderSuccessPage /></ProtectedRoute>} />
                    <Route path="/orders" element={<ProtectedRoute><MyOrdersPage /></ProtectedRoute>} /> {/* Add MyOrdersPage Route */}

                    {/* --- Seller Routes --- */}
                    <Route path="/seller/apply" element={<ProtectedRoute><SellerApplicationPage /></ProtectedRoute>} />
                    <Route path="/seller/application-submitted" element={<ProtectedRoute><SellerApplicationSubmittedPage /></ProtectedRoute>} />
                    <Route
                        path="/seller"
                        element={
                            <SellerRoute>
                                <SellerLayout />
                            </SellerRoute>
                        }
                    >
                        <Route index element={<Navigate to="dashboard" replace />} />
                        <Route path="dashboard" element={<SellerDashboardPage />} />
                        <Route path="collections" element={<SellerCollectionsPage />} />
                        <Route path="collections/new" element={<CollectionFormPage />} />
                        <Route path="collections/edit/:collectionId" element={<CollectionFormPage />} />
                        <Route path="products" element={<SellerProductsPage />} />
                        <Route path="orders" element={<SellerOrdersPage />} />
                        <Route path="earnings" element={<SellerEarningsPage />} />
                        <Route path="profile" element={<SellerProfilePage />} />
                        <Route path="settings" element={<SellerSettingsPage />} />
                    </Route>

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

            {!isAdminRoute && !isSellerRoute && <Footer />}
        </div>
    );
};


// --- Main App Component ---
function App() {
  // Just render AppContent directly
  return <AppContent />;
}

export default App;