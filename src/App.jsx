import React from 'react';
import { Routes, Route, Outlet } from 'react-router-dom';

// Layout Components (assuming you have these)
import Header from './components/Layout/Header';
import Footer from './components/Layout/Footer';
import AdminSidebar from './components/Admin/AdminSidebar'; // If using a sidebar layout for admin

// Core Components
import Home from './components/Home/Home';
import ProductList from './components/Product/ProductList';
import ProductDetail from './components/Product/ProductDetail'; // Ensure correct import path
import Cart from './components/Cart/Cart';
import Checkout from './components/Checkout/Checkout';
import OrderHistory from './components/Order/OrderHistory';
import UserProfile from './components/Profile/UserProfile';
import Login from './components/Auth/Login';
import Register from './components/Auth/Register';
import PrivateRoute from './components/common/PrivateRoute'; // Import PrivateRoute

// Admin Components
import AdminLogin from './components/Admin/AdminLogin';
import AdminDashboard from './components/Admin/AdminDashboard';
import AdminProducts from './components/Admin/AdminProducts';
import AdminAddProduct from './components/Admin/AdminAddProduct';
import AdminCategories from './components/Admin/AdminCategories';
import AdminAddCategory from './components/Admin/AdminAddCategory';
import AdminOrders from './components/Admin/AdminOrders';
import AdminUsers from './components/Admin/AdminUsers';

// Basic Layout Wrappers
const MainLayout = () => (
  <>
    <Header />
    <main className="container mx-auto px-4 py-8 min-h-screen"> {/* Added basic styling */}
      <Outlet /> {/* Nested routes render here */}
    </main>
    <Footer />
  </>
);

const AdminLayout = () => (
    <div className="flex min-h-screen">
        <AdminSidebar />
        <main className="flex-1 p-6 bg-gray-100"> {/* Added basic styling */}
            <Outlet /> {/* Nested admin routes render here */}
        </main>
    </div>
);


function App() {
  return (
    <Routes>
      {/* Public Routes with Main Layout */}
      <Route path="/" element={<MainLayout />}>
        <Route index element={<Home />} />
        <Route path="products" element={<ProductList />} />
        {/* Ensure the parameter name is productId */}
        <Route path="products/:productId" element={<ProductDetail />} />
        <Route path="cart" element={<Cart />} />
        <Route path="login" element={<Login />} />
        <Route path="register" element={<Register />} />

        {/* Private User Routes */}
        <Route element={<PrivateRoute allowedRoles={['user', 'admin']} />}> {/* Allow admin too? Or just 'user' */}
          <Route path="checkout" element={<Checkout />} />
          <Route path="orders" element={<OrderHistory />} />
          <Route path="profile" element={<UserProfile />} />
        </Route>
      </Route>

      {/* Admin Routes */}
      <Route path="/admin/login" element={<AdminLogin />} />
      <Route path="/admin" element={<AdminLayout />}>
         <Route element={<PrivateRoute allowedRoles={['admin']} />}>
            <Route index element={<AdminDashboard />} /> {/* Default admin page */}
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="products" element={<AdminProducts />} />
            <Route path="products/add" element={<AdminAddProduct />} />
            {/* Add route for editing product: <Route path="products/edit/:productId" element={<AdminEditProduct />} /> */}
            <Route path="categories" element={<AdminCategories />} />
            <Route path="categories/add" element={<AdminAddCategory />} />
            {/* Add route for editing category: <Route path="categories/edit/:categoryId" element={<AdminEditCategory />} /> */}
            <Route path="orders" element={<AdminOrders />} />
            <Route path="users" element={<AdminUsers />} />
         </Route>
      </Route>

      {/* Fallback Route for Not Found */}
      <Route path="*" element={<div>404 Not Found</div>} />
    </Routes>
  );
}

export default App;
