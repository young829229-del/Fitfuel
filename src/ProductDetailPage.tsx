import { useState } from 'react';

// This is a placeholder for the actual data that will be fetched from the database
const product = {
  id: '1',
  name: 'Pintola High Protein Oats',
  category: 'Sports Nutrition',
  description: 'Our proprietary formulation contains premium protein and high-fiber oats to support systemic health.',
  benefits: ['High Protein', 'Rich in Fiber', 'No Added Sugar'],
  price: 24.99,
  image: '/public/assets/aistudio/IMG_e9755086-1600-4fc3-b90a-e97667f39591_5ab03a1e.jpg',
  stock: 15
};

export default function ProductDetailPage() {
  const [quantity, setQuantity] = useState(1);

  return (
    <div className="min-h-screen bg-white text-gray-900">
      {/* Slim Header */}
      <nav className="flex items-center justify-between px-8 py-4 border-b border-gray-100">
        <div className="text-xl font-black">FITFUL</div>
        <div className="flex gap-6 text-sm font-medium text-gray-600">
          <span>Shop</span>
          <span>Science</span>
          <span>Learn</span>
        </div>
        <div className="flex gap-6 text-sm font-medium">
          <span>Login</span>
          <span>Cart (0)</span>
        </div>
      </nav>

      {/* Main Content */}
      <main className="container mx-auto px-8 py-16 grid grid-cols-1 md:grid-cols-3 gap-16 items-center">
        {/* Left: Title */}
        <div className="flex flex-col gap-2">
          <span className="text-xs font-bold tracking-widest text-gray-400 uppercase">{product.category}</span>
          <h1 className="text-4xl font-extrabold tracking-tighter">{product.name}</h1>
        </div>

        {/* Center: Image */}
        <div className="flex justify-center">
          <img src={product.image} alt={product.name} className="max-w-xs md:max-w-md drop-shadow-2xl" />
        </div>

        {/* Right: Details */}
        <div className="flex flex-col gap-6">
          <p className="text-gray-600 leading-relaxed">{product.description}</p>
          <ul className="list-disc list-inside text-sm text-gray-500">
            {product.benefits.map((benefit, i) => <li key={i}>{benefit}</li>)}
          </ul>
          
          <div className="text-2xl font-bold">${product.price.toFixed(2)}</div>
          
          <div className="flex items-center gap-4">
             <input 
                type="number" 
                min="1" 
                max={product.stock}
                value={quantity} 
                onChange={(e) => setQuantity(Number(e.target.value))}
                className="w-16 p-2 border border-gray-200 rounded-md text-center"
             />
             <button className="flex-1 bg-black text-white py-3 rounded-md hover:bg-gray-800 transition">Add to Cart</button>
          </div>
          <button className="w-full py-3 border border-black rounded-md hover:bg-gray-50 transition">Buy Now</button>
        </div>
      </main>
    </div>
  );
}
