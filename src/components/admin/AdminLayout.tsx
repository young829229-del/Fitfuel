import { Outlet, Link } from 'react-router-dom';

export default function AdminLayout() {
  return (
    <div className="flex min-h-screen bg-gray-100">
      <nav className="w-64 bg-black text-white p-6">
        <h1 className="text-xl font-bold mb-8">Admin Panel</h1>
        <ul className="space-y-4">
          <li><Link to="/admin">Dashboard</Link></li>
          <li><Link to="/admin/products">Products</Link></li>
          <li><Link to="/admin/banners">Banners</Link></li>
          <li><Link to="/admin/orders">Orders</Link></li>
          <li><Link to="/">Exit Admin</Link></li>
        </ul>
      </nav>
      <main className="flex-1 p-8">
        <Outlet />
      </main>
    </div>
  );
}
