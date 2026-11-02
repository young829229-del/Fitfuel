import { useState, useEffect } from 'react';
import { collection, onSnapshot, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { Link } from 'react-router-dom';

export default function AdminProducts() {
  const [products, setProducts] = useState<any[]>([]);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'products'), (snapshot) => {
      setProducts(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    return unsub;
  }, []);

  const deleteProduct = async (id: string) => {
    if (confirm('Are you sure?')) await deleteDoc(doc(db, 'products', id));
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Products</h2>
      <Link to="/admin/products/new" className="bg-black text-white px-4 py-2 rounded">Add Product</Link>
      <table className="w-full mt-6 bg-white rounded-lg shadow">
        <thead>
          <tr className="border-b">
            <th className="p-4">Name</th>
            <th className="p-4">Price</th>
            <th className="p-4">Stock</th>
            <th className="p-4">Actions</th>
          </tr>
        </thead>
        <tbody>
          {products.map(p => (
            <tr key={p.id} className="border-b">
              <td className="p-4">{p.name}</td>
              <td className="p-4">${p.price}</td>
              <td className="p-4">{p.stock}</td>
              <td className="p-4">
                <Link to={`/admin/products/edit/${p.id}`} className="text-blue-500 mr-2">Edit</Link>
                <button onClick={() => deleteProduct(p.id)} className="text-red-500">Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
