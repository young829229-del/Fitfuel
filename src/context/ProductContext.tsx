import React, { createContext, useContext, useState, useEffect } from 'react';
import { Product } from '../types/product';
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

interface ProductContextType {
  products: Product[];
  loading: boolean;
  error: string | null;
  getProductBySlug: (slug: string) => Product | undefined;
  getProductById: (id: string) => Product | undefined;
  addProduct: (product: Omit<Product, 'id'>) => Promise<string>;
  updateProduct: (id: string, updates: Partial<Product>) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
  resetToDefaults: () => Promise<void>;
  isSynced: boolean;
}

const STORAGE_KEY = 'fitful_nepal_products_cache';

const ProductContext = createContext<ProductContextType | undefined>(undefined);

export const ProductProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [products, setProducts] = useState<Product[]>(() => {
    try {
      const cached = localStorage.getItem(STORAGE_KEY);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch {
      // ignore
    }
    return initialProducts;
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSynced, setIsSynced] = useState(false);

  // Sync with Firestore
  useEffect(() => {
    let unsubscribe: (() => void) | undefined;

    try {
      const productsCol = collection(db, 'products');

      unsubscribe = onSnapshot(
        productsCol,
        (snapshot) => {
          if (!snapshot.empty) {
            const remoteProducts: Product[] = snapshot.docs.map((d) => {
              const data = d.data() as any;
              return {
                id: d.id,
                slug: data.slug || d.id,
                name: data.name || 'Unnamed Product',
                category: data.category || 'Supplements',
                price: typeof data.price === 'number' ? data.price : parseFloat(data.price) || 0,
                originalPrice: data.originalPrice,
                description: data.description || '',
                keyBenefits: Array.isArray(data.keyBenefits) ? data.keyBenefits : [],
                nutritionalInfo: data.nutritionalInfo || '',
                ingredients: data.ingredients || '',
                usage: data.usage || '',
                stockStatus: data.stockStatus || 'In Stock',
                stockQuantity: typeof data.stockQuantity === 'number' ? data.stockQuantity : 10,
                image: data.image || data.images?.[0] || '/public/assets/aistudio/IMG_e9755086-1600-4fc3-b90a-e97667f39591_5ab03a1e.jpg',
                images: Array.isArray(data.images) && data.images.length > 0 
                  ? data.images 
                  : [data.image || '/public/assets/aistudio/IMG_e9755086-1600-4fc3-b90a-e97667f39591_5ab03a1e.jpg'],
                rating: data.rating || 4.8,
                reviewsCount: data.reviewsCount || 25,
                updatedAt: data.updatedAt || new Date().toISOString()
              };
            });

            // Sort products consistently
            remoteProducts.sort((a, b) => a.name.localeCompare(b.name));
            setProducts(remoteProducts);
            localStorage.setItem(STORAGE_KEY, JSON.stringify(remoteProducts));
            setIsSynced(true);
          } else {
            // Firestore is empty; attempt to seed initial products so admin and users have live data
            seedInitialProducts();
          }
          setLoading(false);
        },
        (err) => {
          handleFirestoreError(err, OperationType.LIST, 'products', auth.currentUser);
          console.warn('Firestore sync failed or offline; using local product store:', err.message);
          setError(err.message);
          setLoading(false);
          setIsSynced(false);
        }
      );
    } catch (err) {
      console.warn('Could not initialize Firestore listener:', err);
      setLoading(false);
    }

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  const seedInitialProducts = async () => {
    try {
      for (const prod of initialProducts) {
        const docRef = doc(db, 'products', prod.id);
        await setDoc(docRef, {
          ...prod,
          updatedAt: new Date().toISOString()
        }, { merge: true });
      }
      setIsSynced(true);
    } catch (err) {
      console.warn('Auto-seed to Firestore skipped (waiting for write permissions or offline):', err);
    }
  };

  const getProductBySlug = (slug: string) => {
    return products.find((p) => p.slug === slug);
  };

  const getProductById = (id: string) => {
    return products.find((p) => p.id === id);
  };

  const addProduct = async (productData: Omit<Product, 'id'>): Promise<string> => {
    const newId = 'prod_' + Date.now();
    const newProduct: Product = {
      ...productData,
      id: newId,
      image: productData.image || productData.images?.[0] || '/public/assets/aistudio/IMG_e9755086-1600-4fc3-b90a-e97667f39591_5ab03a1e.jpg',
      images: productData.images?.length ? productData.images : [productData.image],
      updatedAt: new Date().toISOString()
    };

    // Optimistic local update
    setProducts((prev) => {
      const next = [newProduct, ...prev];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });

    // Write to Firestore if connected
    try {
      const docRef = doc(db, 'products', newId);
      await setDoc(docRef, newProduct);
      setIsSynced(true);
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, `products/${newId}`, auth.currentUser);
      console.warn('Saved locally; Firestore write threw an error:', err);
    }

    return newId;
  };

  const updateProduct = async (id: string, updates: Partial<Product>): Promise<void> => {
    const now = new Date().toISOString();
    const updatedPayload = { ...updates, updatedAt: now };

    // Optimistic update
    setProducts((prev) => {
      const next = prev.map((p) => (p.id === id ? { ...p, ...updatedPayload } : p));
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });

    try {
      const docRef = doc(db, 'products', id);
      await updateDoc(docRef, updatedPayload);
      setIsSynced(true);
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `products/${id}`, auth.currentUser);
      console.warn('Updated locally; Firestore update threw an error:', err);
    }
  };

  const deleteProduct = async (id: string): Promise<void> => {
    setProducts((prev) => {
      const next = prev.filter((p) => p.id !== id);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });

    try {
      const docRef = doc(db, 'products', id);
      await deleteDoc(docRef);
      setIsSynced(true);
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `products/${id}`, auth.currentUser);
      console.warn('Deleted locally; Firestore delete threw an error:', err);
    }
  };

  const resetToDefaults = async (): Promise<void> => {
    setProducts(initialProducts);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(initialProducts));

    try {
      for (const prod of initialProducts) {
        const docRef = doc(db, 'products', prod.id);
        await setDoc(docRef, {
          ...prod,
          updatedAt: new Date().toISOString()
        });
      }
      setIsSynced(true);
    } catch (err) {
      console.warn('Reset local cache; Firestore write error:', err);
    }
  };

  return (
    <ProductContext.Provider
      value={{
        products,
        loading,
        error,
        getProductBySlug,
        getProductById,
        addProduct,
        updateProduct,
        deleteProduct,
        resetToDefaults,
        isSynced,
      }}
    >
      {children}
    </ProductContext.Provider>
  );
};

export const useProducts = () => {
  const context = useContext(ProductContext);
  if (!context) {
    throw new Error('useProducts must be used within a ProductProvider');
  }
  return context;
};
