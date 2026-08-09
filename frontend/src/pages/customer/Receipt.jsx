import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { transactionService } from '../../services/transactionService';
import CustomerLayout from '../../layouts/CustomerLayout';

export default function Receipt() {
  const [searchParams] = useSearchParams();
  const transactionId = searchParams.get('transactionId');
  const [receipt, setReceipt] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await transactionService.getReceipt(transactionId);
        setReceipt(res.data.data.receipt);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    if (transactionId) load();
  }, [transactionId]);

  if (loading) {
    return <CustomerLayout pageTitle="Receipt"><div className="text-slate-500">Loading receipt...</div></CustomerLayout>;
  }

  if (!receipt) {
    return <CustomerLayout pageTitle="Receipt"><div className="text-red-600">Receipt not found</div></CustomerLayout>;
  }

  return (
    <CustomerLayout pageTitle="Receipt">
      <div className="max-w-md mx-auto bg-white rounded-xl border border-slate-200 p-6">
        <div className="text-center mb-6">
          <div className="w-14 h-14 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-2xl mx-auto mb-3">✓</div>
          <h3 className="text-lg font-bold text-slate-800">Payment Successful</h3>
          <p className="text-sm text-slate-500 mt-1">{new Date(receipt.date).toLocaleString()}</p>
        </div>

        <div className="border-t border-b border-dashed border-slate-200 py-4 my-4 space-y-2">
          <p className="text-xs text-slate-400 font-mono mb-2">{receipt.transactionId}</p>
          {receipt.items.map((item, i) => (
            <div key={i} className="flex justify-between text-sm">
              <span className="text-slate-600">{item.name} × {item.quantity}</span>
              <span className="font-medium text-slate-800">₹{item.subtotal}</span>
            </div>
          ))}
        </div>

        <div className="space-y-1 mb-6">
          <div className="flex justify-between text-sm text-slate-600">
            <span>Subtotal</span><span>₹{receipt.subtotal}</span>
          </div>
          <div className="flex justify-between text-sm text-slate-600">
            <span>Tax</span><span>₹{receipt.tax}</span>
          </div>
          <div className="flex justify-between text-lg font-bold text-slate-800 pt-2 border-t border-slate-200">
            <span>Total Paid</span><span>₹{receipt.total}</span>
          </div>
        </div>

        <Link
          to="/customer/history"
          className="block text-center w-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium py-2.5 rounded-lg transition-colors"
        >
          View Purchase History
        </Link>
      </div>
    </CustomerLayout>
  );
}