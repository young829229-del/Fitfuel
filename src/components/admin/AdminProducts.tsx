import { useState } from 'react';
import { useProducts } from '../../context/ProductContext';
import { Link } from 'react-router-dom';
import { 
  Plus, 
  Search, 
  Edit3, 
  Trash2, 
  ExternalLink, 
  Star, 
  CheckCircle2, 
  XCircle,
  AlertCircle
} from 'lucide-react';

export default function AdminProducts() {
  const { products, removeProduct, saveProduct, loading } = useProducts();
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const categories = ['All', ...Array.from(new Set(products.map(p => p.category).filter(Boolean)))];

  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          p.slug.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCat = categoryFilter === 'All' || p.category === categoryFilter;
    return matchesSearch && matchesCat;
  });

  const handleDelete = async (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to delete "${name}"? This action cannot be undone.`)) {
      setDeletingId(id);
      setActionError(null);
      try {
        await removeProduct(id);
      } catch (err: any) {
        console.error("Delete error:", err);
        setActionError(`Failed to delete product: ${err.message || err}`);
      } finally {
        setDeletingId(null);
      }
    }
  };

  const handleToggleFeatured = async (product: any) => {
    try {
      await saveProduct({ ...product, isFeatured: !product.isFeatured }, product.id);
    } catch (err: any) {
      setActionError(`Failed to update feature status: ${err.message || err}`);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-gray-200 pb-6">
        <div>
          <h1 className="text-3xl font-black text-gray-950 tracking-tight">Product Catalog</h1>
          <p className="text-sm text-gray-500 mt-1">Manage supplements, pricing, inventory, and images.</p>
        </div>
        <Link
          to="/admin/products/new"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-black hover:bg-neutral-800 text-white text-sm font-semibold rounded-xl shadow-sm transition"
        >
          <Plus className="w-4 h-4" /> Add New Product
        </Link>
      </div>

      {actionError && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{actionError}</span>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3 bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-gray-400" />
          <input
            type="text"
            placeholder="Search by product name or slug..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-black/10 focus:bg-white"
          />
        </div>
        <div className="flex gap-2">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-black/10 focus:bg-white"
          >
            {categories.map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="py-20 text-center text-sm text-gray-400">Loading live catalog...</div>
        ) : filteredProducts.length === 0 ? (
          <div className="py-16 text-center">
            <p className="text-gray-500 text-sm font-medium">No products found matching your filter.</p>
            <Link
              to="/admin/products/new"
              className="mt-4 inline-flex items-center gap-2 text-xs font-bold text-black uppercase tracking-wider underline hover:text-neutral-700"
            >
              Create your first product
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/60 text-[11px] font-bold uppercase tracking-wider text-gray-400">
                  <th className="py-4 px-6">Product</th>
                  <th className="py-4 px-4">Category</th>
                  <th className="py-4 px-4">Price</th>
                  <th className="py-4 px-4">Stock</th>
                  <th className="py-4 px-4">Featured</th>
                  <th className="py-4 px-4">Status</th>
                  <th className="py-4 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm">
                {filteredProducts.map((p) => {
                  const displayImg = (p.images && p.images[0]) || p.image || '/public/assets/aistudio/IMG_e9755086-1600-4fc3-b90a-e97667f39591_5ab03a1e.jpg';
                  const isLowStock = (p.stock ?? 0) <= 5;

                  return (
                    <tr key={p.id} className="hover:bg-gray-50/80 transition">
                      {/* Product Name & Thumbnail */}
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <img
                            src={displayImg}
                            alt={p.name}
                            className="w-12 h-12 rounded-xl object-contain bg-gray-50 p-1 border border-gray-200/80 shrink-0"
                          />
                          <div>
                            <div className="font-bold text-gray-900 leading-tight">{p.name}</div>
                            <div className="text-xs text-gray-400 font-mono mt-0.5">/product/{p.slug}</div>
                          </div>
                        </div>
                      </td>

                      {/* Category */}
                      <td className="py-4 px-4 text-gray-600 font-medium">
                        {p.category || 'Supplements'}
                      </td>

                      {/* Price & Discount */}
                      <td className="py-4 px-4">
                        <div className="font-bold text-gray-900">${p.price.toFixed(2)}</div>
                        {p.discountPrice && (
                          <div className="text-xs text-green-600 font-medium">
                            Sale: ${p.discountPrice.toFixed(2)}
                          </div>
                        )}
                      </td>

                      {/* Stock */}
                      <td className="py-4 px-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${
                          p.stock === 0 ? 'bg-red-50 text-red-700 border border-red-200' :
                          isLowStock ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                          'bg-green-50 text-green-700 border border-green-200'
                        }`}>
                          {p.stock} units
                        </span>
                      </td>

                      {/* Featured */}
                      <td className="py-4 px-4">
                        <button
                          onClick={() => handleToggleFeatured(p)}
                          className={`p-1.5 rounded-lg border transition cursor-pointer ${
                            p.isFeatured 
                              ? 'bg-amber-50 border-amber-200 text-amber-500 hover:bg-amber-100' 
                              : 'bg-gray-50 border-gray-200 text-gray-300 hover:text-gray-500'
                          }`}
                          title="Toggle Featured"
                        >
                          <Star className={`w-4 h-4 ${p.isFeatured ? 'fill-amber-500' : ''}`} />
                        </button>
                      </td>

                      {/* Availability Status */}
                      <td className="py-4 px-4">
                        {p.isUnavailable ? (
                          <span className="inline-flex items-center gap-1 text-xs text-red-600 font-medium">
                            <XCircle className="w-3.5 h-3.5" /> Hidden
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-xs text-green-600 font-medium">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Live
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-6 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            to={`/product/${p.slug}`}
                            target="_blank"
                            className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition"
                            title="View on Live Store"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </Link>
                          <Link
                            to={`/admin/products/edit/${p.id}`}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition font-medium"
                            title="Edit Product"
                          >
                            <Edit3 className="w-4 h-4" />
                          </Link>
                          <button
                            onClick={() => handleDelete(p.id, p.name)}
                            disabled={deletingId === p.id}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition cursor-pointer disabled:opacity-50"
                            title="Delete Product"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
