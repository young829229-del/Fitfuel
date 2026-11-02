import React, { createContext, useContext, useState, useEffect } from 'react';
import { collection, onSnapshot, doc, setDoc, deleteDoc, updateDoc, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Product, Banner, HomepageSettings } from '../types/store';
import { products as fallbackInitialProducts } from '../data/products';
import { handleFirestoreError, OperationType } from '../lib/firestoreError';

interface ProductContextType {
  products: Product[];
  banners: Banner[];
  homepageSettings: HomepageSettings | null;
  loading: boolean;
  saveProduct: (productData: Partial<Product>, id?: string) => Promise<string>;
  removeProduct: (id: string) => Promise<void>;
  saveBanner: (bannerData: Partial<Banner>, id?: string) => Promise<string>;
  removeBanner: (id: string) => Promise<void>;
  saveHomepageSettings: (settings: HomepageSettings) => Promise<void>;
}

const ProductContext = createContext<ProductContextType | undefined>(undefined);

export const ProductProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [banners, setBanners] = useState<Banner[]>([]);
  const [homepageSettings, setHomepageSettings] = useState<HomepageSettings | null>(null);
  const [loading, setLoading] = useState(true);

  // Initialize and listen to products
  useEffect(() => {
    const productsRef = collection(db, 'products');

    const unsubscribe = onSnapshot(
      productsRef,
      async (snapshot) => {
        if (snapshot.empty) {
          // Auto-seed initial 5 products into Firestore if database is empty
          try {
            for (const item of fallbackInitialProducts) {
              const defaultImages = item.images && item.images.length > 0 
                ? item.images 
                : [(item as any).image || '/public/assets/aistudio/IMG_e9755086-1600-4fc3-b90a-e97667f39591_5ab03a1e.jpg'];

              const seedData: Product = {
                id: item.id,
                slug: item.slug,
                name: item.name,
                price: item.price,
                description: item.description,
                images: defaultImages,
                image: defaultImages[0],
                stock: 25,
                category: 'Supplements',
                keyBenefits: item.keyBenefits || ['High Quality', 'Tested & Verified'],
                ingredients: item.ingredients || '',
                nutritionalInfo: item.nutritionalInfo || '',
                usage: item.usage || '',
                weightSize: 'Standard Pack',
                isFeatured: true,
                isUnavailable: false,
                createdAt: new Date().toISOString()
              };
              await setDoc(doc(db, 'products', item.id), seedData);
            }
          } catch (seedErr) {
            console.warn("Could not seed initial products into Firestore:", seedErr);
            // Fallback to local memory products if seeding fails
            setProducts(fallbackInitialProducts.map(p => ({
              ...p,
              stock: 20,
              images: p.images || [(p as any).image],
              image: (p.images && p.images[0]) || (p as any).image
            })));
            setLoading(false);
            return;
          }
        } else {
          const loadedProducts = snapshot.docs.map((docSnap) => {
            const data = docSnap.data() as Product;
            const primaryImg = (data.images && data.images[0]) || data.image || '/public/assets/aistudio/IMG_e9755086-1600-4fc3-b90a-e97667f39591_5ab03a1e.jpg';
            return {
              ...data,
              id: docSnap.id,
              images: data.images && data.images.length > 0 ? data.images : [primaryImg],
              image: primaryImg
            };
          });
          setProducts(loadedProducts);
          setLoading(false);
        }
      },
      (error) => {
        console.error("Firestore onSnapshot error on products:", error);
        // Fallback to static data on error to never break the store
        setProducts(fallbackInitialProducts.map(p => ({
          ...p,
          stock: 20,
          images: p.images || [(p as any).image],
          image: (p.images && p.images[0]) || (p as any).image
        })));
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  // Initialize and listen to banners
  useEffect(() => {
    const bannersRef = collection(db, 'banners');
    const unsub = onSnapshot(
      bannersRef,
      (snapshot) => {
        if (!snapshot.empty) {
          const list = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Banner));
          setBanners(list);
        } else {
          // Default promo banner
          setBanners([
            {
              id: 'default-banner',
              title: '🔥 FUEL YOUR POTENTIAL • PREMIUM NUTRITION ACROSS NEPAL',
              subtitle: 'Free Shipping on orders above Rs. 2,000',
              isActive: true,
              order: 1,
              buttonText: 'Shop Now',
              buttonLink: '/'
            }
          ]);
        }
      },
      (err) => {
        console.warn("Banners onSnapshot error:", err);
      }
    );
    return () => unsub();
  }, []);

  // Listen to homepage settings
  useEffect(() => {
    const settingsDoc = doc(db, 'settings', 'homepage');
    const unsub = onSnapshot(
      settingsDoc,
      (docSnap) => {
        if (docSnap.exists()) {
          setHomepageSettings(docSnap.data() as HomepageSettings);
        } else {
          setHomepageSettings({
            featuredProductIds: ['1', '2', '3'],
            bestSellerIds: ['2', '4'],
            newArrivalIds: ['1', '5'],
            recommendedIds: ['3', '4', '5']
          });
        }
      },
      (err) => {
        console.warn("Homepage settings error:", err);
      }
    );
    return () => unsub();
  }, []);

  const saveProduct = async (productData: Partial<Product>, id?: string): Promise<string> => {
    const productId = id || productData.slug || `prod-${Date.now()}`;
    const primaryImg = (productData.images && productData.images[0]) || productData.image || '/public/assets/aistudio/IMG_e9755086-1600-4fc3-b90a-e97667f39591_5ab03a1e.jpg';
    
    const finalProduct: Product = {
      id: productId,
      name: productData.name || 'Unnamed Product',
      slug: productData.slug || productData.name?.toLowerCase().replace(/[^a-z0-9]+/g, '-') || productId,
      price: Number(productData.price) || 0,
      discountPrice: productData.discountPrice ? Number(productData.discountPrice) : undefined,
      description: productData.description || '',
      images: productData.images && productData.images.length > 0 ? productData.images : [primaryImg],
      image: primaryImg,
      stock: Number(productData.stock) >= 0 ? Number(productData.stock) : 10,
      category: productData.category || 'Supplements',
      keyBenefits: productData.keyBenefits || [],
      ingredients: productData.ingredients || '',
      nutritionalInfo: productData.nutritionalInfo || '',
      usage: productData.usage || '',
      weightSize: productData.weightSize || '',
      isFeatured: !!productData.isFeatured,
      isUnavailable: !!productData.isUnavailable,
      updatedAt: new Date().toISOString(),
      createdAt: productData.createdAt || new Date().toISOString()
    };

    try {
      await setDoc(doc(db, 'products', productId), finalProduct);
      return productId;
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `products/${productId}`);
    }
  };

  const removeProduct = async (id: string): Promise<void> => {
    try {
      await deleteDoc(doc(db, 'products', id));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `products/${id}`);
    }
  };

  const saveBanner = async (bannerData: Partial<Banner>, id?: string): Promise<string> => {
    const bannerId = id || `banner-${Date.now()}`;
    const finalBanner: Banner = {
      id: bannerId,
      title: bannerData.title || 'Special Promotion',
      subtitle: bannerData.subtitle || '',
      description: bannerData.description || '',
      image: bannerData.image || '',
      buttonText: bannerData.buttonText || '',
      buttonLink: bannerData.buttonLink || '/',
      isActive: bannerData.isActive !== undefined ? bannerData.isActive : true,
      order: bannerData.order || 1,
      createdAt: bannerData.createdAt || new Date().toISOString()
    };

    try {
      await setDoc(doc(db, 'banners', bannerId), finalBanner);
      return bannerId;
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `banners/${bannerId}`);
    }
  };

  const removeBanner = async (id: string): Promise<void> => {
    try {
      await deleteDoc(doc(db, 'banners', id));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `banners/${id}`);
    }
  };

  const saveHomepageSettings = async (settings: HomepageSettings): Promise<void> => {
    try {
      await setDoc(doc(db, 'settings', 'homepage'), {
        ...settings,
        updatedAt: new Date().toISOString()
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, 'settings/homepage');
    }
  };

  return (
    <ProductContext.Provider
      value={{
        products,
        banners,
        homepageSettings,
        loading,
        saveProduct,
        removeProduct,
        saveBanner,
        removeBanner,
        saveHomepageSettings
      }}
    >
      {children}
    </ProductContext.Provider>
  );
};

export const useProducts = () => {
  const context = useContext(ProductContext);
  if (!context) throw new Error('useProducts must be used within a ProductProvider');
  return context;
};
