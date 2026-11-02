import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  Product, 
  Order, 
  Customer, 
  Banner, 
  Category, 
  Review, 
  Coupon, 
  StoreSettings 
} from '../types/store';
import { initialProducts } from '../data/products';
import { db, auth } from '../lib/firebase';
import { 
  collection, 
  onSnapshot, 
  doc, 
  setDoc, 
  deleteDoc, 
  updateDoc 
} from 'firebase/firestore';
import { handleFirestoreError, OperationType } from '../lib/firestoreErrors';
import { formatImageUrl } from '../utils/imageUrl';

const defaultSettings: StoreSettings = {
  id: 'general',
  storeName: 'FitFul Nepal',
  currency: 'NPR',
  phone: '+977-9800000000',
  email: 'contact@fitfulnepal.com',
  address: 'Kathmandu, Nepal',
  deliveryCharge: 120,
  freeDeliveryThreshold: 2000,
  codEnabled: true,
  updatedAt: new Date().toISOString()
};

const initialCategories: Category[] = [
  { id: 'cat_sports', name: 'Sports Nutrition', slug: 'sports-nutrition', description: 'Performance and muscle building fuel', visible: true, displayOrder: 1, createdAt: new Date().toISOString() },
  { id: 'cat_performance', name: 'Performance', slug: 'performance', description: 'Strength, ATP power and endurance boosters', visible: true, displayOrder: 2, createdAt: new Date().toISOString() },
  { id: 'cat_spreads', name: 'Protein Spreads', slug: 'protein-spreads', description: 'High-protein peanut and nut butters', visible: true, displayOrder: 3, createdAt: new Date().toISOString() },
  { id: 'cat_superfoods', name: 'Superfoods', slug: 'superfoods', description: 'Raw chia, antioxidant and botanical blends', visible: true, displayOrder: 4, createdAt: new Date().toISOString() }
];

const initialBanners: Banner[] = [
  {
    id: 'banner_main',
    title: 'Pure Fuel for Peak Human Performance',
    subtitle: 'Himalayan-tested nutritional formulations engineered with ultra-micronized ingredients and zero artificial fillers.',
    buttonText: 'Explore Catalog',
    buttonLink: '#catalog',
    image: '/assets/aistudio/tiktok_video_dt6Np_d66a1b63.jpeg',
    active: true,
    displayOrder: 1,
    createdAt: new Date().toISOString()
  }
];

const initialCoupons: Coupon[] = [
  {
    id: 'coup_fitful10',
    code: 'FITFUL10',
    discountType: 'percentage',
    discountValue: 10,
    minOrderAmount: 20,
    active: true,
    usageCount: 14,
    createdAt: new Date().toISOString()
  },
  {
    id: 'coup_save5',
    code: 'SAVE5',
    discountType: 'fixed',
    discountValue: 5,
    minOrderAmount: 25,
    active: true,
    usageCount: 8,
    createdAt: new Date().toISOString()
  }
];

const initialReviews: Review[] = [
  {
    id: 'rev_1',
    productId: '1',
    productName: 'Pintola High Protein Oats',
    customerName: 'Aarav Sharma',
    rating: 5,
    comment: 'The dark cocoa flavor is incredible and gives me sustained energy throughout my morning workouts. 26g protein per bowl is unrivaled.',
    approved: true,
    createdAt: '2026-10-15T09:30:00Z'
  },
  {
    id: 'rev_2',
    productId: '2',
    productName: 'Wellcore Creatine Monohydrate',
    customerName: 'Bikash Thapa',
    rating: 5,
    comment: 'Dissolves completely without any grit. Noticeable strength gains within 2 weeks of daily intake. Pure quality.',
    approved: true,
    createdAt: '2026-10-18T14:15:00Z'
  },
  {
    id: 'rev_3',
    productId: '3',
    productName: 'Kulfi Blast Peanut Butter',
    customerName: 'Sneha Shrestha',
    rating: 5,
    comment: 'Tastes like authentic royal kulfi dessert! Unbelievable that it has zero palm oil and 8g protein per serving.',
    approved: true,
    createdAt: '2026-10-22T11:45:00Z'
  }
];

