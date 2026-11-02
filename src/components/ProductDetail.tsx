import { useParams, useNavigate, Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useProducts } from '../context/ProductContext';
import { useCart } from '../context/CartContext';
import { ShieldCheck, ShoppingCart, ArrowLeft, Check, Sparkles } from 'lucide-react';

export default function ProductDetail() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { products, loading } = useProducts();
  const { addToCart, setIsCartOpen, totalCount } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  // Find product by slug or id
  const product = products.find(p => p.slug === slug || p.id === slug);

  // Reset selected image when slug changes
  useEffect(() => {
    setSelectedImageIndex(0);
    setQuantity(1);
  }, [slug]);

  if (loading && !product) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center">
        <div className="w-8 h-8 border-4 border-black border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-xs font-bold uppercase tracking-wider text-gray-500">Loading supplement...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center text-center p-6">
        <h2 className="text-2xl font-black text-gray-900">Product Not Found</h2>
        <p className="text-sm text-gray-500 mt-2">The supplement you are looking for might have been moved or updated.</p>
        <Link to="/" className="mt-6 px-6 py-2.5 bg-black text-white text-xs font-bold uppercase rounded-xl hover:bg-neutral-800 transition">
          Return to Storefront
        </Link>
      </div>
    );
  }

  const galleryImages = product.images && product.images.length > 0
    ? product.images
    : [product.image || '/public/assets/aistudio/IMG_e9755086-1600-4fc3-b90a-e97667f39591_5ab03a1e.jpg'];

  const mainImage = galleryImages[selectedImageIndex] || galleryImages[0];
  const isOutOfStock = (product.stock ?? 0) <= 0;

  const handleBuyNow = () => {
    addToCart(product, quantity);
    setIsCartOpen(true);
  };

  return (
    <div className="min-h-screen bg-white selection:bg-yellow-400 selection:text-black">
      {/* Top Header Navigation */}
      <nav className="max-w-7xl mx-auto px-6 py-5 flex items-center justify-between border-b border-gray-100">
        <Link to="/" className="flex items-center gap-3 group">
          <img 
            src="/public/assets/aistudio/tiktok_video_dt6Np_d66a1b63.jpeg" 
            alt="FitFul Nepal" 
            className="w-9 h-9 rounded-full border border-gray-200 object-cover group-hover:scale-105 transition" 
          />
          <span className="font-black text-sm uppercase tracking-tight text-gray-900">FitFul Nepal</span>
        </Link>

        <div className="flex items-center gap-3">
          <Link
            to="/admin"
            className="flex items-center gap-1.5 px-3 py-1.5 bg-neutral-900 hover:bg-black text-white text-xs font-bold uppercase tracking-wider rounded-full shadow-sm transition"
            title="Admin Portal"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-yellow-400" />
            <span className="hidden sm:inline">Admin</span>
          </Link>

          <button 
            onClick={() => setIsCartOpen(true)}
            className="p-2 bg-gray-100 hover:bg-gray-200 rounded-full transition relative cursor-pointer"
          >
            <ShoppingCart className="w-5 h-5 text-gray-800" />
            {totalCount > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-black text-white text-[10px] font-black rounded-full flex items-center justify-center">
                {totalCount}
              </span>
            )}
          </button>
        </div>
      </nav>

      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-6 py-8 md:py-16">
        {/* Back Navigation Button */}
        <button 
          onClick={() => navigate(-1)} 
          className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-gray-400 hover:text-black mb-8 transition group cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> Back
        </button>

        {/* Editorial Three-Column Layout (Desktop) */}
        <div className="grid md:grid-cols-12 gap-10 lg:gap-16 items-start">
          {/* Left Column: Category & Title (Desktop) */}
          <div className="hidden md:block md:col-span-3 pt-4 space-y-4">
            <span className="text-xs font-bold uppercase tracking-widest text-yellow-600">
              {product.category || 'Premium Supplement'}
            </span>
            <h1 className="text-4xl font-black text-gray-950 leading-tight tracking-tight">
              {product.name}
            </h1>
            {product.weightSize && (
              <div className="text-xs font-medium text-gray-500">
                Package: <span className="font-bold text-gray-700">{product.weightSize}</span>
              </div>
            )}
            
            {/* Reviews */}
            <div className="flex items-center gap-1 text-yellow-500 pt-2">
              {[...Array(5)].map((_, i) => (
                <svg key={i} className={`w-4 h-4 ${i < 4 ? 'fill-current' : 'fill-gray-200'}`} viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              ))}
              <span className="text-gray-400 text-xs ml-1 font-semibold">(48 Verified Reviews)</span>
            </div>
          </div>

          {/* Center Column: Full-size Product Image & Gallery */}
          <div className="md:col-span-5 flex flex-col items-center">
            {/* Mobile Title View */}
            <div className="md:hidden w-full mb-6">
              <span className="text-xs font-bold uppercase tracking-widest text-yellow-600">
                {product.category || 'Premium Supplement'}
              </span>
              <h1 className="text-3xl font-black text-gray-950 leading-tight mt-1">
                {product.name}
              </h1>
            </div>

            {/* Main Stage Image */}
            <div className="w-full flex items-center justify-center min-h-[320px] md:min-h-[440px] p-4 relative">
              <img 
                src={mainImage} 
                alt={product.name} 
                className="max-w-full max-h-[50vh] md:max-h-[65vh] object-contain drop-shadow-2xl transition duration-300" 
              />
            </div>

            {/* Gallery Thumbnails */}
            {galleryImages.length > 1 && (
              <div className="flex gap-3 mt-6 overflow-x-auto pb-2 max-w-full">
                {galleryImages.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedImageIndex(i)}
                    className={`w-16 h-16 rounded-2xl bg-gray-50 p-1.5 border-2 transition cursor-pointer shrink-0 ${
                      selectedImageIndex === i ? 'border-black shadow-md' : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <img src={img} alt={`Angle ${i + 1}`} className="w-full h-full object-contain" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right Column: Pricing, Purchase, Key Benefits */}
          <div className="md:col-span-4 pt-4 space-y-6">
            {/* Price section */}
            <div>
              <div className="flex items-baseline gap-3">
                <span className="text-3xl font-black text-gray-950">${product.price.toFixed(2)}</span>
                {product.discountPrice && (
                  <span className="text-sm font-bold text-gray-400 line-through">
                    ${product.discountPrice.toFixed(2)}
                  </span>
                )}
                {isOutOfStock ? (
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-red-100 text-red-700">
                    Out of Stock
                  </span>
                ) : (
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-green-100 text-green-800">
                    {product.stock} in stock
                  </span>
                )}
              </div>
              <p className="text-xs text-gray-400 mt-1">Inclusive of all local Nepal taxes & duties</p>
            </div>

            {/* Description */}
            <p className="text-gray-600 text-sm leading-relaxed">
              {product.description || 'Formulated with clinically-studied ingredients for optimal athletic performance, recovery, and daily wellness.'}
            </p>

            {/* Quantity Selector */}
            {!isOutOfStock && (
              <div className="flex items-center gap-4 pt-2">
                <span className="text-xs font-bold uppercase tracking-wider text-gray-500">Quantity</span>
                <div className="flex items-center border border-gray-300 rounded-full bg-white shadow-xs">
                  <button 
                    onClick={() => setQuantity(Math.max(1, quantity - 1))} 
                    className="px-4 py-2 hover:bg-gray-100 rounded-l-full font-bold text-sm cursor-pointer"
                  >
                    -
                  </button>
                  <span className="font-black w-10 text-center text-sm">{quantity}</span>
                  <button 
                    onClick={() => setQuantity(Math.min(product.stock || 99, quantity + 1))} 
                    className="px-4 py-2 hover:bg-gray-100 rounded-r-full font-bold text-sm cursor-pointer"
                  >
                    +
                  </button>
                </div>
              </div>
            )}

            {/* Purchase CTA Buttons */}
            <div className="flex flex-col gap-3 pt-2">
              <button 
                onClick={() => addToCart(product, quantity)}
                disabled={isOutOfStock}
                className="w-full py-4 bg-black hover:bg-neutral-800 text-white rounded-full font-bold text-sm uppercase tracking-wider transition shadow-lg cursor-pointer disabled:opacity-50"
              >
                {isOutOfStock ? 'Temporarily Unavailable' : 'Add to Cart'}
              </button>
              
              <button 
                onClick={handleBuyNow}
                disabled={isOutOfStock}
                className="w-full py-4 border-2 border-black hover:bg-black hover:text-white text-black rounded-full font-bold text-sm uppercase tracking-wider transition cursor-pointer disabled:opacity-50"
              >
                Buy Now
              </button>
            </div>

            {/* Key Benefits Checklist */}
            {product.keyBenefits && product.keyBenefits.length > 0 && (
              <div className="pt-6 border-t border-gray-100 space-y-3">
                <h3 className="font-bold text-xs uppercase tracking-wider text-gray-900">Key Benefits</h3>
                <ul className="space-y-2">
                  {product.keyBenefits.map((b, idx) => (
                    <li key={idx} className="flex items-center gap-2.5 text-gray-600 text-xs font-medium">
                      <span className="w-4 h-4 rounded-full bg-green-100 text-green-700 flex items-center justify-center shrink-0">
                        <Check className="w-2.5 h-2.5" />
                      </span>
                      {b}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Additional Specifications */}
            {(product.ingredients || product.nutritionalInfo || product.usage) && (
              <div className="pt-6 border-t border-gray-100 space-y-3 text-xs">
                {product.ingredients && (
                  <div>
                    <span className="font-bold text-gray-900 block">Ingredients:</span>
                    <span className="text-gray-600">{product.ingredients}</span>
                  </div>
                )}
                {product.nutritionalInfo && (
                  <div>
                    <span className="font-bold text-gray-900 block">Nutritional Profile:</span>
                    <span className="text-gray-600">{product.nutritionalInfo}</span>
                  </div>
                )}
                {product.usage && (
                  <div>
                    <span className="font-bold text-gray-900 block">Suggested Use:</span>
                    <span className="text-gray-600">{product.usage}</span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* You Might Also Like Section (Live Database Linked) */}
        <div className="mt-24 md:mt-32 pt-12 border-t border-gray-100">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-black text-gray-950">You Might Also Like</h2>
            <Link to="/" className="text-xs font-bold text-gray-400 hover:text-black uppercase tracking-wider">
              Explore All Supplements &rarr;
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
            {products
              .filter(p => p.id !== product.id && !p.isUnavailable)
              .slice(0, 4)
              .map(p => {
                const img = (p.images && p.images[0]) || p.image || '/public/assets/aistudio/IMG_e9755086-1600-4fc3-b90a-e97667f39591_5ab03a1e.jpg';
                return (
                  <div 
                    key={p.id} 
                    className="group cursor-pointer bg-gray-50/60 hover:bg-gray-50 border border-gray-100 rounded-3xl p-4 transition-all duration-300 hover:shadow-lg flex flex-col justify-between"
                    onClick={() => navigate(`/product/${p.slug}`)}
                  >
                    <div className="h-40 flex items-center justify-center p-2">
                      <img src={img} alt={p.name} className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform drop-shadow-md" />
                    </div>
                    <div className="pt-3 border-t border-gray-100">
                      <h4 className="font-bold text-xs text-gray-900 line-clamp-1">{p.name}</h4>
                      <p className="text-xs font-black text-gray-950 mt-1">${p.price.toFixed(2)}</p>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      </div>
    </div>
  );
}
