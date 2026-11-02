import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../../context/StoreContext';
import { Product, Banner, Category, Coupon, StoreSettings, Order } from '../../types/store';
import { auth } from '../../lib/firebase';
import { signOut, onAuthStateChanged, User } from 'firebase/auth';
import { formatImageUrl } from '../../utils/imageUrl';
import { processGalleryPhoto } from '../../utils/imageHandler';
import { uploadImageToStorage } from '../../lib/storage';
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
  ArrowRight,
  ImageIcon,
  ImagePlus,
  ShoppingBag,
  Layers,
  Sparkles,
  Tag,
  MessageSquare,
  Settings,
  Users,
  Eye,
  CheckCircle2,
  Clock,
  Truck,
  QrCode
} from 'lucide-react';

type AdminTab = 'products' | 'orders' | 'banners' | 'categories' | 'coupons' | 'reviews' | 'settings' | 'customers';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { 
    products, 
    orders, 
    banners, 
    categories, 
    coupons, 
    reviews, 
    settings, 
    customers,
    addProduct, 
    updateProduct, 
    deleteProduct, 
    resetToDefaults,
    addBanner,
    updateBanner,
    deleteBanner,
    addCategory,
    updateCategory,
    deleteCategory,
    updateOrderStatus,
    deleteOrder,
    toggleReviewApproval,
    deleteReview,
    addCoupon,
    toggleCoupon,
    deleteCoupon,
    updateSettings,
    isSynced 
  } = useStore();

  const [activeTab, setActiveTab] = useState<AdminTab>('products');

  // File Input References for Photo Gallery
  const mainPhotoInputRef = useRef<HTMLInputElement>(null);
  const additionalPhotoInputRef = useRef<HTMLInputElement>(null);
  const bannerPhotoInputRef = useRef<HTMLInputElement>(null);
  const paymentQRInputRef = useRef<HTMLInputElement>(null);
  const [isProcessingPhoto, setIsProcessingPhoto] = useState(false);
  const [activePaymentMethodId, setActivePaymentMethodId] = useState<string | null>(null);
  const [photoError, setPhotoError] = useState<string | null>(null);

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
  const [isBannerModalOpen, setIsBannerModalOpen] = useState(false);
  const [editingBanner, setEditingBanner] = useState<Banner | null>(null);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [isCouponModalOpen, setIsCouponModalOpen] = useState(false);
  const [isDeletingId, setIsDeletingId] = useState<string | null>(null);
  const [deleteTargetType, setDeleteTargetType] = useState<string>('product');
  const [isResetting, setIsResetting] = useState(false);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  // Product Form State
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    price: 1250,
    originalPrice: 1500,
    stockQuantity: 50,
    image: '',
    images: [] as string[],
    description: '',
    keyBenefits: ['Premium Quality', 'Fast Absorption'],
    benefitInput: ''
  });

  // Banner Form State
  const [bannerFormData, setBannerFormData] = useState({
    title: '',
    subtitle: '',
    buttonText: 'Shop Now',
    buttonLink: '#',
    image: '',
    active: true,
    displayOrder: 1
  });

  // Category Form State
  const [categoryFormData, setCategoryFormData] = useState({
    name: '',
    slug: '',
    description: '',
    visible: true,
    displayOrder: 1
  });

  // Coupon Form State
  const [couponFormData, setCouponFormData] = useState({
    code: '',
    discountType: 'percentage' as 'percentage' | 'fixed',
    discountValue: 10,
    minOrderAmount: 20,
    active: true
  });

  const [settingsFormData, setSettingsFormData] = useState({
    deliveryCharge: settings.deliveryCharge || 120,
    freeDeliveryThreshold: settings.freeDeliveryThreshold || 2000,
    phone: settings.phone || '+977-9800000000',
    email: settings.email || 'contact@fitfulnepal.com',
    paymentMethods: settings.paymentMethods || []
  });

  // Sync settings when changed from Firebase
  useEffect(() => {
    setSettingsFormData({
      deliveryCharge: settings.deliveryCharge || 120,
      freeDeliveryThreshold: settings.freeDeliveryThreshold || 2000,
      phone: settings.phone || '+977-9800000000',
      email: settings.email || 'contact@fitfulnepal.com',
      paymentMethods: settings.paymentMethods || []
    });
  }, [settings]);

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

  // Gallery Photo Handlers using Firebase Storage
  const handleMainPhotoSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPhotoError(null);
    setIsProcessingPhoto(true);

    try {
      const optimizedDataUrl = await processGalleryPhoto(file, 1000, 0.85);
      const storageUrl = await uploadImageToStorage(optimizedDataUrl, 'products');

      setFormData(prev => ({
        ...prev,
        image: storageUrl,
        images: prev.images.length > 0 
          ? [storageUrl, ...prev.images.filter(img => img !== prev.image)] 
          : [storageUrl]
      }));
      showToast('Photo uploaded from gallery to Firebase Storage.');
    } catch (err: any) {
      setPhotoError(err.message || 'Could not load photo from gallery.');
    } finally {
      setIsProcessingPhoto(false);
      if (mainPhotoInputRef.current) mainPhotoInputRef.current.value = '';
    }
  };

  const handleAdditionalPhotosSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setPhotoError(null);
    setIsProcessingPhoto(true);

    try {
      const newPhotos: string[] = [];
      for (let i = 0; i < files.length; i++) {
        const optimized = await processGalleryPhoto(files[i], 1000, 0.85);
        const storageUrl = await uploadImageToStorage(optimized, 'products');
        newPhotos.push(storageUrl);
      }

      setFormData(prev => {
        const combined = [...prev.images, ...newPhotos];
        return {
          ...prev,
          images: combined,
          image: prev.image || combined[0] || ''
        };
      });
      showToast(`Added ${newPhotos.length} photo(s) to gallery.`);
    } catch (err: any) {
      setPhotoError(err.message || 'Could not load additional photos.');
    } finally {
      setIsProcessingPhoto(false);
      if (additionalPhotoInputRef.current) additionalPhotoInputRef.current.value = '';
    }
  };

  const handleBannerPhotoSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsProcessingPhoto(true);
    try {
      const optimized = await processGalleryPhoto(file, 1400, 0.85);
      const storageUrl = await uploadImageToStorage(optimized, 'banners');
      setBannerFormData(prev => ({ ...prev, image: storageUrl }));
      showToast('Banner photo uploaded.');
    } catch {
      showToast('Error uploading banner photo.');
    } finally {
      setIsProcessingPhoto(false);
      if (bannerPhotoInputRef.current) bannerPhotoInputRef.current.value = '';
    }
  };

  const handlePaymentQRSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !activePaymentMethodId) return;
    setIsProcessingPhoto(true);
    try {
      const optimized = await processGalleryPhoto(file, 800, 0.85);
      const storageUrl = await uploadImageToStorage(optimized, 'payments');
      
      const updatedMethods = settingsFormData.paymentMethods.map(m => 
        m.id === activePaymentMethodId ? { ...m, qrImage: storageUrl } : m
      );
      
      setSettingsFormData(prev => ({ ...prev, paymentMethods: updatedMethods }));
      showToast('Payment QR code updated.');
    } catch {
      showToast('Error uploading QR code.');
    } finally {
      setIsProcessingPhoto(false);
      if (paymentQRInputRef.current) paymentQRInputRef.current.value = '';
      setActivePaymentMethodId(null);
    }
  };

  // Auth Handlers
  const handleSimpleLogin = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setAuthError(null);
    const pass = password.trim().toLowerCase();
    
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
    } catch {}
    setPassword('');
    showToast('Signed out of admin portal.');
  };

  const isAuthorized = Boolean(isAuthenticated || user);

  const filteredProducts = products.filter(p => {
    const matchesSearch = 
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.slug.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  // Product Modals
  const handleOpenAddProduct = () => {
    setEditingProduct(null);
    setPhotoError(null);
    setFormData({
      name: '',
      slug: '',
      price: 1250,
      originalPrice: 1500,
      stockQuantity: 50,
      image: '',
      images: [],
      description: 'Ultra-pure premium supplement formulated for high-performance athletic lifestyle.',
      keyBenefits: ['Premium Quality', 'Fast Absorption'],
      benefitInput: ''
    });
    setIsEditModalOpen(true);
  };

  const handleOpenEditProduct = (p: Product) => {
    setEditingProduct(p);
    setPhotoError(null);
    const existingMain = formatImageUrl(p.image || p.images?.[0] || '');
    const existingList = p.images && p.images.length > 0 
      ? p.images.map(img => formatImageUrl(img)) 
      : (existingMain ? [existingMain] : []);

    setFormData({
      name: p.name,
      slug: p.slug,
      price: p.price,
      originalPrice: p.originalPrice || p.price,
      stockQuantity: p.stockQuantity ?? 15,
      image: existingMain,
      images: existingList,
      description: p.description || '',
      keyBenefits: p.keyBenefits || [],
      benefitInput: ''
    });
    setIsEditModalOpen(true);
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setPhotoError(null);

    if (!formData.name.trim()) return;
    if (!formData.image) {
      setPhotoError('Please choose a product photo from your gallery.');
      return;
    }

    const slug = formData.slug.trim() || formData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

    const productPayload = {
      name: formData.name.trim(),
      slug,
      price: Number(formData.price),
      originalPrice: Number(formData.originalPrice),
      stockQuantity: Number(formData.stockQuantity),
      image: formData.image,
      images: formData.images.length > 0 ? formData.images : [formData.image],
      description: formData.description.trim(),
      keyBenefits: formData.keyBenefits
    };

    if (editingProduct) {
      await updateProduct(editingProduct.id, productPayload);
      showToast(`Updated "${formData.name}" in Firebase.`);
    } else {
      await addProduct(productPayload);
      showToast(`Created "${formData.name}" in Firebase.`);
    }

    setIsEditModalOpen(false);
  };

  // Banner Actions
  const handleOpenAddBanner = () => {
    setEditingBanner(null);
    setBannerFormData({
      title: '',
      subtitle: '',
      buttonText: 'Shop Now',
      buttonLink: '#',
      image: '',
      active: true,
      displayOrder: banners.length + 1
    });
    setIsBannerModalOpen(true);
  };

  const handleSaveBanner = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bannerFormData.title.trim()) return;

    if (editingBanner) {
      await updateBanner(editingBanner.id, bannerFormData);
      showToast('Banner updated in Firebase.');
    } else {
      await addBanner(bannerFormData);
      showToast('New banner published to homepage.');
    }
    setIsBannerModalOpen(false);
  };

  // Category Actions
  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!categoryFormData.name.trim()) return;

    const slug = categoryFormData.slug.trim() || categoryFormData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    await addCategory({
      name: categoryFormData.name.trim(),
      slug,
      description: categoryFormData.description,
      displayOrder: Number(categoryFormData.displayOrder) || 1,
      visible: categoryFormData.visible
    });
    setCategoryFormData({ name: '', slug: '', description: '', visible: true, displayOrder: 1 });
    setIsCategoryModalOpen(false);
    showToast('Category created in Firebase.');
  };

  // Coupon Actions
  const handleSaveCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponFormData.code.trim()) return;

    await addCoupon({
      code: couponFormData.code.toUpperCase().trim(),
      discountType: couponFormData.discountType,
      discountValue: Number(couponFormData.discountValue),
      minOrderAmount: Number(couponFormData.minOrderAmount),
      active: couponFormData.active
    });
    setCouponFormData({ code: '', discountType: 'percentage', discountValue: 10, minOrderAmount: 20, active: true });
    setIsCouponModalOpen(false);
    showToast(`Coupon ${couponFormData.code} activated in Firebase.`);
  };

  // Settings Actions
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateSettings({
      deliveryCharge: Number(settingsFormData.deliveryCharge),
      freeDeliveryThreshold: Number(settingsFormData.freeDeliveryThreshold),
      phone: settingsFormData.phone.trim(),
      email: settingsFormData.email.trim(),
      paymentMethods: settingsFormData.paymentMethods
    });
    showToast('Settings & Payment Methods updated.');
  };

  // Confirm delete dispatcher
  const handleConfirmDelete = async () => {
    if (!isDeletingId) return;
    if (deleteTargetType === 'product') {
      await deleteProduct(isDeletingId);
      showToast('Product deleted from Firebase.');
    } else if (deleteTargetType === 'banner') {
      await deleteBanner(isDeletingId);
      showToast('Banner deleted from Firebase.');
    } else if (deleteTargetType === 'category') {
      await deleteCategory(isDeletingId);
      showToast('Category deleted from Firebase.');
    } else if (deleteTargetType === 'coupon') {
      await deleteCoupon(isDeletingId);
      showToast('Coupon deleted from Firebase.');
    } else if (deleteTargetType === 'order') {
      await deleteOrder(isDeletingId);
      showToast('Order removed from records.');
    } else if (deleteTargetType === 'review') {
      await deleteReview(isDeletingId);
      showToast('Review removed from catalog.');
    }
    setIsDeletingId(null);
  };

  // 1. Simple Login Card
  if (!isAuthorized) {
    return (
      <div className="min-h-screen bg-neutral-900 flex flex-col justify-center items-center px-4 py-12">
        <div className="w-full max-w-sm bg-white rounded-3xl p-8 shadow-2xl border border-gray-100">
          <div className="flex flex-col items-center text-center mb-6">
            <div className="w-14 h-14 bg-black rounded-2xl flex items-center justify-center text-white font-black text-2xl mb-3 shadow-md">
              FF
            </div>
            <h1 className="text-xl font-black text-black tracking-tight">Admin Portal</h1>
            <p className="text-xs text-gray-500 mt-1">Firebase Centralized Management</p>
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

  // 2. Full-Featured Centralized Firebase Admin Panel
  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 flex flex-col">
      {/* Hidden Gallery Input pickers */}
      <input ref={mainPhotoInputRef} type="file" accept="image/*" onChange={handleMainPhotoSelect} className="hidden" />
      <input ref={additionalPhotoInputRef} type="file" accept="image/*" multiple onChange={handleAdditionalPhotosSelect} className="hidden" />
      <input ref={bannerPhotoInputRef} type="file" accept="image/*" onChange={handleBannerPhotoSelect} className="hidden" />
      <input ref={paymentQRInputRef} type="file" accept="image/*" onChange={handlePaymentQRSelect} className="hidden" />

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
              <p className="text-[11px] text-gray-500 font-medium">Firebase Real-Time Centralized Console</p>
            </div>
          </div>
        </div>

        {/* Status & User Actions */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-emerald-50 text-emerald-800 px-3 py-1.5 rounded-full text-xs font-bold border border-emerald-200">
            <Database className="w-3.5 h-3.5 text-emerald-600 animate-pulse" />
            <span>Firestore Real-Time Sync</span>
          </div>

          <button
            onClick={handleSignOut}
            className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-xl transition"
            title="Sign Out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-8 space-y-6">
        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-gray-200">
          {[
            { id: 'products', label: 'Products', count: products.length, icon: Package },
            { id: 'orders', label: 'Orders', count: orders.length, icon: ShoppingBag },
            { id: 'banners', label: 'Banners', count: banners.length, icon: Sparkles },
            { id: 'coupons', label: 'Coupons', count: coupons.length, icon: Tag },
            { id: 'reviews', label: 'Reviews', count: reviews.length, icon: MessageSquare },
            { id: 'customers', label: 'Customers', count: customers.length, icon: Users },
            { id: 'settings', label: 'Settings', icon: Settings },
          ].map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as AdminTab)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition shrink-0 ${
                  isActive 
                    ? 'bg-black text-white shadow-xs' 
                    : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200/80'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
                {tab.count !== undefined && (
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                    isActive ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-600'
                  }`}>
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* 1. PRODUCTS TAB */}
        {activeTab === 'products' && (
          <div className="space-y-6">
            {/* KPI Metrics */}
            <div className="grid grid-cols-2 gap-4">
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
                <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600">
                  <TrendingUp className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Avg Price</p>
                  <h3 className="text-2xl font-black text-black">
                    Rs. {products.length ? (products.reduce((acc, p) => acc + p.price, 0) / products.length).toFixed(0) : '0'}
                  </h3>
                </div>
              </div>
            </div>

            {/* Catalog Controls */}
            <div className="bg-white rounded-3xl border border-gray-200 shadow-xs p-6 space-y-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-black text-black tracking-tight">Supplements Catalog</h2>
                  <p className="text-xs text-gray-500">Live synchronized with the 3D storefront and product pages.</p>
                </div>

                <div className="flex items-center gap-2.5">
                  <button
                    onClick={async () => {
                      setIsResetting(true);
                      await resetToDefaults();
                      setIsResetting(false);
                      showToast('Database reset to defaults.');
                    }}
                    disabled={isResetting}
                    className="flex items-center gap-2 px-4 py-2.5 border border-gray-300 hover:bg-gray-50 text-gray-700 text-xs font-bold rounded-2xl transition disabled:opacity-50"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isResetting ? 'animate-spin' : ''}`} />
                    <span>Reset Defaults</span>
                  </button>

                  <button
                    onClick={handleOpenAddProduct}
                    className="flex items-center gap-2 px-5 py-2.5 bg-black hover:bg-neutral-800 text-white text-xs font-bold rounded-2xl transition active:scale-95 shadow-md"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add Product</span>
                  </button>
                </div>
              </div>

              {/* Search & Category Filter */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2 border-t border-gray-100">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search by title or slug..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium focus:outline-hidden focus:ring-2 focus:ring-black"
                  />
                </div>
              </div>

              {/* Products Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-gray-200 text-[11px] uppercase tracking-wider text-gray-400 font-bold">
                      <th className="py-3 px-4">Product</th>
                      <th className="py-3 px-4">Price</th>
                      <th className="py-3 px-4">Qty</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 text-xs">
                    {filteredProducts.map((p) => (
                      <tr key={p.id} className="hover:bg-gray-50/80 transition group">
                        <td className="py-3 px-4 flex items-center gap-3">
                          <div className="w-12 h-12 rounded-xl bg-gray-50 p-1 border border-gray-100 shrink-0 flex items-center justify-center overflow-hidden">
                            <img src={formatImageUrl(p.image || p.images?.[0])} alt={p.name} className="max-h-full max-w-full object-contain" />
                          </div>
                          <div>
                            <div className="font-bold text-gray-900 group-hover:text-black">{p.name}</div>
                            <div className="flex items-center gap-1.5 text-[11px] text-gray-400">
                              <span>/{p.slug}</span>
                              <button onClick={() => navigate(`/product/${p.slug}`)} className="text-gray-400 hover:text-black" title="View live page">
                                <ExternalLink className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4 font-black text-gray-900">
                          Rs. {p.price.toFixed(0)}
                        </td>
                        <td className="py-3 px-4 font-semibold text-gray-600">
                          {p.stockQuantity}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => handleOpenEditProduct(p)}
                              className="p-1.5 text-gray-500 hover:text-black hover:bg-gray-200/60 rounded-lg transition"
                              title="Edit Product"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => {
                                setIsDeletingId(p.id);
                                setDeleteTargetType('product');
                              }}
                              className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                              title="Delete Product"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* 2. ORDERS TAB */}
        {activeTab === 'orders' && (
          <div className="bg-white rounded-3xl border border-gray-200 shadow-xs p-6 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-black text-black">Customer Orders</h2>
                <p className="text-xs text-gray-500">Live order stream placed from the storefront checkout.</p>
              </div>
              <span className="text-xs font-bold bg-gray-100 text-gray-800 px-3 py-1.5 rounded-full">
                {orders.length} total orders
              </span>
            </div>

            {orders.length === 0 ? (
              <div className="py-16 text-center text-gray-400 text-xs">
                No orders placed yet. Place a test order from the storefront cart drawer.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-gray-200 text-[11px] uppercase tracking-wider text-gray-400 font-bold">
                      <th className="py-3 px-4">Order #</th>
                      <th className="py-3 px-4">Customer</th>
                      <th className="py-3 px-4">Items</th>
                      <th className="py-3 px-4">Total</th>
                      <th className="py-3 px-4">Payment</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 text-xs font-medium">
                    {orders.map(order => (
                      <tr key={order.id} className="hover:bg-gray-50/80 transition">
                        <td className="py-3 px-4">
                          <span className="font-black text-black">{order.orderNumber}</span>
                          <span className="block text-[10px] text-gray-400">{new Date(order.createdAt).toLocaleDateString()}</span>
                        </td>
                        <td className="py-3 px-4">
                          <div className="font-bold text-gray-900">{order.customerName}</div>
                          <div className="text-[11px] text-gray-500">{order.customerPhone}</div>
                          <div className="text-[10px] text-gray-400 truncate max-w-xs">{order.shippingAddress}</div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="space-y-0.5">
                            {order.items.map((item, idx) => (
                              <div key={idx} className="text-[11px] text-gray-700">
                                {item.quantity}x {item.name}
                              </div>
                            ))}
                          </div>
                        </td>
                        <td className="py-3 px-4 font-black text-gray-900">
                          Rs. {order.totalAmount.toFixed(0)}
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex flex-col gap-1">
                            <span className="text-[11px] bg-gray-100 px-2 py-0.5 rounded-md font-semibold">
                              {order.paymentMethod}
                            </span>
                            {order.paymentScreenshot && (
                              <a 
                                href={formatImageUrl(order.paymentScreenshot)} 
                                target="_blank" 
                                rel="noreferrer"
                                className="text-[10px] text-blue-600 font-bold hover:underline flex items-center gap-1"
                              >
                                <ImageIcon className="w-3 h-3" />
                                <span>View SS</span>
                              </a>
                            )}
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <select
                            value={order.orderStatus}
                            onChange={(e) => updateOrderStatus(order.id, e.target.value as Order['orderStatus'])}
                            className={`text-xs font-bold py-1 px-2.5 rounded-xl border ${
                              order.orderStatus === 'Delivered' ? 'bg-emerald-50 text-emerald-800 border-emerald-200' :
                              order.orderStatus === 'Shipped' ? 'bg-blue-50 text-blue-800 border-blue-200' :
                              order.orderStatus === 'Cancelled' ? 'bg-red-50 text-red-800 border-red-200' :
                              'bg-amber-50 text-amber-800 border-amber-200'
                            }`}
                          >
                            <option value="Pending">Pending</option>
                            <option value="Processing">Processing</option>
                            <option value="Shipped">Shipped</option>
                            <option value="Delivered">Delivered</option>
                            <option value="Cancelled">Cancelled</option>
                          </select>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <button
                            onClick={() => {
                              setIsDeletingId(order.id);
                              setDeleteTargetType('order');
                            }}
                            className="p-1.5 text-gray-400 hover:text-red-600 rounded-lg transition"
                            title="Delete order"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* 3. BANNERS TAB */}
        {activeTab === 'banners' && (
          <div className="bg-white rounded-3xl border border-gray-200 shadow-xs p-6 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-black text-black">Homepage Banners</h2>
                <p className="text-xs text-gray-500">Manage promotional announcements shown on the homepage.</p>
              </div>
              <button
                onClick={handleOpenAddBanner}
                className="flex items-center gap-2 px-5 py-2.5 bg-black hover:bg-neutral-800 text-white text-xs font-bold rounded-2xl shadow-md transition"
              >
                <Plus className="w-4 h-4" />
                <span>Add Banner</span>
              </button>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              {banners.map(banner => (
                <div key={banner.id} className="border border-gray-200 rounded-2xl p-5 flex flex-col justify-between space-y-3 bg-gray-50/50">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-black text-sm text-black">{banner.title}</h4>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          banner.active ? 'bg-emerald-50 text-emerald-700' : 'bg-gray-200 text-gray-600'
                        }`}>
                          {banner.active ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 mt-1 leading-relaxed">{banner.subtitle}</p>
                    </div>

                    <div className="w-14 h-14 bg-white rounded-xl border border-gray-200 p-1 flex items-center justify-center shrink-0 overflow-hidden">
                      <img src={formatImageUrl(banner.image)} alt={banner.title} className="max-h-full max-w-full object-contain" />
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-gray-200/60">
                    <button
                      onClick={() => updateBanner(banner.id, { active: !banner.active })}
                      className="text-xs font-bold text-gray-700 hover:text-black underline"
                    >
                      {banner.active ? 'Deactivate' : 'Set as Active'}
                    </button>
                    <button
                      onClick={() => {
                        setIsDeletingId(banner.id);
                        setDeleteTargetType('banner');
                      }}
                      className="text-gray-400 hover:text-red-600 p-1.5"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 4. CATEGORIES TAB */}
        {activeTab === 'categories' && (
          <div className="bg-white rounded-3xl border border-gray-200 shadow-xs p-6 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-black text-black">Product Categories</h2>
                <p className="text-xs text-gray-500">Categories powering filter strips and store navigation.</p>
              </div>
              <button
                onClick={() => setIsCategoryModalOpen(true)}
                className="flex items-center gap-2 px-5 py-2.5 bg-black hover:bg-neutral-800 text-white text-xs font-bold rounded-2xl shadow-md transition"
              >
                <Plus className="w-4 h-4" />
                <span>Add Category</span>
              </button>
            </div>

            <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-4">
              {categories.map(cat => (
                <div key={cat.id} className="border border-gray-200 rounded-2xl p-4 bg-gray-50/50 flex flex-col justify-between space-y-3">
                  <div>
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-sm text-black">{cat.name}</h4>
                      <button
                        onClick={() => updateCategory(cat.id, { visible: !cat.visible })}
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          cat.visible ? 'bg-emerald-50 text-emerald-700' : 'bg-gray-200 text-gray-500'
                        }`}
                      >
                        {cat.visible ? 'Visible' : 'Hidden'}
                      </button>
                    </div>
                    <p className="text-[11px] text-gray-500 mt-1">{cat.description || `/${cat.slug}`}</p>
                  </div>

                  <div className="flex items-center justify-end pt-2 border-t border-gray-200/60">
                    <button
                      onClick={() => {
                        setIsDeletingId(cat.id);
                        setDeleteTargetType('category');
                      }}
                      className="text-gray-400 hover:text-red-600 p-1"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 5. COUPONS TAB */}
        {activeTab === 'coupons' && (
          <div className="bg-white rounded-3xl border border-gray-200 shadow-xs p-6 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-black text-black">Discount Coupons</h2>
                <p className="text-xs text-gray-500">Promo codes accepted during storefront checkout.</p>
              </div>
              <button
                onClick={() => setIsCouponModalOpen(true)}
                className="flex items-center gap-2 px-5 py-2.5 bg-black hover:bg-neutral-800 text-white text-xs font-bold rounded-2xl shadow-md transition"
              >
                <Plus className="w-4 h-4" />
                <span>Create Coupon</span>
              </button>
            </div>

            <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
              {coupons.map(coupon => (
                <div key={coupon.id} className="border border-gray-200 rounded-2xl p-5 bg-gray-50/50 flex flex-col justify-between space-y-3">
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="font-black text-base tracking-wider text-black bg-white px-2.5 py-1 rounded-xl border border-gray-200">
                        {coupon.code}
                      </span>
                      <button
                        onClick={() => toggleCoupon(coupon.id, !coupon.active)}
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          coupon.active ? 'bg-emerald-50 text-emerald-700' : 'bg-gray-200 text-gray-600'
                        }`}
                      >
                        {coupon.active ? 'Active' : 'Disabled'}
                      </button>
                    </div>
                    <p className="text-xs font-bold text-gray-800 mt-2">
                      {coupon.discountType === 'percentage' ? `${coupon.discountValue}% OFF` : `Rs. ${coupon.discountValue} OFF`}
                    </p>
                    <p className="text-[11px] text-gray-400">Min. order: Rs. {coupon.minOrderAmount || 0}</p>
                  </div>

                  <div className="flex items-center justify-end pt-2 border-t border-gray-200/60">
                    <button
                      onClick={() => {
                        setIsDeletingId(coupon.id);
                        setDeleteTargetType('coupon');
                      }}
                      className="text-gray-400 hover:text-red-600 p-1"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 6. REVIEWS TAB */}
        {activeTab === 'reviews' && (
          <div className="bg-white rounded-3xl border border-gray-200 shadow-xs p-6 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-black text-black">Customer Reviews</h2>
                <p className="text-xs text-gray-500">Live reviews submitted by store visitors across products.</p>
              </div>
              <span className="text-xs font-bold bg-gray-100 text-gray-800 px-3 py-1.5 rounded-full">
                {reviews.length} reviews
              </span>
            </div>

            <div className="space-y-3">
              {reviews.map(rev => (
                <div key={rev.id} className="border border-gray-200 rounded-2xl p-4 bg-gray-50/50 flex items-start justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs text-gray-900">{rev.customerName}</span>
                      <span className="text-[10px] text-gray-400">• on {rev.productName || 'Product'}</span>
                      <span className="text-amber-500 font-bold text-xs">★ {rev.rating}/5</span>
                    </div>
                    <p className="text-xs text-gray-600 leading-relaxed">{rev.comment}</p>
                    <span className="text-[10px] text-gray-400 block">{new Date(rev.createdAt).toLocaleDateString()}</span>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => toggleReviewApproval(rev.id, !rev.approved)}
                      className={`text-[11px] font-bold px-2.5 py-1 rounded-xl transition ${
                        rev.approved ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
                      }`}
                    >
                      {rev.approved ? 'Approved' : 'Pending'}
                    </button>
                    <button
                      onClick={() => {
                        setIsDeletingId(rev.id);
                        setDeleteTargetType('review');
                      }}
                      className="p-1.5 text-gray-400 hover:text-red-600"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 7. CUSTOMERS TAB */}
        {activeTab === 'customers' && (
          <div className="bg-white rounded-3xl border border-gray-200 shadow-xs p-6 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-black text-black">Customer Accounts</h2>
                <p className="text-xs text-gray-500">Live directory of customers who placed orders.</p>
              </div>
              <span className="text-xs font-bold bg-gray-100 text-gray-800 px-3 py-1.5 rounded-full">
                {customers.length} registered
              </span>
            </div>

            {customers.length === 0 ? (
              <div className="py-12 text-center text-gray-400 text-xs">
                No customer profiles recorded yet.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-gray-200 text-[11px] uppercase tracking-wider text-gray-400 font-bold">
                      <th className="py-3 px-4">Name</th>
                      <th className="py-3 px-4">Phone</th>
                      <th className="py-3 px-4">Email</th>
                      <th className="py-3 px-4">Orders</th>
                      <th className="py-3 px-4">Total Spent</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {customers.map(c => (
                      <tr key={c.id} className="hover:bg-gray-50">
                        <td className="py-3 px-4 font-bold text-gray-900">{c.name}</td>
                        <td className="py-3 px-4 text-gray-600">{c.phone}</td>
                        <td className="py-3 px-4 text-gray-500">{c.email || '—'}</td>
                        <td className="py-3 px-4 font-black">{c.totalOrders}</td>
                        <td className="py-3 px-4 font-black text-emerald-600">Rs. {c.totalSpent.toFixed(0)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* 8. SETTINGS TAB */}
        {activeTab === 'settings' && (
          <div className="bg-white rounded-3xl border border-gray-200 shadow-xs p-6 space-y-6 max-w-2xl">
            <div>
              <h2 className="text-xl font-black text-black">Storefront Settings</h2>
              <p className="text-xs text-gray-500">Configures delivery fees and contact details.</p>
            </div>

            <form onSubmit={handleSaveSettings} className="space-y-5 text-xs font-medium">

              {/* Delivery Settings */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold uppercase text-gray-600 mb-1">Standard Delivery Fee (Rs.)</label>
                  <input
                    type="number"
                    step="1"
                    min="0"
                    value={settingsFormData.deliveryCharge}
                    onChange={(e) => setSettingsFormData(prev => ({ ...prev, deliveryCharge: parseFloat(e.target.value) || 0 }))}
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-black"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase text-gray-600 mb-1">Free Delivery Over (Rs.)</label>
                  <input
                    type="number"
                    step="100"
                    min="0"
                    value={settingsFormData.freeDeliveryThreshold}
                    onChange={(e) => setSettingsFormData(prev => ({ ...prev, freeDeliveryThreshold: parseFloat(e.target.value) || 0 }))}
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-black"
                  />
                </div>
              </div>

              {/* Contact Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold uppercase text-gray-600 mb-1">Support Phone</label>
                  <input
                    type="text"
                    value={settingsFormData.phone}
                    onChange={(e) => setSettingsFormData(prev => ({ ...prev, phone: e.target.value }))}
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-black"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase text-gray-600 mb-1">Support Email</label>
                  <input
                    type="email"
                    value={settingsFormData.email}
                    onChange={(e) => setSettingsFormData(prev => ({ ...prev, email: e.target.value }))}
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-black"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3.5 bg-black hover:bg-neutral-800 text-white font-bold rounded-2xl shadow-md transition active:scale-95 text-xs uppercase tracking-wider"
              >
                Save All Settings in Firebase
              </button>

              {/* Payment Methods Management */}
              <div className="pt-8 border-t border-gray-100 space-y-6">
                <div>
                  <h3 className="text-sm font-black text-black">Payment Gateways</h3>
                  <p className="text-[11px] text-gray-500">Configure Esewa, Khalti, or Bank QR codes.</p>
                </div>

                <div className="space-y-4">
                  {settingsFormData.paymentMethods.map((method, idx) => (
                    <div key={method.id} className="p-4 bg-gray-50 rounded-3xl border border-gray-200 space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${method.enabled ? 'bg-black text-white' : 'bg-gray-200 text-gray-400'}`}>
                            {method.type === 'qr' ? <QrCode className="w-5 h-5" /> : <Truck className="w-5 h-5" />}
                          </div>
                          <div>
                            <input
                              type="text"
                              value={method.name}
                              onChange={(e) => {
                                const newMethods = [...settingsFormData.paymentMethods];
                                newMethods[idx] = { ...method, name: e.target.value };
                                setSettingsFormData(prev => ({ ...prev, paymentMethods: newMethods }));
                              }}
                              className="font-bold text-sm bg-transparent border-b border-transparent hover:border-gray-300 focus:border-black focus:outline-hidden px-1"
                            />
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            const newMethods = [...settingsFormData.paymentMethods];
                            newMethods[idx] = { ...method, enabled: !method.enabled };
                            setSettingsFormData(prev => ({ ...prev, paymentMethods: newMethods }));
                          }}
                          className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider transition ${
                            method.enabled ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-200 text-gray-500'
                          }`}
                        >
                          {method.enabled ? 'Enabled' : 'Disabled'}
                        </button>
                      </div>

                      {method.type === 'qr' && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                          <div className="space-y-2">
                            <label className="text-[10px] font-bold uppercase text-gray-500">Instructions</label>
                            <textarea
                              rows={2}
                              value={method.instructions || ''}
                              onChange={(e) => {
                                const newMethods = [...settingsFormData.paymentMethods];
                                newMethods[idx] = { ...method, instructions: e.target.value };
                                setSettingsFormData(prev => ({ ...prev, paymentMethods: newMethods }));
                              }}
                              placeholder="e.g. Scan QR to pay"
                              className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-xs focus:ring-1 focus:ring-black focus:outline-hidden"
                            />
                          </div>
                          <div className="space-y-2">
                            <label className="text-[10px] font-bold uppercase text-gray-500">QR Image (Gallery Only)</label>
                            <div className="flex items-center gap-3">
                              <div className="w-16 h-16 bg-white rounded-xl border border-gray-200 p-1 flex items-center justify-center shrink-0 overflow-hidden">
                                {method.qrImage ? (
                                  <img src={formatImageUrl(method.qrImage)} alt="QR" className="max-h-full max-w-full object-contain" />
                                ) : (
                                  <QrCode className="w-6 h-6 text-gray-300" />
                                )}
                              </div>
                              <button
                                type="button"
                                onClick={() => {
                                  setActivePaymentMethodId(method.id);
                                  paymentQRInputRef.current?.click();
                                }}
                                className="px-3 py-1.5 bg-white border border-gray-300 hover:bg-gray-100 rounded-xl text-[10px] font-bold transition"
                              >
                                Upload QR
                              </button>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </form>
          </div>
        )}
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
                  Select a photo from your gallery to publish directly to Firebase.
                </p>
              </div>
              <button onClick={() => setIsEditModalOpen(false)} className="p-2 text-gray-400 hover:text-black rounded-xl">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="p-6 space-y-5 max-h-[75vh] overflow-y-auto text-xs font-medium">
              {/* Product Photo From Device Gallery Only */}
              <div className="space-y-2">
                <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-700">
                  Product Photo <span className="text-red-500">*</span>
                  <span className="text-gray-400 font-normal ml-1.5 lowercase">(from device photo gallery)</span>
                </label>

                {photoError && (
                  <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-xs text-red-700 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 shrink-0 text-red-500" />
                    <span>{photoError}</span>
                  </div>
                )}

                {formData.image ? (
                  <div className="space-y-3">
                    <div className="rounded-2xl border border-gray-200 p-4 bg-gray-50 flex items-center gap-4">
                      <div className="w-24 h-24 bg-white rounded-2xl border border-gray-200 p-2 flex items-center justify-center shrink-0 overflow-hidden shadow-xs">
                        <img src={formatImageUrl(formData.image)} alt="Selected product" className="max-h-full max-w-full object-contain" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 text-xs font-bold text-gray-900 mb-1">
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Photo Ready for Firebase</span>
                        </div>
                        <p className="text-[11px] text-gray-500 mb-3">
                          Uploaded to Firebase Storage and synchronized across the live store.
                        </p>
                        <div className="flex flex-wrap gap-2">
                          <button
                            type="button"
                            onClick={() => mainPhotoInputRef.current?.click()}
                            disabled={isProcessingPhoto}
                            className="px-3.5 py-1.5 bg-black hover:bg-neutral-800 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition active:scale-95 shadow-xs"
                          >
                            <ImagePlus className="w-3.5 h-3.5" />
                            <span>{isProcessingPhoto ? 'Uploading...' : 'Change Photo from Gallery'}</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => setFormData(prev => ({ ...prev, image: '', images: prev.images.filter(img => img !== prev.image) }))}
                            className="px-3 py-1.5 border border-red-200 text-red-600 hover:bg-red-50 rounded-xl text-xs font-semibold transition"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Additional Photo Gallery Views */}
                    <div className="pt-1">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[11px] font-bold text-gray-600 uppercase">
                          Additional Gallery Angles ({formData.images.length})
                        </span>
                        <button
                          type="button"
                          onClick={() => additionalPhotoInputRef.current?.click()}
                          disabled={isProcessingPhoto}
                          className="text-[11px] font-bold text-black hover:underline flex items-center gap-1"
                        >
                          <Plus className="w-3 h-3" />
                          <span>Add More from Gallery</span>
                        </button>
                      </div>

                      {formData.images.length > 0 && (
                        <div className="flex gap-2.5 overflow-x-auto pb-1">
                          {formData.images.map((img, idx) => (
                            <div 
                              key={idx} 
                              className={`relative group shrink-0 w-16 h-16 rounded-xl border p-1 bg-white overflow-hidden cursor-pointer transition ${
                                formData.image === img ? 'border-black ring-2 ring-black/20' : 'border-gray-200 hover:border-gray-400'
                              }`}
                              onClick={() => setFormData(prev => ({ ...prev, image: img }))}
                              title="Click to set as primary photo"
                            >
                              <img src={formatImageUrl(img)} alt={`Gallery ${idx}`} className="w-full h-full object-contain" />
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div
                    onClick={() => mainPhotoInputRef.current?.click()}
                    className="border-2 border-dashed border-gray-300 hover:border-black rounded-3xl p-8 flex flex-col items-center justify-center cursor-pointer bg-gray-50 hover:bg-gray-100/70 transition text-center group"
                  >
                    <div className="w-14 h-14 rounded-2xl bg-white shadow-xs flex items-center justify-center text-gray-500 group-hover:text-black mb-3 transition group-hover:scale-105">
                      <ImageIcon className="w-7 h-7" />
                    </div>
                    <p className="text-sm font-black text-gray-900">
                      {isProcessingPhoto ? 'Uploading to Firebase Storage...' : 'Tap to Select Photo from Gallery'}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      Choose directly from your camera roll or photo library
                    </p>
                    <span className="mt-4 px-4 py-2 bg-black text-white text-xs font-bold rounded-xl group-hover:bg-neutral-800 transition shadow-xs flex items-center gap-1.5">
                      <ImagePlus className="w-3.5 h-3.5" />
                      <span>Open Photo Gallery</span>
                    </span>
                  </div>
                )}
              </div>

              {/* Title & Slug */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-gray-100">
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
                  <label className="block text-[11px] font-bold uppercase text-gray-600 mb-1">Selling Price (Rs.) *</label>
                  <input
                    type="number"
                    step="1"
                    min="0"
                    required
                    value={formData.price}
                    onChange={(e) => setFormData(prev => ({ ...prev, price: parseFloat(e.target.value) || 0 }))}
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-black focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase text-gray-600 mb-1">Original Price (Rs.)</label>
                  <input
                    type="number"
                    step="1"
                    min="0"
                    value={formData.originalPrice}
                    onChange={(e) => setFormData(prev => ({ ...prev, originalPrice: parseFloat(e.target.value) || 0 }))}
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-black focus:outline-hidden"
                  />
                </div>
              </div>

              {/* Stock Status & Quantity */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold uppercase text-gray-600 mb-1">Stock Quantity</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.stockQuantity}
                    onChange={(e) => setFormData(prev => ({ ...prev, stockQuantity: parseInt(e.target.value) || 0 }))}
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-black focus:outline-hidden"
                  />
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

              {/* Key Benefits */}
              <div>
                <label className="block text-[11px] font-bold uppercase text-gray-600 mb-1">Key Benefits</label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={formData.benefitInput}
                    onChange={(e) => setFormData(prev => ({ ...prev, benefitInput: e.target.value }))}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        if (formData.benefitInput.trim()) {
                          setFormData(prev => ({
                            ...prev,
                            keyBenefits: [...prev.keyBenefits, prev.benefitInput.trim()],
                            benefitInput: ''
                          }));
                        }
                      }
                    }}
                    placeholder="Type benefit and hit Enter"
                    className="flex-1 px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (formData.benefitInput.trim()) {
                        setFormData(prev => ({
                          ...prev,
                          keyBenefits: [...prev.keyBenefits, prev.benefitInput.trim()],
                          benefitInput: ''
                        }));
                      }
                    }}
                    className="px-3.5 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-xl font-bold text-xs"
                  >
                    Add
                  </button>
                </div>

                <div className="flex flex-wrap gap-1.5">
                  {formData.keyBenefits.map((b, i) => (
                    <span key={i} className="inline-flex items-center gap-1.5 bg-gray-100 text-gray-800 text-xs px-2.5 py-1 rounded-full font-medium">
                      {b}
                      <button
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, keyBenefits: prev.keyBenefits.filter((_, idx) => idx !== i) }))}
                        className="text-gray-400 hover:text-red-500"
                      >
                        ×
                      </button>
                    </span>
                  ))}
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
                  disabled={isProcessingPhoto}
                  className="px-6 py-2.5 bg-black hover:bg-neutral-800 text-white font-bold rounded-2xl shadow-md transition active:scale-95 disabled:opacity-50"
                >
                  {editingProduct ? 'Save Changes' : 'Publish Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Banner Modal */}
      {isBannerModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white max-w-md w-full rounded-3xl p-6 shadow-2xl border border-gray-100 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-gray-100">
              <h3 className="text-base font-black text-black">New Promotional Banner</h3>
              <button onClick={() => setIsBannerModalOpen(false)} className="text-gray-400 hover:text-black">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveBanner} className="space-y-3 text-xs font-medium">
              <div>
                <label className="block text-[11px] font-bold uppercase text-gray-600 mb-1">Banner Title *</label>
                <input
                  type="text"
                  required
                  value={bannerFormData.title}
                  onChange={(e) => setBannerFormData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="e.g. Pure Fuel for Peak Performance"
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-black"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase text-gray-600 mb-1">Subtitle</label>
                <input
                  type="text"
                  value={bannerFormData.subtitle}
                  onChange={(e) => setBannerFormData(prev => ({ ...prev, subtitle: e.target.value }))}
                  placeholder="e.g. Ultra-pure micronized formulations"
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-black"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase text-gray-600 mb-1">Banner Photo (From Gallery)</label>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => bannerPhotoInputRef.current?.click()}
                    className="px-3.5 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-xl text-xs font-bold flex items-center gap-1.5"
                  >
                    <ImagePlus className="w-3.5 h-3.5" />
                    <span>Choose from Gallery</span>
                  </button>
                  {bannerFormData.image && (
                    <span className="text-xs text-emerald-600 font-bold flex items-center gap-1">
                      <Check className="w-3.5 h-3.5" /> Photo Loaded
                    </span>
                  )}
                </div>
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsBannerModalOpen(false)}
                  className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-xl font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-black text-white font-bold rounded-xl hover:bg-neutral-800"
                >
                  Save Banner
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Category Modal */}
      {isCategoryModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white max-w-sm w-full rounded-3xl p-6 shadow-2xl border border-gray-100 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-gray-100">
              <h3 className="text-base font-black text-black">New Category</h3>
              <button onClick={() => setIsCategoryModalOpen(false)} className="text-gray-400 hover:text-black">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveCategory} className="space-y-3 text-xs font-medium">
              <div>
                <label className="block text-[11px] font-bold uppercase text-gray-600 mb-1">Category Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Whey Isolates"
                  value={categoryFormData.name}
                  onChange={(e) => setCategoryFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-black"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase text-gray-600 mb-1">Description</label>
                <input
                  type="text"
                  placeholder="Short description"
                  value={categoryFormData.description}
                  onChange={(e) => setCategoryFormData(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-black"
                />
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsCategoryModalOpen(false)}
                  className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-xl font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-black text-white font-bold rounded-xl hover:bg-neutral-800"
                >
                  Add Category
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Coupon Modal */}
      {isCouponModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white max-w-sm w-full rounded-3xl p-6 shadow-2xl border border-gray-100 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-gray-100">
              <h3 className="text-base font-black text-black">Create Discount Coupon</h3>
              <button onClick={() => setIsCouponModalOpen(false)} className="text-gray-400 hover:text-black">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveCoupon} className="space-y-3 text-xs font-medium">
              <div>
                <label className="block text-[11px] font-bold uppercase text-gray-600 mb-1">Coupon Code *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. FLASH20"
                  value={couponFormData.code}
                  onChange={(e) => setCouponFormData(prev => ({ ...prev, code: e.target.value.toUpperCase() }))}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl uppercase font-bold focus:outline-hidden focus:ring-2 focus:ring-black"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold uppercase text-gray-600 mb-1">Type</label>
                  <select
                    value={couponFormData.discountType}
                    onChange={(e) => setCouponFormData(prev => ({ ...prev, discountType: e.target.value as 'percentage' | 'fixed' }))}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl"
                  >
                    <option value="percentage">Percentage (%)</option>
                    <option value="fixed">Fixed (Rs.)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase text-gray-600 mb-1">Discount Value (Rs./%)</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={couponFormData.discountValue}
                    onChange={(e) => setCouponFormData(prev => ({ ...prev, discountValue: parseFloat(e.target.value) || 0 }))}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase text-gray-600 mb-1">Min. Order Amount (Rs.)</label>
                <input
                  type="number"
                  min="0"
                  value={couponFormData.minOrderAmount}
                  onChange={(e) => setCouponFormData(prev => ({ ...prev, minOrderAmount: parseFloat(e.target.value) || 0 }))}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl"
                />
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsCouponModalOpen(false)}
                  className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-xl font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-black text-white font-bold rounded-xl hover:bg-neutral-800"
                >
                  Activate Coupon
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      {isDeletingId && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white max-w-sm w-full rounded-3xl p-6 shadow-2xl border border-gray-100 space-y-4">
            <div className="w-12 h-12 bg-red-50 text-red-600 rounded-2xl flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            <div className="text-center">
              <h4 className="text-base font-black text-black">Confirm Deletion?</h4>
              <p className="text-xs text-gray-500 mt-1">
                This item will be permanently removed from Firebase Firestore.
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
                onClick={handleConfirmDelete}
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
