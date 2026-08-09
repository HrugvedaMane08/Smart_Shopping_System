import { useState, useEffect } from 'react';
import { productService } from '../../services/productService';
import { useToast } from '../../context/ToastContext';
import ManagerLayout from '../../layouts/ManagerLayout';
import ProductFormModal from '../../components/manager/ProductFormModal';

const statusStyles = {
  IN_STOCK: 'bg-green-100 text-green-700',
  LOW_STOCK: 'bg-amber-100 text-amber-700',
  OUT_OF_STOCK: 'bg-red-100 text-red-700',
};

export default function Products() {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const { showToast } = useToast();

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await productService.getAll({ search });
      setProducts(res.data.data.products);
    } catch (err) {
      showToast('Failed to load products', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const debounce = setTimeout(() => fetchProducts(), 300);
    return () => clearTimeout(debounce);
  }, [search]);

  const openCreateModal = () => {
    setEditingProduct(null);
    setModalOpen(true);
  };

  const openEditModal = (product) => {
    setEditingProduct(product);
    setModalOpen(true);
  };

  const handleSubmit = async (formData) => {
    if (editingProduct) {
      await productService.update(editingProduct._id, formData);
      showToast('Product updated successfully');
    } else {
      await productService.create(formData);
      showToast('Product created successfully');
    }
    fetchProducts();
  };

  const handleDelete = async (product) => {
    if (!confirm(`Delete "${product.name}"? This cannot be undone.`)) return;
    try {
      await productService.delete(product._id);
      showToast('Product deleted');
      fetchProducts();
    } catch (err) {
      showToast(err.response?.data?.message || 'Delete failed', 'error');
    }
  };

  return (
    <ManagerLayout pageTitle="Products">
      <div className="flex items-center justify-between mb-6">
        <input
          type="text"
          placeholder="Search products or RFID..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-80 px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
        />
        <button
          onClick={openCreateModal}
          className="bg-primary-600 hover:bg-primary-700 text-white font-medium px-5 py-2.5 rounded-lg transition-colors"
        >
          + Add Product
        </button>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <table className="w-full">
          <thead className="bg-slate-50 text-left text-xs font-semibold text-slate-500 uppercase">
            <tr>
              <th className="px-5 py-3">Name</th>
              <th className="px-5 py-3">Category</th>
              <th className="px-5 py-3">Price</th>
              <th className="px-5 py-3">Stock</th>
              <th className="px-5 py-3">RFID UID</th>
              <th className="px-5 py-3">Status</th>
              <th className="px-5 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              <tr><td colSpan={7} className="px-5 py-8 text-center text-slate-400">Loading...</td></tr>
            ) : products.length === 0 ? (
              <tr><td colSpan={7} className="px-5 py-8 text-center text-slate-400">No products found</td></tr>
            ) : (
              products.map((p) => (
                <tr key={p._id}>
                  <td className="px-5 py-3 font-medium text-slate-800">{p.name}</td>
                  <td className="px-5 py-3 text-sm text-slate-600">{p.category}</td>
                  <td className="px-5 py-3 text-sm text-slate-600">₹{p.price}</td>
                  <td className="px-5 py-3 text-sm text-slate-600">{p.stockQuantity} (min {p.minimumStock})</td>
                  <td className="px-5 py-3 text-sm font-mono text-slate-500">{p.rfidUid}</td>
                  <td className="px-5 py-3">
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${statusStyles[p.status]}`}>
                      {p.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-right space-x-3">
                    <button onClick={() => openEditModal(p)} className="text-primary-600 text-sm font-medium hover:underline">Edit</button>
                    <button onClick={() => handleDelete(p)} className="text-red-600 text-sm font-medium hover:underline">Delete</button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <ProductFormModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleSubmit}
        initialData={editingProduct}
      />
    </ManagerLayout>
  );
}