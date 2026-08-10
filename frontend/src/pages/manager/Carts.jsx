import { useState, useEffect } from 'react';
import { cartService } from '../../services/cartService';
import { useSocket } from '../../hooks/useSocket';
import ManagerLayout from '../../layouts/ManagerLayout';
import Modal from '../../components/common/Modal';

export default function Carts() {
  const [carts, setCarts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCart, setSelectedCart] = useState(null);
  const socketRef = useSocket();

  const fetchCarts = async () => {
    try {
      const res = await cartService.getActiveCarts();
      setCarts(res.data.data.carts);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCarts();
  }, []);

  // Join managers room and listen for live cart events
  useEffect(() => {
    if (!socketRef.current) return;
    const socket = socketRef.current;

    socket.emit('joinManagerRoom');

    const refresh = () => fetchCarts();

    socket.on('cartCreated', refresh);
    socket.on('cartUpdated', refresh);
    socket.on('cartClosed', refresh);

    return () => {
      socket.off('cartCreated', refresh);
      socket.off('cartUpdated', refresh);
      socket.off('cartClosed', refresh);
    };
  }, [socketRef.current]);

  return (
    <ManagerLayout pageTitle="Active Carts">
      <p className="text-sm text-slate-500 mb-4">
        Updates live as customers scan items — no refresh needed. {carts.length} active session{carts.length !== 1 ? 's' : ''}.
      </p>

      {loading ? (
        <div className="text-slate-500">Loading carts...</div>
      ) : carts.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center text-slate-400">
          No active shopping sessions right now.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {carts.map((cart) => (
            <button
              key={cart._id}
              onClick={() => setSelectedCart(cart)}
              className="bg-white rounded-xl border border-slate-200 p-5 text-left hover:shadow-md transition-shadow"
            >
              <div className="flex justify-between items-start mb-3">
                <span className="font-mono font-bold text-primary-700">{cart.cartId}</span>
                <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">ACTIVE</span>
              </div>
              <p className="text-sm text-slate-600">{cart.customer?.name || 'Unknown Customer'}</p>
              <p className="text-xs text-slate-400 mb-3">{cart.customer?.email}</p>
              <div className="flex justify-between items-end pt-3 border-t border-slate-100">
                <span className="text-sm text-slate-500">{cart.items.length} item{cart.items.length !== 1 ? 's' : ''}</span>
                <span className="text-lg font-bold text-slate-800">₹{cart.total}</span>
              </div>
            </button>
          ))}
        </div>
      )}

      <Modal isOpen={!!selectedCart} onClose={() => setSelectedCart(null)} title={selectedCart?.cartId}>
        {selectedCart && (
          <div>
            <p className="text-sm text-slate-600 mb-1">{selectedCart.customer?.name}</p>
            <p className="text-xs text-slate-400 mb-4">{selectedCart.customer?.email}</p>

            {selectedCart.items.length === 0 ? (
              <p className="text-sm text-slate-400 py-6 text-center">No items scanned yet</p>
            ) : (
              <div className="space-y-2 mb-4">
                {selectedCart.items.map((item) => (
                  <div key={item.rfidUid} className="flex justify-between text-sm">
                    <span className="text-slate-600">{item.name} × {item.quantity}</span>
                    <span className="font-medium text-slate-800">₹{item.subtotal}</span>
                  </div>
                ))}
              </div>
            )}

            <div className="border-t border-slate-200 pt-3 space-y-1">
              <div className="flex justify-between text-sm text-slate-600">
                <span>Subtotal</span><span>₹{selectedCart.subtotal}</span>
              </div>
              <div className="flex justify-between text-sm text-slate-600">
                <span>Tax</span><span>₹{selectedCart.tax}</span>
              </div>
              <div className="flex justify-between text-lg font-bold text-slate-800">
                <span>Total</span><span>₹{selectedCart.total}</span>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </ManagerLayout>
  );
}