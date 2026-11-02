/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter, Routes, Route } from 'react-router-dom';
import ProductHero from './ProductHero';
import ProductDetail from './components/ProductDetail';
import AdminLayout from './components/admin/AdminLayout';
import AdminProducts from './components/admin/AdminProducts';
import AdminProductForm from './components/admin/AdminProductForm';
import { CartProvider } from './context/CartContext';

export default function App() {
  return (
    <CartProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<ProductHero />} />
          <Route path="/product/:slug" element={<ProductDetail />} />
          <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<div>Dashboard Placeholder</div>} />
              <Route path="products" element={<AdminProducts />} />
              <Route path="products/new" element={<AdminProductForm />} />
              <Route path="products/edit/:id" element={<AdminProductForm />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </CartProvider>
  );
}
