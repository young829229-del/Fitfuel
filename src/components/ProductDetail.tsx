import { useParams, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { products } from '../data/products';
import { useCart } from '../context/CartContext';

export default function ProductDetail() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const product = products.find(p => p.slug === slug);
  const { addToCart } = useCart();
  const [quantity, setQuantity] = useState(1);

  if (!product) return <div>Product not found</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 md:py-16">
      <button onClick={() => navigate(-1)} className="flex items-center gap-1 text-sm font-medium text-gray-500 hover:text-black mb-8">
        ← Back
      </button>

      <div className="grid md:grid-cols-12 gap-12 lg:gap-20 items-start">
        <div className="hidden md:block md:col-span-3 pt-4">
            <h1 className="text-4xl font-black text-black leading-tight">{product.name}</h1>
        <div className="flex items-center gap-1 mt-2 text-yellow-500">
            {[...Array(5)].map((_, i) => (
                <svg key={i} className={`w-5 h-5 ${i < 4 ? 'fill-current' : 'fill-gray-200'}`} viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
            ))}
            <span className="text-gray-500 text-sm ml-2 font-medium">(42 reviews)</span>
        </div>
        </div>

        {/* Center: Image Gallery */}
        <div className="md:col-span-5 flex flex-col gap-4">
          <div className="flex items-center justify-center w-full">
            <img src={product.image} alt={product.name} className="max-w-full h-auto object-contain max-h-[50vh] md:max-h-[70vh] drop-shadow-2xl" />
          </div>
          <div className="flex gap-4">
              {[product.image, product.image, product.image].map((img, i) => (
                  <div key={i} className="w-20 h-20 bg-gray-50 rounded-xl cursor-pointer hover:ring-2 ring-black p-2">
                      <img src={img} alt={`${product.name} ${i}`} className="w-full h-full object-contain" />
                  </div>
              ))}
          </div>
        </div>

        <div className="md:col-span-4 pt-4">
            <h1 className="md:hidden text-3xl font-black text-black leading-tight mb-4">{product.name}</h1>
            <div className="flex items-center gap-1 -mt-2 mb-6 text-yellow-500">
                {[...Array(5)].map((_, i) => (
                    <svg key={i} className={`w-5 h-5 ${i < 4 ? 'fill-current' : 'fill-gray-200'}`} viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                ))}
                <span className="text-gray-500 text-sm ml-2 font-medium">(42 reviews)</span>
            </div>
            
            <p className="text-2xl font-bold text-gray-900">${product.price.toFixed(2)}</p>
            <p className="text-gray-600 mt-6 leading-relaxed">{product.description}</p>
            
            <div className="mt-8 flex items-center gap-4">
                <div className="flex items-center border border-gray-300 rounded-full">
                    <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="px-4 py-2 hover:bg-gray-100 rounded-l-full">-</button>
                    <span className="font-bold w-12 text-center">{quantity}</span>
                    <button onClick={() => setQuantity(quantity + 1)} className="px-4 py-2 hover:bg-gray-100 rounded-r-full">+</button>
                </div>
            </div>
            
            <div className="mt-8 flex flex-col gap-3">
                <button onClick={() => addToCart(product.id, quantity)} className="w-full py-4 bg-black text-white rounded-full font-bold hover:bg-gray-800 transition">Add to Cart</button>
                <button className="w-full py-4 border border-black rounded-full font-bold hover:bg-gray-50 transition">Buy Now</button>
            </div>

            <div className="mt-12 space-y-4">
                <h3 className="font-bold text-sm uppercase tracking-wider text-gray-900">Key Benefits</h3>
                <ul className="space-y-2"> 
                    {product.keyBenefits.map(b => (
                        <li key={b} className="flex items-center gap-2 text-gray-600 text-sm">
                            <span className="text-green-600">✓</span> {b}
                        </li>
                    ))} 
                </ul>
            </div>
        </div>
      </div>

      {/* Related Products */}
      <div className="mt-20 md:mt-32">
        <h2 className="text-xl font-bold mb-8">You might also like</h2>
        <div className="flex gap-6 overflow-x-auto pb-4">
          {products.filter(p => p.id !== product.id).slice(0, 4).map(p => (
            <div key={p.id} className="min-w-[200px] flex-1 cursor-pointer" onClick={() => navigate(`/product/${p.slug}`)}>
                <div className="bg-gray-50 rounded-2xl p-4 h-48 flex items-center justify-center mb-4">
                    <img src={p.image} alt={p.name} className="h-full object-contain" />
                </div>
                <h4 className="font-semibold text-sm">{p.name}</h4>
                <p className="text-sm text-gray-500">${p.price.toFixed(2)}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
