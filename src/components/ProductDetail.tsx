import { useParams, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useStore } from '../context/StoreContext';
import { useCart } from '../context/CartContext';
import { ArrowLeft, Check, Star, ShoppingBag, MessageSquare, Send } from 'lucide-react';
import { formatImageUrl } from '../utils/imageUrl';
import CartDrawer from './CartDrawer';

export default function ProductDetail() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { products, getProductBySlug, getProductReviews, addReview, settings } = useStore();
  const { addToCart, setIsCartOpen, totalCount } = useCart();

  const product = getProductBySlug(slug || '');
  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState<string>('');

  // Review Form State
  const [reviewName, setReviewName] = useState('');
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [reviewSuccess, setReviewSuccess] = useState(false);

  const productReviews = product ? getProductReviews(product.id) : [];

  useEffect(() => {
    if (product) {
      setActiveImage(product.image || product.images?.[0] || '');
      setQuantity(1);
      window.scrollTo(0, 0);
    }
  }, [product]);

  if (!product) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6 text-center">
        <h2 className="text-3xl font-black text-black mb-3">Product Not Found</h2>
        <p className="text-sm text-gray-500 max-w-sm mb-6">
          The supplement you are looking for may have been updated or removed from the catalog.
        </p>
        <button
          onClick={() => navigate('/')}
          className="px-6 py-3 bg-black text-white rounded-full text-xs font-bold hover:bg-neutral-800 transition"
        >
          ← Back to Storefront
        </button>
      </div>
    );
  }

  const galleryImages = product.images && product.images.length > 0
    ? product.images
    : [product.image];

  const currentImage = activeImage || product.image || galleryImages[0];

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewName.trim() || !reviewComment.trim()) return;

    setIsSubmittingReview(true);
    try {
      await addReview({
        productId: product.id,
        productName: product.name,
        customerName: reviewName.trim(),
        rating: reviewRating,
        comment: reviewComment.trim(),
        approved: true
      });
      setReviewName('');
      setReviewComment('');
      setReviewRating(5);
      setReviewSuccess(true);
      setTimeout(() => setReviewSuccess(false), 4000);
    } catch (err) {
      console.error('Failed to submit review:', err);
    } finally {
      setIsSubmittingReview(false);
    }
  };

  return (
    <div className="min-h-screen bg-white text-gray-900">

      <div className="max-w-7xl mx-auto px-4 py-8 md:py-12">
        {/* Top Navigation Bar */}
        <div className="flex items-center justify-between mb-8">
          <button 
            onClick={() => navigate('/')} 
            className="flex items-center gap-1.5 text-xs font-bold text-gray-500 hover:text-black transition"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Storefront</span>
          </button>

          <div className="flex items-center gap-4">

            {/* Cart Trigger */}
            <button
              onClick={() => setIsCartOpen(true)}
              className="p-2.5 bg-gray-100 hover:bg-black hover:text-white rounded-full transition relative"
              title="View Cart"
            >
              <ShoppingBag className="w-4 h-4" />
              {totalCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-600 text-white text-[10px] font-black rounded-full h-4 w-4 flex items-center justify-center">
                  {totalCount}
                </span>
              )}
            </button>
          </div>
        </div>

        <div className="grid md:grid-cols-12 gap-12 lg:gap-20 items-start">
          {/* Left: Title & Rating (Desktop) */}
          <div className="hidden md:block md:col-span-3">
            <h1 className="text-4xl font-black text-black leading-tight mt-1">{product.name}</h1>
            
            <div className="flex items-center gap-1 mt-3 text-amber-400">
              {[...Array(5)].map((_, i) => (
                <Star 
                  key={i} 
                  className={`w-4 h-4 ${i < Math.floor(product.rating || 4.8) ? 'fill-amber-400 text-amber-400' : 'fill-gray-100 text-gray-200'}`} 
                />
              ))}
              <span className="text-gray-500 text-xs ml-2 font-medium">
                {product.rating || 4.8} ({productReviews.length || product.reviewsCount || 0} reviews)
              </span>
            </div>
          </div>

          {/* Center: Image Gallery */}
          <div className="md:col-span-5 flex flex-col gap-4">
            <div className="flex items-center justify-center w-full min-h-[350px]">
              <img 
                src={formatImageUrl(currentImage)} 
                alt={product.name} 
                className="max-w-full h-auto object-contain max-h-[50vh] md:max-h-[70vh] drop-shadow-2xl transition duration-200" 
              />
            </div>

            {galleryImages.length > 1 && (
              <div className="flex gap-3 justify-center overflow-x-auto pb-2">
                {galleryImages.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveImage(img)}
                    className={`w-16 h-16 rounded-xl border p-1 transition overflow-hidden bg-gray-50 shrink-0 ${
                      currentImage === img 
                        ? 'border-black ring-1 ring-black' 
                        : 'border-gray-200 hover:border-gray-400'
                    }`}
                  >
                    <img src={formatImageUrl(img)} alt={`${product.name} thumbnail ${i}`} className="w-full h-full object-contain" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right: Purchase & Details Info */}
          <div className="md:col-span-4 pt-4">
            <div className="md:hidden mb-4">
              <h1 className="text-3xl font-black text-black leading-tight mt-0.5">{product.name}</h1>
              <div className="flex items-center gap-1 mt-2 text-amber-400">
                {[...Array(5)].map((_, i) => (
                  <Star 
                    key={i} 
                    className={`w-4 h-4 ${i < Math.floor(product.rating || 4.8) ? 'fill-amber-400 text-amber-400' : 'fill-gray-100 text-gray-200'}`} 
                  />
                ))}
                <span className="text-gray-500 text-xs ml-2 font-medium">
                  {product.rating || 4.8} ({productReviews.length || product.reviewsCount || 0} reviews)
                </span>
              </div>
            </div>
            
            <div className="flex items-baseline gap-3">
              <p className="text-3xl font-black text-gray-900">Rs. {product.price.toFixed(0)}</p>
              {product.originalPrice && product.originalPrice > product.price && (
                <p className="text-base text-gray-400 line-through font-semibold">
                  Rs. {product.originalPrice.toFixed(0)}
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
                  onClick={() => setQuantity(Math.min(product.stockQuantity || 50, quantity + 1))} 
                  className="px-4 py-2 hover:bg-gray-100 rounded-r-full font-bold text-gray-700 transition"
                >
                  +
                </button>
              </div>

            </div>
            
            {/* Purchase Buttons */}
            <div className="mt-8 flex flex-col gap-3">
              <button 
                onClick={() => addToCart(product, quantity)} 
                className="w-full py-4 bg-black text-white rounded-full font-bold hover:bg-neutral-800 transition active:scale-[0.99] shadow-md flex items-center justify-center gap-2"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>Add to Cart</span>
              </button>
              <button 
                onClick={() => {
                  addToCart(product, quantity);
                  setIsCartOpen(true);
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

          </div>
        </div>

        {/* Live Customer Reviews Section */}
        <div className="mt-20 md:mt-28 border-t border-gray-100 pt-16">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <div>
              <div className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-black" />
                <h2 className="text-2xl font-black text-black">Customer Reviews</h2>
              </div>
              <p className="text-xs text-gray-500 mt-1">Real reviews synchronized live from verified buyers.</p>
            </div>
            
            <div className="flex items-center gap-2">
              <div className="flex text-amber-400">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-amber-400" />
                ))}
              </div>
              <span className="text-sm font-black">{product.rating || 4.8} / 5.0</span>
            </div>
          </div>

          <div className="grid md:grid-cols-12 gap-8">
            {/* Reviews List */}
            <div className="md:col-span-7 space-y-4">
              {productReviews.length === 0 ? (
                <div className="bg-gray-50 rounded-2xl p-8 text-center text-gray-500 text-xs">
                  No reviews yet for this product. Be the first to share your experience!
                </div>
              ) : (
                productReviews.map(rev => (
                  <div key={rev.id} className="bg-gray-50 rounded-2xl p-5 space-y-2 border border-gray-100">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-gray-900">{rev.customerName}</span>
                      <div className="flex text-amber-400">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className={`w-3.5 h-3.5 ${i < rev.rating ? 'fill-amber-400' : 'text-gray-300'}`} />
                        ))}
                      </div>
                    </div>
                    <p className="text-xs text-gray-600 leading-relaxed">{rev.comment}</p>
                    <span className="text-[10px] text-gray-400 block pt-1">
                      {new Date(rev.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                ))
              )}
            </div>

            {/* Leave a Review Form */}
            <div className="md:col-span-5 bg-white border border-gray-200 rounded-3xl p-6 shadow-xs">
              <h3 className="text-sm font-black text-black mb-1">Write a Review</h3>
              <p className="text-[11px] text-gray-500 mb-4">Your review updates the live catalog automatically.</p>

              {reviewSuccess && (
                <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs p-3 rounded-xl mb-4 flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span>Thank you! Your review has been saved in Firebase.</span>
                </div>
              )}

              <form onSubmit={handleReviewSubmit} className="space-y-3 text-xs font-medium">
                <div>
                  <label className="block text-[11px] font-bold uppercase text-gray-600 mb-1">Your Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Ramesh Giri"
                    value={reviewName}
                    onChange={(e) => setReviewName(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-black"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase text-gray-600 mb-1">Rating</label>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setReviewRating(star)}
                        className={`p-1.5 rounded-lg border transition ${
                          reviewRating >= star ? 'border-amber-400 bg-amber-50 text-amber-500' : 'border-gray-200 text-gray-300'
                        }`}
                      >
                        <Star className={`w-4 h-4 ${reviewRating >= star ? 'fill-amber-400' : ''}`} />
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase text-gray-600 mb-1">Review *</label>
                  <textarea
                    rows={3}
                    required
                    placeholder="Tell other athletes about flavor, mixability, and results..."
                    value={reviewComment}
                    onChange={(e) => setReviewComment(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-black"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmittingReview}
                  className="w-full py-2.5 bg-black hover:bg-neutral-800 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 transition"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{isSubmittingReview ? 'Submitting...' : 'Post Review'}</span>
                </button>
              </form>
            </div>
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
                      src={formatImageUrl(p.image || p.images?.[0])} 
                      alt={p.name} 
                      className="h-full object-contain drop-shadow-md group-hover:scale-105 transition duration-300" 
                    />
                  </div>
                  <h4 className="font-bold text-sm text-gray-900 group-hover:text-black line-clamp-1">{p.name}</h4>
                  <p className="text-sm font-semibold text-gray-600 mt-1">Rs. {p.price.toFixed(0)}</p>
                </div>
              ))}
          </div>
        </div>
      </div>

      {/* Cart Drawer */}
      <CartDrawer />
    </div>
  );
}
