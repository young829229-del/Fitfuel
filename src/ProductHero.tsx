import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { useProducts } from './context/ProductContext';

export default function ProductHero() {
  const { products } = useProducts();
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollTimeout = useRef<NodeJS.Timeout | null>(null);
  const navigate = useNavigate();

  const handleNavigation = (direction: number) => {
    if (products.length === 0) return;
    setCurrentIndex((prev) => (prev + direction + products.length) % products.length);
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
    <div className="relative w-full h-screen flex flex-col items-center justify-center bg-white overflow-hidden pt-24" onWheel={handleWheel}>
      {/* Brand Logo */}
      <img 
        src="/public/assets/aistudio/tiktok_video_dt6Np_d66a1b63.jpeg" 
        alt="FitFul Nepal Logo" 
        className="absolute top-4 left-1/2 -translate-x-1/2 w-12 md:w-16 z-20 rounded-full border border-gray-200 shadow-md" 
      />

      {/* Cart Button */}
      <button className="absolute top-6 right-6 z-20 p-2 bg-gray-100 rounded-full hover:bg-gray-200 transition">
        <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-gray-800" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      </button>
      
      <motion.div
        className="flex items-center justify-center w-full h-full cursor-grab"
        style={{ perspective: 1000 }}
        drag="x"
        dragConstraints={{ left: 0, right: 0 }}
        onDragEnd={(_, info) => {
            if (info.offset.x > 50) handleNavigation(-1);
            else if (info.offset.x < -50) handleNavigation(1);
        }}
      >
        <AnimatePresence mode="popLayout">
          {products.map((product, index) => {
            const offset = (index - currentIndex + products.length) % products.length;
            const isCenter = offset === 0;
            
            if (offset !== 0 && offset !== 1 && offset !== products.length - 1) return null;

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
                    <img src={product.image || product.images?.[0]} alt={product.name} className="w-full h-full object-contain" />
                  </motion.div>
                </div>
                {/* Name and Price */}
                <div className="mt-4 md:mt-6 text-center">
                    <div className="text-gray-800 font-semibold text-sm md:text-base px-2">{product.name}</div>
                    <div className="text-gray-600 font-medium text-xs md:text-sm mt-1">${product.price ? product.price.toFixed(2) : '24.99'}</div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
