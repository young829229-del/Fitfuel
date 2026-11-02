import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { doc, getDoc, setDoc, addDoc, collection } from 'firebase/firestore';
import { db } from '../../lib/firebase';

export default function AdminProductForm() {
  const [product, setProduct] = useState({ name: '', price: 0, stock: 0, slug: '', description: '', category: '' });
  const navigate = useNavigate();
  const { id } = useParams();

  useEffect(() => {
    if (id) {
      getDoc(doc(db, 'products', id)).then(doc => {
        if (doc.exists()) setProduct(doc.data() as any);
      });
    }
  }, [id]);

  const saveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (id) await setDoc(doc(db, 'products', id), product);
    else await addDoc(collection(db, 'products'), product);
    navigate('/admin/products');
  };

  return (
    <form onSubmit={saveProduct} className="max-w-2xl bg-white p-8 rounded shadow space-y-4">
      <h2 className="text-xl font-bold">{id ? 'Edit' : 'Add'} Product</h2>
      <input type="text" placeholder="Name" value={product.name} onChange={e => setProduct({...product, name: e.target.value})} className="w-full p-2 border" required />
      <input type="number" placeholder="Price" value={product.price} onChange={e => setProduct({...product, price: parseFloat(e.target.value)})} className="w-full p-2 border" required />
      <input type="number" placeholder="Stock" value={product.stock} onChange={e => setProduct({...product, stock: parseInt(e.target.value)})} className="w-full p-2 border" required />
      <input type="text" placeholder="Slug" value={product.slug} onChange={e => setProduct({...product, slug: e.target.value})} className="w-full p-2 border" required />
      <textarea placeholder="Description" value={product.description} onChange={e => setProduct({...product, description: e.target.value})} className="w-full p-2 border"></textarea>
      <button type="submit" className="bg-black text-white px-4 py-2 rounded">Save</button>
    </form>
  );
}
