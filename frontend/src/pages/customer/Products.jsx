import { useState, useEffect } from 'react';
import { productService } from '../../services/productService';
import CustomerLayout from '../../layouts/CustomerLayout';

const statusStyles = {
  IN_STOCK: 'bg-green-100 text-green-700',
  LOW_STOCK: 'bg-amber-100 text-amber-700',
  OUT_OF_STOCK: 'bg-red-100 text-red-700',
};

export default function Products() {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await productService.getAll({ search, category });
      setProducts(res.data.data.products);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const debounce = setTimeout(() => fetchProducts(), 300);
    return () => clearTimeout(debounce);
  }, [search, category]);

  const categories = [...new Set(products.map((p) => p.category))];

  return (
    <CustomerLayout pageTitle="Products">
      <div className="flex gap-4 mb-6">
        <input
          type="text"
          placeholder="Search products or RFID..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
        />
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
        >
          <option value="">All Categories</option>
          {categories.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="text-slate-500">Loading products...</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {products.map((product) => (
            <div key={product._id} className="bg-white rounded-xl border border-slate-200 p-5 hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-3">
                <h3 className="font-semibold text-slate-800">{product.name}</h3>
                <span className={`text-xs font-medium px-2 py-0.5 rounded-full whitespace-nowrap ${statusStyles[product.status]}`}>
                  {product.status.replace('_', ' ')}
                </span>
              </div>
              <p className="text-slate-500 text-sm mb-3">{product.category}</p>
              <div className="flex justify-between items-end">
                <span className="text-2xl font-bold text-slate-800">₹{product.price}</span>
                <span className="text-xs text-slate-400">Stock: {product.stockQuantity}</span>
              </div>
              <p className="text-xs text-slate-400 mt-2 font-mono">RFID: {product.rfidUid}</p>
            </div>
          ))}
          {products.length === 0 && (
            <div className="col-span-full text-center text-slate-400 py-12">
              No products found.
            </div>
          )}
        </div>
      )}
    </CustomerLayout>
  );
}