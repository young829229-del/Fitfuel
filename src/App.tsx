/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import ProductHero from './ProductHero';
import ProductDetail from './components/ProductDetail';
import AdminDashboard from './components/admin/AdminDashboard';
import { CartProvider } from './context/CartContext';
import { ProductProvider } from './context/ProductContext';

// Helper to support ?admin or #/admin even if the static host hasn't yet deployed URL rewrites
function RouteHelper() {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const hash = window.location.hash;

    if (searchParams.has('admin') || hash === '#/admin' || hash === '#admin') {
      if (location.pathname !== '/admin') {
        navigate('/admin', { replace: true });
      }
    }
  }, [location, navigate]);

  return null;
}

export default function App() {
  return (
    <ProductProvider>
      <CartProvider>
        <BrowserRouter>
          <RouteHelper />
          <Routes>
            <Route path="/" element={<ProductHero />} />
            <Route path="/product/:slug" element={<ProductDetail />} />
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/*" element={<AdminDashboard />} />
            {/* Catch-all fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </CartProvider>
    </ProductProvider>
  );
}
