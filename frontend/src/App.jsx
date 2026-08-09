import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

// Auth pages
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';

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
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Customer routes */}
        <Route path="/customer/dashboard" element={<CustomerDashboard />} />
        <Route path="/customer/cart" element={<CustomerCart />} />
        <Route path="/customer/products" element={<CustomerProducts />} />
        <Route path="/customer/checkout" element={<CustomerCheckout />} />
        <Route path="/customer/receipt" element={<CustomerReceipt />} />
        <Route path="/customer/history" element={<CustomerHistory />} />

        {/* Manager routes */}
        <Route path="/manager/dashboard" element={<ManagerDashboard />} />
        <Route path="/manager/inventory" element={<ManagerInventory />} />
        <Route path="/manager/products" element={<ManagerProducts />} />
        <Route path="/manager/carts" element={<ManagerCarts />} />
        <Route path="/manager/transactions" element={<ManagerTransactions />} />
        <Route path="/manager/analytics" element={<ManagerAnalytics />} />
        <Route path="/manager/alerts" element={<ManagerAlerts />} />
        <Route path="/manager/iot-simulator" element={<ManagerIotSimulator />} />

        <Route path="*" element={<div className="p-8">404 - Page Not Found</div>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;