import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import CustomerLayout from '../../layouts/CustomerLayout';

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <CustomerLayout pageTitle="Dashboard">
      <div className="bg-white rounded-xl border border-slate-200 p-8">
        <h3 className="text-xl font-bold text-slate-800">Welcome, {user?.name} 👋</h3>
        <p className="text-slate-500 mt-1">Start shopping by heading to your cart — scan items using the store's RFID system.</p>

        <div className="grid grid-cols-2 gap-4 mt-6">
          <button
            onClick={() => navigate('/customer/products')}
            className="bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl p-5 text-left transition-colors"
          >
            <div className="text-2xl mb-2">🛍️</div>
            <p className="font-semibold text-slate-800">Browse Products</p>
            <p className="text-sm text-slate-500">See what's in stock</p>
          </button>
          <button
            onClick={() => navigate('/customer/cart')}
            className="bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl p-5 text-left transition-colors"
          >
            <div className="text-2xl mb-2">🛒</div>
            <p className="font-semibold text-slate-800">Go to My Cart</p>
            <p className="text-sm text-slate-500">View live cart updates</p>
          </button>
        </div>
      </div>
    </CustomerLayout>
  );
}