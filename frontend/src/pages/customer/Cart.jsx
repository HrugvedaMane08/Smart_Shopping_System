import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { cartService } from '../../services/cartService';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../hooks/useSocket';
import CustomerLayout from '../../layouts/CustomerLayout';

export default function Cart() {
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { user } = useAuth();
  const socketRef = useSocket();
  const navigate = useNavigate();

  const loadOrCreateCart = async () => {
    setLoading(true);
    try {
      const res = await cartService.getMyCart();
      setCart(res.data.data.cart);
    } catch (err) {
      if (err.response?.status === 404) {
        // No active cart — create one
        const createRes = await cartService.createCart();
        setCart(createRes.data.data.cart);
      } else {
        setError('Failed to load cart');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrCreateCart();
  }, []);

  // Join the cart's Socket.IO room once we know the cart's MongoDB _id
  useEffect(() => {
    if (!cart?._id || !socketRef.current) return;

    const socket = socketRef.current;
    socket.emit('joinCart', cart._id);

    const handleCartUpdated = (data) => {
      if (data.cart?._id === cart._id) {
        setCart(data.cart);
      }
    };

    const handleCartClosed = (data) => {
      if (data.cart?._id === cart._id) {
        // Cart was checked out — refresh to get a fresh empty cart next time
        loadOrCreateCart();
      }
    };

    socket.on('cartUpdated', handleCartUpdated);
    socket.on('cartClosed', handleCartClosed);

    return () => {
      socket.off('cartUpdated', handleCartUpdated);
      socket.off('cartClosed', handleCartClosed);
    };
  }, [cart?._id]);

  if (loading) {
    return (
      <CustomerLayout pageTitle="My Cart">
        <div className="text-slate-500">Loading cart...</div>
      </CustomerLayout>
    );
  }

  if (error) {
    return (
      <CustomerLayout pageTitle="My Cart">
        <div className="text-red-600">{error}</div>
      </CustomerLayout>
    );
  }

  return (
    <CustomerLayout pageTitle="My Cart">
      <div className="bg-primary-50 border border-primary-200 rounded-xl px-5 py-4 mb-6 flex items-center justify-between">
        <div>
          <p className="text-sm text-primary-700 font-medium">Your Cart ID</p>
          <p className="text-2xl font-bold text-primary-800 font-mono">{cart.cartId}</p>
        </div>
        <div className="text-right text-sm text-primary-600">
          Scan items using a store RFID reader or ask staff to use the IoT Simulator with this Cart ID.
        </div>
      </div>

      {cart.items.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center text-slate-400">
          Your cart is empty. Scan a product to get started — updates appear here instantly.
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <table className="w-full">
            <thead className="bg-slate-50 text-left text-xs font-semibold text-slate-500 uppercase">
              <tr>
                <th className="px-5 py-3">Product</th>
                <th className="px-5 py-3">Price</th>
                <th className="px-5 py-3">Qty</th>
                <th className="px-5 py-3 text-right">Subtotal</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {cart.items.map((item) => (
                <tr key={item.rfidUid}>
                  <td className="px-5 py-4 font-medium text-slate-800">{item.name}</td>
                  <td className="px-5 py-4 text-slate-600">₹{item.price}</td>
                  <td className="px-5 py-4 text-slate-600">{item.quantity}</td>
                  <td className="px-5 py-4 text-right font-semibold text-slate-800">₹{item.subtotal}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="border-t border-slate-200 p-5 space-y-2 bg-slate-50">
            <div className="flex justify-between text-sm text-slate-600">
              <span>Subtotal</span>
              <span>₹{cart.subtotal}</span>
            </div>
            <div className="flex justify-between text-sm text-slate-600">
              <span>Tax</span>
              <span>₹{cart.tax}</span>
            </div>
            <div className="flex justify-between text-lg font-bold text-slate-800 pt-2 border-t border-slate-200">
              <span>Total</span>
              <span>₹{cart.total}</span>
            </div>

            <button
              onClick={() => navigate('/customer/checkout')}
              className="w-full mt-4 bg-primary-600 hover:bg-primary-700 text-white font-semibold py-3 rounded-lg transition-colors"
            >
              Proceed to Checkout
            </button>
          </div>
        </div>
      )}
    </CustomerLayout>
  );
}