import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { cartService } from '../../services/cartService';
import CustomerLayout from '../../layouts/CustomerLayout';

export default function Checkout() {
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const load = async () => {
      try {
        const res = await cartService.getMyCart();
        setCart(res.data.data.cart);
      } catch (err) {
        setError('No active cart found');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleCheckout = async () => {
    setProcessing(true);
    setError('');
    try {
      const res = await cartService.checkout(cart.cartId);
      const { transaction } = res.data.data;
      navigate(`/customer/receipt?transactionId=${transaction.transactionId}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Checkout failed');
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return <CustomerLayout pageTitle="Checkout"><div className="text-slate-500">Loading...</div></CustomerLayout>;
  }

  if (error && !cart) {
    return <CustomerLayout pageTitle="Checkout"><div className="text-red-600">{error}</div></CustomerLayout>;
  }

  if (!cart || cart.items.length === 0) {
    return (
      <CustomerLayout pageTitle="Checkout">
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center text-slate-400">
          Your cart is empty. Add items before checking out.
        </div>
      </CustomerLayout>
    );
  }

  return (
    <CustomerLayout pageTitle="Checkout">
      <div className="max-w-lg mx-auto bg-white rounded-xl border border-slate-200 p-6">
        <h3 className="font-semibold text-slate-800 mb-4">Order Summary — {cart.cartId}</h3>

        <div className="space-y-2 mb-4">
          {cart.items.map((item) => (
            <div key={item.rfidUid} className="flex justify-between text-sm text-slate-600">
              <span>{item.name} × {item.quantity}</span>
              <span>₹{item.subtotal}</span>
            </div>
          ))}
        </div>

        <div className="border-t border-slate-200 pt-4 space-y-1">
          <div className="flex justify-between text-sm text-slate-600">
            <span>Subtotal</span>
            <span>₹{cart.subtotal}</span>
          </div>
          <div className="flex justify-between text-sm text-slate-600">
            <span>Tax</span>
            <span>₹{cart.tax}</span>
          </div>
          <div className="flex justify-between text-lg font-bold text-slate-800">
            <span>Total</span>
            <span>₹{cart.total}</span>
          </div>
        </div>

        <div className="bg-slate-50 rounded-lg px-4 py-3 mt-4 text-xs text-slate-500">
          Payment Method: <span className="font-medium text-slate-700">Simulated Payment</span> (no real gateway in this phase)
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3 mt-4">
            {error}
          </div>
        )}

        <button
          onClick={handleCheckout}
          disabled={processing}
          className="w-full mt-5 bg-primary-600 hover:bg-primary-700 disabled:opacity-50 text-white font-semibold py-3 rounded-lg transition-colors"
        >
          {processing ? 'Processing...' : `Pay ₹${cart.total}`}
        </button>
      </div>
    </CustomerLayout>
  );
}