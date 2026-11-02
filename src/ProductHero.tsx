import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { useStore } from './context/StoreContext';
import { useCart } from './context/CartContext';
import { formatImageUrl } from './utils/imageUrl';
import CartDrawer from './components/CartDrawer';
import { ShoppingBag, Sparkles, ChevronRight } from 'lucide-react';

export default function ProductHero() {
  const { products, settings, banners } = useStore();
  const { totalCount, setIsCartOpen } = useCart();
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollTimeout = useRef<NodeJS.Timeout | null>(null);
  const navigate = useNavigate();

  const displayList = products;

  const handleNavigation = (direction: number) => {
    if (displayList.length === 0) return;
    setCurrentIndex((prev) => (prev + direction + displayList.length) % displayList.length);
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

  const activeBanner = banners.find(b => b.active);

  return (
    <div className="relative w-full h-screen flex flex-col items-center justify-center bg-white overflow-hidden" onWheel={handleWheel}>
      {/* Brand Logo */}
      <img 
        src="/assets/aistudio/tiktok_video_dt6Np_d66a1b63.jpeg" 
        alt="FitFul Nepal Logo" 
        className="absolute top-4 left-1/2 -translate-x-1/2 w-12 md:w-16 z-20 rounded-full border border-gray-200 shadow-md cursor-pointer"
        onClick={() => navigate('/')}
      />

      {/* Cart Button with Live Total Count */}
      <button 
        onClick={() => setIsCartOpen(true)}
        className="absolute top-6 right-6 z-20 p-2.5 bg-gray-100 hover:bg-black hover:text-white rounded-full transition shadow-xs group"
        title="Open Cart"
      >
        <div className="relative">
          <ShoppingBag className="w-5 h-5" />
          {totalCount > 0 && (
            <span className="absolute -top-1.5 -right-2 bg-red-600 text-white text-[10px] font-black rounded-full h-4 w-4 flex items-center justify-center">
              {totalCount}
            </span>
          )}
        </div>
      </button>


      
      {/* 3D Interactive Carousel */}
      <motion.div
        className="flex items-center justify-center w-full h-full cursor-grab pt-12"
        style={{ perspective: 1000 }}
        drag="x"
        dragConstraints={{ left: 0, right: 0 }}
        onDragEnd={(_, info) => {
            if (info.offset.x > 50) handleNavigation(-1);
            else if (info.offset.x < -50) handleNavigation(1);
        }}
      >
        <AnimatePresence mode="popLayout">
          {displayList.map((product, index) => {
            const offset = (index - currentIndex + displayList.length) % displayList.length;
            const isCenter = offset === 0;
            
            if (offset !== 0 && offset !== 1 && offset !== displayList.length - 1) return null;

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
                    <img 
                      src={formatImageUrl(product.image || product.images?.[0])} 
                      alt={product.name} 
                      className="w-full h-full object-contain" 
                    />
                  </motion.div>
                </div>
                {/* Name and Price */}
                <div className="mt-4 md:mt-6 text-center">
                    <div className="text-gray-800 font-semibold text-sm md:text-base px-2">{product.name}</div>
                    <div className="flex items-center justify-center gap-2 mt-1">
                      <span className="text-gray-900 font-black text-sm md:text-base">Rs. {product.price ? product.price.toFixed(0) : '1250'}</span>
                      {product.originalPrice && product.originalPrice > product.price && (
                        <span className="text-gray-400 line-through text-xs">Rs. {product.originalPrice.toFixed(0)}</span>
                      )}
                    </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </motion.div>

      {/* Interactive Cart Drawer */}
      <CartDrawer />
    </div>
  );
}
