import { useState, useEffect } from 'react';
import { collection, onSnapshot, query, orderBy, doc, updateDoc, setDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { Order } from '../../types/store';
import { 
  ShoppingCart, 
  Search, 
  Filter, 
  Eye, 
  CheckCircle, 
  Clock, 
  Truck, 
  XCircle, 
  AlertCircle,
  Plus
} from 'lucide-react';

export default function AdminOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const q = query(collection(db, 'orders'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const list = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Order));
        setOrders(list);
        setLoading(false);
      },
      (err) => {
        console.warn("Orders error:", err);
        setLoading(false);
      }
    );
    return () => unsubscribe();
  }, []);

  const handleUpdateStatus = async (orderId: string, newStatus: Order['status']) => {
    setUpdatingId(orderId);
    setError(null);
    try {
      await updateDoc(doc(db, 'orders', orderId), { status: newStatus });
      if (selectedOrder && selectedOrder.id === orderId) {
        setSelectedOrder({ ...selectedOrder, status: newStatus });
      }
    } catch (err: any) {
      console.error("Order status update failed:", err);
      setError(err.message || 'Failed to update order status.');
    } finally {
      setUpdatingId(null);
    }
  };

  // Seed a sample order if database has none, so admin can immediately test
  const handleCreateSampleOrder = async () => {
    const sample: Order = {
      id: `ord-${Date.now().toString().slice(-6)}`,
      customerName: 'Aarav Sharma',
      customerEmail: 'aarav.sharma@example.com',
      customerPhone: '+977 9841234567',
      shippingAddress: 'Lazimpat, Kathmandu, Nepal',
      items: [
        { id: '1', name: 'Pintola High Protein Oats', price: 24.99, quantity: 2 },
        { id: '2', name: 'Wellcore Creatine Monohydrate', price: 19.99, quantity: 1 }
      ],
      totalAmount: 69.97,
      status: 'Pending',
      paymentMethod: 'Cash on Delivery (COD)',
      createdAt: new Date().toISOString()
    };
    try {
      await setDoc(doc(db, 'orders', sample.id), sample);
    } catch (e: any) {
      setError(e.message || "Failed to create sample order.");
    }
  };

  const filteredOrders = orders.filter(o => {
    const matchesSearch = 
      (o.customerName?.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (o.customerEmail?.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (o.id.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStatus = statusFilter === 'All' || o.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-gray-200 pb-6">
        <div>
          <h1 className="text-3xl font-black text-gray-950 tracking-tight">Order Management</h1>
          <p className="text-sm text-gray-500 mt-1">Review live transactions, buyer shipping details, and fulfillment.</p>
        </div>
        <button
          onClick={handleCreateSampleOrder}
          className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 hover:bg-gray-50 text-gray-700 text-xs font-bold rounded-xl transition cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" /> Generate Test Order
        </button>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Search and Status Filters */}
      <div className="flex flex-col sm:flex-row gap-3 bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-gray-400" />
          <input
            type="text"
            placeholder="Search by customer name, email, or order ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-black/10 focus:bg-white"
          />
        </div>
        <div className="flex gap-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-black/10"
          >
            <option value="All">All Statuses</option>
            <option value="Pending">Pending</option>
            <option value="Processing">Processing</option>
            <option value="Shipped">Shipped</option>
            <option value="Delivered">Delivered</option>
            <option value="Cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="py-20 text-center text-sm text-gray-400">Loading orders...</div>
        ) : filteredOrders.length === 0 ? (
          <div className="py-16 text-center">
            <ShoppingCart className="w-8 h-8 text-gray-300 mx-auto mb-2" />
            <p className="text-gray-500 text-sm font-medium">No customer orders found.</p>
            <p className="text-xs text-gray-400 mt-1">When buyers order through the storefront, orders will stream here live.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/60 text-[11px] font-bold uppercase tracking-wider text-gray-400">
                  <th className="py-4 px-6">Order ID</th>
                  <th className="py-4 px-4">Date</th>
                  <th className="py-4 px-4">Customer</th>
                  <th className="py-4 px-4">Items</th>
                  <th className="py-4 px-4">Total</th>
                  <th className="py-4 px-4">Status</th>
                  <th className="py-4 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredOrders.map(order => (
                  <tr key={order.id} className="hover:bg-gray-50/80 transition">
                    <td className="py-4 px-6 font-mono font-bold text-gray-900 text-xs">
                      #{order.id.slice(-8)}
                    </td>
                    <td className="py-4 px-4 text-xs text-gray-500 whitespace-nowrap">
                      {order.createdAt ? new Date(order.createdAt).toLocaleDateString() : 'Recent'}
                    </td>
                    <td className="py-4 px-4">
                      <div className="font-semibold text-gray-900">{order.customerName}</div>
                      <div className="text-xs text-gray-400">{order.customerEmail}</div>
                    </td>
                    <td className="py-4 px-4 text-xs text-gray-600">
                      {order.items?.length || 1} items
                    </td>
                    <td className="py-4 px-4 font-bold text-gray-950">
                      ${(Number(order.totalAmount) || 0).toFixed(2)}
                    </td>
                    <td className="py-4 px-4">
                      <select
                        value={order.status || 'Pending'}
                        disabled={updatingId === order.id}
                        onChange={(e) => handleUpdateStatus(order.id, e.target.value as Order['status'])}
                        className={`text-xs font-bold px-2.5 py-1 rounded-full border cursor-pointer focus:outline-none ${
                          order.status === 'Delivered' ? 'bg-green-50 text-green-700 border-green-200' :
                          order.status === 'Shipped' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                          order.status === 'Processing' ? 'bg-yellow-50 text-yellow-700 border-yellow-200' :
                          order.status === 'Cancelled' ? 'bg-red-50 text-red-700 border-red-200' :
                          'bg-gray-50 text-gray-700 border-gray-200'
                        }`}
                      >
                        <option value="Pending">Pending</option>
                        <option value="Processing">Processing</option>
                        <option value="Shipped">Shipped</option>
                        <option value="Delivered">Delivered</option>
                        <option value="Cancelled">Cancelled</option>
                      </select>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <button
                        onClick={() => setSelectedOrder(order)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-semibold rounded-lg transition cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5" /> Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Order Details Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 md:p-8 shadow-2xl border border-gray-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-gray-100 mb-6">
              <div>
                <span className="text-xs font-mono font-bold text-gray-400">ORDER #{selectedOrder.id}</span>
                <h2 className="text-xl font-black text-gray-950 mt-0.5">Order Breakdown</h2>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="text-gray-400 hover:text-black text-lg p-2 rounded-lg"
              >
                &times;
              </button>
            </div>

            {/* Customer Details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-gray-50 p-4 rounded-2xl mb-6 text-xs">
              <div>
                <span className="text-gray-400 font-bold uppercase tracking-wider block">Customer Information</span>
                <p className="font-bold text-gray-900 mt-1">{selectedOrder.customerName}</p>
                <p className="text-gray-600">{selectedOrder.customerEmail}</p>
                <p className="text-gray-600">{selectedOrder.customerPhone || 'No phone provided'}</p>
              </div>
              <div>
                <span className="text-gray-400 font-bold uppercase tracking-wider block">Shipping Address</span>
                <p className="text-gray-700 mt-1 leading-relaxed">{selectedOrder.shippingAddress || 'Standard Shipping'}</p>
                <p className="mt-2 text-gray-500 font-medium">Payment: {selectedOrder.paymentMethod || 'Online / Cash'}</p>
              </div>
            </div>

            {/* Line Items */}
            <div className="space-y-3 mb-6">
              <span className="text-xs font-bold uppercase tracking-wider text-gray-400 block">Ordered Products</span>
              <div className="divide-y divide-gray-100 border border-gray-100 rounded-2xl overflow-hidden">
                {selectedOrder.items?.map((item, idx) => (
                  <div key={idx} className="p-3 bg-white flex items-center justify-between text-sm">
                    <div>
                      <div className="font-semibold text-gray-900">{item.name}</div>
                      <div className="text-xs text-gray-500">${item.price.toFixed(2)} &times; {item.quantity} qty</div>
                    </div>
                    <div className="font-bold text-gray-900">
                      ${((item.price || 0) * (item.quantity || 1)).toFixed(2)}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Total and Status change */}
            <div className="flex items-center justify-between pt-4 border-t border-gray-100">
              <div>
                <span className="text-xs text-gray-400 block font-medium">Order Status</span>
                <select
                  value={selectedOrder.status}
                  onChange={(e) => handleUpdateStatus(selectedOrder.id, e.target.value as Order['status'])}
                  className="mt-1 text-xs font-bold px-3 py-1.5 rounded-xl border border-gray-200 bg-gray-50 cursor-pointer"
                >
                  <option value="Pending">Pending</option>
                  <option value="Processing">Processing</option>
                  <option value="Shipped">Shipped</option>
                  <option value="Delivered">Delivered</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>
              <div className="text-right">
                <span className="text-xs text-gray-400 block font-medium">Total Paid</span>
                <span className="text-2xl font-black text-gray-950">${(Number(selectedOrder.totalAmount) || 0).toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
