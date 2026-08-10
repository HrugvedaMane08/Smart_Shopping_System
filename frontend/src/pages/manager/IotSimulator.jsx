import { useState, useEffect } from 'react';
import { cartService } from '../../services/cartService';
import { productService } from '../../services/productService';
import { iotService } from '../../services/iotService';
import { useToast } from '../../context/ToastContext';
import ManagerLayout from '../../layouts/ManagerLayout';

export default function IotSimulator() {
  const [activeCarts, setActiveCarts] = useState([]);
  const [products, setProducts] = useState([]);
  const [selectedCartId, setSelectedCartId] = useState('');
  const [selectedRfid, setSelectedRfid] = useState('');
  const [manualRfid, setManualRfid] = useState('');
  const [useManualRfid, setUseManualRfid] = useState(false);
  const [loading, setLoading] = useState(true);
  const [scanning, setScanning] = useState(false);
  const [eventLog, setEventLog] = useState([]);
  const { showToast } = useToast();

  const loadData = async () => {
    try {
      const [cartsRes, productsRes] = await Promise.all([
        cartService.getActiveCarts(),
        productService.getAll({ limit: 100 }),
      ]);
      setActiveCarts(cartsRes.data.data.carts);
      setProducts(productsRes.data.data.products);
    } catch (err) {
      showToast('Failed to load simulator data', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  const addLogEntry = (type, message, data) => {
    setEventLog((prev) => [
      { id: Date.now(), type, message, data, time: new Date().toLocaleTimeString() },
      ...prev,
    ].slice(0, 20)); // keep last 20
  };

  const getRfidToUse = () => (useManualRfid ? manualRfid.trim().toUpperCase() : selectedRfid);

  const handleScan = async () => {
    const rfidUid = getRfidToUse();
    if (!selectedCartId || !rfidUid) {
      showToast('Select a cart and RFID UID first', 'error');
      return;
    }

    setScanning(true);
    try {
      const res = await iotService.scanRfid({
        cartId: selectedCartId,
        rfidUid,
        event: 'PRODUCT_SCANNED',
        source: 'SIMULATOR',
      });
      const { cart, product } = res.data.data;
      addLogEntry('scan', `Scanned ${product.name} into ${cart.cartId}`, res.data.data);
      showToast(`${product.name} added to ${cart.cartId}`);
      loadData(); // refresh cart totals / stock levels shown on this page
    } catch (err) {
      const message = err.response?.data?.message || 'Scan failed';
      addLogEntry('error', message, null);
      showToast(message, 'error');
    } finally {
      setScanning(false);
    }
  };

  const handleReturn = async () => {
    const rfidUid = getRfidToUse();
    if (!selectedCartId || !rfidUid) {
      showToast('Select a cart and RFID UID first', 'error');
      return;
    }

    setScanning(true);
    try {
      const res = await iotService.productReturn({
        cartId: selectedCartId,
        rfidUid,
        source: 'SIMULATOR',
      });
      const { cart, product } = res.data.data;
      addLogEntry('return', `Removed ${product.name} from ${cart.cartId}`, res.data.data);
      showToast(`${product.name} removed from ${cart.cartId}`);
      loadData();
    } catch (err) {
      const message = err.response?.data?.message || 'Return failed';
      addLogEntry('error', message, null);
      showToast(message, 'error');
    } finally {
      setScanning(false);
    }
  };

  if (loading) {
    return <ManagerLayout pageTitle="IoT Simulator"><div className="text-slate-500">Loading...</div></ManagerLayout>;
  }

  return (
    <ManagerLayout pageTitle="IoT Simulator">
      <div className="bg-amber-50 border border-amber-200 rounded-xl px-5 py-4 mb-6 text-sm text-amber-800">
        <strong>Developer Tool:</strong> This simulator calls the exact same <code className="bg-amber-100 px-1.5 py-0.5 rounded font-mono text-xs">/api/iot/rfid</code> and
        <code className="bg-amber-100 px-1.5 py-0.5 rounded font-mono text-xs ml-1">/api/iot/product-return</code> endpoints
        that the physical ESP32 + RFID reader hardware will call in the future. No separate mock logic — this is the real integration path.
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Controls */}
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <h3 className="font-semibold text-slate-800 mb-4">Simulate RFID Event</h3>

          <div className="mb-4">
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Cart ID</label>
            <select
              value={selectedCartId}
              onChange={(e) => setSelectedCartId(e.target.value)}
              className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="">Select an active cart...</option>
              {activeCarts.map((cart) => (
                <option key={cart._id} value={cart.cartId}>
                  {cart.cartId} — {cart.customer?.name} (₹{cart.total})
                </option>
              ))}
            </select>
            {activeCarts.length === 0 && (
              <p className="text-xs text-amber-600 mt-1">No active carts. Ask a customer to log in first — a cart is created automatically.</p>
            )}
          </div>

          <div className="mb-4">
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-sm font-medium text-slate-700">RFID UID</label>
              <button
                type="button"
                onClick={() => setUseManualRfid((v) => !v)}
                className="text-xs text-primary-600 font-medium hover:underline"
              >
                {useManualRfid ? 'Choose from product list instead' : 'Enter RFID manually instead'}
              </button>
            </div>

            {useManualRfid ? (
              <input
                type="text"
                value={manualRfid}
                onChange={(e) => setManualRfid(e.target.value)}
                placeholder="e.g. A3B79124"
                className="w-full px-4 py-2.5 border border-slate-300 rounded-lg font-mono focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            ) : (
              <select
                value={selectedRfid}
                onChange={(e) => setSelectedRfid(e.target.value)}
                className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="">Select a product...</option>
                {products.map((p) => (
                  <option key={p._id} value={p.rfidUid}>
                    {p.name} — {p.rfidUid} (Stock: {p.stockQuantity})
                  </option>
                ))}
              </select>
            )}
          </div>

          <div className="flex gap-3">
            <button
              onClick={handleScan}
              disabled={scanning}
              className="flex-1 bg-primary-600 hover:bg-primary-700 disabled:opacity-50 text-white font-semibold py-3 rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              📡 Simulate RFID Scan
            </button>
            <button
              onClick={handleReturn}
              disabled={scanning}
              className="flex-1 bg-slate-600 hover:bg-slate-700 disabled:opacity-50 text-white font-semibold py-3 rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              ↩️ Simulate Return
            </button>
          </div>

        </div>

        {/* Event log */}
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <h3 className="font-semibold text-slate-800 mb-4">Event Log</h3>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {eventLog.length === 0 ? (
              <p className="text-sm text-slate-400 text-center py-8">No events yet. Trigger a scan to see it here.</p>
            ) : (
              eventLog.map((entry) => (
                <div
                  key={entry.id}
                  className={`text-sm rounded-lg px-3 py-2 border ${
                    entry.type === 'scan' ? 'bg-green-50 border-green-200 text-green-800' :
                    entry.type === 'return' ? 'bg-blue-50 border-blue-200 text-blue-800' :
                    'bg-red-50 border-red-200 text-red-800'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <span className="font-medium">{entry.message}</span>
                    <span className="text-xs opacity-60 whitespace-nowrap ml-2">{entry.time}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </ManagerLayout>
  );
}