import { useParams, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useProducts } from '../context/ProductContext';
import { useCart } from '../context/CartContext';
import { ArrowLeft, Check, Star } from 'lucide-react';

export default function ProductDetail() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { products, getProductBySlug } = useProducts();
  const product = getProductBySlug(slug || '');
  const { addToCart } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState<string>('');

  useEffect(() => {
    if (product) {
      setActiveImage(product.image || product.images?.[0] || '');
      setQuantity(1);
    }
  }, [product]);

  if (!product) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6 text-center">
        <h2 className="text-3xl font-black text-black mb-3">Product Not Found</h2>
        <p className="text-sm text-gray-500 max-w-sm mb-6">
          The supplement you are looking for may have been updated or removed from the catalog.
        </p>
        <div className="flex gap-3">
          <button
            onClick={() => navigate('/')}
            className="px-6 py-3 bg-black text-white rounded-full text-xs font-bold hover:bg-neutral-800 transition"
          >
            ← Back to Storefront
          </button>
        </div>
      </div>
    );
  }

  const galleryImages = product.images && product.images.length > 0
    ? product.images
    : [product.image];

  const currentImage = activeImage || product.image || galleryImages[0];

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 md:py-16">
      {/* Top Navigation Bar */}
      <div className="flex items-center justify-between mb-8">
        <button 
          onClick={() => navigate(-1)} 
          className="flex items-center gap-1.5 text-xs font-bold text-gray-500 hover:text-black transition"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back</span>
        </button>

        <div>
          <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">
            {product.category || 'Supplements'}
          </span>
        </div>
      </div>

      <div className="grid md:grid-cols-12 gap-12 lg:gap-20 items-start">
        {/* Left: Title & Rating (Desktop) */}
        <div className="hidden md:block md:col-span-3 pt-4">
          <span className="text-[11px] font-bold tracking-widest text-gray-400 uppercase">
            {product.category || 'Sports Nutrition'}
          </span>
          <h1 className="text-4xl font-black text-black leading-tight mt-1">{product.name}</h1>
          
          <div className="flex items-center gap-1 mt-3 text-amber-400">
            {[...Array(5)].map((_, i) => (
              <Star 
                key={i} 
                className={`w-4 h-4 ${i < Math.floor(product.rating || 4.8) ? 'fill-amber-400 text-amber-400' : 'fill-gray-100 text-gray-200'}`} 
              />
            ))}
            <span className="text-gray-500 text-xs ml-2 font-medium">
              {product.rating || 4.8} ({product.reviewsCount || 42} reviews)
            </span>
          </div>

          <div className="mt-6 pt-6 border-t border-gray-100">
            <span className={`inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-full ${
              product.stockStatus === 'In Stock' 
                ? 'bg-emerald-50 text-emerald-700' 
                : 'bg-amber-50 text-amber-700'
            }`}>
              <span className={`w-1.5 h-1.5 rounded-full ${
                product.stockStatus === 'In Stock' ? 'bg-emerald-500' : 'bg-amber-500'
              }`} />
              {product.stockStatus}
            </span>
          </div>
        </div>

        {/* Center: Image Gallery */}
        <div className="md:col-span-5 flex flex-col gap-4">
          <div className="flex items-center justify-center w-full min-h-[350px]">
            <img 
              src={currentImage} 
              alt={product.name} 
              className="max-w-full h-auto object-contain max-h-[50vh] md:max-h-[70vh] drop-shadow-2xl transition duration-200" 
            />
          </div>

          {galleryImages.length > 1 && (
            <div className="flex gap-3 justify-center">
              {galleryImages.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setActiveImage(img)}
                  className={`w-16 h-16 rounded-xl border p-1 transition overflow-hidden bg-gray-50 ${
                    currentImage === img 
                      ? 'border-black ring-1 ring-black' 
                      : 'border-gray-200 hover:border-gray-400'
                  }`}
                >
                  <img src={img} alt={`${product.name} thumbnail ${i}`} className="w-full h-full object-contain" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right: Purchase & Details Info */}
        <div className="md:col-span-4 pt-4">
          {/* Title (Mobile) */}
          <div className="md:hidden mb-4">
            <span className="text-[10px] font-bold tracking-widest text-gray-400 uppercase">
              {product.category || 'Sports Nutrition'}
            </span>
            <h1 className="text-3xl font-black text-black leading-tight mt-0.5">{product.name}</h1>
            <div className="flex items-center gap-1 mt-2 text-amber-400">
              {[...Array(5)].map((_, i) => (
                <Star 
                  key={i} 
                  className={`w-4 h-4 ${i < Math.floor(product.rating || 4.8) ? 'fill-amber-400 text-amber-400' : 'fill-gray-100 text-gray-200'}`} 
                />
              ))}
              <span className="text-gray-500 text-xs ml-2 font-medium">
                {product.rating || 4.8} ({product.reviewsCount || 42} reviews)
              </span>
            </div>
          </div>
          
          <div className="flex items-baseline gap-3">
            <p className="text-3xl font-black text-gray-900">${product.price.toFixed(2)}</p>
            {product.originalPrice && product.originalPrice > product.price && (
              <p className="text-base text-gray-400 line-through font-semibold">
                ${product.originalPrice.toFixed(2)}
              </p>
            )}
          </div>

          <p className="text-gray-600 mt-5 leading-relaxed text-sm">{product.description}</p>
          
          {/* Quantity Selector */}
          <div className="mt-8 flex items-center gap-4">
            <div className="flex items-center border border-gray-300 rounded-full bg-white">
              <button 
                onClick={() => setQuantity(Math.max(1, quantity - 1))} 
                className="px-4 py-2 hover:bg-gray-100 rounded-l-full font-bold text-gray-700 transition"
              >
                -
              </button>
              <span className="font-bold w-10 text-center text-sm">{quantity}</span>
              <button 
                onClick={() => setQuantity(quantity + 1)} 
                className="px-4 py-2 hover:bg-gray-100 rounded-r-full font-bold text-gray-700 transition"
              >
                +
              </button>
            </div>

            <span className="text-xs text-gray-500 font-medium">
              Subtotal: <strong>${(product.price * quantity).toFixed(2)}</strong>
            </span>
          </div>
          
          {/* Purchase Buttons */}
          <div className="mt-8 flex flex-col gap-3">
            <button 
              onClick={() => addToCart(product.id, quantity)} 
              className="w-full py-4 bg-black text-white rounded-full font-bold hover:bg-neutral-800 transition active:scale-[0.99] shadow-md"
            >
              Add to Cart
            </button>
            <button 
              onClick={() => {
                addToCart(product.id, quantity);
                alert(`Proceeding to checkout with ${quantity}x ${product.name}`);
              }}
              className="w-full py-4 border border-black rounded-full font-bold hover:bg-gray-50 transition active:scale-[0.99]"
            >
              Buy Now
            </button>
          </div>

          {/* Key Benefits */}
          {product.keyBenefits && product.keyBenefits.length > 0 && (
            <div className="mt-10 space-y-3">
              <h3 className="font-bold text-xs uppercase tracking-wider text-gray-900">Key Benefits</h3>
              <ul className="space-y-2.5"> 
                {product.keyBenefits.map((benefit, i) => (
                  <li key={i} className="flex items-center gap-2.5 text-gray-600 text-xs">
                    <span className="w-4 h-4 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                      <Check className="w-2.5 h-2.5" />
                    </span>
                    <span>{benefit}</span>
                  </li>
                ))} 
              </ul>
            </div>
          )}

          {/* Additional Nutritional / Usage Specs */}
          {(product.nutritionalInfo || product.usage || product.ingredients) && (
            <div className="mt-10 pt-6 border-t border-gray-100 space-y-4 text-xs text-gray-600">
              {product.nutritionalInfo && (
                <div>
                  <h4 className="font-bold text-[11px] uppercase tracking-wider text-gray-900 mb-1">Nutrition Facts</h4>
                  <p className="leading-relaxed">{product.nutritionalInfo}</p>
                </div>
              )}
              {product.ingredients && (
                <div>
                  <h4 className="font-bold text-[11px] uppercase tracking-wider text-gray-900 mb-1">Ingredients</h4>
                  <p className="leading-relaxed">{product.ingredients}</p>
                </div>
              )}
              {product.usage && (
                <div>
                  <h4 className="font-bold text-[11px] uppercase tracking-wider text-gray-900 mb-1">How to Use</h4>
                  <p className="leading-relaxed">{product.usage}</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Related Products */}
      <div className="mt-20 md:mt-32 border-t border-gray-100 pt-16">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-xl font-bold tracking-tight text-black">You might also like</h2>
          <span className="text-xs text-gray-400 font-medium">Explore related supplements</span>
        </div>

        <div className="flex gap-6 overflow-x-auto pb-4">
          {products
            .filter(p => p.id !== product.id)
            .slice(0, 4)
            .map(p => (
              <div 
                key={p.id} 
                className="min-w-[220px] max-w-[260px] flex-1 cursor-pointer group" 
                onClick={() => navigate(`/product/${p.slug}`)}
              >
                <div className="bg-gray-50 rounded-3xl p-6 h-52 flex items-center justify-center mb-4 group-hover:bg-gray-100 transition">
                  <img 
                    src={p.image || p.images?.[0]} 
                    alt={p.name} 
                    className="h-full object-contain drop-shadow-md group-hover:scale-105 transition duration-300" 
                  />
                </div>
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1">
                  {p.category || 'Supplements'}
                </span>
                <h4 className="font-bold text-sm text-gray-900 group-hover:text-black line-clamp-1">{p.name}</h4>
                <p className="text-sm font-semibold text-gray-600 mt-1">${p.price.toFixed(2)}</p>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}
