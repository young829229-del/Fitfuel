import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate, Link } from 'react-router-dom';
import { useProducts } from './context/ProductContext';
import { useCart } from './context/CartContext';
import { ShieldCheck, ShoppingCart, ChevronRight, Sparkles } from 'lucide-react';

export default function ProductHero() {
  const { products: rawProducts, banners, homepageSettings } = useProducts();
  const { setIsCartOpen, totalCount } = useCart();
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollTimeout = useRef<NodeJS.Timeout | null>(null);
  const navigate = useNavigate();

  // Only show available products in carousel
  const activeProducts = rawProducts.filter(p => !p.isUnavailable);
  const displayProducts = activeProducts.length > 0 ? activeProducts : rawProducts;

  // Active promotional banner
  const activeBanner = banners.find(b => b.isActive);

  const handleNavigation = (direction: number) => {
    if (displayProducts.length === 0) return;
    setCurrentIndex((prev) => (prev + direction + displayProducts.length) % displayProducts.length);
  };

  const handleWheel = (e: React.WheelEvent) => {
    if (scrollTimeout.current) return;
    
    if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) {
        if (e.deltaX > 20) handleNavigation(1);
        else if (e.deltaX < -20) handleNavigation(-1);
    } else {
        if (e.deltaY > 20) handleNavigation(1);
        else if (e.deltaY < -20) handleNavigation(-1);
    }

    scrollTimeout.current = setTimeout(() => {
        scrollTimeout.current = null;
    }, 500);
  };

  return (
    <div className="relative w-full min-h-screen bg-white overflow-x-hidden selection:bg-yellow-400 selection:text-black">
      {/* Active Promotional Banner from Admin */}
      {activeBanner && (
        <div className="w-full bg-black text-white px-4 py-2 text-center text-xs font-bold tracking-wider uppercase flex items-center justify-center gap-3 relative z-30 shadow-sm">
          <span>{activeBanner.title}</span>
          {activeBanner.buttonText && (
            <Link
              to={activeBanner.buttonLink || '/'}
              className="px-2.5 py-0.5 bg-yellow-400 text-black text-[10px] font-black rounded hover:bg-yellow-300 transition"
            >
              {activeBanner.buttonText} &rarr;
            </Link>
          )}
        </div>
      )}

      {/* Hero Showcase Viewport */}
      <div 
        className="relative w-full h-[88vh] md:h-screen flex flex-col items-center justify-center bg-white overflow-hidden pt-20"
        onWheel={handleWheel}
      >
        {/* Centered Circular Logo */}
        <Link to="/" className="absolute top-4 left-1/2 -translate-x-1/2 z-20 group">
          <img 
            src="/public/assets/aistudio/tiktok_video_dt6Np_d66a1b63.jpeg" 
            alt="FitFul Nepal Logo" 
            className="w-12 md:w-16 rounded-full border border-gray-200 shadow-md group-hover:scale-105 transition duration-200" 
          />
        </Link>

        {/* Top Header Actions (Admin Link & Cart Button) */}
        <div className="absolute top-5 right-6 z-20 flex items-center gap-3">
          {/* Admin Portal Direct Link */}
          <Link
            to="/admin"
            className="flex items-center gap-1.5 px-3 py-1.5 bg-neutral-900 hover:bg-black text-white text-xs font-bold uppercase tracking-wider rounded-full shadow-md transition group"
            title="Open Admin Portal"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-yellow-400 group-hover:rotate-12 transition-transform" />
            <span className="hidden sm:inline">Admin</span>
          </Link>

          {/* Cart Icon Button with dynamic count */}
          <button 
            onClick={() => setIsCartOpen(true)}
            className="p-2.5 bg-gray-100 hover:bg-gray-200 rounded-full transition relative cursor-pointer shadow-sm"
            title="Shopping Cart"
          >
            <ShoppingCart className="w-5 h-5 text-gray-800" />
            {totalCount > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-black text-white text-[10px] font-black rounded-full flex items-center justify-center shadow-md">
                {totalCount}
              </span>
            )}
          </button>
        </div>
        
        {/* 3D Interactive Carousel */}
        <motion.div
          className="flex items-center justify-center w-full h-full cursor-grab active:cursor-grabbing"
          style={{ perspective: 1000 }}
          drag="x"
          dragConstraints={{ left: 0, right: 0 }}
          onDragEnd={(_, info) => {
              if (info.offset.x > 50) handleNavigation(-1);
              else if (info.offset.x < -50) handleNavigation(1);
          }}
        >
          <AnimatePresence mode="popLayout">
            {displayProducts.map((product, index) => {
              const count = displayProducts.length;
              const offset = (index - currentIndex + count) % count;
              const isCenter = offset === 0;
              
              if (offset !== 0 && offset !== 1 && offset !== count - 1) return null;

              const displayImg = product.image || (product.images && product.images[0]) || '/public/assets/aistudio/IMG_e9755086-1600-4fc3-b90a-e97667f39591_5ab03a1e.jpg';

              return (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ 
                    opacity: isCenter ? 1 : 0.8,
                    filter: isCenter ? 'blur(0px)' : 'blur(1px)',
                    scale: isCenter ? 1.1 : 0.85,
                    rotateY: isCenter ? 0 : (offset === 1 ? -20 : 20),
                    x: isCenter ? 0 : (offset === 1 ? '70%' : '-70%'),
                    y: isCenter ? [0, -15, 0] : -30,
                    zIndex: isCenter ? 10 : 0
                  }}
                  transition={{ 
                      y: isCenter ? { repeat: Infinity, duration: 4, ease: "easeInOut" } : {},
                      default: { type: 'spring', stiffness: 200, damping: 25 } 
                  }}
                  exit={{ opacity: 0 }}
                  className="absolute flex flex-col items-center"
                >
                  <div 
                      className="w-[85vw] h-[60vw] max-w-[300px] max-h-[350px] md:w-72 md:h-96 flex items-center justify-center p-4 relative overflow-hidden cursor-pointer"
                      onClick={() => navigate(`/product/${product.slug}`)}
                  >
                    <motion.div 
                      className="w-full h-full relative"
                      style={{
                          rotateX: isCenter ? 0 : 0,
                          rotateY: isCenter ? 0 : 0,
                          transformStyle: 'preserve-3d'
                      }}
                      whileHover={isCenter ? { scale: 1.05 } : {}}
                      whileTap={isCenter ? { scale: 0.95 } : {}}
                      onMouseMove={(e: any) => {
                          if (!isCenter) return;
                          const rect = e.currentTarget.getBoundingClientRect();
                          const x = (e.clientX - rect.left) / rect.width - 0.5;
                          const y = (e.clientY - rect.top) / rect.height - 0.5;
                          e.currentTarget.style.transform = `perspective(1000px) rotateY(${x * 10}deg) rotateX(${-y * 10}deg)`;
                      }}
                      onMouseLeave={(e: any) => {
                          e.currentTarget.style.transform = `perspective(1000px) rotateY(0deg) rotateX(0deg)`;
                      }}
                    >
                      <img src={displayImg} alt={product.name} className="w-full h-full object-contain drop-shadow-xl" />
                    </motion.div>
                  </div>

                  {/* Name and Price directly synchronized with Firestore */}
                  <div className="mt-4 md:mt-6 text-center cursor-pointer" onClick={() => navigate(`/product/${product.slug}`)}>
                      <div className="text-gray-900 font-bold text-sm md:text-base px-2 hover:underline">{product.name}</div>
                      <div className="flex items-center justify-center gap-2 mt-1">
                        <span className="text-gray-700 font-extrabold text-xs md:text-sm">${product.price.toFixed(2)}</span>
                        {product.discountPrice && (
                          <span className="text-xs text-green-600 font-bold">Sale: ${product.discountPrice.toFixed(2)}</span>
                        )}
                      </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </motion.div>
      </div>

      {/* Curated Product Sections Managed by Admin */}
      <div className="max-w-7xl mx-auto px-6 py-16 border-t border-gray-100">
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="text-xs font-bold uppercase tracking-widest text-yellow-600 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" /> Curated Collection
            </div>
            <h2 className="text-2xl font-black text-gray-950 mt-1">Featured Supplements</h2>
          </div>
          <Link to="/admin" className="text-xs font-bold text-gray-400 hover:text-black uppercase tracking-wider flex items-center gap-1">
            Admin Studio <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
          {displayProducts.map((p) => {
            const img = p.image || (p.images && p.images[0]) || '/public/assets/aistudio/IMG_e9755086-1600-4fc3-b90a-e97667f39591_5ab03a1e.jpg';
            return (
              <div 
                key={p.id}
                onClick={() => navigate(`/product/${p.slug}`)}
                className="group cursor-pointer bg-gray-50/50 hover:bg-gray-50 border border-gray-100 rounded-3xl p-4 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 flex flex-col justify-between"
              >
                <div className="h-44 flex items-center justify-center p-2">
                  <img
                    src={img}
                    alt={p.name}
                    className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-300 drop-shadow-md"
                  />
                </div>
                <div className="pt-4 border-t border-gray-100">
                  <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider">{p.category || 'Supplements'}</div>
                  <h3 className="text-sm font-bold text-gray-900 mt-1 line-clamp-1">{p.name}</h3>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-sm font-black text-gray-950">${p.price.toFixed(2)}</span>
                    <span className="text-xs font-bold text-blue-600 group-hover:underline">View &rarr;</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
