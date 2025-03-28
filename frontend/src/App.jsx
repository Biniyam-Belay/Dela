import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/layout/Header.jsx'; // Create a basic Header component
import Footer from './components/layout/Footer.jsx'; // Create a basic Footer component
import HomePage from './pages/HomePage.jsx'; // Assuming you have a basic HomePage
import ProductListPage from './pages/ProductListPage.jsx';
import ProductDetailPage from './pages/ProductDetailPage.jsx';
import NotFoundPage from './pages/NotFoundPage.jsx'; // Create a basic 404 page

function App() {
  return (
    <Router>
      <div className="flex flex-col min-h-screen">
        {/* <Header /> */} {/* Add Header later */}
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<HomePage />} /> {/* Or maybe redirect to /products */}
            <Route path="/products" element={<ProductListPage />} />
            {/* Use :identifier to match slug or ID */}
            <Route path="/products/:identifier" element={<ProductDetailPage />} />

            {/* Add other routes later (Cart, Checkout, Login, etc.) */}

            <Route path="*" element={<NotFoundPage />} /> {/* Catch all 404 */}
          </Routes>
        </main>
        {/* <Footer /> */} {/* Add Footer later */}
      </div>
    </Router>
  );
}

export default App;