interface StoreContextType {
  // Collections
  products: Product[];
  banners: Banner[];
  categories: Category[];
  orders: Order[];
  reviews: Review[];
  coupons: Coupon[];
  settings: StoreSettings;
  customers: Customer[];
  
  // Status
  loading: boolean;
  isSynced: boolean;

  // Product Operations
  getProductBySlug: (slug: string) => Product | undefined;
  getProductById: (id: string) => Product | undefined;
  addProduct: (product: Omit<Product, 'id'>) => Promise<string>;
  updateProduct: (id: string, updates: Partial<Product>) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
  resetToDefaults: () => Promise<void>;

  // Banner Operations
  addBanner: (banner: Omit<Banner, 'id'>) => Promise<string>;
  updateBanner: (id: string, updates: Partial<Banner>) => Promise<void>;
  deleteBanner: (id: string) => Promise<void>;

  // Category Operations
  addCategory: (category: Omit<Category, 'id'>) => Promise<string>;
  updateCategory: (id: string, updates: Partial<Category>) => Promise<void>;
  deleteCategory: (id: string) => Promise<void>;

  // Order Operations
  createOrder: (orderData: Omit<Order, 'id' | 'orderNumber' | 'createdAt' | 'updatedAt'>) => Promise<string>;
  updateOrderStatus: (id: string, orderStatus: Order['orderStatus'], paymentStatus?: Order['paymentStatus']) => Promise<void>;
  deleteOrder: (id: string) => Promise<void>;

  // Review Operations
  addReview: (review: Omit<Review, 'id' | 'createdAt'>) => Promise<string>;
  toggleReviewApproval: (id: string, approved: boolean) => Promise<void>;
  deleteReview: (id: string) => Promise<void>;
  getProductReviews: (productId: string) => Review[];

  // Coupon Operations
  addCoupon: (coupon: Omit<Coupon, 'id' | 'createdAt' | 'usageCount'>) => Promise<string>;
  toggleCoupon: (id: string, active: boolean) => Promise<void>;
  deleteCoupon: (id: string) => Promise<void>;
  validateCoupon: (code: string, subtotal: number) => { valid: boolean; discountAmount: number; message: string };

  // Settings Operations
  updateSettings: (updates: Partial<StoreSettings>) => Promise<void>;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // 1. Local States with safe initial defaults
  const [products, setProducts] = useState<Product[]>(() => {
    try {
      const cached = localStorage.getItem('fitful_nepal_products_cache');
      return cached ? JSON.parse(cached) : initialProducts;
    } catch {
      return initialProducts;
    }
  });

  const [banners, setBanners] = useState<Banner[]>(initialBanners);
  const [categories, setCategories] = useState<Category[]>(initialCategories);
  const [orders, setOrders] = useState<Order[]>([]);
  const [reviews, setReviews] = useState<Review[]>(initialReviews);
  const [coupons, setCoupons] = useState<Coupon[]>(initialCoupons);
  const [settings, setSettings] = useState<StoreSettings>(defaultSettings);
  const [customers, setCustomers] = useState<Customer[]>([]);

  const [loading, setLoading] = useState(true);
  const [isSynced, setIsSynced] = useState(false);

