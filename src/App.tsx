/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import ProductHero from './ProductHero';
import ProductDetail from './components/ProductDetail';
import AdminDashboard from './components/admin/AdminDashboard';
import { CartProvider } from './context/CartContext';
import { ProductProvider } from './context/ProductContext';

export default function App() {
  return (
    <ProductProvider>
      <CartProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<ProductHero />} />
            <Route path="/product/:slug" element={<ProductDetail />} />
            <Route path="/admin" element={<AdminDashboard />} />
            {/* Catch-all fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </CartProvider>
    </ProductProvider>
  );
}
