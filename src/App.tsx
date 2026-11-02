import { BrowserRouter, Routes, Route } from 'react-router-dom';
import ProductHero from './ProductHero';
import ProductDetail from './components/ProductDetail';
import AdminLayout from './components/admin/AdminLayout';
import AdminDashboard from './components/admin/AdminDashboard';
import AdminProducts from './components/admin/AdminProducts';
import AdminProductForm from './components/admin/AdminProductForm';
import AdminBanners from './components/admin/AdminBanners';
import AdminHomepage from './components/admin/AdminHomepage';
import AdminOrders from './components/admin/AdminOrders';
import CartDrawer from './components/CartDrawer';
import { ProductProvider } from './context/ProductContext';
import { AdminAuthProvider } from './context/AdminAuthContext';
import { CartProvider } from './context/CartContext';

export default function App() {
  return (
    <ProductProvider>
      <CartProvider>
        <AdminAuthProvider>
          <BrowserRouter>
            {/* Global Shopping Cart & Checkout Drawer */}
            <CartDrawer />

            <Routes>
              {/* Storefront Routes */}
              <Route path="/" element={<ProductHero />} />
              <Route path="/product/:slug" element={<ProductDetail />} />

              {/* Dedicated Admin Portal Routes */}
              <Route path="/admin" element={<AdminLayout />}>
                <Route index element={<AdminDashboard />} />
                <Route path="products" element={<AdminProducts />} />
                <Route path="products/new" element={<AdminProductForm />} />
                <Route path="products/edit/:id" element={<AdminProductForm />} />
                <Route path="banners" element={<AdminBanners />} />
                <Route path="homepage" element={<AdminHomepage />} />
                <Route path="orders" element={<AdminOrders />} />
              </Route>
            </Routes>
          </BrowserRouter>
        </AdminAuthProvider>
      </CartProvider>
    </ProductProvider>
  );
}