  // 2. Real-Time Firestore Listeners (onSnapshot) for all collections
  useEffect(() => {
    const unsubscribes: (() => void)[] = [];

    try {
      // Products Real-time sync
      const unsubProducts = onSnapshot(collection(db, 'products'), (snapshot) => {
        if (!snapshot.empty) {
          const remote: Product[] = snapshot.docs.map((docSnap) => {
            const data = docSnap.data() as any;
            return {
              id: docSnap.id,
              slug: data.slug || docSnap.id,
              name: data.name || 'Product',
              price: Number(data.price) || 0,
              originalPrice: data.originalPrice ? Number(data.originalPrice) : undefined,
              description: data.description || '',
              keyBenefits: Array.isArray(data.keyBenefits) ? data.keyBenefits : [],
              stockQuantity: typeof data.stockQuantity === 'number' ? data.stockQuantity : 15,
              image: formatImageUrl(data.image || data.images?.[0]),
              images: Array.isArray(data.images) && data.images.length > 0 
                ? data.images.map((img: string) => formatImageUrl(img)) 
                : [formatImageUrl(data.image)],
              rating: typeof data.rating === 'number' ? data.rating : 4.8,
              reviewsCount: typeof data.reviewsCount === 'number' ? data.reviewsCount : 24,
              featured: Boolean(data.featured),
              status: data.status || 'active',
              sizes: Array.isArray(data.sizes) ? data.sizes : [],
              updatedAt: data.updatedAt || new Date().toISOString()
            };
          });
          remote.sort((a, b) => a.name.localeCompare(b.name));
          setProducts(remote);
          localStorage.setItem('fitful_nepal_products_cache', JSON.stringify(remote));
          setIsSynced(true);
        } else {
          // Auto-seed initial products to live Firestore
          seedInitialProducts();
        }
        setLoading(false);
      }, (err) => {
        handleFirestoreError(err, OperationType.LIST, 'products', auth.currentUser);
        setLoading(false);
      });
      unsubscribes.push(unsubProducts);

      // Banners Real-time sync
      const unsubBanners = onSnapshot(collection(db, 'banners'), (snapshot) => {
        if (!snapshot.empty) {
          const list: Banner[] = snapshot.docs.map((d) => {
            const data = d.data() as any;
            return {
              id: d.id,
              title: data.title || '',
              subtitle: data.subtitle || '',
              buttonText: data.buttonText || '',
              buttonLink: data.buttonLink || '',
              image: formatImageUrl(data.image),
              active: data.active !== false,
              displayOrder: Number(data.displayOrder) || 1,
              createdAt: data.createdAt || new Date().toISOString()
            };
          });
          list.sort((a, b) => a.displayOrder - b.displayOrder);
          setBanners(list);
        } else {
          seedInitialBanners();
        }
      }, (err) => {
        handleFirestoreError(err, OperationType.LIST, 'banners', auth.currentUser);
      });
      unsubscribes.push(unsubBanners);

      // Categories Real-time sync
      const unsubCategories = onSnapshot(collection(db, 'categories'), (snapshot) => {
        if (!snapshot.empty) {
          const list: Category[] = snapshot.docs.map((d) => {
            const data = d.data() as any;
            return {
              id: d.id,
              name: data.name || '',
              slug: data.slug || d.id,
              description: data.description || '',
              image: data.image ? formatImageUrl(data.image) : undefined,
              displayOrder: Number(data.displayOrder) || 1,
              visible: data.visible !== false,
              createdAt: data.createdAt || new Date().toISOString()
            };
          });
          list.sort((a, b) => a.displayOrder - b.displayOrder);
          setCategories(list);
        } else {
          seedInitialCategories();
        }
      }, (err) => {
        handleFirestoreError(err, OperationType.LIST, 'categories', auth.currentUser);
      });
      unsubscribes.push(unsubCategories);

      // Orders Real-time sync
      const unsubOrders = onSnapshot(collection(db, 'orders'), (snapshot) => {
        const list: Order[] = snapshot.docs.map((d) => {
          const data = d.data() as any;
          return {
            id: d.id,
            orderNumber: data.orderNumber || d.id,
            customerName: data.customerName || 'Anonymous',
            customerEmail: data.customerEmail || '',
            customerPhone: data.customerPhone || '',
            shippingAddress: data.shippingAddress || '',
            city: data.city || '',
            notes: data.notes || '',
            items: Array.isArray(data.items) ? data.items : [],
            subtotal: Number(data.subtotal) || 0,
            deliveryCharge: Number(data.deliveryCharge) || 0,
            discountAmount: Number(data.discountAmount) || 0,
            totalAmount: Number(data.totalAmount) || 0,
            couponCode: data.couponCode || '',
            paymentMethod: data.paymentMethod || 'Cash on Delivery (COD)',
            paymentStatus: data.paymentStatus || 'Pending',
            orderStatus: data.orderStatus || 'Pending',
            createdAt: data.createdAt || new Date().toISOString(),
            updatedAt: data.updatedAt || new Date().toISOString()
          };
        });
        list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        setOrders(list);
      }, (err) => {
        handleFirestoreError(err, OperationType.LIST, 'orders', auth.currentUser);
      });
      unsubscribes.push(unsubOrders);

      // Reviews Real-time sync
      const unsubReviews = onSnapshot(collection(db, 'reviews'), (snapshot) => {
        if (!snapshot.empty) {
          const list: Review[] = snapshot.docs.map((d) => {
            const data = d.data() as any;
            return {
              id: d.id,
              productId: data.productId || '',
              productName: data.productName || '',
              customerName: data.customerName || 'Verified Buyer',
              rating: Number(data.rating) || 5,
              comment: data.comment || '',
              approved: data.approved !== false,
              image: data.image ? formatImageUrl(data.image) : undefined,
              createdAt: data.createdAt || new Date().toISOString()
            };
          });
          list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
          setReviews(list);
        } else {
          seedInitialReviews();
        }
      }, (err) => {
        handleFirestoreError(err, OperationType.LIST, 'reviews', auth.currentUser);
      });
      unsubscribes.push(unsubReviews);

      // Coupons Real-time sync
      const unsubCoupons = onSnapshot(collection(db, 'coupons'), (snapshot) => {
        if (!snapshot.empty) {
          const list: Coupon[] = snapshot.docs.map((d) => {
            const data = d.data() as any;
            return {
              id: d.id,
              code: data.code || '',
              discountType: data.discountType || 'percentage',
              discountValue: Number(data.discountValue) || 10,
              minOrderAmount: Number(data.minOrderAmount) || 0,
              active: data.active !== false,
              expiryDate: data.expiryDate,
              usageCount: Number(data.usageCount) || 0,
              createdAt: data.createdAt || new Date().toISOString()
            };
          });
          setCoupons(list);
        } else {
          seedInitialCoupons();
        }
      }, (err) => {
        handleFirestoreError(err, OperationType.LIST, 'coupons', auth.currentUser);
      });
      unsubscribes.push(unsubCoupons);

      // Store Settings Real-time sync
      const unsubSettings = onSnapshot(doc(db, 'settings', 'general'), (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data() as any;
          setSettings({
            id: 'general',
            storeName: data.storeName || defaultSettings.storeName,
            currency: data.currency || 'USD',
            phone: data.phone || defaultSettings.phone,
            email: data.email || defaultSettings.email,
            address: data.address || defaultSettings.address,
            deliveryCharge: typeof data.deliveryCharge === 'number' ? data.deliveryCharge : defaultSettings.deliveryCharge,
            freeDeliveryThreshold: typeof data.freeDeliveryThreshold === 'number' ? data.freeDeliveryThreshold : defaultSettings.freeDeliveryThreshold,
            codEnabled: data.codEnabled !== false,
            updatedAt: data.updatedAt || new Date().toISOString()
          });
        } else {
          setDoc(doc(db, 'settings', 'general'), defaultSettings).catch(() => {});
        }
      }, (err) => {
        handleFirestoreError(err, OperationType.GET, 'settings/general', auth.currentUser);
      });
      unsubscribes.push(unsubSettings);

      // Customers Real-time sync
      const unsubCustomers = onSnapshot(collection(db, 'customers'), (snapshot) => {
        const list: Customer[] = snapshot.docs.map((d) => {
          const data = d.data() as any;
          return {
            id: d.id,
            name: data.name || '',
            email: data.email || '',
            phone: data.phone || '',
            address: data.address || '',
            totalOrders: Number(data.totalOrders) || 0,
            totalSpent: Number(data.totalSpent) || 0,
            lastOrderDate: data.lastOrderDate,
            createdAt: data.createdAt || new Date().toISOString()
          };
        });
        setCustomers(list);
      }, (err) => {
        handleFirestoreError(err, OperationType.LIST, 'customers', auth.currentUser);
      });
      unsubscribes.push(unsubCustomers);

    } catch (err) {
      console.warn('Firestore initial listeners initialization:', err);
      setLoading(false);
    }

    return () => {
      unsubscribes.forEach((unsub) => unsub());
    };
  }, []);

  // Seed Helpers for Live Collections
  const seedInitialProducts = async () => {
    try {
      for (const prod of initialProducts) {
        await setDoc(doc(db, 'products', prod.id), {
          ...prod,
          updatedAt: new Date().toISOString()
        }, { merge: true });
      }
    } catch {}
  };

  const seedInitialBanners = async () => {
    try {
      for (const b of initialBanners) {
        await setDoc(doc(db, 'banners', b.id), b, { merge: true });
      }
    } catch {}
  };

  const seedInitialCategories = async () => {
    try {
      for (const cat of initialCategories) {
        await setDoc(doc(db, 'categories', cat.id), cat, { merge: true });
      }
    } catch {}
  };

  const seedInitialReviews = async () => {
    try {
      for (const rev of initialReviews) {
        await setDoc(doc(db, 'reviews', rev.id), rev, { merge: true });
      }
    } catch {}
  };

  const seedInitialCoupons = async () => {
    try {
      for (const c of initialCoupons) {
        await setDoc(doc(db, 'coupons', c.id), c, { merge: true });
      }
    } catch {}
  };

  // Products API
  const getProductBySlug = (slug: string) => products.find((p) => p.slug === slug);
  const getProductById = (id: string) => products.find((p) => p.id === id);

  const addProduct = async (productData: Omit<Product, 'id'>): Promise<string> => {
    const newId = 'prod_' + Date.now();
    const newProduct: Product = {
      ...productData,
      id: newId,
      image: formatImageUrl(productData.image),
      images: productData.images.length ? productData.images.map(img => formatImageUrl(img)) : [formatImageUrl(productData.image)],
      updatedAt: new Date().toISOString()
    };

    setProducts(prev => [newProduct, ...prev]);

    try {
      await setDoc(doc(db, 'products', newId), newProduct);
      setIsSynced(true);
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, `products/${newId}`, auth.currentUser);
    }
    return newId;
  };

  const updateProduct = async (id: string, updates: Partial<Product>): Promise<void> => {
    const now = new Date().toISOString();
    const payload = { ...updates, updatedAt: now };

    setProducts(prev => prev.map(p => p.id === id ? { ...p, ...payload } : p));

    try {
      await updateDoc(doc(db, 'products', id), payload);
      setIsSynced(true);
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `products/${id}`, auth.currentUser);
    }
  };

  const deleteProduct = async (id: string): Promise<void> => {
    setProducts(prev => prev.filter(p => p.id !== id));

    try {
      await deleteDoc(doc(db, 'products', id));
      setIsSynced(true);
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `products/${id}`, auth.currentUser);
    }
  };

  const resetToDefaults = async (): Promise<void> => {
    setProducts(initialProducts);
    try {
      for (const p of initialProducts) {
        await setDoc(doc(db, 'products', p.id), { ...p, updatedAt: new Date().toISOString() });
      }
      setIsSynced(true);
    } catch {}
  };

  // Banners API
  const addBanner = async (bannerData: Omit<Banner, 'id'>): Promise<string> => {
    const id = 'ban_' + Date.now();
    const newBanner: Banner = { ...bannerData, id };
    setBanners(prev => [...prev, newBanner]);
    try {
      await setDoc(doc(db, 'banners', id), newBanner);
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, `banners/${id}`, auth.currentUser);
    }
    return id;
  };

  const updateBanner = async (id: string, updates: Partial<Banner>): Promise<void> => {
    setBanners(prev => prev.map(b => b.id === id ? { ...b, ...updates } : b));
    try {
      await updateDoc(doc(db, 'banners', id), updates);
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `banners/${id}`, auth.currentUser);
    }
  };

  const deleteBanner = async (id: string): Promise<void> => {
    setBanners(prev => prev.filter(b => b.id !== id));
    try {
      await deleteDoc(doc(db, 'banners', id));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `banners/${id}`, auth.currentUser);
    }
  };

  // Categories API
  const addCategory = async (catData: Omit<Category, 'id'>): Promise<string> => {
    const id = 'cat_' + Date.now();
    const newCat: Category = { ...catData, id };
    setCategories(prev => [...prev, newCat]);
    try {
      await setDoc(doc(db, 'categories', id), newCat);
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, `categories/${id}`, auth.currentUser);
    }
    return id;
  };

  const updateCategory = async (id: string, updates: Partial<Category>): Promise<void> => {
    setCategories(prev => prev.map(c => c.id === id ? { ...c, ...updates } : c));
    try {
      await updateDoc(doc(db, 'categories', id), updates);
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `categories/${id}`, auth.currentUser);
    }
  };

  const deleteCategory = async (id: string): Promise<void> => {
    setCategories(prev => prev.filter(c => c.id !== id));
    try {
      await deleteDoc(doc(db, 'categories', id));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `categories/${id}`, auth.currentUser);
    }
  };

  // Orders & Customers API
  const createOrder = async (orderData: Omit<Order, 'id' | 'orderNumber' | 'createdAt' | 'updatedAt'>): Promise<string> => {
    const id = `ord_${Date.now().toString().slice(-6)}`;
    const now = new Date().toISOString();
    const orderNumber = `ORD-${Date.now().toString().slice(-5)}`;

    const newOrder: Order = {
      ...orderData,
      id,
      orderNumber,
      createdAt: now,
      updatedAt: now
    };

    setOrders(prev => [newOrder, ...prev]);

    try {
      await setDoc(doc(db, 'orders', id), newOrder);

      // Decrement stock for purchased products in real-time
      for (const item of newOrder.items) {
        const prod = products.find(p => p.id === item.id);
        if (prod) {
          const nextQty = Math.max(0, prod.stockQuantity - item.quantity);
          await updateDoc(doc(db, 'products', prod.id), {
            stockQuantity: nextQty,
            updatedAt: now
          });
        }
      }

      // Record / update customer profile
      const customerId = `cust_${newOrder.customerPhone.replace(/[^0-9]/g, '') || Date.now()}`;
      const existingCustomer = customers.find(c => c.phone === newOrder.customerPhone);

      const customerPayload: Customer = {
        id: customerId,
        name: newOrder.customerName,
        email: newOrder.customerEmail,
        phone: newOrder.customerPhone,
        address: newOrder.shippingAddress,
        totalOrders: (existingCustomer?.totalOrders || 0) + 1,
        totalSpent: (existingCustomer?.totalSpent || 0) + newOrder.totalAmount,
        lastOrderDate: now,
        createdAt: existingCustomer?.createdAt || now
      };

      await setDoc(doc(db, 'customers', customerId), customerPayload, { merge: true });

    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, `orders/${id}`, auth.currentUser);
    }

    return orderNumber;
  };

  const updateOrderStatus = async (
    id: string, 
    orderStatus: Order['orderStatus'], 
    paymentStatus?: Order['paymentStatus']
  ): Promise<void> => {
    const updates: any = { orderStatus, updatedAt: new Date().toISOString() };
    if (paymentStatus) updates.paymentStatus = paymentStatus;

    setOrders(prev => prev.map(o => o.id === id ? { ...o, ...updates } : o));

    try {
      await updateDoc(doc(db, 'orders', id), updates);
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `orders/${id}`, auth.currentUser);
    }
  };

  const deleteOrder = async (id: string): Promise<void> => {
    setOrders(prev => prev.filter(o => o.id !== id));
    try {
      await deleteDoc(doc(db, 'orders', id));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `orders/${id}`, auth.currentUser);
    }
  };

  // Reviews API
  const addReview = async (reviewData: Omit<Review, 'id' | 'createdAt'>): Promise<string> => {
    const id = 'rev_' + Date.now();
    const newReview: Review = {
      ...reviewData,
      id,
      createdAt: new Date().toISOString()
    };

    setReviews(prev => [newReview, ...prev]);

    try {
      await setDoc(doc(db, 'reviews', id), newReview);

      // Re-calculate average rating on product
      const productReviews = [...reviews.filter(r => r.productId === reviewData.productId), newReview];
      const avg = productReviews.reduce((sum, r) => sum + r.rating, 0) / productReviews.length;
      await updateDoc(doc(db, 'products', reviewData.productId), {
        rating: Number(avg.toFixed(1)),
        reviewsCount: productReviews.length,
        updatedAt: new Date().toISOString()
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, `reviews/${id}`, auth.currentUser);
    }

    return id;
  };

  const toggleReviewApproval = async (id: string, approved: boolean): Promise<void> => {
    setReviews(prev => prev.map(r => r.id === id ? { ...r, approved } : r));
    try {
      await updateDoc(doc(db, 'reviews', id), { approved });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `reviews/${id}`, auth.currentUser);
    }
  };

  const deleteReview = async (id: string): Promise<void> => {
    setReviews(prev => prev.filter(r => r.id !== id));
    try {
      await deleteDoc(doc(db, 'reviews', id));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `reviews/${id}`, auth.currentUser);
    }
  };

  const getProductReviews = (productId: string) => {
    return reviews.filter(r => r.productId === productId && r.approved);
  };

  // Coupons API
  const addCoupon = async (data: Omit<Coupon, 'id' | 'createdAt' | 'usageCount'>): Promise<string> => {
    const id = 'coup_' + Date.now();
    const newCoupon: Coupon = {
      ...data,
      id,
      code: data.code.toUpperCase().trim(),
      usageCount: 0,
      createdAt: new Date().toISOString()
    };
    setCoupons(prev => [newCoupon, ...prev]);
    try {
      await setDoc(doc(db, 'coupons', id), newCoupon);
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, `coupons/${id}`, auth.currentUser);
    }
    return id;
  };

  const toggleCoupon = async (id: string, active: boolean): Promise<void> => {
    setCoupons(prev => prev.map(c => c.id === id ? { ...c, active } : c));
    try {
      await updateDoc(doc(db, 'coupons', id), { active });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `coupons/${id}`, auth.currentUser);
    }
  };

  const deleteCoupon = async (id: string): Promise<void> => {
    setCoupons(prev => prev.filter(c => c.id !== id));
    try {
      await deleteDoc(doc(db, 'coupons', id));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `coupons/${id}`, auth.currentUser);
    }
  };

  const validateCoupon = (code: string, subtotal: number) => {
    const clean = code.toUpperCase().trim();
    const found = coupons.find(c => c.code === clean);

    if (!found) {
      return { valid: false, discountAmount: 0, message: 'Invalid coupon code.' };
    }
    if (!found.active) {
      return { valid: false, discountAmount: 0, message: 'This coupon has expired or is inactive.' };
    }
    if (found.minOrderAmount && subtotal < found.minOrderAmount) {
      return { valid: false, discountAmount: 0, message: `Minimum order of Rs. ${found.minOrderAmount} required.` };
    }

    let discount = 0;
    if (found.discountType === 'percentage') {
      discount = (subtotal * found.discountValue) / 100;
    } else {
      discount = Math.min(found.discountValue, subtotal);
    }

    return {
      valid: true,
      discountAmount: Number(discount.toFixed(2)),
      message: `Coupon applied: saved Rs. ${discount.toFixed(2)}`
    };
  };

  // Settings API
  const updateSettings = async (updates: Partial<StoreSettings>): Promise<void> => {
    const payload = { ...updates, updatedAt: new Date().toISOString() };
    setSettings(prev => ({ ...prev, ...payload }));
    try {
      await setDoc(doc(db, 'settings', 'general'), payload, { merge: true });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, 'settings/general', auth.currentUser);
    }
  };

  return (
    <StoreContext.Provider
      value={{
        products,
        banners,
        categories,
        orders,
        reviews,
        coupons,
        settings,
        customers,
        loading,
        isSynced,
        getProductBySlug,
        getProductById,
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
        createOrder,
        updateOrderStatus,
        deleteOrder,
        addReview,
        toggleReviewApproval,
        deleteReview,
        getProductReviews,
        addCoupon,
        toggleCoupon,
        deleteCoupon,
        validateCoupon,
        updateSettings
      }}
    >
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => {
  const context = useContext(StoreContext);
  if (!context) throw new Error('useStore must be used within StoreProvider');
  return context;
};

// Aliases for seamless backward compatibility
export const useProducts = useStore;
export const ProductProvider = StoreProvider;
