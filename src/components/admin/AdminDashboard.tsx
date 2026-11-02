import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProducts } from '../../context/ProductContext';
import { Product } from '../../types/product';
import { auth } from '../../lib/firebase';
import { signOut, onAuthStateChanged, User } from 'firebase/auth';
import { formatImageUrl } from '../../utils/imageUrl';
import { 
  Package, 
  Plus, 
  Trash2, 
  Edit3, 
  Search, 
  LogOut, 
  ExternalLink, 
  ArrowLeft, 
  RefreshCw, 
  Database, 
  Check, 
  X, 
  AlertTriangle,
  Lock,
  TrendingUp,
  ArrowRight
} from 'lucide-react';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { 
    products, 
    addProduct, 
    updateProduct, 
    deleteProduct, 
    resetToDefaults, 
    isSynced 
  } = useProducts();

  // Authentication State
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    try {
      return localStorage.getItem('fitful_admin_authenticated') === 'true';
    } catch {
      return false;
    }
  });
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState<string | null>(null);

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Modal States
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isDeletingId, setIsDeletingId] = useState<string | null>(null);
  const [isResetting, setIsResetting] = useState(false);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    category: 'Sports Nutrition',
    price: 24.99,
    originalPrice: 29.99,
    stockStatus: 'In Stock',
    stockQuantity: 25,
    image: '/assets/aistudio/IMG_e9755086-1600-4fc3-b90a-e97667f39591_5ab03a1e.jpg',
    description: '',
    keyBenefits: ['High Protein', 'Zero Preservatives'],
    nutritionalInfo: '',
    ingredients: '',
    usage: '',
    benefitInput: ''
  });

  // Background listener for Firebase auth
  useEffect(() => {
    try {
      const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
        setUser(currentUser);
      });
      return () => unsubscribe();
    } catch {
      // ignore
    }
  }, []);

  const showToast = (msg: string) => {
    setSuccessToast(msg);
    setTimeout(() => setSuccessToast(null), 3500);
  };

  // Simple Password Login
  const handleSimpleLogin = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setAuthError(null);
    const pass = password.trim().toLowerCase();
    
    // Accept standard default password 'admin', 'admin123', 'fitful', 'fitfuel', or any non-empty password
    if (pass === 'admin' || pass === 'admin123' || pass === 'fitful' || pass === 'fitfuel' || pass.length >= 1) {
      setIsAuthenticated(true);
      try {
        localStorage.setItem('fitful_admin_authenticated', 'true');
      } catch {}
      showToast('Signed in to Admin Panel.');
    } else {
      setAuthError('Please enter password (default: admin)');
    }
  };

  const handleQuickUnlock = () => {
    setIsAuthenticated(true);
    try {
      localStorage.setItem('fitful_admin_authenticated', 'true');
    } catch {}
    showToast('Signed in to Admin Panel.');
  };

  const handleSignOut = async () => {
    setIsAuthenticated(false);
    try {
      localStorage.removeItem('fitful_admin_authenticated');
      localStorage.removeItem('fitful_admin_demo_access');
      await signOut(auth);
    } catch {
      // ignore
    }
    setPassword('');
    showToast('Signed out of admin portal.');
  };

  // User is authorized if localStorage session is active OR firebase user is present
  const isAuthorized = Boolean(isAuthenticated || user);

  // Categories
  const categories = ['all', ...Array.from(new Set(products.map(p => p.category || 'General')))];

  // Filtered Products
  const filteredProducts = products.filter(p => {
    const matchesSearch = 
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.slug.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.category && p.category.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCat = selectedCategory === 'all' || p.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  // Open modal for New or Edit
  const handleOpenAdd = () => {
    setEditingProduct(null);
    setFormData({
      name: '',
      slug: '',
      category: 'Sports Nutrition',
      price: 24.99,
      originalPrice: 29.99,
      stockStatus: 'In Stock',
      stockQuantity: 25,
      image: '/assets/aistudio/IMG_e9755086-1600-4fc3-b90a-e97667f39591_5ab03a1e.jpg',
      description: 'Ultra-pure premium supplement formulated for high-performance athletic lifestyle.',
      keyBenefits: ['Premium Quality', 'Clinically Tested', 'Fast Absorption'],
      nutritionalInfo: 'Per 100g: 380 kcal | 25g Protein',
      ingredients: 'Natural botanical extracts and active compounds.',
      usage: 'Mix 1 serving with 250ml water once daily.',
      benefitInput: ''
    });
    setIsEditModalOpen(true);
  };

  const handleOpenEdit = (p: Product) => {
    setEditingProduct(p);
    setFormData({
      name: p.name,
      slug: p.slug,
      category: p.category || 'Sports Nutrition',
      price: p.price,
      originalPrice: p.originalPrice || p.price,
      stockStatus: p.stockStatus || 'In Stock',
      stockQuantity: p.stockQuantity ?? 15,
      image: formatImageUrl(p.image || p.images?.[0] || ''),
      description: p.description || '',
      keyBenefits: p.keyBenefits || [],
      nutritionalInfo: p.nutritionalInfo || '',
      ingredients: p.ingredients || '',
      usage: p.usage || '',
      benefitInput: ''
    });
    setIsEditModalOpen(true);
  };

  const handleAddBenefit = () => {
    if (formData.benefitInput.trim()) {
      setFormData(prev => ({
        ...prev,
        keyBenefits: [...prev.keyBenefits, prev.benefitInput.trim()],
        benefitInput: ''
      }));
    }
  };

  const handleRemoveBenefit = (index: number) => {
    setFormData(prev => ({
      ...prev,
      keyBenefits: prev.keyBenefits.filter((_, i) => i !== index)
    }));
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    const slug = formData.slug.trim() || formData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

    const productPayload = {
      name: formData.name.trim(),
      slug,
      category: formData.category,
      price: Number(formData.price),
      originalPrice: Number(formData.originalPrice),
      stockStatus: formData.stockStatus,
      stockQuantity: Number(formData.stockQuantity),
      image: formatImageUrl(formData.image.trim()),
      images: [formatImageUrl(formData.image.trim())],
      description: formData.description.trim(),
      keyBenefits: formData.keyBenefits,
      nutritionalInfo: formData.nutritionalInfo.trim(),
      ingredients: formData.ingredients.trim(),
      usage: formData.usage.trim()
    };

    if (editingProduct) {
      await updateProduct(editingProduct.id, productPayload);
      showToast(`Updated "${formData.name}" successfully.`);
    } else {
      await addProduct(productPayload);
      showToast(`Created "${formData.name}" successfully.`);
    }

    setIsEditModalOpen(false);
  };

  const handleDeleteProduct = async (id: string) => {
    await deleteProduct(id);
    setIsDeletingId(null);
    showToast('Product removed from catalog.');
  };

  const handleResetDefaults = async () => {
    setIsResetting(true);
    await resetToDefaults();
    setIsResetting(false);
    showToast('Reset catalog to 5 original supplements.');
  };

  // 1. Simple, Minimalist Login Card (No blocking loader)
  if (!isAuthorized) {
    return (
      <div className="min-h-screen bg-neutral-900 flex flex-col justify-center items-center px-4 py-12">
        <div className="w-full max-w-sm bg-white rounded-3xl p-8 shadow-2xl border border-gray-100">
          <div className="flex flex-col items-center text-center mb-6">
            <div className="w-14 h-14 bg-black rounded-2xl flex items-center justify-center text-white font-black text-2xl mb-3 shadow-md">
              FF
            </div>
            <h1 className="text-xl font-black text-black tracking-tight">Admin Portal</h1>
            <p className="text-xs text-gray-500 mt-1">Manage supplements catalog & stock</p>
          </div>

          {authError && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-3 mb-5 text-xs text-red-700 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0 text-red-500" />
              <span>{authError}</span>
            </div>
          )}

          <form onSubmit={handleSimpleLogin} className="space-y-4">
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-600 mb-1.5">
                Password <span className="text-gray-400 font-normal">(default: admin)</span>
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="password"
                  placeholder="Enter password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-xs font-medium focus:outline-hidden focus:ring-2 focus:ring-black focus:bg-white transition"
                  autoFocus
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3.5 px-4 bg-black hover:bg-neutral-800 text-white font-bold rounded-2xl transition active:scale-[0.98] shadow-md text-xs uppercase tracking-wider flex items-center justify-center gap-2"
            >
              <span>Sign In</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>

            <button
              type="button"
              onClick={handleQuickUnlock}
              className="w-full py-2.5 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-2xl transition text-xs"
            >
              1-Click Instant Access
            </button>
          </form>

          <div className="mt-6 pt-5 border-t border-gray-100 text-center">
            <button
              onClick={() => navigate('/')}
              className="hover:text-black text-xs text-gray-500 inline-flex items-center gap-1.5 font-medium transition"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back to Store
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 2. Main Admin Dashboard View
  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 flex flex-col">
      {/* Toast Notification */}
      {successToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-black text-white px-5 py-3 rounded-2xl shadow-xl flex items-center gap-2.5 text-sm font-medium animate-in fade-in slide-in-from-bottom-2">
          <Check className="w-4 h-4 text-emerald-400" />
          <span>{successToast}</span>
        </div>
      )}

      {/* Top Navbar */}
      <header className="sticky top-0 z-30 bg-white border-b border-gray-200 px-6 py-4 flex flex-wrap items-center justify-between gap-4 shadow-xs">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-1.5 text-xs font-bold text-gray-600 hover:text-black bg-gray-100 hover:bg-gray-200 px-3 py-1.5 rounded-full transition"
            title="Return to storefront"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Storefront</span>
          </button>

          <div className="h-5 w-px bg-gray-200 hidden sm:block" />

          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 bg-black rounded-xl flex items-center justify-center text-white font-black text-sm">
              FF
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-black text-base tracking-tight text-black">FITFUL NEPAL</span>
                <span className="text-[10px] font-black uppercase bg-black text-white px-2 py-0.5 rounded-md">Admin</span>
              </div>
              <p className="text-[11px] text-gray-500 font-medium">Supplement Inventory & Catalog Control</p>
            </div>
          </div>
        </div>

        {/* Status & User Actions */}
        <div className="flex items-center gap-3">
          <div className="hidden md:flex items-center gap-2 bg-gray-100 px-3 py-1.5 rounded-full text-xs font-medium text-gray-700">
            <Database className={`w-3.5 h-3.5 ${isSynced ? 'text-emerald-500' : 'text-amber-500'}`} />
            <span>{isSynced ? 'Firestore Live Sync' : 'Local Synced'}</span>
          </div>

          <div className="flex items-center gap-2 pl-2">
            <div className="text-right hidden sm:block">
              <p className="text-xs font-bold text-gray-900 leading-none">
                Administrator
              </p>
              <span className="text-[10px] font-semibold text-emerald-600">Active Session</span>
            </div>

            <button
              onClick={handleSignOut}
              className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-xl transition"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-8 space-y-8">
        {/* KPI / Metrics Bar */}
        <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-xs flex items-center gap-4">
            <div className="w-12 h-12 bg-gray-100 rounded-2xl flex items-center justify-center text-gray-900">
              <Package className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Total Products</p>
              <h3 className="text-2xl font-black text-black">{products.length}</h3>
            </div>
          </div>

          <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-xs flex items-center gap-4">
            <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600">
              <Check className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">In Stock</p>
              <h3 className="text-2xl font-black text-black">
                {products.filter(p => p.stockStatus === 'In Stock').length}
              </h3>
            </div>
          </div>

          <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-xs flex items-center gap-4">
            <div className="w-12 h-12 bg-amber-50 rounded-2xl flex items-center justify-center text-amber-600">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Low / Out</p>
              <h3 className="text-2xl font-black text-black">
                {products.filter(p => p.stockStatus !== 'In Stock').length}
              </h3>
            </div>
          </div>

          <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-xs flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600">
              <TrendingUp className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Average Price</p>
              <h3 className="text-2xl font-black text-black">
                ${products.length ? (products.reduce((acc, p) => acc + p.price, 0) / products.length).toFixed(2) : '0.00'}
              </h3>
            </div>
          </div>
        </section>

        {/* Product Catalog Controls */}
        <section className="bg-white rounded-3xl border border-gray-200 shadow-xs p-6 space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-black text-black tracking-tight">Supplements Catalog</h2>
              <p className="text-xs text-gray-500">Manage products, pricing, stock levels, and benefits across all channels.</p>
            </div>

            <div className="flex items-center gap-2.5">
              <button
                onClick={handleResetDefaults}
                disabled={isResetting}
                className="flex items-center gap-2 px-4 py-2.5 border border-gray-300 hover:bg-gray-50 text-gray-700 text-xs font-bold rounded-2xl transition disabled:opacity-50"
                title="Restore default 5 items"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isResetting ? 'animate-spin' : ''}`} />
                <span>Reset Defaults</span>
              </button>

              <button
                onClick={handleOpenAdd}
                className="flex items-center gap-2 px-5 py-2.5 bg-black hover:bg-neutral-800 text-white text-xs font-bold rounded-2xl transition active:scale-95 shadow-md"
              >
                <Plus className="w-4 h-4" />
                <span>Add Product</span>
              </button>
            </div>
          </div>

          {/* Search & Category Filter Pills */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2 border-t border-gray-100">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search products by title, category, or slug..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium focus:outline-hidden focus:ring-2 focus:ring-black"
              />
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`text-[11px] font-bold px-3 py-1.5 rounded-xl capitalize transition shrink-0 ${
                    selectedCategory === cat
                      ? 'bg-black text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Products Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-200 text-[11px] uppercase tracking-wider text-gray-400 font-bold">
                  <th className="py-3 px-4">Product</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Price</th>
                  <th className="py-3 px-4">Stock Status</th>
                  <th className="py-3 px-4">Qty</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-xs">
                {filteredProducts.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-gray-400">
                      <p className="font-medium">No supplements found matching your filter.</p>
                      <button
                        onClick={() => { setSearchQuery(''); setSelectedCategory('all'); }}
                        className="mt-2 text-xs font-bold text-black underline"
                      >
                        Clear filters
                      </button>
                    </td>
                  </tr>
                ) : (
                  filteredProducts.map((p) => (
                    <tr key={p.id} className="hover:bg-gray-50/80 transition group">
                      <td className="py-3 px-4 flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-gray-50 p-1 border border-gray-100 shrink-0 flex items-center justify-center overflow-hidden">
                          <img
                            src={formatImageUrl(p.image || p.images?.[0])}
                            alt={p.name}
                            className="max-h-full max-w-full object-contain"
                          />
                        </div>
                        <div>
                          <div className="font-bold text-gray-900 group-hover:text-black">
                            {p.name}
                          </div>
                          <div className="flex items-center gap-1.5 text-[11px] text-gray-400">
                            <span>/{p.slug}</span>
                            <button
                              onClick={() => navigate(`/product/${p.slug}`)}
                              className="text-gray-400 hover:text-black"
                              title="View live page"
                            >
                              <ExternalLink className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        <span className="bg-gray-100 text-gray-700 px-2.5 py-1 rounded-md text-[11px] font-semibold">
                          {p.category || 'Supplements'}
                        </span>
                      </td>

                      <td className="py-3 px-4">
                        <div className="font-black text-gray-900">${p.price.toFixed(2)}</div>
                        {p.originalPrice && p.originalPrice > p.price && (
                          <div className="text-[10px] text-gray-400 line-through">
                            ${p.originalPrice.toFixed(2)}
                          </div>
                        )}
                      </td>

                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full ${
                            p.stockStatus === 'In Stock'
                              ? 'bg-emerald-50 text-emerald-700'
                              : p.stockStatus === 'Low Stock'
                              ? 'bg-amber-50 text-amber-700'
                              : 'bg-red-50 text-red-700'
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              p.stockStatus === 'In Stock'
                                ? 'bg-emerald-500'
                                : p.stockStatus === 'Low Stock'
                                ? 'bg-amber-500'
                                : 'bg-red-500'
                            }`}
                          />
                          {p.stockStatus}
                        </span>
                      </td>

                      <td className="py-3 px-4 font-semibold text-gray-600">
                        {p.stockQuantity ?? '—'}
                      </td>

                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleOpenEdit(p)}
                            className="p-1.5 text-gray-500 hover:text-black hover:bg-gray-200/60 rounded-lg transition"
                            title="Edit Product"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setIsDeletingId(p.id)}
                            className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                            title="Delete Product"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>
      </main>

      {/* Product Add / Edit Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl border border-gray-100 my-8 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-black text-black">
                  {editingProduct ? `Edit Product: ${editingProduct.name}` : 'Create New Product'}
                </h3>
                <p className="text-xs text-gray-500">
                  {editingProduct
                    ? 'Changes immediately synchronize across the homepage carousel and product page.'
                    : 'Fill in details to publish a new supplement to the FitFul catalog.'}
                </p>
              </div>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="p-2 text-gray-400 hover:text-black rounded-xl"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto text-xs font-medium">
              {/* Name & Slug */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold uppercase text-gray-600 mb-1">Product Title *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => {
                      const name = e.target.value;
                      setFormData(prev => ({
                        ...prev,
                        name,
                        slug: prev.slug === '' || !editingProduct
                          ? name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
                          : prev.slug
                      }));
                    }}
                    placeholder="e.g. Wellcore Creatine Monohydrate"
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-black focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase text-gray-600 mb-1">URL Slug *</label>
                  <input
                    type="text"
                    required
                    value={formData.slug}
                    onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                    placeholder="e.g. wellcore-creatine-monohydrate"
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-black focus:outline-hidden"
                  />
                </div>
              </div>

              {/* Price, Original Price, Category */}
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-[11px] font-bold uppercase text-gray-600 mb-1">Selling Price ($) *</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    value={formData.price}
                    onChange={(e) => setFormData(prev => ({ ...prev, price: parseFloat(e.target.value) || 0 }))}
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-black focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase text-gray-600 mb-1">Compare Price ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.originalPrice}
                    onChange={(e) => setFormData(prev => ({ ...prev, originalPrice: parseFloat(e.target.value) || 0 }))}
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-black focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase text-gray-600 mb-1">Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-black focus:outline-hidden"
                  >
                    <option value="Sports Nutrition">Sports Nutrition</option>
                    <option value="Performance">Performance</option>
                    <option value="Protein Spreads">Protein Spreads</option>
                    <option value="Superfoods">Superfoods</option>
                    <option value="Vitamins & Minerals">Vitamins & Minerals</option>
                  </select>
                </div>
              </div>

              {/* Stock Status & Quantity */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold uppercase text-gray-600 mb-1">Inventory Status</label>
                  <select
                    value={formData.stockStatus}
                    onChange={(e) => setFormData(prev => ({ ...prev, stockStatus: e.target.value }))}
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-black focus:outline-hidden"
                  >
                    <option value="In Stock">In Stock</option>
                    <option value="Low Stock">Low Stock</option>
                    <option value="Out of Stock">Out of Stock</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase text-gray-600 mb-1">Available Units</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.stockQuantity}
                    onChange={(e) => setFormData(prev => ({ ...prev, stockQuantity: parseInt(e.target.value) || 0 }))}
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-black focus:outline-hidden"
                  />
                </div>
              </div>

              {/* Image URL & Preview */}
              <div>
                <label className="block text-[11px] font-bold uppercase text-gray-600 mb-1">Product Image URL *</label>
                <div className="flex gap-3 items-center">
                  <input
                    type="text"
                    required
                    value={formData.image}
                    onChange={(e) => setFormData(prev => ({ ...prev, image: e.target.value }))}
                    placeholder="/assets/aistudio/... or https://..."
                    className="flex-1 px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-black focus:outline-hidden"
                  />
                  <div className="w-11 h-11 bg-gray-100 rounded-xl border border-gray-200 p-1 flex items-center justify-center shrink-0 overflow-hidden">
                    <img src={formatImageUrl(formData.image)} alt="Preview" className="max-h-full max-w-full object-contain" />
                  </div>
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-[11px] font-bold uppercase text-gray-600 mb-1">Product Description</label>
                <textarea
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Explain benefits, formulation, and quality standards..."
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-black focus:outline-hidden leading-relaxed"
                />
              </div>

              {/* Key Benefits Tags */}
              <div>
                <label className="block text-[11px] font-bold uppercase text-gray-600 mb-1">Key Benefits</label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={formData.benefitInput}
                    onChange={(e) => setFormData(prev => ({ ...prev, benefitInput: e.target.value }))}
                    onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddBenefit(); } }}
                    placeholder="Type benefit and hit Enter or click Add"
                    className="flex-1 px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:ring-2 focus:ring-black focus:outline-hidden"
                  />
                  <button
                    type="button"
                    onClick={handleAddBenefit}
                    className="px-3.5 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-xl font-bold text-xs"
                  >
                    Add
                  </button>
                </div>

                <div className="flex flex-wrap gap-1.5">
                  {formData.keyBenefits.map((b, i) => (
                    <span
                      key={i}
                      className="inline-flex items-center gap-1.5 bg-gray-100 text-gray-800 text-xs px-2.5 py-1 rounded-full font-medium"
                    >
                      {b}
                      <button
                        type="button"
                        onClick={() => handleRemoveBenefit(i)}
                        className="text-gray-400 hover:text-red-500"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              {/* Nutritional Info, Ingredients, Usage */}
              <div className="space-y-3 pt-2 border-t border-gray-100">
                <div>
                  <label className="block text-[11px] font-bold uppercase text-gray-600 mb-1">Nutritional Breakdown</label>
                  <input
                    type="text"
                    value={formData.nutritionalInfo}
                    onChange={(e) => setFormData(prev => ({ ...prev, nutritionalInfo: e.target.value }))}
                    placeholder="Per 100g: 380 kcal | 26g Protein..."
                    className="w-full px-3.5 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-black focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase text-gray-600 mb-1">Ingredients</label>
                  <input
                    type="text"
                    value={formData.ingredients}
                    onChange={(e) => setFormData(prev => ({ ...prev, ingredients: e.target.value }))}
                    placeholder="Rolled Oats, Whey Protein Isolate, Cocoa..."
                    className="w-full px-3.5 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-black focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase text-gray-600 mb-1">Usage Instructions</label>
                  <input
                    type="text"
                    value={formData.usage}
                    onChange={(e) => setFormData(prev => ({ ...prev, usage: e.target.value }))}
                    placeholder="Mix 1 scoop with 200ml cold water..."
                    className="w-full px-3.5 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-black focus:outline-hidden"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 flex items-center justify-end gap-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-5 py-2.5 text-gray-600 hover:bg-gray-100 rounded-2xl font-bold transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-black hover:bg-neutral-800 text-white font-bold rounded-2xl shadow-md transition active:scale-95"
                >
                  {editingProduct ? 'Save Changes' : 'Create Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isDeletingId && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white max-w-sm w-full rounded-3xl p-6 shadow-2xl border border-gray-100 space-y-4">
            <div className="w-12 h-12 bg-red-50 text-red-600 rounded-2xl flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            <div className="text-center">
              <h4 className="text-base font-black text-black">Remove Product?</h4>
              <p className="text-xs text-gray-500 mt-1">
                Are you sure you want to remove this product from the storefront catalog? This cannot be undone.
              </p>
            </div>
            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setIsDeletingId(null)}
                className="flex-1 py-2.5 border border-gray-200 rounded-2xl text-xs font-bold hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteProduct(isDeletingId)}
                className="flex-1 py-2.5 bg-red-600 text-white rounded-2xl text-xs font-bold hover:bg-red-700 transition"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
