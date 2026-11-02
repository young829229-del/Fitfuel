import { useState, useEffect } from 'react';
import { useProducts } from '../../context/ProductContext';
import { Link } from 'react-router-dom';
import { collection, onSnapshot, query, orderBy, limit } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { Order } from '../../types/store';
import { 
  Package, 
  ShoppingCart, 
  DollarSign, 
  AlertTriangle, 
  Plus, 
  Image as ImageIcon, 
  Sliders, 
  ExternalLink,
  ChevronRight,
  TrendingUp,
  Clock
} from 'lucide-react';

export default function AdminDashboard() {
  const { products, banners } = useProducts();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(true);

  useEffect(() => {
    const q = query(collection(db, 'orders'), orderBy('createdAt', 'desc'), limit(10));
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const orderList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Order));
        setOrders(orderList);
        setLoadingOrders(false);
      },
      (error) => {
        console.warn("Orders fetch error:", error);
        setLoadingOrders(false);
      }
    );
    return () => unsubscribe();
  }, []);

  // Compute metrics
  const totalProducts = products.length;
  const lowStockProducts = products.filter(p => (p.stock ?? 0) <= 5);
  const totalOrders = orders.length;
  const totalRevenue = orders.reduce((sum, order) => sum + (Number(order.totalAmount) || 0), 0);
  const activeBannersCount = banners.filter(b => b.isActive).length;

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Top Welcome Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-gray-200 pb-6">
        <div>
          <h1 className="text-3xl font-black text-gray-950 tracking-tight">Overview Dashboard</h1>
          <p className="text-sm text-gray-500 mt-1">Live metrics, inventory alerts, and store controls.</p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            to="/admin/products/new"
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-black hover:bg-neutral-800 text-white text-sm font-semibold rounded-xl shadow-sm transition"
          >
            <Plus className="w-4 h-4" /> Add Product
          </Link>
          <Link
            to="/"
            target="_blank"
            className="inline-flex items-center gap-2 px-4 py-2.5 border border-gray-300 hover:bg-gray-50 text-gray-700 text-sm font-medium rounded-xl transition"
          >
            View Live Store <ExternalLink className="w-3.5 h-3.5 text-gray-400" />
          </Link>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Total Products */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-400">Total Products</span>
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Package className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-black text-gray-900">{totalProducts}</span>
            <span className="text-xs text-gray-500 font-medium">in catalog</span>
          </div>
          <div className="mt-4 pt-3 border-t border-gray-100 flex justify-between items-center text-xs">
            <span className="text-gray-500">{activeBannersCount} active banners</span>
            <Link to="/admin/products" className="text-blue-600 hover:underline font-medium">View all</Link>
          </div>
        </div>

        {/* Total Orders */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-400">Total Orders</span>
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <ShoppingCart className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-black text-gray-900">{totalOrders}</span>
            <span className="text-xs text-green-600 font-medium flex items-center gap-1">
              <TrendingUp className="w-3 h-3" /> Live
            </span>
          </div>
          <div className="mt-4 pt-3 border-t border-gray-100 flex justify-between items-center text-xs">
            <span className="text-gray-500">Real-time synced</span>
            <Link to="/admin/orders" className="text-purple-600 hover:underline font-medium">Manage</Link>
          </div>
        </div>

        {/* Total Revenue */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-400">Total Revenue</span>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-black text-gray-900">${totalRevenue.toFixed(2)}</span>
            <span className="text-xs text-gray-500 font-medium">USD</span>
          </div>
          <div className="mt-4 pt-3 border-t border-gray-100 flex justify-between items-center text-xs">
            <span className="text-gray-500">Calculated from orders</span>
            <span className="text-emerald-600 font-medium">Store gross</span>
          </div>
        </div>

        {/* Low Stock Alert */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-400">Low Stock Alert</span>
            <div className={`w-10 h-10 rounded-xl ${lowStockProducts.length > 0 ? 'bg-amber-50 text-amber-600' : 'bg-gray-50 text-gray-400'} flex items-center justify-center`}>
              <AlertTriangle className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className={`text-3xl font-black ${lowStockProducts.length > 0 ? 'text-amber-600' : 'text-gray-900'}`}>
              {lowStockProducts.length}
            </span>
            <span className="text-xs text-gray-500 font-medium">products &le; 5 units</span>
          </div>
          <div className="mt-4 pt-3 border-t border-gray-100 flex justify-between items-center text-xs">
            <span className="text-gray-500">{lowStockProducts.length > 0 ? 'Attention needed' : 'All stocks healthy'}</span>
            <Link to="/admin/products" className="text-amber-600 hover:underline font-medium">Inspect</Link>
          </div>
        </div>
      </div>

      {/* Quick Actions Panel */}
      <div className="bg-neutral-900 text-white rounded-3xl p-6 md:p-8 relative overflow-hidden shadow-xl">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h2 className="text-xl font-bold tracking-tight">Quick Actions</h2>
            <p className="text-neutral-400 text-sm mt-1">Frequently used administrative actions for rapid updates.</p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Link
              to="/admin/products/new"
              className="px-4 py-2.5 bg-white text-black text-xs font-bold uppercase tracking-wider rounded-xl hover:bg-neutral-200 transition flex items-center gap-2"
            >
              <Plus className="w-3.5 h-3.5" /> New Product
            </Link>
            <Link
              to="/admin/banners"
              className="px-4 py-2.5 bg-neutral-800 text-neutral-200 text-xs font-bold uppercase tracking-wider rounded-xl hover:bg-neutral-700 transition flex items-center gap-2"
            >
              <ImageIcon className="w-3.5 h-3.5" /> Manage Banners
            </Link>
            <Link
              to="/admin/homepage"
              className="px-4 py-2.5 bg-neutral-800 text-neutral-200 text-xs font-bold uppercase tracking-wider rounded-xl hover:bg-neutral-700 transition flex items-center gap-2"
            >
              <Sliders className="w-3.5 h-3.5" /> Curate Homepage
            </Link>
            <Link
              to="/admin/orders"
              className="px-4 py-2.5 bg-neutral-800 text-neutral-200 text-xs font-bold uppercase tracking-wider rounded-xl hover:bg-neutral-700 transition flex items-center gap-2"
            >
              <ShoppingCart className="w-3.5 h-3.5" /> View Orders
            </Link>
          </div>
        </div>
      </div>

      {/* Dual Section: Low Stock & Recent Orders */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Low Stock Products List */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-500" /> Low Stock Inventory
              </h3>
              <p className="text-xs text-gray-500 mt-0.5">Products with critical or low inventory levels</p>
            </div>
            <Link to="/admin/products" className="text-xs text-gray-500 hover:text-black font-semibold flex items-center">
              All Products <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {lowStockProducts.length === 0 ? (
            <div className="py-10 text-center text-sm text-gray-400 bg-gray-50 rounded-xl">
              All products have sufficient stock levels.
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {lowStockProducts.map(p => (
                <div key={p.id} className="py-3 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <img 
                      src={p.image || (p.images && p.images[0]) || '/public/assets/aistudio/IMG_e9755086-1600-4fc3-b90a-e97667f39591_5ab03a1e.jpg'} 
                      alt={p.name}
                      className="w-10 h-10 object-contain bg-gray-50 rounded-lg p-1 border border-gray-100"
                    />
                    <div>
                      <div className="text-sm font-semibold text-gray-900">{p.name}</div>
                      <div className="text-xs text-gray-500">${p.price.toFixed(2)}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="px-2.5 py-1 text-xs font-bold rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                      {p.stock} left
                    </span>
                    <Link
                      to={`/admin/products/edit/${p.id}`}
                      className="text-xs font-semibold text-blue-600 hover:underline"
                    >
                      Update
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Orders List */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                <Clock className="w-4 h-4 text-purple-500" /> Recent Orders
              </h3>
              <p className="text-xs text-gray-500 mt-0.5">Latest transactions from customer checkout</p>
            </div>
            <Link to="/admin/orders" className="text-xs text-gray-500 hover:text-black font-semibold flex items-center">
              All Orders <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {loadingOrders ? (
            <div className="py-10 text-center text-sm text-gray-400">Loading orders...</div>
          ) : orders.length === 0 ? (
            <div className="py-10 text-center text-sm text-gray-400 bg-gray-50 rounded-xl">
              No orders placed yet. Orders will appear here in real-time when customers buy.
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {orders.slice(0, 5).map(order => (
                <div key={order.id} className="py-3 flex items-center justify-between">
                  <div>
                    <div className="text-sm font-semibold text-gray-900">{order.customerName}</div>
                    <div className="text-xs text-gray-500">
                      {order.items?.length || 1} items • {new Date(order.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-bold text-gray-900">${(Number(order.totalAmount) || 0).toFixed(2)}</div>
                    <span className={`inline-block text-[11px] font-bold px-2 py-0.5 rounded-full mt-0.5 ${
                      order.status === 'Delivered' ? 'bg-green-100 text-green-700' :
                      order.status === 'Shipped' ? 'bg-blue-100 text-blue-700' :
                      order.status === 'Processing' ? 'bg-yellow-100 text-yellow-700' :
                      order.status === 'Cancelled' ? 'bg-red-100 text-red-700' :
                      'bg-gray-100 text-gray-700'
                    }`}>
                      {order.status || 'Pending'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
