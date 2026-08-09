import { useState, useEffect } from 'react';
import { productService } from '../../services/productService';
import ManagerLayout from '../../layouts/ManagerLayout';

const statusStyles = {
  IN_STOCK: 'bg-green-100 text-green-700',
  LOW_STOCK: 'bg-amber-100 text-amber-700',
  OUT_OF_STOCK: 'bg-red-100 text-red-700',
};

export default function Inventory() {
  const [products, setProducts] = useState([]);
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await productService.getAll({ status: statusFilter, limit: 100 });
      setProducts(res.data.data.products);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchProducts(); }, [statusFilter]);

  const totalStock = products.reduce((sum, p) => sum + p.stockQuantity, 0);

  return (
    <ManagerLayout pageTitle="Inventory">
      <div className="grid grid-cols-4 gap-4 mb-6">
        {['', 'IN_STOCK', 'LOW_STOCK', 'OUT_OF_STOCK'].map((status) => (
          <button
            key={status}
            onClick={() => setStatusFilter(status)}
            className={`px-4 py-2.5 rounded-lg text-sm font-medium border-2 transition-colors ${
              statusFilter === status ? 'border-primary-600 bg-primary-50 text-primary-700' : 'border-slate-200 text-slate-500'
            }`}
          >
            {status === '' ? 'All' : status.replace('_', ' ')}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-5 mb-6">
        <p className="text-sm text-slate-500">Total units in inventory (current view)</p>
        <p className="text-3xl font-bold text-slate-800 mt-1">{totalStock}</p>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <table className="w-full">
          <thead className="bg-slate-50 text-left text-xs font-semibold text-slate-500 uppercase">
            <tr>
              <th className="px-5 py-3">Product</th>
              <th className="px-5 py-3">Category</th>
              <th className="px-5 py-3">Stock</th>
              <th className="px-5 py-3">Min Stock</th>
              <th className="px-5 py-3">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              <tr><td colSpan={5} className="px-5 py-8 text-center text-slate-400">Loading...</td></tr>
            ) : (
              products.map((p) => (
                <tr key={p._id}>
                  <td className="px-5 py-3 font-medium text-slate-800">{p.name}</td>
                  <td className="px-5 py-3 text-sm text-slate-600">{p.category}</td>
                  <td className="px-5 py-3 text-sm text-slate-600">{p.stockQuantity}</td>
                  <td className="px-5 py-3 text-sm text-slate-600">{p.minimumStock}</td>
                  <td className="px-5 py-3">
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${statusStyles[p.status]}`}>
                      {p.status.replace('_', ' ')}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </ManagerLayout>
  );
}