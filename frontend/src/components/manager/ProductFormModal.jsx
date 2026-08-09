import { useState, useEffect } from 'react';
import Modal from '../common/Modal';

const emptyForm = {
  name: '', category: '', price: '', stockQuantity: '', minimumStock: '',
  rfidUid: '', description: '', image: '',
};

export default function ProductFormModal({ isOpen, onClose, onSubmit, initialData }) {
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (initialData) {
      setForm({
        name: initialData.name || '',
        category: initialData.category || '',
        price: initialData.price ?? '',
        stockQuantity: initialData.stockQuantity ?? '',
        minimumStock: initialData.minimumStock ?? '',
        rfidUid: initialData.rfidUid || '',
        description: initialData.description || '',
        image: initialData.image || '',
      });
    } else {
      setForm(emptyForm);
    }
    setError('');
  }, [initialData, isOpen]);

  const handleChange = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSaving(true);
    try {
      await onSubmit({
        ...form,
        price: Number(form.price),
        stockQuantity: Number(form.stockQuantity),
        minimumStock: Number(form.minimumStock),
      });
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={initialData ? 'Edit Product' : 'Add New Product'}>
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-3 py-2">
            {error}
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Product Name</label>
          <input required value={form.name} onChange={handleChange('name')}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500" />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Category</label>
            <input required value={form.category} onChange={handleChange('category')}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Price (₹)</label>
            <input required type="number" min="0" step="0.01" value={form.price} onChange={handleChange('price')}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Stock Quantity</label>
            <input required type="number" min="0" value={form.stockQuantity} onChange={handleChange('stockQuantity')}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Minimum Stock</label>
            <input required type="number" min="0" value={form.minimumStock} onChange={handleChange('minimumStock')}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500" />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">RFID UID</label>
          <input required value={form.rfidUid} onChange={handleChange('rfidUid')}
            placeholder="e.g. A3B79124"
            className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono focus:outline-none focus:ring-2 focus:ring-primary-500" />
          <p className="text-xs text-slate-400 mt-1">Must be unique. This is what the RFID reader (or simulator) will scan.</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
          <textarea value={form.description} onChange={handleChange('description')} rows={2}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500" />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Image URL (optional)</label>
          <input value={form.image} onChange={handleChange('image')}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500" />
        </div>

        <div className="flex gap-3 pt-2">
          <button type="button" onClick={onClose}
            className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium py-2.5 rounded-lg transition-colors">
            Cancel
          </button>
          <button type="submit" disabled={saving}
            className="flex-1 bg-primary-600 hover:bg-primary-700 disabled:opacity-50 text-white font-medium py-2.5 rounded-lg transition-colors">
            {saving ? 'Saving...' : initialData ? 'Update Product' : 'Create Product'}
          </button>
        </div>
      </form>
    </Modal>
  );
}