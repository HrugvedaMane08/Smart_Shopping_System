import { useState, useEffect } from 'react';
import { alertService } from '../../services/alertService';
import { useSocket } from '../../hooks/useSocket';
import { useToast } from '../../context/ToastContext';
import ManagerLayout from '../../layouts/ManagerLayout';

export default function Alerts() {
  const [alerts, setAlerts] = useState([]);
  const [filter, setFilter] = useState('unresolved'); // 'unresolved' | 'all'
  const [loading, setLoading] = useState(true);
  const socketRef = useSocket();
  const { showToast } = useToast();

  const fetchAlerts = async () => {
    setLoading(true);
    try {
      const resolvedParam = filter === 'unresolved' ? 'false' : undefined;
      const res = await alertService.getAll(resolvedParam);
      setAlerts(res.data.data.alerts);
    } catch (err) {
      showToast('Failed to load alerts', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAlerts(); }, [filter]);

  // Live: new low stock alerts push straight into the list
  useEffect(() => {
    if (!socketRef.current) return;
    const socket = socketRef.current;
    socket.emit('joinManagerRoom');

    const handleNewAlert = () => {
      showToast('New low-stock alert received', 'error');
      fetchAlerts();
    };

    socket.on('lowStockAlert', handleNewAlert);
    return () => socket.off('lowStockAlert', handleNewAlert);
  }, [socketRef.current, filter]);

  const handleResolve = async (alert) => {
    try {
      await alertService.resolve(alert._id);
      showToast('Alert marked as resolved');
      fetchAlerts();
    } catch (err) {
      showToast('Failed to resolve alert', 'error');
    }
  };

  return (
    <ManagerLayout pageTitle="Alerts">
      <div className="flex gap-3 mb-6">
        <button
          onClick={() => setFilter('unresolved')}
          className={`px-4 py-2 rounded-lg text-sm font-medium border-2 transition-colors ${
            filter === 'unresolved' ? 'border-primary-600 bg-primary-50 text-primary-700' : 'border-slate-200 text-slate-500'
          }`}
        >
          Unresolved
        </button>
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 rounded-lg text-sm font-medium border-2 transition-colors ${
            filter === 'all' ? 'border-primary-600 bg-primary-50 text-primary-700' : 'border-slate-200 text-slate-500'
          }`}
        >
          All
        </button>
      </div>

      {loading ? (
        <div className="text-slate-500">Loading alerts...</div>
      ) : alerts.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center text-slate-400">
          {filter === 'unresolved' ? 'No unresolved alerts. All good! 🎉' : 'No alerts yet.'}
        </div>
      ) : (
        <div className="space-y-3">
          {alerts.map((alert) => (
            <div
              key={alert._id}
              className={`bg-white rounded-xl border p-5 flex items-center justify-between ${
                alert.isResolved ? 'border-slate-200 opacity-60' : alert.type === 'OUT_OF_STOCK' ? 'border-red-300' : 'border-amber-300'
              }`}
            >
              <div className="flex items-start gap-3">
                <span className="text-2xl">{alert.type === 'OUT_OF_STOCK' ? '🔴' : '⚠️'}</span>
                <div>
                  <p className="font-medium text-slate-800">{alert.message}</p>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {alert.product?.category} · {new Date(alert.createdAt).toLocaleString()}
                  </p>
                </div>
              </div>

              {!alert.isResolved && (
                <button
                  onClick={() => handleResolve(alert)}
                  className="text-sm font-medium text-primary-600 hover:underline whitespace-nowrap ml-4"
                >
                  Mark Resolved
                </button>
              )}
              {alert.isResolved && (
                <span className="text-xs font-medium text-green-600 whitespace-nowrap ml-4">✓ Resolved</span>
              )}
            </div>
          ))}
        </div>
      )}
    </ManagerLayout>
  );
}