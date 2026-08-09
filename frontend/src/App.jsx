import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/common/ProtectedRoute';

// Auth pages
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import { ToastProvider } from './context/ToastContext';

// Customer pages
import CustomerDashboard from './pages/customer/Dashboard';
import CustomerCart from './pages/customer/Cart';
import CustomerProducts from './pages/customer/Products';
import CustomerCheckout from './pages/customer/Checkout';
import CustomerReceipt from './pages/customer/Receipt';
import CustomerHistory from './pages/customer/History';

// Manager pages
import ManagerDashboard from './pages/manager/Dashboard';
import ManagerInventory from './pages/manager/Inventory';
import ManagerProducts from './pages/manager/Products';
import ManagerCarts from './pages/manager/Carts';
import ManagerTransactions from './pages/manager/Transactions';
import ManagerAnalytics from './pages/manager/Analytics';
import ManagerAlerts from './pages/manager/Alerts';
import ManagerIotSimulator from './pages/manager/IotSimulator';

function App() {
  return (
    <ToastProvider>
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Customer routes */}
          <Route path="/customer/dashboard" element={<ProtectedRoute allowedRoles={['CUSTOMER']}><CustomerDashboard /></ProtectedRoute>} />
          <Route path="/customer/cart" element={<ProtectedRoute allowedRoles={['CUSTOMER']}><CustomerCart /></ProtectedRoute>} />
          <Route path="/customer/products" element={<ProtectedRoute allowedRoles={['CUSTOMER']}><CustomerProducts /></ProtectedRoute>} />
          <Route path="/customer/checkout" element={<ProtectedRoute allowedRoles={['CUSTOMER']}><CustomerCheckout /></ProtectedRoute>} />
          <Route path="/customer/receipt" element={<ProtectedRoute allowedRoles={['CUSTOMER']}><CustomerReceipt /></ProtectedRoute>} />
          <Route path="/customer/history" element={<ProtectedRoute allowedRoles={['CUSTOMER']}><CustomerHistory /></ProtectedRoute>} />

          {/* Manager routes */}
          <Route path="/manager/dashboard" element={<ProtectedRoute allowedRoles={['MANAGER']}><ManagerDashboard /></ProtectedRoute>} />
          <Route path="/manager/inventory" element={<ProtectedRoute allowedRoles={['MANAGER']}><ManagerInventory /></ProtectedRoute>} />
          <Route path="/manager/products" element={<ProtectedRoute allowedRoles={['MANAGER']}><ManagerProducts /></ProtectedRoute>} />
          <Route path="/manager/carts" element={<ProtectedRoute allowedRoles={['MANAGER']}><ManagerCarts /></ProtectedRoute>} />
          <Route path="/manager/transactions" element={<ProtectedRoute allowedRoles={['MANAGER']}><ManagerTransactions /></ProtectedRoute>} />
          <Route path="/manager/analytics" element={<ProtectedRoute allowedRoles={['MANAGER']}><ManagerAnalytics /></ProtectedRoute>} />
          <Route path="/manager/alerts" element={<ProtectedRoute allowedRoles={['MANAGER']}><ManagerAlerts /></ProtectedRoute>} />
          <Route path="/manager/iot-simulator" element={<ProtectedRoute allowedRoles={['MANAGER']}><ManagerIotSimulator /></ProtectedRoute>} />

          <Route path="*" element={<div className="p-8">404 - Page Not Found</div>} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
    </ToastProvider>
  );
}

export default App;